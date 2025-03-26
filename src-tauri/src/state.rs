use std::collections::HashMap;
use std::sync::Mutex;
use iroh::Endpoint;
use crate::models::Room;

pub struct AppState {
    pub rooms: Mutex<HashMap<String, Room>>,
    pub iroh_endpoint: Endpoint,
} 