"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Download,
    Search,
    BookOpen,
    Filter,
    Star,
    Calendar,
    Database,
    RefreshCw,
    ArrowUp,
    ArrowDown,
    SortAsc,
    SortDesc,
    Hash,
    Quote,
    ChevronRight,
    ChevronUp,
    PlusCircle,
    Upload,
    FileText,
    Eye,
    ExternalLink,
    CheckCircle,
    Clock,
    AlertCircle,
    MoreVertical,
    Grid3X3,
    List,
    Settings2,
    Tag,
    Users,
    TrendingUp,
    BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWebSearch } from "@/hooks/useWebSearch"
import { getProjectLibrary, getProjectLibraryStats } from "@/lib/api"
import { SearchLoadingProgress } from "@/components/library/SearchLoadingProgress"
import { PaperCard } from "@/components/library/PaperCard"
import { PaperDetailModal } from "@/components/library/PaperDetailModal"
import { PdfViewerModal } from "@/components/library/PdfViewerModal"
import { SearchConfigDialog } from "@/components/library/SearchConfigDialog"
import { B2DownloadTest } from "@/components/test/B2DownloadTest"
import type { Paper, WebSearchRequest } from "@/types/websearch"

// Using Paper interface from types/websearch.ts

interface ProjectLibraryPageProps {
    params: Promise<{
        id: string
    }>
}

export default function ProjectLibraryPage({ params }: ProjectLibraryPageProps) {
    const [projectId, setProjectId] = useState<string>("")
    const [papers, setPapers] = useState<Paper[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<'date' | 'citations' | 'title'>('date')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [filterSource, setFilterSource] = useState<string>("all")
    const [filterOpenAccess, setFilterOpenAccess] = useState<string>("all")
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showFilters, setShowFilters] = useState(false)
    const [showPdfViewer, setShowPdfViewer] = useState(false)
    const [pdfViewerPaper, setPdfViewerPaper] = useState<Paper | null>(null)
    const [showSearchConfig, setShowSearchConfig] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)
    const [libraryStats, setLibraryStats] = useState<any>(null)
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false)
    const [libraryError, setLibraryError] = useState<string | null>(null)

    // Web search functionality
    const webSearch = useWebSearch()

    // Load project ID and papers
    useEffect(() => {
        const loadData = async () => {
            const resolvedParams = await params
            setProjectId(resolvedParams.id)

            // Load existing papers from library
            await loadProjectLibrary(resolvedParams.id)

            setIsLoading(false)
        }
        loadData()
    }, [params])

    // Load papers from web search results when available
    useEffect(() => {
        if (webSearch.papers.length > 0) {
            // Merge new papers with existing ones, avoiding duplicates
            setPapers(prevPapers => {
                const existingTitles = new Set(prevPapers.map(p => p.title.toLowerCase()))
                const newPapers = webSearch.papers.filter(p => !existingTitles.has(p.title.toLowerCase()))
                return [...prevPapers, ...newPapers]
            })
        }
    }, [webSearch.papers])

    const loadProjectLibrary = async (projectId: string) => {
        try {
            setIsLoadingLibrary(true)
            setLibraryError(null)

            // Fetch both library data and stats
            const [libraryData, statsData] = await Promise.all([
                getProjectLibrary(projectId),
                getProjectLibraryStats(projectId)
            ])

            // Set papers from library data
            if (libraryData.data.papers) {
                setPapers(libraryData.data.papers)
            }

            // Set library stats
            setLibraryStats(statsData.data)

        } catch (error) {
            console.error('Error loading project library:', error)
            setLibraryError(error instanceof Error ? error.message : 'Failed to load library')
        } finally {
            setIsLoadingLibrary(false)
        }
    }

    const filteredAndSortedPapers = papers
        .filter(paper => {
            const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                paper.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (paper.fieldsOfStudy?.some(field => field.toLowerCase().includes(searchQuery.toLowerCase())) ?? false) ||
                (paper.venueName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (paper.abstractText?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

            const matchesSource = filterSource === "all" || paper.source === filterSource
            const matchesOpenAccess = filterOpenAccess === "all" ||
                (filterOpenAccess === "open" && paper.isOpenAccess) ||
                (filterOpenAccess === "closed" && !paper.isOpenAccess)

            return matchesSearch && matchesSource && matchesOpenAccess
        })
        .sort((a, b) => {
            let aVal, bVal
            switch (sortBy) {
                case 'date':
                    aVal = new Date(a.publicationDate).getTime()
                    bVal = new Date(b.publicationDate).getTime()
                    break
                case 'citations':
                    aVal = a.citationCount
                    bVal = b.citationCount
                    break
                case 'title':
                    aVal = a.title.toLowerCase()
                    bVal = b.title.toLowerCase()
                    return sortDirection === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
                default:
                    return 0
            }

            return sortDirection === 'desc' ? bVal - aVal : aVal - bVal
        })

    const handleRetrievePapers = () => {
        setShowSearchConfig(true)
    }

    const handleSearchSubmit = async (searchRequest: WebSearchRequest) => {
        await webSearch.startSearch(searchRequest)
    }

    const handlePaperSelect = (paper: Paper) => {
        setSelectedPaper(paper)
    }

    const handleViewPdf = (paper: Paper) => {
        setPdfViewerPaper(paper)
        setShowPdfViewer(true)
    }



    // Scroll handling
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop
        setShowScrollTop(scrollTop > 300)
    }

    const scrollToTop = () => {
        scrollContainer?.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    // Get unique sources and fields for filtering
    const uniqueSources = [...new Set(papers.map(p => p.source).filter(Boolean))]
    const uniqueFields = [...new Set(papers.flatMap(p => p.fieldsOfStudy || []).filter(Boolean))]

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading library...</p>
                        {isLoadingLibrary && (
                            <p className="text-sm text-muted-foreground mt-2">Fetching existing papers...</p>
                        )}
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
                {/* Library Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
                                <Database className="h-8 w-8 text-primary" />
                                Paper Library
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage and analyze your research papers with advanced tools
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                                className="bg-background/40 backdrop-blur-xl border-primary/20 hover:bg-primary/5"
                            >
                                <Settings2 className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                            <Button
                                onClick={() => projectId && loadProjectLibrary(projectId)}
                                disabled={isLoadingLibrary}
                                variant="outline"
                                className="bg-background/40 backdrop-blur-xl border-primary/20 hover:bg-primary/5"
                            >
                                {isLoadingLibrary ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Refresh
                            </Button>
                            <Button
                                onClick={handleRetrievePapers}
                                disabled={webSearch.isSearching}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                            >
                                {webSearch.isSearching ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                {webSearch.isSearching ? "Fetching..." : "Fetch Papers"}
                            </Button>
                        </div>
                    </div>

                    {/* Library Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[
                            {
                                label: "Total Papers",
                                value: libraryStats?.totalPapers?.toString() || papers.length.toString(),
                                icon: BookOpen,
                                color: "text-blue-500"
                            },
                            {
                                label: "Open Access",
                                value: papers.filter(p => p.isOpenAccess).length.toString(),
                                icon: CheckCircle,
                                color: "text-green-500"
                            },
                            {
                                label: "Search Operations",
                                value: libraryStats?.completedSearchOperations?.toString() || "0",
                                icon: TrendingUp,
                                color: "text-purple-500"
                            },
                            {
                                label: "Total Citations",
                                value: papers.reduce((acc, p) => acc + p.citationCount, 0).toString(),
                                icon: Quote,
                                color: "text-yellow-500"
                            }
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
                                                <p className="text-xl font-bold text-foreground">
                                                    {isLoadingLibrary ? (
                                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        stat.value
                                                    )}
                                                </p>
                                            </div>
                                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Search and Filters */}
                {/* Library Error Display */}
                {libraryError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <Card className="bg-red-500/10 border-red-500/20 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <div className="flex-1">
                                        <p className="text-red-500 font-medium">Failed to load library</p>
                                        <p className="text-red-400 text-sm">{libraryError}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => projectId && loadProjectLibrary(projectId)}
                                        className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Retry
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6"
                >
                    <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                        <CardContent className="p-6">
                            {/* Search Bar */}
                            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search papers, authors, venues, or tags..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-background/40 backdrop-blur-xl border-primary/20 focus:border-primary/40"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                        className="bg-background/40 backdrop-blur-xl border-primary/20"
                                    >
                                        {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                        className="bg-background/40 backdrop-blur-xl border-primary/20"
                                    >
                                        {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <Separator className="my-4" />
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Sort By</label>
                                                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                                    <SelectTrigger className="bg-background/40 backdrop-blur-xl border-primary/20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="date">Publication Date</SelectItem>
                                                        <SelectItem value="citations">Citations</SelectItem>
                                                        <SelectItem value="title">Title</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Source</label>
                                                <Select value={filterSource} onValueChange={setFilterSource}>
                                                    <SelectTrigger className="bg-background/40 backdrop-blur-xl border-primary/20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Sources</SelectItem>
                                                        {uniqueSources.map(source => (
                                                            <SelectItem key={source} value={source}>{source}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Access</label>
                                                <Select value={filterOpenAccess} onValueChange={setFilterOpenAccess}>
                                                    <SelectTrigger className="bg-background/40 backdrop-blur-xl border-primary/20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Papers</SelectItem>
                                                        <SelectItem value="open">Open Access</SelectItem>
                                                        <SelectItem value="closed">Closed Access</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Quick Actions</label>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="flex-1 bg-background/40">
                                                        <Upload className="h-3 w-3 mr-1" />
                                                        Upload
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="flex-1 bg-background/40">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        Categorize
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Papers Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="max-h-[calc(100vh-400px)] overflow-hidden"
                >
                    {papers.length === 0 ? (
                        /* Empty State */
                        <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                            <CardContent className="p-12">
                                <div className="text-center">
                                    <Database className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                                    <h3 className="text-xl font-semibold mb-2">No Papers Yet</h3>
                                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                        {libraryStats?.totalPapers === 0 ?
                                            "This project doesn't have any papers yet. Start building your research library by fetching papers or uploading your own documents." :
                                            "Start building your research library by fetching papers or uploading your own documents."
                                        }
                                    </p>
                                    {libraryStats && libraryStats.completedSearchOperations > 0 && (
                                        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                            <p className="text-sm text-blue-400">
                                                📊 {libraryStats.completedSearchOperations} search operations completed
                                                {libraryStats.retrievedAt && ` • Last updated: ${new Date(libraryStats.retrievedAt).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex gap-3 justify-center">
                                        <Button
                                            onClick={handleRetrievePapers}
                                            disabled={webSearch.isSearching}
                                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                        >
                                            {webSearch.isSearching ? (
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="mr-2 h-4 w-4" />
                                            )}
                                            {webSearch.isSearching ? "Fetching Papers..." : "Fetch Papers"}
                                        </Button>
                                        <Button variant="outline" className="bg-background/40 backdrop-blur-xl border-primary/20">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Papers
                                        </Button>
                                    </div>

                                    {/* B2 Download Test Component - TEMPORARY FOR TESTING */}
                                    <div className="mt-8">
                                        <B2DownloadTest />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Papers Grid */
                        <div className="h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    {filteredAndSortedPapers.length} Papers Found
                                </h3>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="bg-background/40">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Analyze All
                                    </Button>
                                    <Button size="sm" variant="outline" className="bg-background/40">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Export List
                                    </Button>
                                </div>
                            </div>

                            {/* Scrollable Papers Container */}
                            <div
                                ref={setScrollContainer}
                                onScroll={handleScroll}
                                className="h-[calc(100vh-500px)] overflow-y-auto pr-2 custom-scrollbar scroll-smooth"
                            >
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                                        <AnimatePresence mode="popLayout">
                                            {filteredAndSortedPapers.map((paper, index) => (
                                                <PaperCard
                                                    key={`${paper.title}-${index}`}
                                                    paper={paper}
                                                    index={index}
                                                    onSelect={handlePaperSelect}
                                                    onViewPdf={handleViewPdf}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pb-6">
                                        <AnimatePresence mode="popLayout">
                                            {filteredAndSortedPapers.map((paper, index) => (
                                                <PaperCard
                                                    key={`${paper.title}-${index}`}
                                                    paper={paper}
                                                    index={index}
                                                    onSelect={handlePaperSelect}
                                                    onViewPdf={handleViewPdf}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Search Loading Progress */}
            <SearchLoadingProgress
                isVisible={webSearch.isSearching}
                progress={webSearch.progress}
                currentStep={webSearch.currentStep}
                onComplete={() => {
                    // Optional callback when search completes
                }}
            />

            {/* Paper Detail Modal */}
            <PaperDetailModal
                paper={selectedPaper}
                isOpen={!!selectedPaper}
                onClose={() => setSelectedPaper(null)}
                onViewPdf={handleViewPdf}
            />

            {/* PDF Viewer Modal */}
            <PdfViewerModal
                paper={pdfViewerPaper}
                isOpen={showPdfViewer}
                onClose={() => {
                    setShowPdfViewer(false)
                    setPdfViewerPaper(null)
                }}
            />

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <Button
                            onClick={scrollToTop}
                            size="sm"
                            className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                        >
                            <ChevronUp className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Configuration Dialog */}
            <SearchConfigDialog
                isOpen={showSearchConfig}
                projectId={projectId}
                onClose={() => setShowSearchConfig(false)}
                onSearchSubmit={handleSearchSubmit}
                isLoading={webSearch.isSearching}
            />
        </div>
    )
} 