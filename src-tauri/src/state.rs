use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use iroh::protocol::Router;
use iroh::Endpoint;
use iroh_gossip::net::Gossip;
use crate::models::Room;
use crate::iroh::gossip::{PeerEventBroadcaster, PeerEventsCache};

pub struct AppState {
    pub rooms: Arc<Mutex<HashMap<String, Room>>>,
    pub iroh_endpoint: Endpoint,
    pub _router: Router, // This is the router instance, currently not referenced
    pub gossip: Gossip,
    pub peer_event_broadcaster: PeerEventBroadcaster,
    pub peer_events_cache: PeerEventsCache,
} 