<div align="center">
  <h1>LAN Party</h1>
  <h3>🎮 P2P Port Sharing for Gaming with Friends 🎮</h3>

<p>
  <strong>⚠️ WARNING: This project is under heavy development and is not ready for use yet. ⚠️</strong>
</p>

</div>

## ❓ What is LAN Party?

LAN Party is a powerful peer-to-peer application that allows gamers to play together as if they were on the same local network, regardless of their physical location. By facilitating port sharing and network connection between peers, it creates a virtual LAN environment perfect for multiplayer gaming sessions.

## ✨ Key Features

### Core Functionality
- **Peer Discovery & Connection**: Create or join rooms with unique IDs
- **Port Sharing & Management**: Select which local ports to share with others
- **Room Management**: Create, join, and leave rooms easily
- **Security & Privacy**: Encrypted connections between peers
- **Logging & Monitoring**: View real-time connection activity

### User Experience
- **Minimalist UI**: Clean interface with dark/light mode options
- **Simple Navigation**: Intuitive layout for easy access to all features
- **Status Indicators**: Color coding for connection status (connected, pending, disconnected)
- **Minimal Configuration**: Get started quickly with sensible defaults

## 💪 Motivation

Online gaming often requires complex port forwarding setup or VPN solutions to play certain games with friends. Many games also require renting expensive dedicated servers from hosting providers, adding an ongoing cost to play with friends. LAN Party eliminates these barriers by creating a seamless peer-to-peer connection that mimics a local area network, without requiring technical networking knowledge or paying for dedicated server hosting services.

## 📦 Installation

Coming soon! The project is currently under heavy development.

## 🎨 Using LAN Party

Once released, LAN Party will feature:

1. **Creating or Joining a Room**
   - Create a new room and share the room ID with friends
   - Join an existing room by entering a room ID

2. **Managing Port Sharing**
   - Select which application ports to share with peers
   - Control access permissions for specific peers

3. **Monitoring Connections**
   - View active connections and data transfer logs
   - Check the status of shared ports and connections

## 🧪 Platform Support

LAN Party is being built as a cross-platform application using Nextauri (Next.js + Tauri), allowing it to run efficiently on:
- Windows
- macOS
- Linux

## ⚡ Technical Implementation

LAN Party leverages [Iroh](https://www.iroh.computer/) P2P library for peer-to-peer connections and encryption, with a focus on:
- Secure, encrypted data transfer
- NAT traversal for connectivity across different networks
- Minimal resource usage
- No central server dependency after initial connection

## ⚠️ Current Status

This project is under active development and is not yet ready for public use. Features are being implemented and tested continuously. Stay tuned for the first release!

# LAN Party

A Tauri-based peer-to-peer application for creating virtual LAN environments.

## Prerequisites

- [Node.js](https://nodejs.org/) v20.5.0 or higher
- [npm](https://www.npmjs.com/) v10.8.1 or higher
- [nvm](https://github.com/nvm-sh/nvm) (recommended for managing Node.js versions)
- [Rust](https://www.rust-lang.org/) (required for Tauri)

## Setup

This project uses Node.js v20.5.0 and npm v10.8.1. To ensure you're using the correct versions, you can use the included setup script:

```bash
nvm use
```

## Development

1. First, set up the correct Node.js version:

```bash
nvm use 20.5.0
```

2. Install dependencies (if you haven't already):

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Project Structure

- `src-next/`: Next.js frontend code
- `src-tauri/`: Tauri backend code
- `ui-mock/`: UI component mockups

## Available Scripts

- `npm run setup`: Set up the correct Node.js version
- `npm run dev`: Start the development server
- `npm run lint`: Run ESLint on the Next.js code
- `npm run clippy`: Run Clippy (Rust linter) on the Tauri code
- `npm run next-build`: Build the Next.js application

## Notes for Developers

- The project requires Node.js v20.5.0 or higher, which you can install via nvm using the included `.nvmrc` file.
- If you encounter errors related to Node.js or npm versions, run the setup script: `./setup-node.sh`
- The project uses Tailwind CSS v4 for styling, which requires the `@tailwindcss/postcss` plugin.
