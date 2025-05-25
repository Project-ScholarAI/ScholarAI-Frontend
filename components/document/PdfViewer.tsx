"use client"

import type React from "react"
import { useState } from "react"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share,
  Bookmark,
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  FileText,
  Eye,
  Edit3,
  Highlighter,
  MessageSquare,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"

type Props = {
  documentUrl?: string
  documentName?: string
}

export function PDFViewer({ documentUrl, documentName = "Document" }: Props) {
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(24) // Mock data
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'read' | 'edit'>('read')

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 300))
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 25))

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Document Toolbar */}
      <div className="flex items-center justify-between h-12 px-4 bg-[#2d2d30] border-b border-[#3e3e42]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#007acc]" />
            <span className="text-white font-medium text-sm">{documentName}</span>
          </div>

          <div className="h-4 w-px bg-[#3e3e42]" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('read')}
              className={cn(
                "h-8 px-3 text-xs",
                viewMode === 'read'
                  ? "bg-[#094771] text-[#75beff]"
                  : "text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
              )}
            >
              <Eye className="h-3 w-3 mr-1" />
              Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('edit')}
              className={cn(
                "h-8 px-3 text-xs",
                viewMode === 'edit'
                  ? "bg-[#094771] text-[#75beff]"
                  : "text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
              )}
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Annotate
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 text-[#cccccc] hover:bg-[#3e3e42] hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 text-sm text-[#cccccc]">
              <Input
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-12 h-8 text-center bg-[#3e3e42] border-[#3e3e42] text-white text-xs"
              />
              <span>of {totalPages}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 text-[#cccccc] hover:bg-[#3e3e42] hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-4 w-px bg-[#3e3e42]" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0 text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-[#cccccc] min-w-[3rem] text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0 text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-4 w-px bg-[#3e3e42]" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0 text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Annotation Toolbar (when in edit mode) */}
      {viewMode === 'edit' && (
        <div className="flex items-center gap-2 h-10 px-4 bg-[#252526] border-b border-[#3e3e42]">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
          >
            <Highlighter className="h-3 w-3 mr-1" />
            Highlight
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Comment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-[#cccccc] hover:bg-[#3e3e42] hover:text-white"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Draw
          </Button>
        </div>
      )}

      {/* Document Viewer */}
      <div className="flex-1 overflow-auto bg-[#1e1e1e] p-4">
        <div className="flex justify-center">
          <div
            className="bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              width: '210mm', // A4 width
              minHeight: '297mm' // A4 height
            }}
          >
            {/* Mock PDF Content */}
            <div className="p-8 text-black">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Research Paper Title</h1>
                <p className="text-gray-600">Authors: John Doe, Jane Smith</p>
                <p className="text-gray-600">Published: 2024</p>
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <h2 className="text-lg font-semibold">Abstract</h2>
                <p>
                  This research paper explores the innovative applications of artificial intelligence
                  in academic research and document analysis. Our findings demonstrate significant
                  improvements in research efficiency and accuracy when AI tools are properly
                  integrated into scholarly workflows.
                </p>

                <h2 className="text-lg font-semibold">Introduction</h2>
                <p>
                  The landscape of academic research has been transformed by the advent of
                  artificial intelligence technologies. Traditional methods of literature review,
                  data analysis, and hypothesis generation are being augmented by sophisticated
                  AI systems that can process vast amounts of information at unprecedented speeds.
                </p>

                <p>
                  In this study, we examine the practical applications of AI in research
                  environments, focusing on document analysis, pattern recognition, and
                  automated insight generation. Our methodology combines quantitative analysis
                  with qualitative assessments to provide a comprehensive view of AI's impact
                  on research productivity.
                </p>

                <h2 className="text-lg font-semibold">Methodology</h2>
                <p>
                  Our research methodology employed a mixed-methods approach, incorporating
                  both experimental and observational studies. We analyzed data from over
                  1,000 research projects across multiple disciplines to identify patterns
                  and trends in AI adoption and effectiveness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
