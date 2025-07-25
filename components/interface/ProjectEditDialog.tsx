"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SmartComboBox } from "@/components/ui/smart-combobox"
import { TagInput } from "@/components/ui/tag-input"
import { projectsApi } from "@/lib/api/projects"
import { Project, ProjectFormData, UpdateProjectRequest, ProjectStatus } from "@/types/project"
import {
    RESEARCH_DOMAINS,
    getTopicSuggestions,
    getTagSuggestions,
    searchSuggestions
} from "@/constants/research-data"
import { Loader2, Sparkles, Brain, Target, Hash, Settings, X, BarChart3 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils/cn"

interface ProjectEditDialogProps {
    isOpen: boolean
    project: Project | null
    onClose: () => void
    onProjectUpdated: (project: Project) => void
}

export function ProjectEditDialog({ isOpen, project, onClose, onProjectUpdated }: ProjectEditDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors }
    } = useForm<ProjectFormData & { status: ProjectStatus, progress: number, domainValue: string, topicsArray: string[], tagsArray: string[] }>()

    const watchedDomain = watch("domainValue")
    const watchedTopics = watch("topicsArray")

    const topicSuggestions = useMemo(() => {
        return watchedDomain ? getTopicSuggestions(watchedDomain) : []
    }, [watchedDomain])

    const tagSuggestions = useMemo(() => {
        return getTagSuggestions(watchedDomain, watchedTopics)
    }, [watchedDomain, watchedTopics])

    useEffect(() => {
        if (project) {
            reset({
                name: project.name,
                description: project.description || "",
                domain: project.domain || "",
                topics: "",
                tags: "",
                status: project.status,
                progress: project.progress,
                domainValue: project.domain || "",
                topicsArray: project.topics || [],
                tagsArray: project.tags || []
            })
        }
    }, [project, reset])

    const onSubmit = async (data: ProjectFormData & { status: ProjectStatus, progress: number, domainValue: string, topicsArray: string[], tagsArray: string[] }) => {
        if (!project) return

        try {
            setIsLoading(true)
            setError(null)

            const updateRequest: UpdateProjectRequest = {
                name: data.name,
                description: data.description || undefined,
                domain: data.domainValue || undefined,
                topics: data.topicsArray || [],
                tags: data.tagsArray || [],
                status: data.status,
                progress: data.progress
            }

            const updatedProject = await projectsApi.updateProject(project.id, updateRequest)
            onProjectUpdated(updatedProject)
            onClose()
        } catch (error) {
            console.error('Error updating project:', error)
            setError(error instanceof Error ? error.message : 'Failed to update project')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        if (!isLoading) {
            setError(null)
            onClose()
        }
    }

    if (!project) return null

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
                        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

                        {/* Header */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="relative z-10 border-b border-border bg-background/80 backdrop-blur-xl flex-shrink-0"
                            style={{
                                boxShadow: `
                                    0 2px 15px hsl(var(--primary) / 0.1),
                                    0 4px 25px hsl(var(--accent) / 0.06)
                                `
                            }}
                        >
                            <div className="max-w-7xl mx-auto px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20">
                                            <Settings className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-gradient-primary">
                                                Edit Project
                                            </h1>
                                            <p className="text-sm text-muted-foreground">
                                                Update your research project settings and configuration
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClose}
                                        disabled={isLoading}
                                        className="h-9 w-9 rounded-lg bg-background/40 backdrop-blur-xl border border-border hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                                        style={{
                                            boxShadow: `
                                                0 0 8px hsl(var(--primary) / 0.08),
                                                0 0 16px hsl(var(--accent) / 0.04)
                                            `
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Content */}
                        <div className="relative z-10 h-[calc(100vh-81px)] overflow-hidden">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="max-w-7xl mx-auto px-6 py-8 h-full"
                            >
                                <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
                                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column */}
                                        <div className="space-y-8 flex flex-col lg:col-span-1">
                                            <Card className="bg-background/40 backdrop-blur-xl border-border shadow-lg transition-all duration-300 hover:shadow-primary/5"
                                                style={{
                                                    boxShadow: `
                                                        0 0 20px hsl(var(--primary) / 0.1),
                                                        0 0 40px hsl(var(--accent) / 0.06)
                                                    `
                                                }}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                                        Project Name *
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <Input
                                                        id="name"
                                                        {...register("name", {
                                                            required: "Project name is required",
                                                            maxLength: { value: 500, message: "Project name must not exceed 500 characters" }
                                                        })}
                                                        placeholder="Enter a descriptive name for your research project"
                                                        disabled={isLoading}
                                                        className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg p-0 placeholder:text-muted-foreground"
                                                    />
                                                    {errors.name && (
                                                        <p className="text-sm text-destructive flex items-center gap-2 mt-2">
                                                            <span className="w-1 h-1 rounded-full bg-destructive" />
                                                            {errors.name.message}
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-background/40 backdrop-blur-xl border-border shadow-lg flex-1 flex flex-col transition-all duration-300 hover:shadow-primary/5"
                                                style={{
                                                    boxShadow: `
                                                        0 0 20px hsl(var(--primary) / 0.1),
                                                        0 0 40px hsl(var(--accent) / 0.06)
                                                    `
                                                }}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                        Description
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1 flex flex-col">
                                                    <Textarea
                                                        id="description"
                                                        {...register("description", {
                                                            maxLength: { value: 5000, message: "Description must not exceed 5000 characters" }
                                                        })}
                                                        placeholder="Describe your research objectives, methodology, and expected outcomes..."
                                                        className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none flex-1 w-full p-0 placeholder:text-muted-foreground"
                                                        disabled={isLoading}
                                                    />
                                                    {errors.description && (
                                                        <p className="text-sm text-destructive flex items-center gap-2 mt-2">
                                                            <span className="w-1 h-1 rounded-full bg-destructive" />
                                                            {errors.description.message}
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Middle Column */}
                                        <div className="space-y-8 flex flex-col lg:col-span-1">
                                            <Card className="bg-background/40 backdrop-blur-xl border-border shadow-lg flex-1 flex flex-col transition-all duration-300 hover:shadow-primary/5"
                                                style={{
                                                    boxShadow: `
                                                        0 0 20px hsl(var(--primary) / 0.1),
                                                        0 0 40px hsl(var(--accent) / 0.06)
                                                    `
                                                }}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Target className="h-4 w-4 text-green-500" />
                                                            Research Topics
                                                        </div>
                                                        {watchedDomain && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Sparkles className="h-3 w-3" />
                                                                {topicSuggestions.length} suggestions
                                                            </div>
                                                        )}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1 flex flex-col">
                                                    <Controller
                                                        name="topicsArray"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TagInput
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                                suggestions={topicSuggestions}
                                                                placeholder="Add specific topics..."
                                                                maxTags={10}
                                                                disabled={isLoading || !watchedDomain}
                                                                className="w-full flex-1"
                                                            />
                                                        )}
                                                    />
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-background/40 backdrop-blur-xl border-border shadow-lg flex-1 flex flex-col transition-all duration-300 hover:shadow-primary/5"
                                                style={{
                                                    boxShadow: `
                                                        0 0 20px hsl(var(--primary) / 0.1),
                                                        0 0 40px hsl(var(--accent) / 0.06)
                                                    `
                                                }}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Hash className="h-4 w-4 text-orange-500" />
                                                            Tags
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Sparkles className="h-3 w-3" />
                                                            Context-aware suggestions
                                                        </div>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1 flex flex-col">
                                                    <Controller
                                                        name="tagsArray"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TagInput
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                                suggestions={tagSuggestions}
                                                                placeholder="Add relevant tags..."
                                                                maxTags={15}
                                                                disabled={isLoading}
                                                                className="w-full flex-1"
                                                            />
                                                        )}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-8 flex flex-col lg:col-span-1">
                                            <Card className="bg-background/40 backdrop-blur-xl border-border shadow-lg transition-all duration-300 hover:shadow-primary/5"
                                                style={{
                                                    boxShadow: `
                                                        0 0 20px hsl(var(--primary) / 0.1),
                                                        0 0 40px hsl(var(--accent) / 0.06)
                                                    `
                                                }}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <Settings className="h-4 w-4 text-purple-500" />
                                                        Details
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-muted-foreground">Research Domain</label>
                                                        <Controller
                                                            name="domainValue"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <SmartComboBox
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                    suggestions={RESEARCH_DOMAINS}
                                                                    placeholder="Select or type a domain"
                                                                    searchFunction={searchSuggestions}
                                                                    disabled={isLoading}
                                                                    className="w-full mt-1"
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                    <Separator />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs font-medium text-muted-foreground">Status</label>
                                                            <Select
                                                                value={watch("status")}
                                                                onValueChange={(value) => setValue("status", value as ProjectStatus)}
                                                                disabled={isLoading}
                                                            >
                                                                <SelectTrigger className="w-full mt-1">
                                                                    <SelectValue placeholder="Select status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                                                    <SelectItem value="PAUSED">Paused</SelectItem>
                                                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-muted-foreground">Progress (%)</label>
                                                            <Input
                                                                id="progress"
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                {...register("progress", {
                                                                    required: "Progress is required",
                                                                    min: { value: 0, message: "Progress must be at least 0" },
                                                                    max: { value: 100, message: "Progress must not exceed 100" },
                                                                    valueAsNumber: true
                                                                })}
                                                                placeholder="0-100"
                                                                disabled={isLoading}
                                                                className="w-full mt-1"
                                                            />
                                                            {errors.progress && (
                                                                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                                                    {errors.progress.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-destructive" />
                                                <p className="text-sm text-destructive font-medium">{error}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-auto border-t border-border">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleClose}
                                            disabled={isLoading}
                                            className="flex-1 h-11 bg-background/40 backdrop-blur-xl border-border hover:bg-accent transition-all duration-300"
                                            style={{
                                                boxShadow: `
                                                    0 0 10px hsl(var(--primary) / 0.08),
                                                    0 0 20px hsl(var(--accent) / 0.04)
                                                `
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 h-11 gradient-primary-to-accent text-primary-foreground border-0 transition-all duration-300 hover:scale-[1.02]"
                                            style={{
                                                boxShadow: `
                                                    0 0 15px hsl(var(--primary) / 0.4),
                                                    0 0 30px hsl(var(--accent) / 0.2),
                                                    inset 0 1px 0 hsl(var(--primary-foreground) / 0.1)
                                                `
                                            }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Updating Project...
                                                </>
                                            ) : (
                                                <>
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Update Project
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
} 