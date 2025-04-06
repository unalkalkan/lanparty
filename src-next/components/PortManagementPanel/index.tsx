"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "../ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"

interface PortManagementPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PortManagementPanel({ open, onOpenChange }: PortManagementPanelProps) {
  const [portNumber, setPortNumber] = useState("")
  const [protocol, setProtocol] = useState("tcp")
  const [allowAll, setAllowAll] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle port sharing logic here
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Port</SheetTitle>
          <SheetDescription>Configure a local port to share with your peers.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="port">Port Number</Label>
              <Input
                id="port"
                type="number"
                placeholder="e.g. 27015"
                value={portNumber}
                onChange={(e) => setPortNumber(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={protocol} onValueChange={setProtocol}>
                <SelectTrigger id="protocol">
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="both">TCP & UDP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="game">Game (Optional)</Label>
              <Select>
                <SelectTrigger id="game">
                  <SelectValue placeholder="Select game or custom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minecraft">Minecraft</SelectItem>
                  <SelectItem value="csgo">Counter-Strike</SelectItem>
                  <SelectItem value="valheim">Valheim</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selecting a game will automatically configure recommended ports
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-all" className="flex-1">
                Allow access to all peers
              </Label>
              <Switch id="allow-all" checked={allowAll} onCheckedChange={setAllowAll} />
            </div>
            {!allowAll && (
              <div className="grid gap-2">
                <Label htmlFor="specific-peers">Specific Peers</Label>
                <Select>
                  <SelectTrigger id="specific-peers">
                    <SelectValue placeholder="Select peers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alice">Alice</SelectItem>
                    <SelectItem value="bob">Bob</SelectItem>
                    <SelectItem value="charlie">Charlie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <SheetFooter>
            <Button type="submit">Add Port</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
} 