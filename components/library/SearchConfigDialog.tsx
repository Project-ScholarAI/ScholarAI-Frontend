"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SmartComboBox } from "@/components/ui/smart-combobox"
import { TagInput } from "@/components/ui/tag-input"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { WebSearchRequest } from "@/types/websearch"
import {
    RESEARCH_DOMAINS,
    getTopicSuggestions,
    searchSuggestions
} from "@/constants/research-data"
import {
    Search,
    Brain,
    Target,
    Settings2,
    Sparkles,
    Zap,
    RefreshCw,
    BookOpen,
    Globe,
    Hash,
    ChevronRight,
    X,
    ArrowLeft,
    Lightbulb,
    CheckCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SearchConfigDialogProps {
    isOpen: boolean
    projectId: string
    onClose: () => void
    onSearchSubmit: (searchRequest: WebSearchRequest) => void
    isLoading?: boolean
}

interface SearchFormData {
    domain: string
    queryTerms: string[]
    batchSize: number
}

export function SearchConfigDialog({
    isOpen,
    projectId,
    onClose,
    onSearchSubmit,
    isLoading = false
}: SearchConfigDialogProps) {
    const [project, setProject] = useState<Project | null>(null)
    const [isLoadingProject, setIsLoadingProject] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<SearchFormData>({
        defaultValues: {
            domain: "",
            queryTerms: [],
            batchSize: 20
        }
    })

    const watchedDomain = watch("domain")
    const watchedBatchSize = watch("batchSize")
    const watchedQueryTerms = watch("queryTerms")

    // Generate smart suggestions based on selected domain
    const topicSuggestions = useMemo(() => {
        return watchedDomain ? getTopicSuggestions(watchedDomain) : []
    }, [watchedDomain])

    // Load project data on mount
    useEffect(() => {
        if (isOpen && projectId) {
            loadProjectData()
        }
    }, [isOpen, projectId])

    const loadProjectData = async () => {
        try {
            setIsLoadingProject(true)
            setError(null)
            const projectData = await projectsApi.getProject(projectId)
            setProject(projectData)

            // Set default values from project
            reset({
                domain: projectData.domain || "",
                queryTerms: projectData.topics || [],
                batchSize: 20
            })
        } catch (error) {
            console.error('Error loading project:', error)
            setError('Failed to load project data')
        } finally {
            setIsLoadingProject(false)
        }
    }

    const onSubmit = (data: SearchFormData) => {
        if (!projectId) return

        const searchRequest: WebSearchRequest = {
            projectId,
            domain: data.domain,
            queryTerms: data.queryTerms,
            batchSize: data.batchSize
        }

        onSearchSubmit(searchRequest)
        onClose()
    }

    const handleClose = () => {
        if (!isLoading && !isLoadingProject) {
            setError(null)
            onClose()
        }
    }

    const getBatchSizeColor = (size: number) => {
        if (size <= 10) return "text-green-500"
        if (size <= 30) return "text-yellow-500"
        return "text-red-500"
    }

    const getBatchSizeDescription = (size: number) => {
        if (size <= 10) return "Quick search - faster results"
        if (size <= 30) return "Balanced search - good coverage"
        return "Comprehensive search - may take longer"
    }

    const isFormValid = watchedDomain && watchedQueryTerms.length > 0

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
                >
                    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

                        {/* Header */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="relative z-10 border-b border-primary/10 bg-background/80 backdrop-blur-xl"
                        >
                            <div className="max-w-4xl mx-auto px-6 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
                                            <Search className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                                Configure Paper Search
                                            </h1>
                                            <p className="text-muted-foreground">
                                                Customize your academic paper search parameters for optimal results
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClose}
                                        disabled={isLoading}
                                        className="h-10 w-10 rounded-lg bg-background/40 backdrop-blur-xl border border-primary/10 hover:bg-red-500/10 hover:text-red-500"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Content */}
                        <div className="relative z-10 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
                            <div className="max-w-4xl mx-auto px-6 py-8 pb-16">
                                {/* Project Info Card */}
                                {project && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.4, delay: 0.2 }}
                                        className="mb-8"
                                    >
                                        <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-lg flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center">
                                                        <BookOpen className="h-4 w-4 text-orange-500" />
                                                    </div>
                                                    {project.name}
                                                </CardTitle>
                                                {project.description && (
                                                    <CardDescription className="text-sm leading-relaxed">
                                                        {project.description}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            {(project.domain || (project.topics && project.topics.length > 0)) && (
                                                <CardContent className="pt-0">
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.domain && (
                                                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                                                                <Globe className="h-3 w-3 mr-1" />
                                                                {project.domain}
                                                            </Badge>
                                                        )}
                                                        {project.topics?.slice(0, 5).map((topic, index) => (
                                                            <Badge key={index} variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                                <Hash className="h-3 w-3 mr-1" />
                                                                {topic}
                                                            </Badge>
                                                        ))}
                                                        {project.topics && project.topics.length > 5 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{project.topics.length - 5} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    </motion.div>
                                )}

                                {/* Form Content */}
                                {isLoadingProject ? (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.4, delay: 0.3 }}
                                    >
                                        <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                            <CardContent className="p-12">
                                                <div className="flex items-center justify-center">
                                                    <div className="text-center">
                                                        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                                                        <h3 className="text-lg font-semibold mb-2">Loading Project Data</h3>
                                                        <p className="text-muted-foreground">Please wait while we fetch your project information...</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ) : error ? (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.4, delay: 0.3 }}
                                    >
                                        <Card className="bg-red-500/10 border-red-500/20 shadow-lg">
                                            <CardContent className="p-12">
                                                <div className="text-center">
                                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                                                        <X className="h-8 w-8 text-red-500" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold mb-2 text-red-500">Error Loading Project</h3>
                                                    <p className="text-red-400 mb-4">{error}</p>
                                                    <Button
                                                        variant="outline"
                                                        onClick={loadProjectData}
                                                        className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Try Again
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                        {/* Research Domain Card */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.4, delay: 0.3 }}
                                        >
                                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center">
                                                            <Brain className="h-4 w-4 text-purple-500" />
                                                        </div>
                                                        Research Domain
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                                            <Sparkles className="h-3 w-3" />
                                                            Smart suggestions
                                                        </div>
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Specify the primary research domain to focus your search
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Controller
                                                        name="domain"
                                                        control={control}
                                                        rules={{ required: "Research domain is required" }}
                                                        render={({ field }) => (
                                                            <SmartComboBox
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                                suggestions={RESEARCH_DOMAINS}
                                                                placeholder="Select or type a research domain (e.g., Machine Learning, Computer Vision)"
                                                                searchFunction={searchSuggestions}
                                                                disabled={isLoading}
                                                                className="w-full"
                                                            />
                                                        )}
                                                    />
                                                    {errors.domain && (
                                                        <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                                                            <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                                            {errors.domain.message}
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>

                                        {/* Search Query Terms Card */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.4, delay: 0.4 }}
                                        >
                                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center">
                                                            <Target className="h-4 w-4 text-green-500" />
                                                        </div>
                                                        Search Query Terms
                                                        {watchedDomain && topicSuggestions.length > 0 && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                                                <Lightbulb className="h-3 w-3" />
                                                                {topicSuggestions.length} suggestions for {watchedDomain}
                                                            </div>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Add specific keywords, research topics, or methodologies you want to search for
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Controller
                                                        name="queryTerms"
                                                        control={control}
                                                        rules={{
                                                            required: "At least one query term is required",
                                                            validate: (value) => value.length > 0 || "At least one query term is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <TagInput
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                                suggestions={topicSuggestions}
                                                                placeholder="Add research topics, keywords, or specific areas..."
                                                                maxTags={15}
                                                                disabled={isLoading}
                                                                className="w-full"
                                                            />
                                                        )}
                                                    />
                                                    {errors.queryTerms && (
                                                        <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                                                            <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                                            {errors.queryTerms.message}
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>

                                        {/* Search Batch Size Card */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.4, delay: 0.5 }}
                                        >
                                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/20 flex items-center justify-center">
                                                            <Settings2 className="h-4 w-4 text-orange-500" />
                                                        </div>
                                                        Search Batch Size
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Number of papers to retrieve. Larger batches provide more comprehensive results but take longer.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <Controller
                                                        name="batchSize"
                                                        control={control}
                                                        rules={{
                                                            required: "Batch size is required",
                                                            min: { value: 5, message: "Minimum batch size is 5" },
                                                            max: { value: 100, message: "Maximum batch size is 100" }
                                                        }}
                                                        render={({ field }) => (
                                                            <div className="space-y-4">
                                                                <Slider
                                                                    value={[field.value]}
                                                                    onValueChange={(value) => field.onChange(value[0])}
                                                                    max={100}
                                                                    min={5}
                                                                    step={5}
                                                                    className="w-full"
                                                                    disabled={isLoading}
                                                                />
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-muted-foreground">5 papers</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`font-medium ${getBatchSizeColor(watchedBatchSize)}`}>
                                                                            {watchedBatchSize} papers
                                                                        </span>
                                                                        <Zap className={`h-4 w-4 ${getBatchSizeColor(watchedBatchSize)}`} />
                                                                    </div>
                                                                    <span className="text-muted-foreground">100 papers</span>
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className={`text-sm ${getBatchSizeColor(watchedBatchSize)} font-medium`}>
                                                                        {getBatchSizeDescription(watchedBatchSize)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                    {errors.batchSize && (
                                                        <p className="text-sm text-red-500 flex items-center gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                                            {errors.batchSize.message}
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>

                                        {/* Action Buttons */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.4, delay: 0.6 }}
                                            className="flex gap-4 pt-4"
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleClose}
                                                disabled={isLoading}
                                                className="flex-1 h-12 bg-background/40 backdrop-blur-xl border-primary/20"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isLoading || !isFormValid}
                                                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-base font-medium"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                                        Starting Search...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search className="mr-2 h-5 w-5" />
                                                        Start Search
                                                        <ChevronRight className="ml-2 h-5 w-5" />
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
} 