use serde::{Serialize, Deserialize};
use crate::models::player::Player;

// Room struct to store room information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
    pub id: String,
    pub name: String,
    pub host: String,
    pub players: Vec<Player>,
    // We could add more fields here like game settings, etc.
}