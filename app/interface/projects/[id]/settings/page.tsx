"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Cog, Shield, Database } from "lucide-react"

interface ProjectSettingsPageProps {
    params: Promise<{
        id: string
    }>
}

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
                        <Settings className="h-8 w-8 text-primary" />
                        Project Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Configure project preferences and settings
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="bg-background/40 backdrop-blur-xl border-2 border-primary/25 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cog className="h-5 w-5 text-primary" />
                                Project Configuration
                            </CardTitle>
                            <CardDescription>
                                Manage project settings and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Settings Coming Soon</h3>
                                <p className="text-muted-foreground mb-6">
                                    Configure project preferences, API settings, and automation rules.
                                </p>
                                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white">
                                    <Cog className="mr-2 h-4 w-4" />
                                    Configure Project
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
} 