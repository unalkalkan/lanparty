use std::collections::HashMap;
use std::sync::Arc;

use anyhow::Result as AnyhowResult;
use futures_lite::StreamExt;
use iroh_gossip::net::{Event, GossipEvent, GossipReceiver};
use iroh_gossip::proto::TopicId;
use tokio::task;

use crate::models::message::SignedMessage;
use crate::models::Message;

pub async fn listen_gossip(endpoint: iroh::Endpoint, gossip: iroh_gossip::net::Gossip, player_name: String, nodes: Arc<Vec<iroh::NodeAddr>>, topic: TopicId) -> Result<(), String> {
    // Subscribe to the room topic
    println!("> gossip awaiting for peers...");
    let peer_ids = nodes.clone().iter().map(|p| p.node_id).collect();
    let (sender, receiver) = gossip.subscribe_and_join(topic, peer_ids).await.map_err(|_| "Failed to subscribe to room topic".to_string())?.split();
    println!("> connected!");

    // subscribe and print loop
    task::spawn(subscribe_loop(receiver));

    // TODO: Create a channel for sending messages
    // let (line_tx, mut line_rx) = tokio::sync::mpsc::channel(1);

    // Send About message to the room
    let message = Message::About { player_name: player_name.clone() };
    let encoded_message = SignedMessage::sign_and_encode(endpoint.secret_key(), &message).map_err(|_| "Failed to sign and encode message".to_string())?;
    sender.broadcast(encoded_message).await.map_err(|_| "Failed to send message".to_string())?;
    println!("> sent about message");

    Ok(())
}

// TODO: We need to stop this loop when the room is closed.
async fn subscribe_loop(mut receiver: GossipReceiver) -> AnyhowResult<()> {
    // init a peerid -> name hashmap
    let mut names = HashMap::new();
    while let Some(event) = receiver.try_next().await? {
        if let Event::Gossip(GossipEvent::Received(msg)) = event {
            let (from, message) = SignedMessage::verify_and_decode(&msg.content).map_err(|_| anyhow::anyhow!("Failed to decode message"))?;
            match message {
                Message::About { player_name } => {
                    names.insert(from, player_name.clone());
                    println!("> {} is now known as {}", from.fmt_short(), player_name);
                }
                Message::Message { text } => {
                    let name = names
                        .get(&from)
                        .map_or_else(|| from.fmt_short(), String::to_string);
                    println!("{}: {}", name, text);
                }
            }
        }
    }
    Ok(())
}