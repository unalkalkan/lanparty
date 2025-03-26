use crate::models::{Room, Player};
use crate::state::AppState;
use iroh::ticket::NodeTicket;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub async fn create_room(state: State<'_, AppState>, room_name: String, player_name: String) -> Result<Room, String> {
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

#[tauri::command]
pub async fn join_room(state: State<'_, AppState>, room_id: String, player_name: String) -> Result<Room, String> {
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

#[tauri::command]
pub async fn get_rooms(state: State<'_, AppState>) -> Result<Vec<Room>, String> {
    let rooms = state.rooms.lock().map_err(|_| "Failed to lock rooms".to_string())?;
    Ok(rooms.values().cloned().collect())
}

#[tauri::command]
pub async fn leave_room(state: State<'_, AppState>, room_id: String, player_id: String) -> Result<(), String> {
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