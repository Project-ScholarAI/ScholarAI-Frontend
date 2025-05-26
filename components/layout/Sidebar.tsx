"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BookOpen,
  Settings,
  Home,
  Bell,
  User,
  Workflow,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Folder,
  GitBranch,
  Bug,
  Zap,
  Brain,
  Sparkles,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LogoutButton } from "@/components/auth/LogoutButton"

type Props = {
  collapsed: boolean
  onToggle: () => void
}

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/interface/dashboard",
    icon: Home,
    description: "Overview and analytics"
  },
  {
    name: "Library",
    href: "/interface/library",
    icon: BookOpen,
    description: "Document library"
  },
  {
    name: "AI Assistant",
    href: "/interface/ai",
    icon: Brain,
    description: "AI-powered research assistant"
  },
  {
    name: "Workflows",
    href: "/interface/workflows",
    icon: Workflow,
    description: "Automated workflows"
  },
  {
    name: "Search",
    href: "/interface/search",
    icon: Search,
    description: "Global search"
  },
  {
    name: "Notifications",
    href: "/interface/notifications",
    icon: Bell,
    description: "Recent notifications"
  }
]

const BOTTOM_ITEMS = [
  {
    name: "Settings",
    href: "/interface/settings",
    icon: Settings,
    description: "Application settings"
  },
  {
    name: "Account",
    href: "/interface/account",
    icon: User,
    description: "User profile"
  }
]

export function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname()

  const SidebarItem = ({ item, isBottom = false }: { item: typeof NAV_ITEMS[0], isBottom?: boolean }) => {
    const isActive = pathname.startsWith(item.href)

    const content = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
          "hover:bg-[#2a2d2e] hover:text-white",
          isActive
            ? "bg-[#094771] text-[#75beff] shadow-sm border-l-2 border-[#007acc]"
            : "text-[#cccccc] hover:text-white",
          collapsed && "justify-center px-2"
        )}
      >
        <item.icon className={cn(
          "h-5 w-5 transition-colors",
          isActive ? "text-[#75beff]" : "text-[#cccccc] group-hover:text-white"
        )} />
        {!collapsed && (
          <span className="truncate">{item.name}</span>
        )}
        {isActive && !collapsed && (
          <div className="absolute right-2 w-1 h-1 bg-[#007acc] rounded-full" />
        )}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#2d2d30] border-[#3e3e42] text-white">
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-gray-400">{item.description}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return content
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "flex h-screen flex-col bg-[#252526] border-r border-[#3e3e42] transition-all duration-300",
        collapsed ? "w-12" : "w-64"
      )}>
        {/* Header */}
        <div className="flex h-12 items-center justify-between px-3 border-b border-[#3e3e42]">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#007acc] to-[#005a9e] rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">ScholarAI</span>
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 p-0 text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[#3e3e42] p-2 space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <SidebarItem key={item.name} item={item} isBottom />
          ))}
          {/* Logout Button */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <LogoutButton className="flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-200 group relative hover:bg-[#2a2d2e] hover:text-white text-[#cccccc]">
                  <LogOut className="h-5 w-5 text-[#cccccc] group-hover:text-white" />
                </LogoutButton>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#2d2d30] border-[#3e3e42] text-white">
                <p className="font-medium">Logout</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <LogoutButton className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative hover:bg-[#2a2d2e] hover:text-white text-[#cccccc]">
              <LogOut className="h-5 w-5 text-[#cccccc] group-hover:text-white" />
              <span className="truncate">Logout</span>
            </LogoutButton>
          )}
        </div>

        {/* Status Bar */}
        {!collapsed && (
          <div className="border-t border-[#3e3e42] p-3">
            <div className="flex items-center gap-2 text-xs text-[#cccccc]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Online</span>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <GitBranch className="h-3 w-3" />
                <span>main</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
