"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Plus,
    Search,
    BookOpen,
    Brain,
    BarChart3,
    MessageSquare,
    Clock,
    CheckCircle,
    PlayCircle,
    PauseCircle,
    Filter,
    Star,
    Calendar,
    Users,
    Database,
    TrendingUp,
    Zap,
    Settings,
    MoreVertical
} from "lucide-react"

interface Project {
    id: string
    name: string
    domain: string
    description: string
    papersCount: number
    lastActivity: string
    status: 'active' | 'paused' | 'completed'
    progress: number
    tags: string[]
    isStarred: boolean
}

const mockProjects: Project[] = [
    {
        id: "1",
        name: "Computer Vision in Healthcare",
        domain: "Computer Vision",
        description: "Analyzing recent developments in medical imaging with deep learning",
        papersCount: 47,
        lastActivity: "2 hours ago",
        status: "active",
        progress: 75,
        tags: ["medical-imaging", "deep-learning", "cnn"],
        isStarred: true
    },
    {
        id: "2",
        name: "Natural Language Processing Survey",
        domain: "NLP",
        description: "Comprehensive review of transformer architectures and their applications",
        papersCount: 89,
        lastActivity: "1 day ago",
        status: "active",
        progress: 45,
        tags: ["transformers", "bert", "gpt"],
        isStarred: false
    },
    {
        id: "3",
        name: "Quantum Computing Applications",
        domain: "Quantum Computing",
        description: "Exploring quantum algorithms for optimization problems",
        papersCount: 23,
        lastActivity: "3 days ago",
        status: "paused",
        progress: 20,
        tags: ["quantum-algorithms", "optimization", "qaoa"],
        isStarred: false
    }
]

export function ProjectsDashboard() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>(mockProjects)
    const [searchQuery, setSearchQuery] = useState("")
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string>("all")

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = selectedStatus === "all" || project.status === selectedStatus

        return matchesSearch && matchesStatus
    })

    const toggleStar = (projectId: string) => {
        setProjects(prev => prev.map(p =>
            p.id === projectId ? { ...p, isStarred: !p.isStarred } : p
        ))
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <PlayCircle className="h-4 w-4 text-green-500" />
            case 'paused': return <PauseCircle className="h-4 w-4 text-yellow-500" />
            case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />
            default: return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'paused': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    const handleOpenProject = (projectId: string) => {
        router.push(`/interface/projects/${projectId}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 container mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                Research Projects
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Manage your AI-powered research workflows and discoveries
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowNewProjectDialog(true)}
                            size="lg"
                            className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white border-0 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-105"
                        >
                            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                            New Project
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: "Active Projects", value: "3", icon: PlayCircle, color: "text-green-500" },
                            { label: "Total Papers", value: "159", icon: BookOpen, color: "text-blue-500" },
                            { label: "AI Insights", value: "24", icon: Brain, color: "text-purple-500" },
                            { label: "Citations", value: "1.2K", icon: TrendingUp, color: "text-orange-500" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                className="relative group"
                            >
                                <Card className="relative overflow-hidden bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg hover:shadow-primary/20 transition-all duration-300 group-hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <CardContent className="p-4 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                            </div>
                                            <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search projects, domains, or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background/40 backdrop-blur-xl border-primary/20 focus:border-primary/40"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'active', 'paused', 'completed'].map((status) => (
                                <Button
                                    key={status}
                                    variant={selectedStatus === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedStatus(status)}
                                    className={selectedStatus === status
                                        ? "bg-gradient-to-r from-primary to-purple-600 text-white"
                                        : "bg-background/40 backdrop-blur-xl border-primary/20 hover:bg-primary/5"
                                    }
                                >
                                    <Filter className="mr-1 h-3 w-3" />
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Projects Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="group cursor-pointer"
                            >
                                <Card className="relative overflow-hidden bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg hover:shadow-primary/30 transition-all duration-500 group-hover:border-primary/30">
                                    {/* Card Background Effects */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <CardHeader className="relative z-10 pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusIcon(project.status)}
                                                    <Badge className={`${getStatusColor(project.status)} text-xs`}>
                                                        {project.status}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs border-primary/20">
                                                        {project.domain}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                                                    {project.name}
                                                </CardTitle>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleStar(project.id)
                                                    }}
                                                    className="h-8 w-8 p-0 hover:bg-primary/10"
                                                >
                                                    <Star className={`h-4 w-4 transition-colors ${project.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-primary/10"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardDescription className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                                            {project.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="relative z-10">
                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">Progress</span>
                                                <span className="text-sm text-muted-foreground">{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-secondary/50 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <Database className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-medium">{project.papersCount} papers</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-green-500" />
                                                <span className="text-sm text-muted-foreground">{project.lastActivity}</span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {project.tags.slice(0, 3).map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-xs bg-primary/10 text-primary border-primary/20"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {project.tags.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{project.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-gradient-to-r from-primary/80 to-purple-600/80 hover:from-primary hover:to-purple-600 text-white transition-all duration-300"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleOpenProject(project.id)
                                                }}
                                            >
                                                <PlayCircle className="mr-1 h-3 w-3" />
                                                Open
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-background/40 backdrop-blur-xl border-primary/20 hover:bg-primary/5"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    // Analytics/insights for this project
                                                    console.log("Show project analytics for", project.id)
                                                }}
                                            >
                                                <BarChart3 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-background/40 backdrop-blur-xl border-primary/20 hover:bg-primary/5"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    // Open project chat
                                                    console.log("Open chat for", project.id)
                                                }}
                                            >
                                                <MessageSquare className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="relative inline-block mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full opacity-20 blur-xl" />
                            <Search className="relative h-16 w-16 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                        <p className="text-muted-foreground mb-6">
                            {searchQuery ? "Try adjusting your search criteria" : "Create your first research project to get started"}
                        </p>
                        <Button
                            onClick={() => setShowNewProjectDialog(true)}
                            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* New Project Dialog would go here */}
            {showNewProjectDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background/90 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
                        <p className="text-muted-foreground mb-4">
                            This feature will be implemented to match UC-02: Create & Manage Research Project
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                                Cancel
                            </Button>
                            <Button>Coming Soon</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
} 