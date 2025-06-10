"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
    Sparkles,
    BookOpen,
    Target,
    Calendar,
    User,
    Tag,
    Globe,
    TrendingUp,
    Clock,
    CheckCircle,
    RefreshCw,
    AlertCircle,
    BarChart3,
    Database,
    Brain,
    Users,
    Edit3,
    Archive
} from "lucide-react"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"

interface ProjectOverviewPageProps {
    params: Promise<{
        id: string
    }>
}

export default function ProjectOverviewPage({ params }: ProjectOverviewPageProps) {
    const [projectId, setProjectId] = useState<string>("")
    const [project, setProject] = useState<Project | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Load project data
    useEffect(() => {
        const loadData = async () => {
            const resolvedParams = await params
            setProjectId(resolvedParams.id)
            try {
                const projectData = await projectsApi.getProject(resolvedParams.id)
                setProject(projectData)
            } catch (error) {
                console.error('Error loading project:', error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [params])

    const parseProjectTopics = (project: Project): string[] => {
        return project.topics || []
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading project overview...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">Project not found</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 container mx-auto px-6 py-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-4 mb-4">
                                <Sparkles className="h-10 w-10 text-primary" />
                                {project.name}
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                                {project.description || "No description provided for this research project."}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="bg-background/40 backdrop-blur-xl border-primary/20">
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit Project
                            </Button>
                            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white">
                                <Archive className="mr-2 h-4 w-4" />
                                Export Project
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Project Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-primary" />
                                        Project Information
                                    </CardTitle>
                                    <CardDescription>
                                        Detailed information about this research project
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                                    <User className="h-4 w-4" />
                                                    Project Creator
                                                </label>
                                                <p className="text-foreground font-medium">You</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Created Date
                                                </label>
                                                <p className="text-foreground">{new Date().toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                                    <Clock className="h-4 w-4" />
                                                    Last Updated
                                                </label>
                                                <p className="text-foreground">{new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                                    <Target className="h-4 w-4" />
                                                    Project Status
                                                </label>
                                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                                    <Globe className="h-4 w-4" />
                                                    Domain
                                                </label>
                                                <p className="text-foreground">Computer Science Research</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                                    <Users className="h-4 w-4" />
                                                    Collaborators
                                                </label>
                                                <p className="text-foreground">Solo Project</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Research Topics & Tags */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-primary" />
                                        Research Focus
                                    </CardTitle>
                                    <CardDescription>
                                        Topics and keywords related to this research project
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                            Research Topics
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {parseProjectTopics(project).map((topic) => (
                                                <Badge
                                                    key={topic}
                                                    variant="outline"
                                                    className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    {topic}
                                                </Badge>
                                            ))}
                                            {parseProjectTopics(project).length === 0 && (
                                                <p className="text-muted-foreground text-sm">No topics specified</p>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                            Keywords & Tags
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="bg-background/40 border-muted/40">
                                                experimental design
                                            </Badge>
                                            <Badge variant="secondary" className="bg-background/40 border-muted/40">
                                                statistical methods
                                            </Badge>
                                            <Badge variant="secondary" className="bg-background/40 border-muted/40">
                                                research methodology
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column - Quick Stats & Actions */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                        Quick Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { label: "Total Papers", value: project.totalPapers, icon: BookOpen, color: "text-blue-500" },
                                        { label: "Active Tasks", value: project.activeTasks, icon: Target, color: "text-yellow-500" },
                                        { label: "Progress", value: `${project.progress}%`, icon: TrendingUp, color: "text-green-500" },
                                        { label: "AI Insights", value: "0", icon: Brain, color: "text-purple-500" }
                                    ].map((stat, index) => (
                                        <div key={stat.label} className="flex items-center justify-between p-3 bg-background/20 rounded-lg border border-primary/5">
                                            <div className="flex items-center gap-3">
                                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                                <span className="font-medium">{stat.label}</span>
                                            </div>
                                            <span className="font-bold text-foreground">{stat.value}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                                        <Database className="mr-2 h-4 w-4" />
                                        Go to Library
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start bg-background/40 border-primary/20">
                                        <Target className="mr-2 h-4 w-4" />
                                        View Tasks
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start bg-background/40 border-primary/20">
                                        <Brain className="mr-2 h-4 w-4" />
                                        AI Insights
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start bg-background/40 border-primary/20">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Analytics
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
} 