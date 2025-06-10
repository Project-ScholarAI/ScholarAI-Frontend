"use client"

import { useState, useCallback } from "react"
import { initiateWebSearch, pollUntilComplete } from "@/lib/api"
import type { WebSearchRequest, WebSearchResponse, Paper } from "@/types/websearch"

interface UseWebSearchState {
    isSearching: boolean
    progress: number
    currentStep: string
    papers: Paper[]
    error: string | null
    correlationId: string | null
}

interface UseWebSearchActions {
    startSearch: (searchRequest: WebSearchRequest) => Promise<void>
    resetSearch: () => void
}

export function useWebSearch(): UseWebSearchState & UseWebSearchActions {
    const [state, setState] = useState<UseWebSearchState>({
        isSearching: false,
        progress: 0,
        currentStep: "",
        papers: [],
        error: null,
        correlationId: null
    })

    const updateProgress = useCallback((progress: number, step: string) => {
        setState(prev => ({
            ...prev,
            progress,
            currentStep: step
        }))
    }, [])

    const startSearch = useCallback(async (searchRequest: WebSearchRequest) => {
        setState({
            isSearching: true,
            progress: 0,
            currentStep: "Initiating search...",
            papers: [],
            error: null,
            correlationId: null
        })

        try {
            // Step 1: Initiate search (10% progress)
            updateProgress(10, "Request sent to search agent...")
            const { correlationId } = await initiateWebSearch(searchRequest)

            setState(prev => ({ ...prev, correlationId }))
            updateProgress(20, "Agent initiated successfully")

            // Step 2: Poll for results with progress updates
            const onProgress = (attempt: number, status: string) => {
                const progressMap: Record<string, number> = {
                    'SUBMITTED': 30,
                    'PROCESSING': 60,
                    'COMPLETED': 100
                }

                const stepMap: Record<string, string> = {
                    'SUBMITTED': "Fetching from academic databases...",
                    'PROCESSING': "Processing and filtering results...",
                    'COMPLETED': "Search completed successfully!"
                }

                const currentProgress = progressMap[status] || 30 + (attempt * 5)
                const currentStep = stepMap[status] || `Processing... (attempt ${attempt})`

                updateProgress(Math.min(currentProgress, 95), currentStep)
            }

            const result = await pollUntilComplete(correlationId, 30, onProgress)

            // Final update
            updateProgress(100, "Search completed successfully!")

            setState(prev => ({
                ...prev,
                isSearching: false,
                papers: result.papers,
                progress: 100
            }))

        } catch (error) {
            console.error("Web search error:", error)
            setState(prev => ({
                ...prev,
                isSearching: false,
                error: error instanceof Error ? error.message : "Search failed",
                progress: 0
            }))
        }
    }, [updateProgress])

    const resetSearch = useCallback(() => {
        setState({
            isSearching: false,
            progress: 0,
            currentStep: "",
            papers: [],
            error: null,
            correlationId: null
        })
    }, [])

    return {
        ...state,
        startSearch,
        resetSearch
    }
} 