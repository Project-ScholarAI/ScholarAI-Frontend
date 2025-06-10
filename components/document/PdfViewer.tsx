"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  Settings,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { getAuthenticatedPdfUrl, downloadPdfWithAuth } from "@/lib/api"

type Props = {
  documentUrl?: string
  documentName?: string
}

export function PDFViewer({ documentUrl, documentName = "Document" }: Props) {
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'read' | 'edit'>('read')
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 300))
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 25))

  // Load authenticated PDF URL
  useEffect(() => {
    const loadPdf = async () => {
      if (!documentUrl) return

      setIsLoading(true)
      setError(null)

      try {
        const authUrl = await getAuthenticatedPdfUrl(documentUrl)
        if (authUrl) {
          setAuthenticatedUrl(authUrl)
        } else {
          setError('PDF URL not available')
        }
      } catch (error) {
        console.error('Failed to load PDF:', error)
        setError(error instanceof Error ? error.message : 'Failed to load PDF')
      } finally {
        setIsLoading(false)
      }
    }

    loadPdf()
  }, [documentUrl])

  // Handle PDF download
  const handleDownload = async () => {
    if (!documentUrl) return

    try {
      await downloadPdfWithAuth(documentUrl, documentName)
    } catch (error) {
      console.error('Download failed:', error)
      setError(error instanceof Error ? error.message : 'Download failed. Please try again.')
    }
  }

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
              onClick={handleDownload}
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
          {isLoading ? (
            /* Loading State */
            <div className="flex items-center justify-center h-96 w-full">
              <div className="text-center text-white">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-400">Loading PDF...</p>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex items-center justify-center h-96 w-full">
              <div className="text-center text-white max-w-md">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to Load PDF</h3>
                <p className="text-sm text-gray-400 mb-4">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-white border-gray-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          ) : authenticatedUrl ? (
            /* PDF Iframe */
            <div
              className="w-full max-w-4xl bg-white shadow-2xl rounded-lg overflow-hidden"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                height: '80vh'
              }}
            >
              <iframe
                src={`${authenticatedUrl}#page=${currentPage}&zoom=${zoom}`}
                className="w-full h-full border-0"
                title={documentName}
                onLoad={() => {
                  // You can implement page detection here if needed
                  // For now, we'll use a reasonable default
                  setTotalPages(24)
                }}
              />
            </div>
          ) : (
            /* No Document State */
            <div className="flex items-center justify-center h-96 w-full">
              <div className="text-center text-white">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-sm text-gray-400">No PDF document available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
