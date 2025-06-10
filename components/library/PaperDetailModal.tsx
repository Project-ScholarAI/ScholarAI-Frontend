"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    X,
    FileText,
    Users,
    Calendar,
    Quote,
    ExternalLink,
    Download,
    Eye,
    BookOpen,
    Building,
    Hash,
    Zap,
    Share2,
    Bookmark
} from "lucide-react"
import { cn } from "@/lib/utils"
import { downloadPdfWithAuth } from "@/lib/api"
import type { Paper } from "@/types/websearch"

interface PaperDetailModalProps {
    paper: Paper | null
    isOpen: boolean
    onClose: () => void
    onViewPdf?: (paper: Paper) => void
}

export function PaperDetailModal({ paper, isOpen, onClose, onViewPdf }: PaperDetailModalProps) {
    if (!isOpen || !paper) return null

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return dateString
        }
    }

    const handlePdfDownload = async () => {
        if (!paper.pdfContentUrl) return

        try {
            console.log('🔽 Starting PDF download for:', paper.title)
            console.log('🔗 PDF URL:', paper.pdfContentUrl)

            await downloadPdfWithAuth(paper.pdfContentUrl, paper.title)
            console.log('✅ PDF download completed successfully')
        } catch (error) {
            console.error('❌ Error downloading PDF:', error)

            // Fallback: Try to open in new tab if download fails
            console.log('🔄 Attempting fallback download method...')
            try {
                const link = document.createElement('a')
                link.href = paper.pdfContentUrl
                link.download = `${paper.title}.pdf`
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            } catch (fallbackError) {
                console.error('❌ Fallback download also failed:', fallbackError)
                alert('Failed to download PDF. Please try again or check your connection.')
            }
        }
    }

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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className={cn(
                    "relative px-6 py-4 bg-gradient-to-r text-white",
                    getGradientFromTitle(paper.title)
                )}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                            <h2 className="text-xl font-bold mb-2 line-clamp-2">
                                {paper.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{paper.authors.length} author{paper.authors.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(paper.publicationDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Quote className="h-4 w-4" />
                                    <span>{paper.citationCount} citations</span>
                                </div>
                                {paper.isOpenAccess && (
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        <Zap className="h-3 w-3 mr-1" />
                                        Open Access
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)] overflow-hidden">
                    {/* Main Content */}
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        {/* Abstract */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Abstract
                            </h3>
                            {paper.abstractText ? (
                                <Card className="bg-muted/50 border-primary/10">
                                    <CardContent className="p-4">
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {paper.abstractText}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    Abstract not available
                                </p>
                            )}
                        </div>

                        {/* Authors */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Authors ({paper.authors.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {paper.authors.map((author, index) => (
                                    <Card key={index} className="bg-background/40 border-primary/10">
                                        <CardContent className="p-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm">{author.name}</p>
                                                    {author.affiliation && (
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Building className="h-3 w-3" />
                                                            {author.affiliation}
                                                        </p>
                                                    )}
                                                    {author.orcid && (
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Hash className="h-3 w-3" />
                                                            ORCID: {author.orcid}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Fields of Study */}
                        {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Fields of Study
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {paper.fieldsOfStudy.map((field, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-primary/10 text-primary border-primary/20"
                                        >
                                            {field}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80 border-l border-border bg-muted/20 p-6 overflow-y-auto custom-scrollbar">
                        {/* Action Buttons */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-3">Actions</h3>
                            <div className="space-y-2">
                                {paper.pdfUrl && onViewPdf && (
                                    <Button
                                        onClick={() => onViewPdf(paper)}
                                        className="w-full bg-gradient-to-r from-primary to-purple-600 text-white"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View PDF
                                    </Button>
                                )}

                                {paper.pdfContentUrl && (
                                    <Button
                                        variant="outline"
                                        onClick={handlePdfDownload}
                                        className="w-full"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PDF
                                    </Button>
                                )}

                                {paper.paperUrl && (
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(paper.paperUrl, '_blank')}
                                        className="w-full"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open Original
                                    </Button>
                                )}

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Bookmark className="mr-2 h-4 w-4" />
                                        Save
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Separator className="mb-6" />

                        {/* Metadata */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Publication Details</h3>

                            <div className="space-y-3 text-sm">
                                {paper.venueName && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Venue:</span>
                                        <p className="mt-1">{paper.venueName}</p>
                                    </div>
                                )}

                                {paper.publisher && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Publisher:</span>
                                        <p className="mt-1">{paper.publisher}</p>
                                    </div>
                                )}

                                {paper.doi && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">DOI:</span>
                                        <p className="mt-1 font-mono text-xs break-all">{paper.doi}</p>
                                    </div>
                                )}

                                {paper.volume && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Volume:</span>
                                        <p className="mt-1">{paper.volume}</p>
                                    </div>
                                )}

                                {paper.issue && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Issue:</span>
                                        <p className="mt-1">{paper.issue}</p>
                                    </div>
                                )}

                                {paper.pages && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Pages:</span>
                                        <p className="mt-1">{paper.pages}</p>
                                    </div>
                                )}

                                <div>
                                    <span className="font-medium text-muted-foreground">Source:</span>
                                    <p className="mt-1">{paper.source}</p>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="font-medium text-muted-foreground">Citations:</span>
                                        <p className="text-lg font-bold text-primary">{paper.citationCount}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">References:</span>
                                        <p className="text-lg font-bold text-primary">{paper.referenceCount}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="font-medium text-muted-foreground">Influential Citations:</span>
                                    <p className="text-lg font-bold text-primary">{paper.influentialCitationCount}</p>
                                </div>

                                {paper.semanticScholarId && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Semantic Scholar ID:</span>
                                        <p className="mt-1 font-mono text-xs break-all">{paper.semanticScholarId}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
