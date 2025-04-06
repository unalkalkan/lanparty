"use client"

import { RoomDashboard } from "../../../components/RoomDashboard"

export default function RoomPage({ params }: { params: { id: string } }) {
  return <RoomDashboard roomId={params.id} />
} 