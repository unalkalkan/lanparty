use std::collections::HashMap;
use std::sync::Arc;

use anyhow::Result as AnyhowResult;
use futures_lite::StreamExt;
use iroh_gossip::net::{Event, GossipEvent, GossipReceiver};
use iroh_gossip::proto::TopicId;
use tokio::sync::broadcast;
use tokio::task;

use crate::models::message::SignedMessage;
use crate::models::Message;

// Define a struct for peer join events
#[derive(Clone, Debug, serde::Serialize)]
pub struct PeerJoinEvent {
    pub peer_id: String,
    pub player_name: String,
    pub topic_id: String,
}

// Type for the peer events broadcast channel
pub type PeerEventBroadcaster = broadcast::Sender<PeerJoinEvent>;

// This stores all peer events that have happened, so when the UI subscribes late
// we can replay them
pub type PeerEventsCache = Arc<tokio::sync::Mutex<HashMap<String, Vec<PeerJoinEvent>>>>;

pub async fn listen_gossip(
    endpoint: iroh::Endpoint, 
    gossip: iroh_gossip::net::Gossip, 
    player_name: String, 
    nodes: Arc<Vec<iroh::NodeAddr>>, 
    topic: TopicId,
    peer_event_broadcaster: PeerEventBroadcaster,
    peer_events_cache: PeerEventsCache, 
) -> Result<(), String> {
    // Subscribe to the room topic
    println!("> gossip awaiting for peers...");
    let peer_ids = nodes.clone().iter().map(|p| p.node_id).collect();
    let (sender, receiver) = gossip.subscribe_and_join(topic, peer_ids).await.map_err(|_| "Failed to subscribe to room topic".to_string())?.split();
    println!("> connected!");

    // topic as string for events
    let topic_id = topic.to_string();

    // subscribe and print loop
    task::spawn(subscribe_loop(receiver, topic_id.clone(), peer_event_broadcaster, peer_events_cache));

    // Send About message to the room
    let message = Message::About { player_name: player_name.clone() };
    let encoded_message = SignedMessage::sign_and_encode(endpoint.secret_key(), &message).map_err(|_| "Failed to sign and encode message".to_string())?;
    sender.broadcast(encoded_message).await.map_err(|_| "Failed to send message".to_string())?;
    println!("> sent about message");

    Ok(())
}

// We need to stop this loop when the room is closed.
async fn subscribe_loop(
    mut receiver: GossipReceiver, 
    topic_id: String,
    peer_event_broadcaster: PeerEventBroadcaster,
    peer_events_cache: PeerEventsCache,
) -> AnyhowResult<()> {
    // init a peerid -> name hashmap
    let mut names = HashMap::new();
    println!("> Subscribe loop started for topic: {}", topic_id);
    
    while let Some(event) = receiver.try_next().await? {
        if let Event::Gossip(GossipEvent::Received(msg)) = event {
            let (from, message) = SignedMessage::verify_and_decode(&msg.content).map_err(|_| anyhow::anyhow!("Failed to decode message"))?;
            match message {
                Message::About { player_name } => {
                    names.insert(from, player_name.clone());
                    println!("> {} is now known as {}", from.fmt_short(), player_name);
                    
                    // Create the peer join event
                    let peer_event = PeerJoinEvent {
                        peer_id: from.to_string(),
                        player_name: player_name.clone(),
                        topic_id: topic_id.clone(),
                    };
                    
                    // Store the event in the cache
                    {
                        let mut cache = peer_events_cache.lock().await;
                        let events = cache.entry(topic_id.clone()).or_insert_with(Vec::new);
                        events.push(peer_event.clone());
                    }
                    
                    println!("> Broadcasting peer join event for {} in topic {}", player_name, topic_id);
                    // Don't care if no one is listening
                    let listeners = peer_event_broadcaster.receiver_count();
                    match peer_event_broadcaster.send(peer_event) {
                        Ok(n) => println!("> Event sent to {} receivers (out of {} listeners)", n, listeners),
                        Err(e) => println!("> Failed to send event: {}. This is normal if no one has subscribed yet.", e),
                    }
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
    println!("> Subscribe loop ended for topic: {}", topic_id);
    Ok(())
}