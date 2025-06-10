"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
    BookOpen,
    Settings,
    Bell,
    User,
    ChevronLeft,
    ChevronRight,
    Target,
    Brain,
    Lightbulb,
    BarChart3,
    LogOut,
    ArrowLeft,
    Sparkles,
    Database,
    Zap,
    Calendar,
    Users,
    MessageSquare,
    GraduationCap
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"

type Props = {
    projectId: string
    collapsed: boolean
    onToggle: () => void
}

const PROJECT_NAV_ITEMS = [
    {
        name: "Overview",
        href: "/overview",
        icon: Sparkles,
        description: "Project details, stats, and information"
    },
    {
        name: "Library",
        href: "/library",
        icon: Database,
        description: "Research paper library with advanced search and filters"
    },
    {
        name: "AI Agents",
        href: "/agents",
        icon: Brain,
        description: "AI-powered research assistants"
    },
    {
        name: "Insights",
        href: "/insights",
        icon: Lightbulb,
        description: "Research insights and gap analysis"
    },
    {
        name: "Tasks",
        href: "/tasks",
        icon: Target,
        description: "Reading list and task management"
    },
    {
        name: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        description: "Research progress and analytics"
    },
    {
        name: "Collaboration",
        href: "/collaboration",
        icon: Users,
        description: "Team collaboration and sharing"
    }
]

const PROJECT_BOTTOM_ITEMS = [
    {
        name: "Project Settings",
        href: "/settings",
        icon: Settings,
        description: "Project configuration and preferences"
    },
    {
        name: "Notifications",
        href: "/notifications",
        icon: Bell,
        description: "Project notifications and alerts"
    }
]

export function ProjectSidebar({ projectId, collapsed, onToggle }: Props) {
    const pathname = usePathname()
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Load project data
    useEffect(() => {
        loadProject()
    }, [projectId])

    const loadProject = async () => {
        try {
            setIsLoading(true)
            const projectData = await projectsApi.getProject(projectId)
            setProject(projectData)
        } catch (error) {
            console.error('Error loading project:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleExitProject = () => {
        router.push('/interface/home')
    }

    const getProjectPath = (href: string) => `/interface/projects/${projectId}${href}`

    const SidebarItem = ({ item, isBottom = false }: { item: typeof PROJECT_NAV_ITEMS[0], isBottom?: boolean }) => {
        const fullPath = getProjectPath(item.href)
        const isActive = pathname === fullPath

        const content = (
            <Link
                href={fullPath}
                className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 group relative backdrop-blur-sm border",
                    "hover:bg-primary/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
                    isActive
                        ? "bg-gradient-to-r from-primary/20 to-purple-500/10 text-primary border-primary/30 shadow-lg shadow-primary/20"
                        : "text-foreground/80 hover:text-foreground border-transparent bg-background/20",
                    collapsed && "justify-center px-2"
                )}
            >
                <div className={cn(
                    "relative p-1.5 rounded-lg transition-all duration-300",
                    isActive
                        ? "bg-gradient-to-r from-primary/30 to-purple-500/20"
                        : "group-hover:bg-primary/10"
                )}>
                    <item.icon className={cn(
                        "h-4 w-4 transition-all duration-300",
                        isActive
                            ? "text-primary drop-shadow-glow"
                            : "text-foreground/70 group-hover:text-primary"
                    )} />
                </div>
                {!collapsed && (
                    <span className="truncate font-medium">{item.name}</span>
                )}
                {isActive && !collapsed && (
                    <div className="absolute right-3 w-2 h-2 bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-lg shadow-primary/50" />
                )}
            </Link>
        )

        if (collapsed) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        {content}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-background/90 backdrop-blur-xl border-primary/20 text-foreground shadow-2xl">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                    </TooltipContent>
                </Tooltip>
            )
        }

        return content
    }

    return (
        <TooltipProvider>
            <div className={cn(
                "flex h-screen flex-col bg-background/40 backdrop-blur-xl border-r border-primary/10 transition-all duration-300 relative overflow-hidden",
                collapsed ? "w-16" : "w-72"
            )}>
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/50 to-purple-500/5" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl" />

                {/* Header */}
                <div className={cn(
                    "flex h-16 items-center justify-between px-4 border-b border-primary/10 relative z-10",
                    collapsed && "px-2"
                )}>
                    {!collapsed && (
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300">
                                <GraduationCap className="h-6 w-6 text-white drop-shadow-glow" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent truncate">
                                    {isLoading ? "Loading..." : project?.name || "Project"}
                                </span>
                                <span className="text-xs text-muted-foreground">Research Project</span>
                            </div>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className={cn(
                            "h-8 w-8 p-0 text-foreground/70 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-lg",
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



                {/* Project Stats */}
                {!collapsed && project && (
                    <div className="p-3 border-b border-primary/10 relative z-10">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-background/20 rounded-lg p-2 border border-primary/10">
                                <div className="text-muted-foreground">Papers</div>
                                <div className="font-semibold text-primary">{project.totalPapers}</div>
                            </div>
                            <div className="bg-background/20 rounded-lg p-2 border border-primary/10">
                                <div className="text-muted-foreground">Progress</div>
                                <div className="font-semibold text-green-500">{project.progress}%</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 space-y-2 p-3 relative z-10 overflow-y-auto custom-scrollbar">
                    {!collapsed && (
                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                                Project Navigation
                            </h3>
                        </div>
                    )}

                    {PROJECT_NAV_ITEMS.map((item) => (
                        <SidebarItem key={item.name} item={item} />
                    ))}

                    {/* Separator */}
                    <div className="my-4 px-3">
                        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    </div>

                    {PROJECT_BOTTOM_ITEMS.map((item) => (
                        <SidebarItem key={item.name} item={item} isBottom />
                    ))}
                </nav>

                {/* Exit Project Button at Bottom */}
                <div className="p-3 border-t border-primary/10 relative z-10 mt-auto">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleExitProject}
                                variant="outline"
                                size={collapsed ? "sm" : "default"}
                                className={cn(
                                    "w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all duration-300",
                                    collapsed && "px-2"
                                )}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {!collapsed && <span className="ml-2">Exit Project</span>}
                            </Button>
                        </TooltipTrigger>
                        {collapsed && (
                            <TooltipContent side="right" className="bg-background/90 backdrop-blur-xl border-primary/20 text-foreground shadow-2xl">
                                <p className="font-medium">Exit Project</p>
                                <p className="text-xs text-muted-foreground">Return to main interface</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </div>

            </div>
        </TooltipProvider>
    )
} 