#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::{State, Manager};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

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
}

// Function to create a new room
#[tauri::command]
fn create_room(state: State<'_, AppState>, room_name: String, player_name: String) -> Result<Room, String> {
    let room_id = Uuid::new_v4().to_string();
    let player_id = Uuid::new_v4().to_string();
    
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

// Function to join an existing room
#[tauri::command]
fn join_room(state: State<'_, AppState>, room_id: String, player_name: String) -> Result<Room, String> {
    let mut rooms = state.rooms.lock().map_err(|_| "Failed to lock rooms".to_string())?;
    
    // Check if the room exists
    let room = rooms.get_mut(&room_id).ok_or_else(|| "Room not found".to_string())?;
    
    // Create a new player
    let player_id = Uuid::new_v4().to_string();
    let player = Player {
        id: player_id,
        name: player_name,
    };
    
    // Add the player to the room
    room.players.push(player);
    
    Ok(room.clone())
}

// Function to get all active rooms
#[tauri::command]
fn get_rooms(state: State<'_, AppState>) -> Result<Vec<Room>, String> {
    let rooms = state.rooms.lock().map_err(|_| "Failed to lock rooms".to_string())?;
    Ok(rooms.values().cloned().collect())
}

// Function to leave a room
#[tauri::command]
fn leave_room(state: State<'_, AppState>, room_id: String, player_id: String) -> Result<(), String> {
    let mut rooms = state.rooms.lock().map_err(|_| "Failed to lock rooms".to_string())?;
    
    // Check if the room exists
    let room = rooms.get_mut(&room_id).ok_or_else(|| "Room not found".to_string())?;
    
    // Remove the player from the room
    room.players.retain(|p| p.id != player_id);
    
    // If no players left, remove the room
    if room.players.is_empty() {
        rooms.remove(&room_id);
    }
    
    Ok(())
}

fn main() {
    // Initialize the application state
    let app_state = AppState {
        rooms: Mutex::new(HashMap::new()),
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
}
