import React, { useEffect, useState, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import './style.css';

interface PeerJoinEvent {
  peer_id: string;
  player_name: string;
  topic_id: string;
}

interface PeerJoinNotificationProps {
  roomId: string;
  onPlayerJoin: (player: { id: string; name: string }) => void;
}

// Track subscriptions across component instances
const subscribedRooms = new Set<string>();
// Track topic IDs by room ID
const roomTopics = new Map<string, string>();

export default function PeerJoinNotification({ roomId, onPlayerJoin }: PeerJoinNotificationProps) {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const seenPeerIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let unlisten: () => void;
    
    // Reset seen peer IDs when room changes
    seenPeerIds.current = new Set();

    const setup = async () => {
      try {
        // Only subscribe if we haven't already for this room
        if (!subscribedRooms.has(roomId)) {
          // Subscribe to peer events from Rust
          await invoke('subscribe_peer_events', { roomId });
          subscribedRooms.add(roomId);
          
          // Get the room information to extract topic ID
          const room = await invoke('get_room', { roomId });
          if (room) {
            // Store the mapping between roomId and topicId
            // We'll extract it from the first event we receive
            console.log(`Subscribed to room ${roomId}`);
          }
        }

        // Listen for peer joined events from Tauri
        unlisten = await listen<PeerJoinEvent>('peer-joined', (event) => {
          const { peer_id, player_name, topic_id } = event.payload;
          
          // Store topic ID for this room if we don't have it yet
          if (!roomTopics.has(roomId)) {
            roomTopics.set(roomId, topic_id);
          }
          
          // Skip if this event is not for our room
          const roomTopicId = roomTopics.get(roomId);
          if (roomTopicId && topic_id !== roomTopicId) {
            return;
          }
          
          // Skip if we've already seen this peer
          if (seenPeerIds.current.has(peer_id)) {
            console.log(`Already showed notification for ${player_name} (${peer_id})`);
            return;
          }
          
          // Add to seen set
          seenPeerIds.current.add(peer_id);
          
          // Call onPlayerJoin with the new player data
          onPlayerJoin({
            id: peer_id,
            name: player_name
          });
          
          // Add a new notification
          const newNotification = {
            id: Date.now().toString(),
            message: `${player_name} joined the room`
          };
          
          setNotifications(prev => [...prev, newNotification]);
          
          // Remove notification after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
          }, 5000);
        });
      } catch (error) {
        console.error('Error setting up peer join notifications:', error);
      }
    };

    setup();

    // Cleanup function
    return () => {
      if (unlisten) unlisten();
    };
  }, [roomId, onPlayerJoin]);

  if (notifications.length === 0) return null;

  return (
    <div className="peer-notifications">
      {notifications.map(notification => (
        <div key={notification.id} className="notification-item">
          <span className="notification-icon">👤</span>
          <span className="notification-message">{notification.message}</span>
        </div>
      ))}
    </div>
  );
}