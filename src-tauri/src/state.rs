use std::collections::HashMap;
use tokio::sync::Mutex;
use iroh::protocol::Router;
use iroh::Endpoint;
use iroh_gossip::net::Gossip;
use crate::models::Room;

pub struct AppState {
    pub rooms: Mutex<HashMap<String, Room>>,
    pub iroh_endpoint: Endpoint,
    pub _router: Router, // This is the router instance, currently not referenced
    pub gossip: Gossip,
} 