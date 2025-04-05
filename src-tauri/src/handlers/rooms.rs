use std::str::FromStr;
use std::sync::Arc;

use crate::iroh::gossip::listen_gossip;
use crate::models::{Player, Room, Ticket};
use crate::state::AppState;
use iroh_gossip::proto::TopicId;
use tauri::{Emitter, State, Window};

// This command subscribes to peer join events using the window's emit method
#[tauri::command]
pub async fn subscribe_peer_events(window: Window, state: State<'_, AppState>, room_id: String) -> Result<(), String> {
    println!("> Subscribing to peer events for room: {}", room_id);
    
    // Create a receiver from the broadcaster
    let mut receiver = state.clone().peer_event_broadcaster.subscribe();
    
    // Clone window for the async task
    let window_clone = window.clone();
    
    // Extract topic ID from room ID to filter events
    let Ticket { topic, .. } = Ticket::from_str(&room_id).map_err(|_| "Invalid room ID".to_string())?;
    let topic_id = topic.to_string();
    
    println!("> Topic ID for filtering: {}", topic_id);
    
    // Check if we have any cached events for this topic and send them first
    {
        let state_clone = state.clone();
        let cache = state_clone.peer_events_cache.lock().await;
        if let Some(cached_events) = cache.get(&topic_id) {
            println!("> Found {} cached peer events for topic {}", cached_events.len(), topic_id);
            for event in cached_events {
                println!("> Sending cached event: {} joined", event.player_name);
                let _ = window.emit("peer-joined", &event);
                
                // Add the player to room's player list.
                state.clone().rooms.lock().await
                    .get_mut(&room_id)
                    .map(|room| {
                        room.players.push(Player {
                            id: event.peer_id.clone(),
                            name: event.player_name.clone(),
                        });
                    });
            }
        } else {
            println!("> No cached peer events for topic {}", topic_id);
        }
    }
        
    // Create a task to forward events from the broadcast channel to the window
    let rooms = state.clone().rooms.clone();
    tokio::spawn(async move {
        println!("> Starting to listen for peer events");
        while let Ok(event) = receiver.recv().await {
            println!("> Received event for topic: {}", event.topic_id);
            // Only forward events for this room/topic
            if event.topic_id == topic_id {
                println!("> Forwarding event: {} joined", event.player_name);
                let _ = window_clone.emit("peer-joined", &event);

                // Add the player to room's player list.
                rooms.lock().await
                    .get_mut(&room_id)
                    .map(|room| {
                        room.players.push(Player {
                            id: event.peer_id.clone(),
                            name: event.player_name.clone(),
                        });
                    });
            }
        }
        println!("> Stopped listening for peer events");
    });
    
    println!("> Subscribed to peer events successfully");
    Ok(())
}

#[tauri::command]
pub async fn create_room(state: State<'_, AppState>, room_name: String, player_name: String) -> Result<Room, String> {
    // Create a ticket for this endpoint so that others can join
    let endpoint = state.clone().iroh_endpoint.clone();

    //  Create a ticket for this endpoint so that others can join
    let topic = TopicId::from_bytes(rand::random());
    let me = endpoint.node_addr().await.map_err(|_| "Failed to get node address".to_string())?;
    let nodes = Arc::new(vec![me]);
    let ticket = Ticket { topic, nodes: nodes.clone().to_vec() };

    // Create a room id from the ticket
    let room_id = ticket.to_string();
    let player_id = endpoint.node_id().to_string();

    let player = Player {
        id: player_id,
        name: player_name.clone(),
    };
    
    let room = Room {
        id: room_id.clone(),
        name: room_name.clone(),
        host: player_name.clone(),
        players: vec![player],
    };
    
    // Store the room in our state
    let state_clone = state.clone();
    let mut rooms = state_clone.rooms.lock().await;
    rooms.insert(room_id.clone(), room.clone());

    // Connect to the gossip protocol
    println!("> listening to the gossip protocol");
    let iroh_endpoint = state.clone().iroh_endpoint.clone();
    let gossip = state.clone().gossip.clone();
    let peer_event_broadcaster = state.clone().peer_event_broadcaster.clone();
    let peer_events_cache = state.clone().peer_events_cache.clone();
    tokio::spawn(async move {
        listen_gossip(iroh_endpoint, gossip, player_name.clone(), nodes.clone(), topic, peer_event_broadcaster, peer_events_cache).await.map_err(|_| "Failed to connect to gossip".to_string()) // TODO: Handle errors properly
    });
    
    Ok(room)
}

#[tauri::command]
pub async fn join_room(state: State<'_, AppState>, room_id: String, player_name: String) -> Result<Room, String> {
    // Get the endpoint from the state
    let endpoint = state.clone().iroh_endpoint.clone();
    
    // Get the ticket from the room id
    let Ticket { topic, nodes } = Ticket::from_str(&room_id).map_err(|_| "Invalid room ID".to_string())?;
    println!("> joining chat room for topic {topic}");

    // add the peer addrs from the ticket to our endpoint's addressbook so that they can be dialed
    for peer in nodes.clone().into_iter() {
        endpoint.add_node_addr(peer).map_err(|_| "Failed to add node address".to_string())?;
    }
    
    // Add the room to our state
    let mut room = Room {
        id: room_id.clone(),
        name: "Unknown".to_string(),
        host: "Unknown".to_string(),
        players: vec![],
    };
    let mut rooms = state.rooms.lock().await;
    rooms.insert(room_id.clone(), room.clone());
    
    // Create a new player
    let player_id = endpoint.node_id().to_string();
    let player = Player {
        id: player_id,
        name: player_name.clone(),
    };
    
    // Connect to the gossip protocol
    println!("> listening to the gossip protocol");
    let iroh_endpoint = state.clone().iroh_endpoint.clone();
    let gossip = state.clone().gossip.clone();
    let nodes_arc = Arc::new(nodes.clone());
    let peer_event_broadcaster = state.clone().peer_event_broadcaster.clone();
    let peer_events_cache = state.clone().peer_events_cache.clone();
    tokio::spawn(async move {
        listen_gossip(iroh_endpoint, gossip, player_name.clone(), nodes_arc, topic, peer_event_broadcaster, peer_events_cache).await.map_err(|_| "Failed to connect to gossip".to_string()) // TODO: Handle errors properly
    });
    
    // Add the player to the room
    room.players.push(player);
    
    Ok(room.clone())
}

#[tauri::command]
pub async fn get_rooms(state: State<'_, AppState>) -> Result<Vec<Room>, String> {
    let rooms = state.rooms.lock().await;
    Ok(rooms.values().cloned().collect())
}

#[tauri::command]
pub async fn leave_room(state: State<'_, AppState>, room_id: String, player_id: String) -> Result<(), String> {
    let mut rooms = state.rooms.lock().await;
    
    // Check if the room exists
    let room = rooms.get_mut(&room_id).ok_or_else(|| "Room not found".to_string())?;
    
    // Remove the player from the room
    room.players.retain(|p| p.id != player_id);
    
    // If no players left, remove the room and close Iroh connections
    if room.players.is_empty() {
        // TODO: Cleanup would happen here - closing specific connections
        // This would depend on how we're tracking endpoints per room
        // state.iroh_endpoint.close().await.map_err(|_| "Failed to close Iroh endpoint".to_string())?;
        rooms.remove(&room_id);
    }
    
    Ok(())
} 