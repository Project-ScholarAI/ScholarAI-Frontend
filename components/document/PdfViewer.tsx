"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Worker, Viewer, ScrollMode } from '@react-pdf-viewer/core'
import type { PopoverProps } from '@react-pdf-viewer/core'
import { zoomPlugin } from '@react-pdf-viewer/zoom'
import type { ZoomPopoverProps } from '@react-pdf-viewer/zoom'
import { searchPlugin } from '@react-pdf-viewer/search'
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation'
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
  X,
  ChevronUp,
  ChevronDown,
  Hash
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { downloadPdfWithAuth } from "@/lib/api/pdf"

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
  const [searchKeyword, setSearchKeyword] = useState('')
  const [jumpToPage, setJumpToPage] = useState('')
  const [scale, setScale] = useState(1.0)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize plugins
  const zoomPluginInstance = zoomPlugin()
  const { zoomTo } = zoomPluginInstance
  const searchPluginInstance = searchPlugin({ keyword: searchKeyword ? [searchKeyword] : [] })
  const { clearHighlights, highlight, jumpToNextMatch, jumpToPreviousMatch } = searchPluginInstance

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
    const outerContainer = containerRef.current?.parentElement
    if (!outerContainer) return

    const handleScroll = () => {
      // Find all pages in the document
      const pages = document.querySelectorAll('.rpv-core__page-layer')
      if (pages.length === 0) return

      const containerRect = outerContainer.getBoundingClientRect()
      const containerTop = containerRect.top
      const containerBottom = containerRect.bottom
      const containerCenter = containerTop + containerRect.height / 2

      // Find which page is most visible in the viewport
      let visiblePageIndex = 0
      let maxVisibleArea = 0

      pages.forEach((page, index) => {
        const pageRect = page.getBoundingClientRect()

        // Calculate visible area of this page
        const visibleTop = Math.max(pageRect.top, containerTop)
        const visibleBottom = Math.min(pageRect.bottom, containerBottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const visibleArea = visibleHeight * pageRect.width

        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea
          visiblePageIndex = index
        }
      })

      if (visiblePageIndex !== currentPage) {
        console.log('Page changed from', currentPage, 'to', visiblePageIndex)
        setCurrentPage(visiblePageIndex)
      }
    }

    // Throttle scroll events for better performance
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    outerContainer.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => outerContainer.removeEventListener('scroll', throttledHandleScroll)
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
    setCurrentMatchIndex(0)
    if (keyword.trim()) {
      highlight([keyword])
    } else {
      clearHighlights()
      setTotalMatches(0)
    }
  }

  // Enhanced page navigation - cleaned up but keeping working logic
  const jumpToPageNumber = (pageIndex: number) => {
    setCurrentPage(pageIndex)

    // Fallback: Direct DOM manipulation
    const pageSelectors = [
      '.rpv-core__page-layer',
      '[data-page-number]',
      '.rpv-page',
      '.page'
    ]

    let pages: NodeListOf<Element> | null = null

    for (const selector of pageSelectors) {
      const foundPages = document.querySelectorAll(selector)
      if (foundPages.length > 0) {
        pages = foundPages
        break
      }
    }

    if (pages && pages.length > pageIndex && pageIndex >= 0) {
      const targetPage = pages[pageIndex] as HTMLElement
      const scrollContainer = containerRef.current?.parentElement

      if (scrollContainer && targetPage) {
        const containerRect = scrollContainer.getBoundingClientRect()
        const pageRect = targetPage.getBoundingClientRect()

        const currentScroll = scrollContainer.scrollTop
        const targetScroll = currentScroll + pageRect.top - containerRect.top - 20

        // Force immediate scroll first, then smooth scroll
        scrollContainer.scrollTop = targetScroll
        scrollContainer.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        })
      }
    }
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

  // Handle zoom with wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()

      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newScale = Math.max(0.5, Math.min(3.0, scale + delta))

      setScale(newScale)
      if (zoomTo) {
        zoomTo(newScale)
      }
    }
  }, [scale, zoomTo])

  // Add wheel event listener for zoom
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Handle zoom
  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, 3.0)
    setScale(newScale)
    if (zoomTo) {
      zoomTo(newScale)
    }
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale / 1.2, 0.5)
    setScale(newScale)
    if (zoomTo) {
      zoomTo(newScale)
    }
  }

  const handleFitToPage = () => {
    setScale(1.0)
    if (zoomTo) {
      zoomTo(1.0)
    }
  }

  // Search navigation
  const handleNextMatch = () => {
    if (totalMatches > 0) {
      jumpToNextMatch()
      setCurrentMatchIndex((prev) => (prev + 1) % totalMatches)
    }
  }

  const handlePreviousMatch = () => {
    if (totalMatches > 0) {
      jumpToPreviousMatch()
      setCurrentMatchIndex((prev) => (prev - 1 + totalMatches) % totalMatches)
    }
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
      {/* Compact Header */}
      <div className="flex items-center justify-end h-12 px-4 bg-card border-b border-border">
        <div className="flex items-center gap-2">
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
              showSearch ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

      {/* Search Bar */}
      {showSearch && (
        <div className="flex items-center gap-2 h-10 px-4 bg-primary/5 border-b border-border">
          <Search className="h-4 w-4 text-primary" />
          <Input
            ref={searchInputRef}
            type="text"
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search in document..."
            className="h-8 flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSearch(false)
                setSearchKeyword('')
                clearHighlights()
              } else if (e.key === 'Enter') {
                if (e.shiftKey) {
                  handlePreviousMatch()
                } else {
                  handleNextMatch()
                }
              }
            }}
          />
          {searchKeyword && totalMatches > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {currentMatchIndex + 1} of {totalMatches}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousMatch}
                className="h-6 w-6 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMatch}
                className="h-6 w-6 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          )}
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
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Document Viewer */}
      <div className="flex-1 bg-background overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load PDF</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={retryLoad}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        ) : processedUrl ? (
          <div
            ref={containerRef}
            className="pdf-viewer-container"
            style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
          >
            <Worker workerUrl="/pdfjs/pdf.worker.min.js">
              <Viewer
                fileUrl={processedUrl}
                plugins={[zoomPluginInstance, searchPluginInstance]}
                onDocumentLoad={handleDocumentLoad}
                onPageChange={handlePageChange}
                theme="dark"
                defaultScale={1.0}
                scrollMode={ScrollMode.Vertical}
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
          </div>
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No document selected</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls - Drawboard style */}
      {processedUrl && !isLoading && !error && (
        <div className="flex items-center justify-between h-14 px-6 bg-card border-t border-border pdf-footer-controls">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage <= 0}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJumpToPage()
                  }
                }}
                className="w-16 h-8 text-center text-sm"
                placeholder={(currentPage + 1).toString()}
                min="1"
                max={totalPages.toString()}
              />
              <span className="text-sm text-muted-foreground">/ {totalPages}</span>
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

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleFitToPage}
              className="h-8 px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {Math.round(scale * 100)}%
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3.0}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Page Debug Info */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
