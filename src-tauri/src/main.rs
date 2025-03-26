#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod models;
mod state;
mod iroh;
mod handlers;

use std::collections::HashMap;
use std::sync::Mutex;
use state::AppState;
use handlers::{create_room, join_room, get_rooms, leave_room};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize Iroh node
    let iroh_endpoint = match iroh::setup::init_iroh_endpoint().await {
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
