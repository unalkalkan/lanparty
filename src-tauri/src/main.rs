#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::collections::HashMap;
use std::sync::Mutex;
use iroh::ticket::NodeTicket;
use iroh::Endpoint;
use nextauri::{get_or_create_secret, ALPN};
use tauri::State;
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use anyhow::Result as AnyhowResult;

// Room struct to store room information
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Room {
    id: String,
    name: String,
    host: String,
    players: Vec<Player>,
    // We could add more fields here like game settings, etc.
}

// Player struct to store player information
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Player {
    id: String,
    name: String,
    // We could add more fields here like score, role, etc.
}

// AppState struct to manage application state
struct AppState {
    rooms: Mutex<HashMap<String, Room>>,
    iroh_endpoint: Endpoint,
}

// Initialize Iroh node
async fn init_iroh_endpoint() -> AnyhowResult<Endpoint> {
    let secret_key = get_or_create_secret()?;
    let builder = Endpoint::builder()
        .alpns(vec![ALPN.to_vec()])
        .secret_key(secret_key)
        .discovery_n0();
    let endpoint = builder.bind().await?;
    println!("Listening on {:?}", endpoint.node_addr().await?);
    Ok(endpoint)
}

// Function to create a new room with Iroh connection
#[tauri::command]
async fn create_room(state: State<'_, AppState>, room_name: String, player_name: String) -> Result<Room, String> {
    // Create a ticket for this endpoint so that others can join
    let endpoint = state.iroh_endpoint.clone();
    let node_addr = endpoint.node_addr().await.map_err(|_| "Failed to get node address".to_string())?;
    let ticket = NodeTicket::new(node_addr);
    
    // Create a room id from the ticket
    let room_id = ticket.to_string();
    let player_id = endpoint.node_id().to_string();

    let player = Player {
        id: player_id,
        name: player_name.clone(),
    };
    
    let room = Room {
        id: room_id.clone(),
        name: room_name,
        host: player_name,
        players: vec![player],
    };
    
    // Store the room in our state
    let mut rooms = state.rooms.lock().map_err(|_| "Failed to lock rooms".to_string())?;
    rooms.insert(room_id, room.clone());
    
    Ok(room)
}

// Function to join an existing room using Iroh
#[tauri::command]
async fn join_room(state: State<'_, AppState>, room_id: String, player_name: String) -> Result<Room, String> {
    let mut rooms = state.rooms.lock().map_err(|_| "Failed to lock rooms".to_string())?;
    
    // Check if the room exists
    let room = rooms.get_mut(&room_id).ok_or_else(|| "Room not found".to_string())?;
    
    // Create a new player
    let player_id = Uuid::new_v4().to_string();
    let player = Player {
        id: player_id,
        name: player_name,
    };
    
    // TODO: Connect to the Iroh endpoint if a ticket is available
    
    // Add the player to the room
    room.players.push(player);
    
    Ok(room.clone())
}

// Function to get all active rooms
#[tauri::command]
async fn get_rooms(state: State<'_, AppState>) -> Result<Vec<Room>, String> {
    let rooms = state.rooms.lock().map_err(|_| "Failed to lock rooms".to_string())?;
    Ok(rooms.values().cloned().collect())
}

// Function to leave a room
#[tauri::command]
async fn leave_room(state: State<'_, AppState>, room_id: String, player_id: String) -> Result<(), String> {
    let mut rooms = state.rooms.lock().map_err(|_| "Failed to lock rooms".to_string())?;
    
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

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize Iroh node
    let iroh_endpoint = match init_iroh_endpoint().await {
        Ok(endpoint) => endpoint,
        Err(e) => {
            eprintln!("Failed to initialize Iroh endpoint: {}", e);
            return Err(e.into());
        }
    };

    // Initialize the application state
    let app_state = AppState {
        rooms: Mutex::new(HashMap::new()),
        iroh_endpoint: iroh_endpoint.clone(),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        // Register our commands
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            create_room,
            join_room,
            get_rooms,
            leave_room
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
    Ok(())
}
