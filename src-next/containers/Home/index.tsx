"use client";

import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Types for our data
interface Player {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  host: string;
  players: Player[];
}

const Home = () => {
  const [choice, setChoice] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = () => {
    setChoice('create');
    setError(null);
  };

  const handleJoinRoom = () => {
    setChoice('join');
    setError(null);
  };

  const handleBackToChoice = () => {
    setChoice(null);
    setError(null);
  };

  const submitCreateRoom = async () => {
    if (!roomName.trim() || !playerName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call our Rust function to create a room
      const room = await invoke<Room>('create_room', {
        roomName,
        playerName
      });
      
      setCurrentRoom(room);
      setChoice('room');
    } catch (err) {
      console.error('Failed to create room:', err);
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const submitJoinRoom = async () => {
    if (!roomId.trim() || !playerName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call our Rust function to join a room
      const room = await invoke<Room>('join_room', {
        roomId,
        playerName
      });
      
      setCurrentRoom(room);
      setChoice('room');
    } catch (err) {
      console.error('Failed to join room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!currentRoom) return;

    try {
      // Find our player ID (we're assuming the last player in the list is us)
      const playerId = currentRoom.players[currentRoom.players.length - 1].id;
      
      // Call our Rust function to leave the room
      await invoke('leave_room', {
        roomId: currentRoom.id,
        playerId
      });
      
      setCurrentRoom(null);
      setChoice(null);
    } catch (err) {
      console.error('Failed to leave room:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave room');
    }
  };

  const renderCreateRoomForm = () => (
    <div className="room-form">
      <h2>Create a New Room</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="roomName">Room Name:</label>
        <input 
          type="text" 
          id="roomName" 
          placeholder="Enter room name" 
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="playerName">Your Name:</label>
        <input 
          type="text" 
          id="playerName" 
          placeholder="Enter your name" 
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button onClick={handleBackToChoice} className="secondary-button" disabled={loading}>Back</button>
        <button onClick={submitCreateRoom} className="primary-button" disabled={loading}>
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </div>
    </div>
  );

  const renderJoinRoomForm = () => (
    <div className="room-form">
      <h2>Join a Room</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="roomId">Room ID:</label>
        <input 
          type="text" 
          id="roomId" 
          placeholder="Enter room ID" 
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="playerName">Your Name:</label>
        <input 
          type="text" 
          id="playerName" 
          placeholder="Enter your name" 
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button onClick={handleBackToChoice} className="secondary-button" disabled={loading}>Back</button>
        <button onClick={submitJoinRoom} className="primary-button" disabled={loading}>
          {loading ? 'Joining...' : 'Join Room'}
        </button>
      </div>
    </div>
  );

  const renderRoom = () => {
    if (!currentRoom) return null;
    
    return (
      <div className="room-view">
        <h2>Room: {currentRoom.name}</h2>
        <p className="room-id">Room ID: <span className="code">{currentRoom.id}</span></p>
        <p>Host: {currentRoom.host}</p>
        
        <div className="player-list">
          <h3>Players ({currentRoom.players.length})</h3>
          <ul>
            {currentRoom.players.map(player => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
        </div>
        
        <div className="room-actions">
          <button onClick={leaveRoom} className="secondary-button">Leave Room</button>
        </div>
      </div>
    );
  };

  const renderChoice = () => (
    <div className="choice-container">
      <h1 className="app-title">LAN Party</h1>
      <p className="tagline">Play games with friends on your local network</p>
      
      <div className="choice-buttons">
        <button onClick={handleCreateRoom} className="primary-button">
          Create a Room
        </button>
        <button onClick={handleJoinRoom} className="primary-button">
          Join a Room
        </button>
      </div>
    </div>
  );

  return (
    <div className='home-container'>
      {choice === null && renderChoice()}
      {choice === 'create' && renderCreateRoomForm()}
      {choice === 'join' && renderJoinRoomForm()}
      {choice === 'room' && renderRoom()}
    </div>
  );
}

export default Home;
