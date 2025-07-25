"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ShareProjectDialog } from "@/components/interface/ShareProjectDialog"
import { projectsApi } from "@/lib/api/projects"
import { Collaborator } from "@/types/project"
import { Users, Share2, UserPlus, Mail, Clock, CheckCircle, X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProjectCollaborationPageProps {
    params: Promise<{
        id: string
    }>
}

export default function ProjectCollaborationPage({ params }: ProjectCollaborationPageProps) {
    const [projectId, setProjectId] = useState<string>("")
    const [collaborators, setCollaborators] = useState<Collaborator[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showShareDialog, setShowShareDialog] = useState(false)
    const { toast } = useToast()

    // Load collaborators data
    useEffect(() => {
        const loadData = async () => {
            const resolvedParams = await params
            setProjectId(resolvedParams.id)
            try {
                const collaboratorsData = await projectsApi.getCollaborators(resolvedParams.id)
                setCollaborators(collaboratorsData)
            } catch (error) {
                console.error('Error loading collaborators:', error)
                // If no collaborators endpoint exists yet, show empty state
                setCollaborators([])
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [params])

    const handleRemoveCollaborator = async (collaboratorId: string) => {
        try {
            await projectsApi.removeCollaborator(projectId, collaboratorId)
            setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
            toast({
                title: "Collaborator removed",
                description: "The collaborator has been removed from the project.",
            })

            // If this was the last collaborator, we might want to update the shared status
            // This would require a way to communicate back to the parent component
            // For now, we'll rely on the projects dashboard to refresh when navigated back to
        } catch (error) {
            console.error('Error removing collaborator:', error)
            toast({
                title: "Error",
                description: "Failed to remove collaborator. Please try again.",
                variant: "destructive"
            })
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'PENDING':
                return <Clock className="h-4 w-4 text-yellow-500" />
            case 'DECLINED':
                return <X className="h-4 w-4 text-red-500" />
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'PENDING':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'DECLINED':
                return 'bg-red-500/10 text-red-500 border-red-500/20'
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'EDITOR':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'VIEWER':
                return 'bg-green-500/10 text-green-500 border-green-500/20'
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Users className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading collaborators...</p>
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
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient-primary flex items-center gap-3">
                                <Users className="h-8 w-8 text-primary" />
                                Collaboration
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Share and collaborate on research with your team
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowShareDialog(true)}
                            className="gradient-primary-to-accent hover:gradient-accent text-white"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Collaborator
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Share2 className="h-5 w-5 text-primary" />
                                Team Members ({collaborators.length})
                            </CardTitle>
                            <CardDescription>
                                Manage collaborators and their access levels
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {collaborators.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No collaborators yet</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Invite team members to collaborate on this research project.
                                    </p>
                                    <Button
                                        onClick={() => setShowShareDialog(true)}
                                        className="gradient-primary-to-accent hover:gradient-accent text-white"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Invite First Collaborator
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {collaborators.map((collaborator, index) => (
                                            <motion.div
                                                key={collaborator.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center justify-between p-4 bg-background/20 rounded-lg border border-primary/10 hover:bg-background/30 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {collaborator.email.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{collaborator.email}</span>
                                                            <Badge className={`${getRoleColor(collaborator.role)} text-xs`}>
                                                                {collaborator.role}
                                                            </Badge>
                                                            <Badge className={`${getStatusColor(collaborator.status)} text-xs`}>
                                                                {getStatusIcon(collaborator.status)}
                                                                {collaborator.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                Invited {new Date(collaborator.invitedAt).toLocaleDateString()}
                                                            </span>
                                                            {collaborator.joinedAt && (
                                                                <span className="flex items-center gap-1">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Joined {new Date(collaborator.joinedAt).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {collaborator.status === 'PENDING' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs border-primary/20 hover:bg-primary/5"
                                                        >
                                                            Resend Invite
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                                                        className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Share Project Dialog */}
            <ShareProjectDialog
                isOpen={showShareDialog}
                projectId={projectId}
                projectName="Research Project"
                onClose={() => setShowShareDialog(false)}
                onCollaboratorAdded={() => {
                    // Refresh collaborators list
                    const loadCollaborators = async () => {
                        try {
                            const collaboratorsData = await projectsApi.getCollaborators(projectId)
                            setCollaborators(collaboratorsData)
                        } catch (error) {
                            console.error('Error refreshing collaborators:', error)
                        }
                    }
                    loadCollaborators()
                }}
            />
        </div>
    )
} 