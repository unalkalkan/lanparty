"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "../../lib/utils"

const SidebarContext = React.createContext<{
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  variant: "open" | "inset"
  collapsible: boolean | "icon"
}>({
  expanded: true,
  setExpanded: () => {},
  variant: "open",
  collapsible: false,
})

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [expanded, setExpanded] = React.useState(true)
  const [variant, setVariant] = React.useState<"open" | "inset">("open")
  const [collapsible, setCollapsible] = React.useState<boolean | "icon">(false)

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, variant, collapsible }}>
      {children}
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "relative flex h-full flex-col gap-2 overflow-hidden border-r bg-card text-card-foreground transition-width duration-300",
  {
    variants: {
      expanded: {
        true: "w-60",
        false: "w-16",
      },
      variant: {
        open: "",
        inset: "rounded-lg border",
      },
    },
    defaultVariants: {
      expanded: true,
      variant: "open",
    },
  }
)

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsible?: boolean | "icon"
}

export function Sidebar({
  className,
  expanded,
  variant,
  collapsible = false,
  ...props
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = React.useState(expanded ?? true)

  return (
    <SidebarContext.Provider
      value={{
        expanded: isExpanded,
        setExpanded: setIsExpanded,
        variant: variant || "open",
        collapsible,
      }}
    >
      <div
        className={cn(
          sidebarVariants({
            expanded: isExpanded,
            variant,
          }),
          className
        )}
        {...props}
      />
    </SidebarContext.Provider>
  )
}

export function SidebarTrigger() {
  const { expanded, setExpanded, collapsible } = React.useContext(SidebarContext)

  if (!collapsible) return null

  return (
    <button
      type="button"
      className="absolute right-2 top-2 h-6 w-6 rounded-md border bg-background p-0 text-muted-foreground"
      onClick={() => setExpanded(!expanded)}
    >
      {expanded ? (
        <ChevronsLeft className="h-4 w-4" />
      ) : (
        <ChevronsRight className="h-4 w-4" />
      )}
      <span className="sr-only">{expanded ? "Collapse" : "Expand"}</span>
    </button>
  )
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative px-4 py-2", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto px-2", className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t px-2 py-2", className)} {...props} />
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-2", className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = React.useContext(SidebarContext)

  if (!expanded) return null

  return (
    <div
      className={cn("mb-2 px-2 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("min-w-0 space-y-1", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("min-w-0", className)} {...props} />
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string
  active?: boolean
  asChild?: boolean
}

export function SidebarMenuButton({
  className,
  tooltip,
  active,
  children,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const { expanded } = React.useContext(SidebarContext)
  const Comp = asChild ? React.Fragment : "button"

  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent",
        !expanded && "justify-center",
        className
      )}
      {...(!asChild && {
        ...props,
        title: !expanded ? tooltip : undefined,
      })}
    >
      {asChild ? (
        React.Children.map(children as React.ReactElement, (child) =>
          React.cloneElement(child, {
            className: cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground",
              active && "bg-accent",
              !expanded && "justify-center"
            ),
            title: !expanded ? tooltip : undefined,
          })
        )
      ) : (
        <>
          {children && React.Children.map(children as React.ReactElement, (child, index) => {
            // Only display the first child (icon) when collapsed
            if (!expanded && index > 0) return null
            return child
          })}
        </>
      )}
    </Comp>
  )
}

export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = React.useContext(SidebarContext)

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        variant === "inset" ? "overflow-hidden p-4" : "",
        className
      )}
      {...props}
    />
  )
} 