"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Switch } from "../ui/switch"
import { Slider } from "../ui/slider"
import { ThemeToggle } from "../ui/theme-toggle"
import { ArrowLeft, Shield, Eye, Zap } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ThemeScript } from "../../lib/theme-script"

export function SettingsPage() {
  const [encryptionLevel, setEncryptionLevel] = useState("standard")
  const [logVerbosity, setLogVerbosity] = useState(["50"])
  const [autoConnect, setAutoConnect] = useState(true)
  const [upnpEnabled, setUpnpEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  return (
    <div className="flex min-h-screen flex-col">
      <ThemeScript />
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container px-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the application looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <span className="text-sm text-muted-foreground">Choose between light, dark, or system theme</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Notifications</Label>
                      <Switch
                        id="notifications"
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when peers connect or disconnect
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Logs</CardTitle>
                  <CardDescription>Configure how detailed the application logs should be</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="log-verbosity">Log Verbosity</Label>
                      <span className="text-sm font-medium">{Number.parseInt(logVerbosity[0])}%</span>
                    </div>
                    <Slider
                      id="log-verbosity"
                      value={logVerbosity.map(Number)}
                      onValueChange={(value) => setLogVerbosity(value.map(String))}
                      max={100}
                      step={10}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Minimal</span>
                      <span>Detailed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>Encryption Settings</CardTitle>
                  </div>
                  <CardDescription>Configure how your connections are encrypted</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={encryptionLevel} onValueChange={setEncryptionLevel} className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="standard" className="font-medium">
                          Standard Encryption
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Balanced security and performance for most games
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="high" className="font-medium">
                          High Encryption
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enhanced security with minimal performance impact
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="maximum" id="maximum" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="maximum" className="font-medium">
                          Maximum Encryption
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Highest level of security, may impact performance on slower connections
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <CardTitle>Privacy</CardTitle>
                  </div>
                  <CardDescription>Control who can see and connect to your shared ports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-visibility">Default Port Visibility</Label>
                    <Select defaultValue="room-only">
                      <SelectTrigger id="default-visibility">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="room-only">Room Members Only</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="invite">Invite Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-connect">Auto-Connect</Label>
                      <p className="text-sm text-muted-foreground">Automatically connect to trusted peers</p>
                    </div>
                    <Switch id="auto-connect" checked={autoConnect} onCheckedChange={setAutoConnect} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle>Network Settings</CardTitle>
                  </div>
                  <CardDescription>Advanced network configuration options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="upnp">UPnP</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically configure port forwarding on your router
                      </p>
                    </div>
                    <Switch id="upnp" checked={upnpEnabled} onCheckedChange={setUpnpEnabled} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stun-server">STUN Server</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger id="stun-server">
                        <SelectValue placeholder="Select STUN server" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatic (Recommended)</SelectItem>
                        <SelectItem value="google">Google STUN</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      STUN servers help establish peer-to-peer connections
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="connection-timeout">Connection Timeout (seconds)</Label>
                    <Input id="connection-timeout" type="number" defaultValue="30" min="5" max="120" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Manage application data and logs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Button variant="outline">Export Logs</Button>
                    <Button variant="outline">Clear All Data</Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Clearing data will remove all saved rooms and connection history
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container flex justify-between items-center px-4">
          <p className="text-sm text-muted-foreground">LAN Party v1.0.0</p>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </footer>
    </div>
  )
} 