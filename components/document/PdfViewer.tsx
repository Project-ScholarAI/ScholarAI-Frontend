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
  Hash,
  Send,
  MessageSquarePlus,
  AtSign,
  Cloud,
  Clock,
  MoreHorizontal,
  Infinity,
  Bot,
  LayoutGrid
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { downloadPdfWithAuth } from "@/lib/api/pdf"

// Import CSS for react-pdf-viewer
import '@react-pdf-viewer/core/lib/styles/index.css'

// Thumbnail plugin for grid view
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail'
import '@react-pdf-viewer/thumbnail/lib/styles/index.css'

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
  const [searchResults, setSearchResults] = useState<{ pageIndex: number; snippet: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [jumpToPage, setJumpToPage] = useState('')
  const [scale, setScale] = useState(1.0)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Chat drawer state
  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [pendingContext, setPendingContext] = useState<string[]>([])

  // Floating add-to-chat button for selected text
  const [selectionText, setSelectionText] = useState('')
  const [selectionPos, setSelectionPos] = useState<{ x: number; y: number } | null>(null)

  // Chat metadata and resizing
  const [chatName, setChatName] = useState('New Chat')
  const [isEditingName, setIsEditingName] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ name: string; messages: { role: 'user' | 'assistant'; content: string }[] }[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [chatWidth, setChatWidth] = useState(384)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(384)

  const zoomPluginInstance = zoomPlugin()
  const { zoomTo } = zoomPluginInstance

  const searchPluginInstance = searchPlugin()
  const { clearHighlights, highlight, jumpToNextMatch, jumpToPreviousMatch } = searchPluginInstance

// Thumbnail plugin instance
const thumbnailPluginInstance = thumbnailPlugin()

// Add thumbnail overlay component
const ThumbnailOverlay = () => {
  const [thumbnails, setThumbnails] = useState<{ pageIndex: number; url: string }[]>([])
  const [loadingThumbnails, setLoadingThumbnails] = useState(true)

  useEffect(() => {
    const generateThumbnails = async () => {
      if (!pdfDoc) return
      
      setLoadingThumbnails(true)
      const thumbs: { pageIndex: number; url: string }[] = []
      
      try {
        for (let i = 1; i <= Math.min(pdfDoc.numPages, 100); i++) {
          const page = await pdfDoc.getPage(i)
          const viewport = page.getViewport({ scale: 0.5 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          
          if (context) {
            canvas.height = viewport.height
            canvas.width = viewport.width
            
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise
            
            thumbs.push({
              pageIndex: i - 1,
              url: canvas.toDataURL()
            })
          }
        }
        
        setThumbnails(thumbs)
      } catch (error) {
        console.error('Error generating thumbnails:', error)
      } finally {
        setLoadingThumbnails(false)
      }
    }

    if (showThumbnails && pdfDoc) {
      generateThumbnails()
    }
  }, [showThumbnails, pdfDoc])

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="sticky top-0 flex items-center justify-between p-4 bg-background border-b border-border z-10">
        <h2 className="text-lg font-semibold">All Pages</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowThumbnails(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-8 max-w-[1600px] mx-auto">
        {loadingThumbnails ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Generating thumbnails...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {thumbnails.map((thumb) => (
              <div
                key={thumb.pageIndex}
                className="cursor-pointer group"
                onClick={() => {
                  jumpToPageNumber(thumb.pageIndex)
                  setShowThumbnails(false)
                }}
              >
                <div className="relative rounded-lg overflow-hidden bg-card border border-border transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1">
                  <div className="aspect-[1/1.4] bg-muted">
                    <img 
                      src={thumb.url} 
                      alt={`Page ${thumb.pageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <p className="text-center mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Page {thumb.pageIndex + 1}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

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
    const urlForDownload = processedUrl || documentUrl
    if (!urlForDownload) return

    try {
      await downloadPdfWithAuth(urlForDownload, documentName)
    } catch (error) {
      console.error('Download failed:', error)

      // Fallback: Attempt to open the PDF in a new tab for download
      try {
        const link = document.createElement('a')
        link.href = urlForDownload
        link.download = `${documentName}.pdf`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError)
        setError('Failed to download PDF. Please try again or check your connection.')
      }
    }
  }

  const handleDocumentLoad = useCallback((e: any) => {
    console.log('Document loaded successfully:', e)
    setTotalPages(e.doc.numPages)
    setPdfDoc(e.doc)
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
      // Toggle chat with Ctrl+I
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        setShowChat((prev) => !prev)
        return
      }
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

  // Listen to selection changes to show Add-to-Chat button
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection()
      if (sel && sel.toString().trim().length > 0) {
        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setSelectionText(sel.toString())
        setSelectionPos({ x: rect.right, y: rect.bottom })
      } else {
        setSelectionPos(null)
      }
    }
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  const performSearch = async (keyword: string) => {
    if (!pdfDoc || !keyword.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    const newResults: { pageIndex: number; snippet: string }[] = []
    const regex = new RegExp(keyword, 'gi')
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()
      const text = (textContent.items as any[]).map((it) => it.str).join(' ')
      let match
      while ((match = regex.exec(text)) !== null) {
        const start = Math.max(0, match.index - 30)
        const snippet = text.substr(start, keyword.length + 60).replace(/\s+/g, ' ')
        newResults.push({ pageIndex: i - 1, snippet })
      }
    }
    setSearchResults(newResults)
    setIsSearching(false)
  }

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentMatchIndex(0)
    if (keyword.trim()) {
      highlight([keyword])
      performSearch(keyword)
    } else {
      clearHighlights()
      setSearchResults([])
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

  // Handle resizing of chat drawer
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const delta = startX - e.clientX
      setChatWidth(Math.max(200, Math.min(800, startWidth + delta)))
    }
    const onMouseUp = () => setIsResizing(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isResizing, startX, startWidth])

  return (
    <div className="relative flex flex-col h-full bg-background">
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
            onClick={() => setShowChat(!showChat)}
            className={cn(
              "h-8 w-8 p-0",
              showChat ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Sidebar */}
      <div className={`absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-40 transform transition-transform duration-300 ease-in-out ${showSearch ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header with input */}
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <Input
            ref={searchInputRef}
            type="text"
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSearch(false)
                setSearchKeyword('')
                clearHighlights()
                setSearchResults([])
              }
            }}
            placeholder="Keyword search"
            className="h-8 text-sm flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSearch(false)
              setSearchKeyword('')
              clearHighlights()
              setSearchResults([])
            }}
            className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto">
          {isSearching ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No results</div>
          ) : (
            searchResults.map((res, idx) => (
              <button
                key={`${res.pageIndex}-${idx}`}
                onClick={() => {
                  jumpToPageNumber(res.pageIndex)
                  setShowSearch(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-muted"
              >
                <div className="text-xs text-muted-foreground">Page {res.pageIndex + 1}</div>
                <div className="text-sm truncate" dangerouslySetInnerHTML={{ __html: res.snippet.replace(new RegExp(searchKeyword, 'gi'), `<span class='text-primary font-semibold'>${searchKeyword}</span>`) }} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Floating add-to-chat button */}
      {selectionPos && (
        <button
          style={{ top: selectionPos.y + window.scrollY + 8, left: selectionPos.x + window.scrollX + 8 }}
          className="fixed z-50 flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs shadow hover:bg-primary/90"
          onClick={() => {
            setPendingContext((ctx) => [...ctx, selectionText])
            window.getSelection()?.removeAllRanges()
            setSelectionPos(null)
            setShowChat(true)
          }}
        >
          <MessageSquarePlus className="h-3 w-3" /> Add to chat
        </button>
      )}

      {/* Document Viewer */}
      <div
        className={`flex-1 bg-background overflow-auto transition-all ease-in-out ${showSearch ? 'ml-72' : 'ml-0'}`}
        style={{
          marginRight: showChat ? `${chatWidth}px` : '0px',
          transitionDuration: isResizing ? '0ms' : '300ms'
        }}
      >
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
                plugins={[zoomPluginInstance, searchPluginInstance, thumbnailPluginInstance]}
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
        <div className="flex items-center h-10 px-4 bg-card border-t border-border pdf-footer-controls">
          {/* Centered Page Navigation */}
          <div className="flex-1 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage <= 0}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Input
              type="number"
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJumpToPage()
                }
              }}
              className="w-14 h-8 text-center text-xs"
              placeholder={(currentPage + 1).toString()}
              min="1"
              max={totalPages.toString()}
            />

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

          {/* Zoom Controls - aligned right with separators */}
          <div className="ml-auto flex items-center gap-2">
            <div className="border-l border-border h-6 mx-2" />
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
              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
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
            <div className="border-l border-border h-6 mx-2" />

            {/* View all pages / Thumbnail grid button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThumbnails(true)}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      <div
        className={`absolute right-0 top-0 bottom-0 bg-card border-l border-border z-40 flex flex-col transform transition-all ease-in-out ${showChat ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          width: `${chatWidth}px`,
          transitionDuration: isResizing ? '0ms' : '300ms'
        }}
      >
        {/* Resizer Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-border"
          onMouseDown={(e) => { setIsResizing(true); setStartX(e.clientX); setStartWidth(chatWidth) }}
        />
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-border">
          {isEditingName ? (
            <Input
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="font-semibold w-32"
            />
          ) : (
            <span onClick={() => setIsEditingName(true)} className="font-semibold cursor-text">{chatName}</span>
          )}
          <div className="flex items-center gap-2">
            {/* New Chat */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setChatHistory((hist) => [...hist, { name: chatName, messages: chatMessages }])
                setChatName('New Chat')
                setChatMessages([])
                setPendingContext([])
                setChatInput('')
                setShowHistory(false)
                setIsEditingName(false)
              }}
            ><Plus className="h-4 w-4" /></Button>
            {/* History Toggle */}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowHistory((v) => !v)}><Clock className="h-4 w-4" /></Button>
            {/* Close Chat */}
            <Button variant="ghost" onClick={() => setShowChat(false)} className="h-8 w-8 p-0"><X className="h-4 w-4" /></Button>
          </div>
        </div>
        {/* Content */}
        {showHistory ? (
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {chatHistory.length === 0 ? (
              <div className="text-sm text-muted-foreground">No chats yet</div>
            ) : (
              chatHistory.map((session, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatName(session.name)
                    setChatMessages(session.messages)
                    setShowHistory(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted"
                >
                  <div className="font-medium">{session.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{session.messages[0]?.content || ''}</div>
                </button>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn('rounded-lg px-3 py-2 whitespace-pre-wrap text-sm', msg.role === 'user' ? 'bg-primary/10 self-end' : 'bg-muted')}
                >
                  {msg.content}
                </div>
              ))}
            </div>
          </>
        )}
        {/* Input Section */}
        <div className="border-t border-border p-3 flex flex-col gap-2">
          {/* Context Chips */}
          {pendingContext.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {pendingContext.map((ctx, i) => (
                <div key={i} className="flex items-center bg-muted/10 rounded px-2 py-1 text-xs">
                  <span className="truncate max-w-xs">{ctx}</span>
                  <button onClick={() => setPendingContext((c) => c.filter((_, idx) => idx !== i))} className="ml-1 text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Input Row */}
          <div className="flex items-center gap-2">
            <AtSign className="h-4 w-4 text-muted-foreground" />
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything."
              className="flex-1 h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (chatInput.trim() || pendingContext.length)) {
                  const content = [...pendingContext, chatInput.trim()].filter(Boolean).join('\n\n')
                  setChatMessages((msgs) => [...msgs, { role: 'user', content }])
                  setChatInput('')
                  setPendingContext([])
                }
              }}
            />
            <Button size="icon" onClick={() => {
              if (!chatInput.trim() && pendingContext.length === 0) return
              const content = [...pendingContext, chatInput.trim()].filter(Boolean).join('\n\n')
              setChatMessages((msgs) => [...msgs, { role: 'user', content }])
              setChatInput('')
              setPendingContext([])
            }}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {/* Footer Toolbar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Infinity className="h-4 w-4" />
              Agent <kbd className="px-1 bg-muted rounded">Ctrl+I</kbd>
            </div>
            <div className="flex items-center gap-1">
              <Bot className="h-4 w-4" />
              gemini
            </div>
          </div>
        </div>
      </div>

      {/* Add thumbnail overlay */}
      {showThumbnails && <ThumbnailOverlay />}
    </div>
  )
}
