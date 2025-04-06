"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "./button"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  // Only render UI when mounted to avoid hydration errors
  React.useEffect(() => setMounted(true), [])
  
  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled aria-label="Toggle theme">
      <Sun className="h-5 w-5" />
    </Button>
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 