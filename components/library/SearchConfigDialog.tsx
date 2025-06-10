"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SmartComboBox } from "@/components/ui/smart-combobox"
import { TagInput } from "@/components/ui/tag-input"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
    ChevronRight
} from "lucide-react"

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

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20 p-0">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 p-6 border-b border-primary/10">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                    <div className="relative z-10">
                        <DialogHeader className="space-y-3">
                            <DialogTitle className="flex items-center gap-3 text-xl">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 shrink-0">
                                    <Search className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent text-xl font-bold">
                                        Configure Paper Search
                                    </div>
                                    <p className="text-sm text-muted-foreground font-normal mt-1 leading-relaxed">
                                        Customize your academic paper search parameters for optimal results
                                    </p>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        {/* Project Info */}
                        {project && (
                            <div className="mt-4 p-4 rounded-lg bg-background/40 backdrop-blur-xl border border-primary/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center">
                                        <BookOpen className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground">{project.name}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {project.description ? project.description.slice(0, 100) + "..." : "No description"}
                                        </p>
                                    </div>
                                </div>
                                {(project.domain || (project.topics && project.topics.length > 0)) && (
                                    <div className="flex flex-wrap gap-2">
                                        {project.domain && (
                                            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                                                <Globe className="h-3 w-3 mr-1" />
                                                {project.domain}
                                            </Badge>
                                        )}
                                        {project.topics?.slice(0, 3).map((topic, index) => (
                                            <Badge key={index} variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                <Hash className="h-3 w-3 mr-1" />
                                                {topic}
                                            </Badge>
                                        ))}
                                        {project.topics && project.topics.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{project.topics.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    {isLoadingProject ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Loading project data...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 text-sm">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadProjectData}
                                className="mt-2"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Research Domain */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-purple-500" />
                                        Research Domain
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Sparkles className="h-3 w-3" />
                                        Smart suggestions
                                    </div>
                                </Label>
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
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                        {errors.domain.message}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Specify the primary research domain to search within
                                </p>
                            </div>

                            <Separator className="opacity-50" />

                            {/* Query Terms */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-green-500" />
                                        Search Query Terms
                                    </div>
                                    {watchedDomain && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Sparkles className="h-3 w-3" />
                                            {topicSuggestions.length} suggestions for {watchedDomain}
                                        </div>
                                    )}
                                </Label>
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
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                        {errors.queryTerms.message}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Add specific keywords, research topics, or methodologies you want to search for
                                </p>
                            </div>

                            <Separator className="opacity-50" />

                            {/* Batch Size */}
                            <div className="space-y-4">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Settings2 className="h-4 w-4 text-orange-500" />
                                    Search Batch Size
                                </Label>

                                <div className="space-y-3">
                                    <Controller
                                        name="batchSize"
                                        control={control}
                                        rules={{
                                            required: "Batch size is required",
                                            min: { value: 5, message: "Minimum batch size is 5" },
                                            max: { value: 100, message: "Maximum batch size is 100" }
                                        }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
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
                                                <p className={`text-xs ${getBatchSizeColor(watchedBatchSize)} text-center`}>
                                                    {getBatchSizeDescription(watchedBatchSize)}
                                                </p>
                                            </div>
                                        )}
                                    />
                                </div>

                                {errors.batchSize && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                        {errors.batchSize.message}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Number of papers to retrieve. Larger batches provide more comprehensive results but take longer.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="flex-1 bg-background/40 backdrop-blur-xl border-primary/20"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Starting Search...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            Start Search
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 