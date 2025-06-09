"use client"

import { useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SmartComboBox } from "@/components/ui/smart-combobox"
import { TagInput } from "@/components/ui/tag-input"
import { projectsApi } from "@/lib/api/projects"
import { Project, ProjectFormData, CreateProjectRequest } from "@/types/project"
import {
    RESEARCH_DOMAINS,
    getTopicSuggestions,
    getTagSuggestions,
    searchSuggestions
} from "@/constants/research-data"
import { Loader2, Plus, Sparkles, Brain, Target, Hash, FolderPlus } from "lucide-react"

interface ProjectCreateDialogProps {
    isOpen: boolean
    onClose: () => void
    onProjectCreated: (project: Project) => void
}

export function ProjectCreateDialog({ isOpen, onClose, onProjectCreated }: ProjectCreateDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        formState: { errors }
    } = useForm<ProjectFormData & { domainValue: string, topicsArray: string[], tagsArray: string[] }>({
        defaultValues: {
            name: "",
            description: "",
            domain: "",
            topics: "",
            tags: "",
            domainValue: "",
            topicsArray: [],
            tagsArray: []
        }
    })

    const watchedDomain = watch("domainValue")
    const watchedTopics = watch("topicsArray")

    // Generate smart suggestions based on selected domain and topics
    const topicSuggestions = useMemo(() => {
        return watchedDomain ? getTopicSuggestions(watchedDomain) : []
    }, [watchedDomain])

    const tagSuggestions = useMemo(() => {
        return getTagSuggestions(watchedDomain, watchedTopics)
    }, [watchedDomain, watchedTopics])

    const onSubmit = async (data: ProjectFormData & { domainValue: string, topicsArray: string[], tagsArray: string[] }) => {
        try {
            setIsLoading(true)
            setError(null)

            // Convert form data to API format
            const createRequest: CreateProjectRequest = {
                name: data.name,
                description: data.description || undefined,
                domain: data.domainValue || undefined,
                topics: data.topicsArray || [],
                tags: data.tagsArray || []
            }

            const newProject = await projectsApi.createProject(createRequest)
            onProjectCreated(newProject)
            reset()
            onClose()
        } catch (error) {
            console.error('Error creating project:', error)
            setError(error instanceof Error ? error.message : 'Failed to create project')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        if (!isLoading) {
            reset()
            setError(null)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20 p-6">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 shrink-0">
                            <FolderPlus className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent text-xl font-bold">
                                Create New Project
                            </div>
                            <p className="text-sm text-muted-foreground font-normal mt-1 leading-relaxed">
                                Set up your AI-powered research workspace with intelligent suggestions
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                    {/* Project Name */}
                    <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            Project Name *
                        </Label>
                        <Input
                            id="name"
                            {...register("name", {
                                required: "Project name is required",
                                maxLength: { value: 500, message: "Project name must not exceed 500 characters" }
                            })}
                            placeholder="Enter a descriptive name for your research project"
                            disabled={isLoading}
                            className="bg-background/40 backdrop-blur-xl border-primary/20 focus:border-primary/40 transition-all duration-300"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            {...register("description", {
                                maxLength: { value: 5000, message: "Description must not exceed 5000 characters" }
                            })}
                            placeholder="Describe your research objectives, methodology, and expected outcomes..."
                            className="min-h-[100px] bg-background/40 backdrop-blur-xl border-primary/20 focus:border-primary/40 transition-all duration-300 resize-none"
                            disabled={isLoading}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                {errors.description.message}
                            </p>
                        )}
                    </div>

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
                            name="domainValue"
                            control={control}
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
                        <p className="text-xs text-muted-foreground">
                            Choose your primary research area to get relevant topic suggestions
                        </p>
                    </div>

                    {/* Research Topics */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-green-500" />
                                Research Topics
                            </div>
                            {watchedDomain && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Sparkles className="h-3 w-3" />
                                    {topicSuggestions.length} suggestions for {watchedDomain}
                                </div>
                            )}
                        </Label>
                        <Controller
                            name="topicsArray"
                            control={control}
                            render={({ field }) => (
                                <TagInput
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    suggestions={topicSuggestions}
                                    placeholder="Add specific research topics..."
                                    maxTags={10}
                                    disabled={isLoading}
                                    className="w-full"
                                />
                            )}
                        />
                        <p className="text-xs text-muted-foreground">
                            Add specific topics related to your research. Select a domain above for intelligent suggestions.
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-orange-500" />
                                Tags
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Sparkles className="h-3 w-3" />
                                Context-aware suggestions
                            </div>
                        </Label>
                        <Controller
                            name="tagsArray"
                            control={control}
                            render={({ field }) => (
                                <TagInput
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    suggestions={tagSuggestions}
                                    placeholder="Add relevant tags for better organization..."
                                    maxTags={15}
                                    disabled={isLoading}
                                    className="w-full"
                                />
                            )}
                        />
                        <p className="text-xs text-muted-foreground">
                            Add tags to help organize and categorize your project. Tags adapt based on your domain and topics.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50/50 border border-red-200/50 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-primary/10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 bg-background/40 backdrop-blur-xl border-primary/20 hover:bg-background/60 transition-all duration-300 min-h-[44px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white border-0 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.02] min-h-[44px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span className="whitespace-nowrap">Creating Project...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    <span className="whitespace-nowrap">Create Project</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 