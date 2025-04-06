"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"
import { ThemeToggle } from "../ui/theme-toggle"
import { PortManagementPanel } from "../PortManagementPanel"
import { Users, Settings, Home, Copy, ArrowLeft, CheckCircle, AlertCircle, Clock, Plus } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "../ui/sidebar"
import { invoke } from "@tauri-apps/api/tauri"
import PeerJoinNotification from '../PeerJoinNotification'
import { ThemeScript } from "../../lib/theme-script"

// Types from the existing Home component
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

// Mock data for logs
const generateMockLogs = () => {
  const logTypes = ["info", "warning", "error", "success"]
  const logMessages = [
    "Connection established with peer",
    "Port 27015 opened successfully",
    "Peer disconnected",
    "Waiting for peer to accept connection",
    "Port forwarding enabled",
    "Network configuration updated",
  ]

  return Array(20)
    .fill(null)
    .map((_, i) => ({
      id: i,
      type: logTypes[Math.floor(Math.random() * logTypes.length)],
      message: logMessages[Math.floor(Math.random() * logMessages.length)],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
    }))
}

export function RoomDashboard({ roomId }: { roomId: string }) {
  const router = useRouter()
  const [isPortPanelOpen, setIsPortPanelOpen] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [logs, setLogs] = useState(generateMockLogs())
  const [copySuccess, setCopySuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true)
        // Fetch room data based on the roomId
        const room = await invoke<Room>('get_room', { roomId });
        setCurrentRoom(room);
      } catch (err) {
        console.error('Failed to fetch room data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch room data');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

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
      
      router.push('/')
    } catch (err) {
      console.error('Failed to leave room:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave room');
    }
  }

  // Function to add a new player to the current room
  const addPlayerToRoom = (player: Player) => {
    if (currentRoom) {
      // Check if player already exists in the room
      const playerExists = currentRoom.players.some(p => p.id === player.id);
      
      if (!playerExists) {
        // Create a new room object with the added player
        setCurrentRoom({
          ...currentRoom,
          players: [...currentRoom.players, player]
        });
      }
    }
  };

  // Status icon component
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "disconnected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // Log item component
  const LogItem = ({ log }: { log: any }) => {
    const getLogColor = (type: string) => {
      switch (type) {
        case "info":
          return "text-blue-500 dark:text-blue-400"
        case "warning":
          return "text-yellow-500 dark:text-yellow-400"
        case "error":
          return "text-red-500 dark:text-red-400"
        case "success":
          return "text-green-500 dark:text-green-400"
        default:
          return ""
      }
    }

    return (
      <div className="flex items-start py-1 text-sm">
        <span className={`font-mono ${getLogColor(log.type)}`}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
        <span className="ml-2">{log.message}</span>
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading room data...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Room not found or access denied</div>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ThemeScript />
      <div className="flex min-h-screen">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 font-bold">
              <Users className="h-5 w-5" />
              <span>P2P LAN Gaming</span>
            </div>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Room</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Room ID">
                      <div className="flex items-center justify-between w-full">
                        <span>Room ID: {roomId}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyRoomId}>
                          {copySuccess ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Connected Peers</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {currentRoom.players.map((player) => (
                    <SidebarMenuItem key={player.id}>
                      <SidebarMenuButton tooltip={`Status: connected`}>
                        <StatusIcon status="connected" />
                        <span>{player.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="flex flex-col h-full">
            <header className="border-b">
              <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                  </Button>
                  <h1 className="text-xl font-bold">Room Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="flex-1 p-4 md:p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Port Management</h2>
                    <Button onClick={() => setIsPortPanelOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Port
                    </Button>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">TCP</Badge>
                          <span>27015</span>
                        </div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">UDP</Badge>
                          <span>7777</span>
                        </div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">TCP</Badge>
                          <span>3074</span>
                        </div>
                        <Badge className="bg-yellow-500">Pending</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Connection Logs</h2>
                  <div className="rounded-lg border">
                    <ScrollArea className="h-[300px] p-4">
                      <div className="space-y-1">
                        {logs.map((log) => (
                          <LogItem key={log.id} log={log} />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </main>

            <footer className="border-t p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {currentRoom.players.length} peers connected
                  </span>
                </div>
                <Button variant="outline" onClick={leaveRoom}>
                  Leave Room
                </Button>
              </div>
            </footer>
          </div>
        </SidebarInset>
      </div>

      <PortManagementPanel open={isPortPanelOpen} onOpenChange={setIsPortPanelOpen} />
      {currentRoom && (
        <PeerJoinNotification 
          roomId={currentRoom.id} 
          onPlayerJoin={addPlayerToRoom}
        />
      )}
    </SidebarProvider>
  )
} 