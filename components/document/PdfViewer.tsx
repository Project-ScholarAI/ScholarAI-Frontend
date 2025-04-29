"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

type Props = {
  url: string
  currentPage: number
  setCurrentPage: (page: number) => void
  scale: number
  setScale: (scale: number) => void
}

export function PdfViewer({ url, currentPage, setCurrentPage, scale, setScale }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setIsLoading(false)
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const zoomIn = () => {
    setScale(Math.min(scale + 0.1, 2.0))
  }

  const zoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.5))
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={goToPrevPage} disabled={currentPage <= 1}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <span>
          Page {currentPage} of {numPages || "--"}
        </span>

        <Button variant="outline" size="icon" onClick={goToNextPage} disabled={!numPages || currentPage >= numPages}>
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="ml-4 flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span>{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "border rounded-lg overflow-auto",
          isLoading ? "flex items-center justify-center min-h-[500px]" : "",
        )}
      >
        {isLoading && <div className="animate-pulse">Loading document...</div>}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="animate-pulse">Loading document...</div>}
        >
          <Page pageNumber={currentPage} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      </div>
    </div>
  )
}
