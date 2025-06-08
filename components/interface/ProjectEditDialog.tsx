"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { projectsApi } from "@/lib/api/projects"
import { Project, ProjectFormData, UpdateProjectRequest, ProjectStatus } from "@/types/project"
import { Loader2, Edit } from "lucide-react"

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
        formState: { errors }
    } = useForm<ProjectFormData & { status: ProjectStatus, progress: number }>()

    // Helper function to convert array to comma-separated string
    const arrayToString = (arr?: string[]): string => {
        if (!arr || arr.length === 0) return ""
        return arr.join(", ")
    }

    // Helper function to convert comma-separated string to array
    const stringToArray = (str: string): string[] => {
        if (!str?.trim()) return []
        return str.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }

    // Reset form when project changes
    useEffect(() => {
        if (project) {
            reset({
                name: project.name,
                description: project.description || "",
                domain: project.domain || "",
                topics: arrayToString(project.topics),
                tags: arrayToString(project.tags),
                status: project.status,
                progress: project.progress
            })
        }
    }, [project, reset])

    const onSubmit = async (data: ProjectFormData & { status: ProjectStatus, progress: number }) => {
        if (!project) return

        try {
            setIsLoading(true)
            setError(null)

            // Convert form data to API format
            const updateRequest: UpdateProjectRequest = {
                name: data.name,
                description: data.description || undefined,
                domain: data.domain || undefined,
                topics: stringToArray(data.topics),
                tags: stringToArray(data.tags),
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
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Edit Project
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name *</Label>
                        <Input
                            id="name"
                            {...register("name", {
                                required: "Project name is required",
                                maxLength: { value: 500, message: "Project name must not exceed 500 characters" }
                            })}
                            placeholder="Enter project name"
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description", {
                                maxLength: { value: 5000, message: "Description must not exceed 5000 characters" }
                            })}
                            placeholder="Describe your research project"
                            className="min-h-[80px]"
                            disabled={isLoading}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="domain">Research Domain</Label>
                        <Input
                            id="domain"
                            {...register("domain", {
                                maxLength: { value: 255, message: "Domain must not exceed 255 characters" }
                            })}
                            placeholder="e.g., Computer Vision, NLP, Machine Learning"
                            disabled={isLoading}
                        />
                        {errors.domain && (
                            <p className="text-sm text-red-500">{errors.domain.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="topics">Research Topics</Label>
                        <Input
                            id="topics"
                            {...register("topics")}
                            placeholder="e.g., deep learning, neural networks, computer vision (comma-separated)"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Separate multiple topics with commas
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            {...register("tags")}
                            placeholder="e.g., AI, research, healthcare (comma-separated)"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Separate multiple tags with commas
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={watch("status")}
                                onValueChange={(value) => setValue("status", value as ProjectStatus)}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
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

                        <div className="space-y-2">
                            <Label htmlFor="progress">Progress (%)</Label>
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
                                disabled={isLoading}
                            />
                            {errors.progress && (
                                <p className="text-sm text-red-500">{errors.progress.message}</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Update Project
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 