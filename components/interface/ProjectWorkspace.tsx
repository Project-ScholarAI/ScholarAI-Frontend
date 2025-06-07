"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
    Download,
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
    MoreVertical,
    FileText,
    Eye,
    ExternalLink,
    Sparkles,
    Bot,
    Library,
    Target,
    Lightbulb,
    RefreshCw,
    ArrowUp,
    ArrowDown,
    SortAsc,
    SortDesc,
    Hash,
    Quote,
    ChevronRight,
    PlusCircle
} from "lucide-react"

interface Paper {
    id: string
    title: string
    doi: string
    publicationDate: string
    venue: string
    publisher: string
    isPeerReviewed: boolean
    authors: Array<{
        name: string
        orcid?: string
        gsProfileUrl?: string
        affiliation?: string
    }>
    citationCount: number
    codeRepositoryUrl?: string
    datasetUrl?: string
    paperUrl: string
    pdfAvailable: boolean
    hasBeenSummarized: boolean
    hasBeenScored: boolean
    score?: number
    tags: string[]
    status: 'new' | 'processing' | 'ready' | 'failed'
}

interface ProjectData {
    id: string
    name: string
    domain: string
    description: string
    topics: string[]
    papers: Paper[]
    totalPapers: number
    activeTasks: number
    insights: number
}

const mockPaper: Paper = {
    id: "1",
    title: "Deep Learning Approaches for Medical Image Segmentation: A Comprehensive Survey",
    doi: "10.1016/j.media.2021.102190",
    publicationDate: "2021-10-15",
    venue: "Medical Image Analysis",
    publisher: "Elsevier",
    isPeerReviewed: true,
    authors: [
        { name: "John Smith", affiliation: "Stanford University" },
        { name: "Jane Doe", affiliation: "MIT" }
    ],
    citationCount: 342,
    codeRepositoryUrl: "https://github.com/example/medical-segmentation",
    datasetUrl: "https://dataset.example.com",
    paperUrl: "https://doi.org/10.1016/j.media.2021.102190",
    pdfAvailable: true,
    hasBeenSummarized: true,
    hasBeenScored: true,
    score: 8.7,
    tags: ["medical-imaging", "deep-learning", "segmentation"],
    status: "ready"
}

const mockProject: ProjectData = {
    id: "1",
    name: "Computer Vision in Healthcare",
    domain: "Computer Vision",
    description: "Analyzing recent developments in medical imaging with deep learning",
    topics: ["medical-imaging", "deep-learning", "cnn", "segmentation"],
    papers: Array(12).fill(null).map((_, i) => ({
        ...mockPaper,
        id: `${i + 1}`,
        title: `${mockPaper.title} ${i + 1}`,
        score: Math.random() * 10,
        hasBeenScored: Math.random() > 0.3,
        hasBeenSummarized: Math.random() > 0.4,
        pdfAvailable: Math.random() > 0.2,
        status: ['new', 'processing', 'ready', 'failed'][Math.floor(Math.random() * 4)] as Paper['status']
    })),
    totalPapers: 47,
    activeTasks: 3,
    insights: 12
}

interface ProjectWorkspaceProps {
    projectId: string
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
    const [project, setProject] = useState<ProjectData>(mockProject)
    const [papers, setPapers] = useState<Paper[]>(project.papers)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<'score' | 'date' | 'citations'>('score')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
    const [activeTab, setActiveTab] = useState("library")
    const [isRetrieving, setIsRetrieving] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)

    const filteredAndSortedPapers = papers
        .filter(paper => {
            const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                paper.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                paper.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesStatus = filterStatus === "all" || paper.status === filterStatus

            return matchesSearch && matchesStatus
        })
        .sort((a, b) => {
            let aVal, bVal
            switch (sortBy) {
                case 'score':
                    aVal = a.score || 0
                    bVal = b.score || 0
                    break
                case 'date':
                    aVal = new Date(a.publicationDate).getTime()
                    bVal = new Date(b.publicationDate).getTime()
                    break
                case 'citations':
                    aVal = a.citationCount
                    bVal = b.citationCount
                    break
                default:
                    return 0
            }

            return sortDirection === 'desc' ? bVal - aVal : aVal - bVal
        })

    const handleRetrievePapers = async () => {
        setIsRetrieving(true)
        // Simulate API call - implement UC-03: Automated Paper Retrieval
        setTimeout(() => {
            const newPapers = Array(5).fill(null).map((_, i) => ({
                ...mockPaper,
                id: `new-${Date.now()}-${i}`,
                title: `New Retrieved Paper ${i + 1}`,
                status: 'new' as Paper['status'],
                hasBeenScored: false,
                hasBeenSummarized: false
            }))
            setPapers(prev => [...newPapers, ...prev])
            setIsRetrieving(false)
        }, 3000)
    }

    const handleScorePapers = async () => {
        // Implement UC-05: Automated Paper Scoring & Sorting
        const unscored = papers.filter(p => !p.hasBeenScored)
        for (const paper of unscored) {
            setTimeout(() => {
                setPapers(prev => prev.map(p =>
                    p.id === paper.id
                        ? { ...p, hasBeenScored: true, score: Math.random() * 10 }
                        : p
                ))
            }, Math.random() * 2000)
        }
    }

    const handleSummarizePapers = async (paperIds: string[]) => {
        // Implement UC-06: Content Extraction & Summarization
        paperIds.forEach(id => {
            setTimeout(() => {
                setPapers(prev => prev.map(p =>
                    p.id === id
                        ? { ...p, hasBeenSummarized: true, status: 'ready' as Paper['status'] }
                        : p
                ))
            }, Math.random() * 3000)
        })
    }

    const getStatusIcon = (status: Paper['status']) => {
        switch (status) {
            case 'new': return <PlusCircle className="h-4 w-4 text-blue-500" />
            case 'processing': return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
            case 'ready': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'failed': return <MoreVertical className="h-4 w-4 text-red-500" />
            default: return null
        }
    }

    const getStatusColor = (status: Paper['status']) => {
        switch (status) {
            case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'processing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'ready': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 container mx-auto px-6 py-6">
                {/* Project Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                {project.name}
                            </h1>
                            <p className="text-muted-foreground mt-1">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {project.topics.map((topic) => (
                                    <Badge key={topic} variant="outline" className="text-xs border-primary/20">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                variant="outline"
                                className="bg-background/40 backdrop-blur-xl border-primary/20 hover:bg-primary/5"
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                QA Chat
                            </Button>
                            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Papers", value: project.totalPapers.toString(), icon: BookOpen, color: "text-blue-500" },
                            { label: "Active Tasks", value: project.activeTasks.toString(), icon: Zap, color: "text-yellow-500" },
                            { label: "AI Insights", value: project.insights.toString(), icon: Brain, color: "text-purple-500" },
                            { label: "Progress", value: "75%", icon: TrendingUp, color: "text-green-500" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                            >
                                <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg hover:shadow-primary/20 transition-all duration-300">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                                            </div>
                                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 bg-background/40 backdrop-blur-xl border border-primary/20">
                        <TabsTrigger value="library" className="data-[state=active]:bg-primary/20">
                            <Library className="mr-2 h-4 w-4" />
                            Library
                        </TabsTrigger>
                        <TabsTrigger value="agents" className="data-[state=active]:bg-primary/20">
                            <Bot className="mr-2 h-4 w-4" />
                            AI Agents
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="data-[state=active]:bg-primary/20">
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Insights
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="data-[state=active]:bg-primary/20">
                            <Target className="mr-2 h-4 w-4" />
                            Tasks
                        </TabsTrigger>
                    </TabsList>

                    {/* Library Tab - UC-03, UC-04, UC-05 */}
                    <TabsContent value="library" className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Library Controls */}
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Database className="h-5 w-5 text-primary" />
                                                Paper Library
                                            </CardTitle>
                                            <CardDescription>
                                                Retrieve, manage, and analyze research papers
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleRetrievePapers}
                                                disabled={isRetrieving}
                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                            >
                                                {isRetrieving ? (
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="mr-2 h-4 w-4" />
                                                )}
                                                {isRetrieving ? "Retrieving..." : "Fetch Papers"}
                                            </Button>
                                            <Button
                                                onClick={handleScorePapers}
                                                variant="outline"
                                                className="bg-background/40 backdrop-blur-xl border-primary/20 hover:bg-primary/5"
                                            >
                                                <BarChart3 className="mr-2 h-4 w-4" />
                                                Score Papers
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {/* Search and Filters */}
                                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search papers, authors, or tags..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 bg-background/40 backdrop-blur-xl border-primary/20 focus:border-primary/40"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                                className="bg-background/40 backdrop-blur-xl border-primary/20"
                                            >
                                                {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                            </Button>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as any)}
                                                className="px-3 py-2 text-sm rounded-md bg-background/40 backdrop-blur-xl border border-primary/20 focus:border-primary/40"
                                            >
                                                <option value="score">Score</option>
                                                <option value="date">Date</option>
                                                <option value="citations">Citations</option>
                                            </select>
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="px-3 py-2 text-sm rounded-md bg-background/40 backdrop-blur-xl border border-primary/20 focus:border-primary/40"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="new">New</option>
                                                <option value="processing">Processing</option>
                                                <option value="ready">Ready</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Papers List */}
                                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                        <AnimatePresence mode="popLayout">
                                            {filteredAndSortedPapers.map((paper, index) => (
                                                <motion.div
                                                    key={paper.id}
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                                    className="group"
                                                >
                                                    <Card
                                                        className="relative overflow-hidden bg-background/20 backdrop-blur-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 cursor-pointer group-hover:shadow-lg"
                                                        onClick={() => setSelectedPaper(paper)}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        {getStatusIcon(paper.status)}
                                                                        <Badge className={`${getStatusColor(paper.status)} text-xs`}>
                                                                            {paper.status}
                                                                        </Badge>
                                                                        {paper.hasBeenScored && paper.score && (
                                                                            <Badge className="text-xs bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary border-primary/20">
                                                                                Score: {paper.score.toFixed(1)}
                                                                            </Badge>
                                                                        )}
                                                                        {paper.pdfAvailable && (
                                                                            <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                                                                PDF
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors truncate">
                                                                        {paper.title}
                                                                    </h4>
                                                                    <p className="text-xs text-muted-foreground mb-2">
                                                                        {paper.authors.map(a => a.name).join(", ")} • {paper.venue} • {new Date(paper.publicationDate).getFullYear()}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                        <span className="flex items-center gap-1">
                                                                            <Quote className="h-3 w-3" />
                                                                            {paper.citationCount}
                                                                        </span>
                                                                        {paper.codeRepositoryUrl && (
                                                                            <span className="flex items-center gap-1 text-blue-500">
                                                                                <ExternalLink className="h-3 w-3" />
                                                                                Code
                                                                            </span>
                                                                        )}
                                                                        {paper.datasetUrl && (
                                                                            <span className="flex items-center gap-1 text-green-500">
                                                                                <Database className="h-3 w-3" />
                                                                                Data
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-1 ml-4">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0 hover:bg-primary/10"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            if (paper.pdfAvailable) {
                                                                                // Open PDF viewer - UC-04
                                                                                console.log("Opening PDF for", paper.title)
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    {!paper.hasBeenSummarized && paper.pdfAvailable && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0 hover:bg-purple-500/10 text-purple-500"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                handleSummarizePapers([paper.id])
                                                                            }}
                                                                        >
                                                                            <Sparkles className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* AI Agents Tab */}
                    <TabsContent value="agents" className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {[
                                {
                                    name: "WebSearch Agent",
                                    description: "Automatically retrieve papers from academic databases",
                                    icon: Search,
                                    status: "Ready",
                                    lastRun: "2 hours ago",
                                    results: "12 new papers",
                                    useCase: "UC-03"
                                },
                                {
                                    name: "Critic Agent",
                                    description: "Score and rank papers based on relevance and impact",
                                    icon: BarChart3,
                                    status: "Running",
                                    lastRun: "Running now",
                                    results: "8 papers scored",
                                    useCase: "UC-05"
                                },
                                {
                                    name: "Summarizer Agent",
                                    description: "Extract content and generate comprehensive summaries",
                                    icon: FileText,
                                    status: "Ready",
                                    lastRun: "1 day ago",
                                    results: "5 papers summarized",
                                    useCase: "UC-06"
                                },
                                {
                                    name: "Gap Analysis Agent",
                                    description: "Identify research gaps and suggest novel topics",
                                    icon: Lightbulb,
                                    status: "Ready",
                                    lastRun: "3 days ago",
                                    results: "4 gaps identified",
                                    useCase: "UC-07"
                                }
                            ].map((agent, index) => (
                                <Card key={agent.name} className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg hover:shadow-primary/20 transition-all duration-300">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20">
                                                    <agent.icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                                                    <Badge variant="outline" className="text-xs mt-1">{agent.useCase}</Badge>
                                                </div>
                                            </div>
                                            <Badge className={agent.status === 'Running' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}>
                                                {agent.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                                            <span>Last run: {agent.lastRun}</span>
                                            <span>{agent.results}</span>
                                        </div>
                                        <Button
                                            className="w-full bg-gradient-to-r from-primary/80 to-purple-600/80 hover:from-primary hover:to-purple-600 text-white"
                                            disabled={agent.status === 'Running'}
                                        >
                                            {agent.status === 'Running' ? (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                    Running...
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle className="mr-2 h-4 w-4" />
                                                    Run Agent
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </motion.div>
                    </TabsContent>

                    {/* Insights Tab - UC-07 */}
                    <TabsContent value="insights" className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-primary" />
                                        Research Insights & Gap Analysis
                                    </CardTitle>
                                    <CardDescription>
                                        AI-generated insights and research opportunity identification
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">Gap Analysis Coming Soon</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Run the Gap Analysis Agent to identify research opportunities and generate novel topic suggestions.
                                        </p>
                                        <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white">
                                            <Brain className="mr-2 h-4 w-4" />
                                            Run Gap Analysis
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Tasks Tab - UC-09 */}
                    <TabsContent value="tasks" className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        Reading List & Task Management
                                    </CardTitle>
                                    <CardDescription>
                                        Track your reading progress and set reminders
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">Task Management Coming Soon</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Set reading reminders, track progress, and integrate with your calendar.
                                        </p>
                                        <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Set Up Tasks
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* QA Chat Panel - UC-08 */}
            {isChatOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    className="fixed right-0 top-0 h-full w-96 bg-background/90 backdrop-blur-xl border-l border-primary/20 shadow-2xl z-50"
                >
                    <div className="p-4 border-b border-primary/20">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Contextual QA Chat
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsChatOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                ×
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ask questions about your selected papers
                        </p>
                    </div>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">
                                Select papers from your library to start asking questions
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Paper Detail Modal */}
            {selectedPaper && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background/90 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">{selectedPaper.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {selectedPaper.authors.map(a => a.name).join(", ")} • {selectedPaper.venue} • {new Date(selectedPaper.publicationDate).getFullYear()}
                                </p>
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedPaper(null)}>
                                ×
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <h4 className="font-semibold mb-2">Abstract & Content</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    This feature implements UC-04: View Paper Details and Content.
                                    Full PDF viewer and metadata display would be shown here.
                                </p>
                                {selectedPaper.hasBeenSummarized && (
                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="font-medium mb-2">AI Summary</h5>
                                            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                                                <p className="text-sm">Generated summary would appear here (UC-06)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Metadata</h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-medium">DOI:</span>
                                        <p className="text-muted-foreground">{selectedPaper.doi}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Citations:</span>
                                        <p className="text-muted-foreground">{selectedPaper.citationCount}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Publisher:</span>
                                        <p className="text-muted-foreground">{selectedPaper.publisher}</p>
                                    </div>
                                    {selectedPaper.hasBeenScored && selectedPaper.score && (
                                        <div>
                                            <span className="font-medium">AI Score:</span>
                                            <p className="text-primary font-semibold">{selectedPaper.score.toFixed(1)}/10</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium">Tags:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedPaper.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    {selectedPaper.codeRepositoryUrl && (
                                        <div>
                                            <span className="font-medium">Code:</span>
                                            <a href={selectedPaper.codeRepositoryUrl} className="text-blue-500 hover:underline block text-xs">
                                                Repository Link
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setSelectedPaper(null)}>
                                Close
                            </Button>
                            {selectedPaper.pdfAvailable && (
                                <Button className="bg-gradient-to-r from-primary to-purple-600 text-white">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View PDF
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
} 