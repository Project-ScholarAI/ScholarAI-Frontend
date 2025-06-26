import type { WebSearchRequest, WebSearchResponse } from "@/types/websearch";
import type { APIResponse } from "@/types/project";
import { getApiUrl } from "@/lib/config/api-config";
import { authenticatedFetch } from "@/lib/api/auth";

/**
 * Web Search API Functions
 */

export const initiateWebSearch = async (
    searchRequest: WebSearchRequest
): Promise<{ correlationId: string }> => {
    try {
        const response = await authenticatedFetch(getApiUrl("/api/v1/websearch"), {
            method: "POST",
            body: JSON.stringify(searchRequest),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to initiate web search");
        }

        const result: APIResponse<WebSearchResponse> = await response.json();
        return { correlationId: result.data.correlationId };
    } catch (error) {
        console.error("Web search initiation error:", error);
        throw error instanceof Error
            ? error
            : new Error("Failed to initiate web search");
    }
};

export const pollSearchResults = async (
    correlationId: string
): Promise<WebSearchResponse> => {
    try {
        const response = await authenticatedFetch(
            getApiUrl(`/api/v1/websearch/${correlationId}`)
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to get search results");
        }

        const result: APIResponse<WebSearchResponse> = await response.json();
        return result.data;
    } catch (error) {
        console.error("Search results polling error:", error);
        throw error instanceof Error
            ? error
            : new Error("Failed to get search results");
    }
};

export const pollUntilComplete = async (
    correlationId: string,
    maxAttempts: number = 30,
    onProgress?: (attempt: number, status: string) => void
): Promise<WebSearchResponse> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result = await pollSearchResults(correlationId);

        onProgress?.(attempt, result.status);

        if (result.status === "COMPLETED") {
            return result;
        } else if (result.status === "FAILED") {
            throw new Error(`Search failed: ${result.message}`);
        }

        // Wait before next poll (exponential backoff)
        await new Promise((resolve) =>
            setTimeout(resolve, Math.min(1000 * attempt, 10000))
        );
    }

    throw new Error("Search timeout - taking too long");
};

export const getAllSearchHistory = async (): Promise<WebSearchResponse[]> => {
    try {
        const response = await authenticatedFetch(getApiUrl("/api/v1/websearch"));

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to get search history");
        }

        const result: APIResponse<WebSearchResponse[]> = await response.json();
        return result.data;
    } catch (error) {
        console.error("Search history error:", error);
        throw error instanceof Error
            ? error
            : new Error("Failed to get search history");
    }
};

export const checkWebSearchHealth = async (): Promise<boolean> => {
    try {
        const response = await fetch(getApiUrl("/api/v1/websearch/health"));
        const result = await response.json();
        return result.data?.status === "UP";
    } catch (error) {
        console.error("Web search health check error:", error);
        return false;
    }
}; 