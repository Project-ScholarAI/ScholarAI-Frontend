"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Users,
    Calendar,
    Quote,
    ExternalLink,
    Download,
    Eye,
    Star,
    BookOpen,
    Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Paper } from "@/types/websearch"
import { useState, useEffect } from "react"
import { generatePdfThumbnail, downloadPdfWithAuth } from "@/lib/api"

interface PaperCardProps {
    paper: Paper
    index: number
    onSelect: (paper: Paper) => void
    onViewPdf?: (paper: Paper) => void
}

export function PaperCard({ paper, index, onSelect, onViewPdf }: PaperCardProps) {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [thumbnailLoading, setThumbnailLoading] = useState(false)

    // Generate a gradient for the thumbnail based on paper title (fallback)
    const getGradientFromTitle = (title: string) => {
        const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const gradients = [
            "from-blue-500 to-cyan-500",
            "from-purple-500 to-pink-500",
            "from-green-500 to-emerald-500",
            "from-orange-500 to-red-500",
            "from-indigo-500 to-purple-500",
            "from-cyan-500 to-blue-500",
            "from-pink-500 to-rose-500",
            "from-emerald-500 to-teal-500"
        ]
        return gradients[hash % gradients.length]
    }

    // Load PDF thumbnail if available
    useEffect(() => {
        const loadThumbnail = async () => {
            // Check both pdfUrl and pdfContentUrl for PDF availability
            const pdfUrl = paper.pdfUrl || paper.pdfContentUrl
            if (!pdfUrl) return

            setThumbnailLoading(true)
            try {
                const thumbnail = await generatePdfThumbnail(pdfUrl)
                setThumbnailUrl(thumbnail)
            } catch (error) {
                console.error('Failed to generate thumbnail:', error)
                // Will fallback to gradient
            } finally {
                setThumbnailLoading(false)
            }
        }

        loadThumbnail()
    }, [paper.pdfUrl, paper.pdfContentUrl])

    // Handle PDF download
    const handlePdfDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()
        const pdfUrl = paper.pdfUrl || paper.pdfContentUrl
        if (!pdfUrl) return

        try {
            await downloadPdfWithAuth(pdfUrl, paper.title)
        } catch (error) {
            console.error('Download failed:', error)
            // You could add a toast notification here in the future
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).getFullYear()
        } catch {
            return dateString
        }
    }

    const getInitials = (title: string) => {
        return title
            .split(' ')
            .slice(0, 2)
            .map(word => word[0])
            .join('')
            .toUpperCase()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -2 }}
            className="group"
        >
            <Card className="h-full bg-background/40 backdrop-blur-xl border border-primary/10 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 cursor-pointer overflow-hidden">
                <CardContent className="p-0">
                    {/* Thumbnail Section */}
                    <div className="relative">
                        <div className={cn(
                            "h-32 relative overflow-hidden flex items-center justify-center",
                            !thumbnailUrl && `bg-gradient-to-br ${getGradientFromTitle(paper.title)}`
                        )}>
                            {thumbnailUrl ? (
                                /* PDF Thumbnail */
                                <img
                                    src={thumbnailUrl}
                                    alt={`${paper.title} thumbnail`}
                                    className="w-full h-full object-cover"
                                    onError={() => setThumbnailUrl(null)} // Fallback to gradient on error
                                />
                            ) : (
                                /* Gradient Fallback */
                                <>
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="absolute inset-0 bg-grid-pattern" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 text-white text-center">
                                        <div className="text-2xl font-bold mb-1">
                                            {getInitials(paper.title)}
                                        </div>
                                        <div className="text-xs opacity-80">
                                            {paper.source}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Loading overlay for thumbnail */}
                            {thumbnailLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                </div>
                            )}

                            {/* PDF Available Badge */}
                            {(paper.pdfUrl || paper.pdfContentUrl) && (
                                <div className="absolute top-2 right-2">
                                    <Badge className="bg-white/20 text-white border-white/30 text-xs">
                                        <FileText className="h-3 w-3 mr-1" />
                                        PDF
                                    </Badge>
                                </div>
                            )}

                            {/* Open Access Badge */}
                            {paper.isOpenAccess && (
                                <div className="absolute top-2 left-2">
                                    <Badge className="bg-green-500/80 text-white border-green-400/50 text-xs">
                                        <Zap className="h-3 w-3 mr-1" />
                                        Open Access
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onSelect(paper)
                                    }}
                                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                                {(paper.pdfUrl || paper.pdfContentUrl) && onViewPdf && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onViewPdf(paper)
                                        }}
                                        className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        PDF
                                    </Button>
                                )}
                                {(paper.pdfUrl || paper.pdfContentUrl) && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handlePdfDownload}
                                        className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4" onClick={() => onSelect(paper)}>
                        {/* Title */}
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 text-sm leading-relaxed">
                            {paper.title}
                        </h3>

                        {/* Authors */}
                        <div className="flex items-center gap-1 mb-3">
                            <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs text-muted-foreground line-clamp-1">
                                {paper.authors.slice(0, 3).map(a => a.name).join(", ")}
                                {paper.authors.length > 3 && ` +${paper.authors.length - 3}`}
                            </p>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(paper.publicationDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Quote className="h-3 w-3" />
                                    <span>{paper.citationCount}</span>
                                </div>
                            </div>

                            {/* DOI Badge */}
                            {paper.doi && (
                                <Badge variant="outline" className="text-xs border-primary/20">
                                    DOI
                                </Badge>
                            )}
                        </div>

                        {/* Venue */}
                        {paper.venueName && (
                            <div className="flex items-center gap-1 mb-3">
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {paper.venueName}
                                </p>
                            </div>
                        )}

                        {/* Fields of Study */}
                        {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {paper.fieldsOfStudy.slice(0, 2).map((field, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                                    >
                                        {field}
                                    </Badge>
                                ))}
                                {paper.fieldsOfStudy.length > 2 && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground"
                                    >
                                        +{paper.fieldsOfStudy.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Abstract Preview */}
                        {paper.abstractText && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {paper.abstractText}
                            </p>
                        )}

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2">
                                {paper.isOpenAccess && (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <span className="text-xs">Open Access</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-1">
                                {paper.paperUrl && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            window.open(paper.paperUrl, '_blank')
                                        }}
                                        className="h-7 w-7 p-0 hover:bg-primary/10"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        // TODO: Add to favorites
                                    }}
                                    className="h-7 w-7 p-0 hover:bg-primary/10"
                                >
                                    <Star className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
} 