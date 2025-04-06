"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RoomDashboard } from "../../components/RoomDashboard"
import { Button } from "../../components/ui/button"

function RoomContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [roomId, setRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Extract room ID from the query parameters
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setRoomId(id)
    } else {
      setError("No room ID provided")
    }
    setLoading(false)
  }, [searchParams])
  
  // If we have a room ID, render the dashboard
  if (roomId) {
    return <RoomDashboard roomId={roomId} />
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Loading room...</p>
        </div>
      </div>
    )
  }
  
  // Error/Not found state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
      <p className="mb-6 text-center">
        {error || "Please use a valid room ID or create a new room from the home page."}
      </p>
      <Button onClick={() => router.push('/')}>
        Back to Home
      </Button>
    </div>
  )
}

export default function RoomPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Loading room...</p>
        </div>
      </div>
    }>
      <RoomContent />
    </Suspense>
  )
} 