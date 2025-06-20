"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Worker, Viewer, ScrollMode } from '@react-pdf-viewer/core'
import type { PopoverProps } from '@react-pdf-viewer/core'
import { zoomPlugin } from '@react-pdf-viewer/zoom'
import type { ZoomPopoverProps } from '@react-pdf-viewer/zoom'
import { searchPlugin } from '@react-pdf-viewer/search'
import {
  Download,
  FileText,
  AlertCircle,
  RefreshCw,
  Maximize,
  Minimize,
  Search,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Book,
  Scroll,
  Hash
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { downloadPdfWithAuth } from "@/lib/api"

// Import CSS for react-pdf-viewer
import '@react-pdf-viewer/core/lib/styles/index.css'

type Props = {
  documentUrl?: string
  documentName?: string
}

// Helper function to handle PDF URL processing
const processPdfUrl = async (url: string): Promise<string> => {
  try {
    console.log('Processing PDF URL:', url)

    // If it's already a blob or data URL, return as is
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      console.log('URL is already a blob/data URL')
      return url
    }

    // Check if it's a valid URL
    try {
      const urlObj = new URL(url)

      // If it's from our own domain, use it directly
      if (typeof window !== 'undefined') {
        const currentOrigin = window.location.origin
        if (urlObj.origin === currentOrigin) {
          console.log('Internal URL detected:', url)
          return url
        }
      }

      // If it's external, use our proxy to bypass CORS
      const proxyUrl = `/api/pdf/proxy?url=${encodeURIComponent(url)}`
      console.log('External URL detected, using proxy. Original:', url, 'Proxy:', proxyUrl)
      return proxyUrl
    } catch (urlError) {
      console.error('Invalid URL format:', urlError)
      throw new Error(`Invalid PDF URL format: ${url}`)
    }
  } catch (error) {
    console.error('Error processing PDF URL:', error)
    throw error
  }
}

export function PDFViewer({ documentUrl, documentName = "Document" }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'read' | 'edit'>('read')
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [scrollMode, setScrollMode] = useState<ScrollMode>(ScrollMode.Vertical)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [jumpToPage, setJumpToPage] = useState('')
  const [scale, setScale] = useState(1.0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const jumpPageInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize plugins - simplified
  const zoomPluginInstance = zoomPlugin()
  const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance

  const searchPluginInstance = searchPlugin({
    keyword: [searchKeyword],
  })
  const { clearHighlights, highlight } = searchPluginInstance

  // Load and process PDF URL
  useEffect(() => {
    const loadPdf = async () => {
      if (!documentUrl) {
        setProcessedUrl(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('Loading PDF from URL:', documentUrl)
        const url = await processPdfUrl(documentUrl)
        console.log('Processed PDF URL:', url)
        setProcessedUrl(url)
      } catch (error) {
        console.error('Failed to load PDF:', error)
        let errorMessage = 'Failed to load PDF document.'

        if (error instanceof Error) {
          if (error.message.includes('fetch')) {
            errorMessage += ' Network error - the PDF may be inaccessible or blocked by CORS policy.'
          } else if (error.message.includes('CORS')) {
            errorMessage += ' Cross-origin request blocked. Using proxy to retry...'
          } else if (error.message.includes('404')) {
            errorMessage += ' PDF file not found (404).'
          } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage += ' Access denied - authentication may be required.'
          } else if (documentUrl?.startsWith('http')) {
            errorMessage += ' External PDF access failed. Proxy will handle this automatically.'
          } else {
            errorMessage += ' The file may be corrupted or in an unsupported format.'
          }
        }

        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadPdf()

    // Cleanup blob URLs when component unmounts or URL changes
    return () => {
      if (processedUrl && processedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedUrl)
      }
    }
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

  const handleDocumentLoad = useCallback((e: any) => {
    console.log('Document loaded successfully:', e)
    setTotalPages(e.doc.numPages)
    setError(null)
    setScale(1.0)
  }, [])

  const handlePageChange = useCallback((e: any) => {
    console.log('Page changed to:', e.currentPage + 1)
    setCurrentPage(e.currentPage)
  }, [])

  // Add scroll event listener to track current page manually if needed
  useEffect(() => {
    const viewer = containerRef.current?.querySelector('.rpv-core__viewer')
    if (!viewer) return

    const handleScroll = () => {
      const pages = viewer.querySelectorAll('.rpv-core__page-layer')
      if (pages.length === 0) return

      const viewerRect = viewer.getBoundingClientRect()
      const viewerCenter = viewerRect.top + viewerRect.height / 2

      // Find which page is closest to the center of the viewer
      let closestPageIndex = 0
      let closestDistance = Infinity

      pages.forEach((page, index) => {
        const pageRect = page.getBoundingClientRect()
        const pageCenter = pageRect.top + pageRect.height / 2
        const distance = Math.abs(pageCenter - viewerCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestPageIndex = index
        }
      })

      if (closestPageIndex !== currentPage) {
        setCurrentPage(closestPageIndex)
      }
    }

    viewer.addEventListener('scroll', handleScroll, { passive: true })
    return () => viewer.removeEventListener('scroll', handleScroll)
  }, [processedUrl, currentPage])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 100)
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false)
        setSearchKeyword('')
        clearHighlights()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSearch, clearHighlights])

  // Handle search
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    if (keyword.trim()) {
      highlight([keyword])
    } else {
      clearHighlights()
    }
  }

  // Enhanced page navigation with multiple fallback methods
  const jumpToPageNumber = (pageIndex: number) => {
    console.log('Jumping to page index:', pageIndex)
    setCurrentPage(pageIndex)

    // Wait for the component to update, then scroll
    setTimeout(() => {
      const viewer = containerRef.current?.querySelector('.rpv-core__viewer') as HTMLElement
      if (!viewer) {
        console.warn('PDF viewer container not found')
        return
      }

      // Method 1: Find page by data attribute or class
      let pageElement = viewer.querySelector(`[data-page-number="${pageIndex + 1}"]`) ||
        viewer.querySelector(`[data-page-number="${pageIndex}"]`) ||
        viewer.querySelector(`.rpv-core__page-layer:nth-child(${pageIndex + 1})`)

      if (pageElement) {
        console.log('Found page element, scrolling...')
        pageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
        return
      }

      // Method 2: Calculate scroll position based on page height
      const pages = viewer.querySelectorAll('.rpv-core__page-layer')
      if (pages.length > pageIndex) {
        const targetPage = pages[pageIndex] as HTMLElement
        console.log('Scrolling to calculated position...')

        // Calculate the scroll position
        let scrollTop = 0
        for (let i = 0; i < pageIndex; i++) {
          const page = pages[i] as HTMLElement
          scrollTop += page.offsetHeight + 16 // Include margin
        }

        viewer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        })
        return
      }

      // Method 3: Force re-render and try again
      console.log('Forcing re-render and retrying...')
      setTimeout(() => {
        const retryPages = viewer.querySelectorAll('.rpv-core__page-layer')
        if (retryPages.length > pageIndex) {
          retryPages[pageIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 500)
    }, 200)
  }

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage)
    if (pageNum >= 1 && pageNum <= totalPages) {
      jumpToPageNumber(pageNum - 1)
      setJumpToPage('')
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      jumpToPageNumber(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      jumpToPageNumber(currentPage - 1)
    }
  }

  // Handle scroll mode change
  const handleScrollModeChange = (mode: ScrollMode) => {
    console.log('Switching scroll mode to:', mode)
    setScrollMode(mode)

    // Reset to first page when switching modes and scroll to top
    setCurrentPage(0)

    // Ensure the viewer scrolls to the top after mode change
    setTimeout(() => {
      const viewer = containerRef.current?.querySelector('.rpv-core__viewer')
      if (viewer) {
        viewer.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 100)
  }

  // Handle zoom
  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, 3.0)
    setScale(newScale)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale / 1.2, 0.5)
    setScale(newScale)
  }

  const retryLoad = () => {
    setError(null)
    setIsLoading(true)

    const currentUrl = documentUrl
    setProcessedUrl(null)

    setTimeout(async () => {
      if (currentUrl) {
        try {
          const url = await processPdfUrl(currentUrl)
          setProcessedUrl(url)
        } catch (error) {
          console.error('Retry failed:', error)
          setError(error instanceof Error ? error.message : 'Failed to load PDF')
        } finally {
          setIsLoading(false)
        }
      }
    }, 100)
  }

  const testPdfUrl = () => {
    if (processedUrl) {
      console.log('Testing PDF URL:', processedUrl)
      window.open(processedUrl, '_blank')
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Custom Document Toolbar */}
      <div className="flex items-center justify-between h-14 px-4 bg-card border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-foreground font-medium text-sm">{documentName}</span>
          </div>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('read')}
              className={cn(
                "h-8 px-3 text-xs",
                viewMode === 'read'
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('edit')}
              className={cn(
                "h-8 px-3 text-xs",
                viewMode === 'edit'
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
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
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Page {currentPage + 1} of {totalPages || '...'}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Jump to Page */}
          <div className="flex items-center gap-1">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <Input
              ref={jumpPageInputRef}
              type="number"
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJumpToPage()
                }
              }}
              placeholder="Go"
              className="h-8 w-12 text-xs text-center border-0 bg-muted/50 focus:bg-background"
              min={1}
              max={totalPages}
            />
            {jumpToPage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleJumpToPage}
                className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Scroll Mode */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleScrollModeChange(ScrollMode.Horizontal)}
              className={cn(
                "h-8 w-8 p-0",
                scrollMode === ScrollMode.Horizontal
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Book className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleScrollModeChange(ScrollMode.Vertical)}
              className={cn(
                "h-8 w-8 p-0",
                scrollMode === ScrollMode.Vertical
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Scroll className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {Math.round(scale * 100)}%
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearch(!showSearch)
                if (!showSearch) {
                  setTimeout(() => searchInputRef.current?.focus(), 100)
                }
              }}
              className={cn(
                "h-8 w-8 p-0",
                showSearch
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="flex items-center gap-2 h-10 px-4 bg-primary/5 border-b border-border">
          <Search className="h-4 w-4 text-primary" />
          <Input
            ref={searchInputRef}
            type="text"
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search in document... (Ctrl+F)"
            className="h-8 flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSearch(false)
                setSearchKeyword('')
                clearHighlights()
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSearch(false)
              setSearchKeyword('')
              clearHighlights()
            }}
            className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ×
          </Button>
        </div>
      )}

      {/* Document Viewer */}
      <div className="flex-1 bg-background">
        {isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
              {documentUrl && (
                <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto truncate">
                  {documentUrl}
                </p>
              )}
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load PDF</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              {documentUrl && (
                <div className="mb-4 p-2 bg-muted/50 rounded text-xs text-muted-foreground break-all">
                  URL: {documentUrl}
                </div>
              )}
              <div className="flex gap-2 justify-center flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryLoad}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                {processedUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testPdfUrl}
                  >
                    Test URL
                  </Button>
                )}

                {documentUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(documentUrl, '_blank')}
                  >
                    Open in New Tab
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : processedUrl ? (
          /* PDF Viewer */
          <div
            ref={containerRef}
            className="flex-1 pdf-viewer-container relative overflow-hidden"
            data-scroll-mode={scrollMode === ScrollMode.Vertical ? "vertical" : "horizontal"}
            style={{ height: 'calc(100vh - 14rem)' }}
          >
            <Worker workerUrl="/pdfjs/pdf.worker.min.js">
              <Viewer
                fileUrl={processedUrl}
                plugins={[
                  zoomPluginInstance,
                  searchPluginInstance,
                ]}
                onDocumentLoad={handleDocumentLoad}
                onPageChange={handlePageChange}
                theme="dark"
                defaultScale={1.0}
                scrollMode={scrollMode}
                renderLoader={(percentages: number) => (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Loading PDF... {Math.round(percentages)}%</p>
                    </div>
                  </div>
                )}
              />
            </Worker>

            {/* Always-visible Floating Navigation */}
            {totalPages > 1 && (
              <div className="absolute bottom-6 right-6 flex items-center gap-2 z-50">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className="h-12 w-12 p-0 rounded-full shadow-lg border border-border/50 backdrop-blur-sm bg-background/95 hover:bg-background disabled:opacity-50 transition-all duration-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="px-4 py-2 rounded-full bg-background/95 backdrop-blur-sm border border-border/50 text-sm font-medium text-foreground shadow-lg">
                  {currentPage + 1} / {totalPages}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className="h-12 w-12 p-0 rounded-full shadow-lg border border-border/50 backdrop-blur-sm bg-background/95 hover:bg-background disabled:opacity-50 transition-all duration-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Mode Indicator */}
            <div className="absolute top-4 left-4 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm border border-border/50 text-sm text-muted-foreground shadow-lg z-40">
              {scrollMode === ScrollMode.Horizontal ? '📖 Page Mode' : '📜 Scroll Mode'}
            </div>
          </div>
        ) : (
          /* No Document State */
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No document selected</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
