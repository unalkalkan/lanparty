"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ThemeToggle } from "../ui/theme-toggle"
import { Users, Settings } from "lucide-react"
import Link from "next/link"
import { invoke } from "@tauri-apps/api/core"
import { ThemeScript } from "../../lib/theme-script"

// Types copied from the existing Home component
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

export function HomeScreen() {
  const [roomId, setRoomId] = useState("")
  const [roomName, setRoomName] = useState("")
  const [playerName, setPlayerName] = useState("")
  // const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [_, setCurrentRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // const [copySuccess, setCopySuccess] = useState(false)
  const router = useRouter()

  const joinRoom = async () => {
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
      router.push(`/room?id=${encodeURIComponent(roomId)}`);
    } catch (err) {
      console.error('Failed to join room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  }

  const createRoom = async () => {
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
      router.push(`/room?id=${encodeURIComponent(room.id)}`);
    } catch (err) {
      console.error('Failed to create room:', err);
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ThemeScript />
      
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <Users className="h-5 w-5" />
            <span>LAN Party</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container flex flex-col items-center justify-center px-4 py-12 md:py-24 lg:py-32">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to LAN Party</CardTitle>
              <CardDescription>Connect with friends and play games as if you are on the same room</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="join" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="join">Join a Room</TabsTrigger>
                  <TabsTrigger value="create">Create a Room</TabsTrigger>
                </TabsList>
                <TabsContent value="join" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Enter Room ID" 
                      value={roomId} 
                      onChange={(e) => setRoomId(e.target.value)} 
                    />
                    <Input 
                      placeholder="Your Name" 
                      value={playerName} 
                      onChange={(e) => setPlayerName(e.target.value)} 
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={joinRoom}
                    disabled={loading}
                  >
                    {loading ? 'Joining...' : 'Join Room'}
                  </Button>
                </TabsContent>
                <TabsContent value="create" className="pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input 
                        placeholder="Room Name" 
                        value={roomName} 
                        onChange={(e) => setRoomName(e.target.value)} 
                      />
                      <Input 
                        placeholder="Your Name" 
                        value={playerName} 
                        onChange={(e) => setPlayerName(e.target.value)} 
                      />
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={createRoom}
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create New Room'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Create or join a room to connect with friends in a peer-to-peer network.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
} 