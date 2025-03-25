# Lan Party

### **Feature Requirements**

#### **Core Features**

1. **Peer Discovery & Connection**
    - Each user has a unique `node id`.
    - Users can create and join rooms using a `room ID`.
    - Room creator acts as the initial host but does not necessarily have extra privileges.
2. **Port Sharing & Management**
    - Users can select local ports to share with others.
    - Peers in the same room can see available ports and request access.
    - Ability to set access permissions for specific peers.
3. **Room Management**
    - Create a new room and receive a `room ID` for sharing.
    - Join a room via `room ID` input.
    - List active peers in a room with their `node id`.
    - Option to leave a room.
4. **Security & Privacy**
    - Encrypted connections between peers.
    - Option to password-protect a room.
    - Firewall/NAT traversal support via STUN/TURN if needed.
5. **Logging & Monitoring**
    - See incoming and outgoing connections.
    - Display real-time logs of data transfer activity.
6. **User Experience Enhancements**
    - Minimal configuration required for first-time use.
    - Auto-reconnect to room if disconnected.
    - Notifications for new connections, disconnections, or errors.

---

### **Visual Design Considerations**

1. **Minimalist UI**
    - Dark/light mode options.
    - Simple tabbed interface for easy navigation.
2. **Main Screen Layout**
    - **Sidebar**: Room list & peer list.
    - **Main Panel**: Port-sharing controls, logs, connection status.
    - **Bottom Panel**: Quick actions (Join Room, Leave Room, etc.).
3. **Color Coding for Status**
    - Green: Active connection.
    - Yellow: Connection pending.
    - Red: Disconnected.

---

### **Sequence of Pages**

1. **Splash Screen (Loading)**
    - Displaying "Connecting to P2P network…"
2. **Home Page (Room Selection)**
    - Option to **Create a Room** or **Join a Room**.
    - If joining, prompt for `room ID`.
3. **Room Dashboard**
    - Displays connected peers.
    - Port-sharing options.
    - Real-time logs.
4. **Port Management Panel** (Modal or Side Panel)
    - Select local ports to share.
    - Set access permissions.
5. **Settings Page**
    - Encryption settings.
    - UI preferences (theme, logs verbosity).


Let's build a web app that is going to be used for p2p port opening for playing games with your friends as if you are on the same LAN. It won't have accounts, it will just have rooms and options to either create a room or join to a room.
This app will have following pages:

### Sequence of Pages
1. **Home Page (Room Selection)**
    - Option to **Create a Room** or **Join a Room**.
    - If joining, prompt for `room ID`.
2. **Room Dashboard**
    - Displays connected peers.
    - Port-sharing options.
    - Real-time logs.
3. **Port Management Panel** (Modal or Side Panel)
    - Select local ports to share.
    - Set access permissions.
4. **Settings Page**
    - Encryption settings.
    - UI preferences (theme, logs verbosity).


### **Visual Design Considerations**

1. **Minimalist UI**
    - Dark/light mode options.
    - Simple tabbed interface for easy navigation.
2. **Main Screen Layout**
    - **Sidebar**: Room list & peer list.
    - **Main Panel**: Port-sharing controls, logs, connection status.
    - **Bottom Panel**: Quick actions (Join Room, Leave Room, etc.).
3. **Color Coding for Status**
    - Green: Active connection.
    - Yellow: Connection pending.
    - Red: Disconnected.


 **Splash Screen (Loading)**
    - Displaying "Connecting to P2P network…"
