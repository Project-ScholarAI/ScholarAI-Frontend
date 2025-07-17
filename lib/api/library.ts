import { getApiUrl } from "@/lib/config/api-config";
import { authenticatedFetch } from "@/lib/api/auth";
import type { Paper } from "@/types/websearch";

/**
 * Library API Functions
 */

export interface LibraryStats {
    projectId: string;
    correlationIds: string[];
    totalPapers: number;
    completedSearchOperations: number;
    retrievedAt: string;
    message: string;
}

export interface LibraryResponse {
    timestamp: string;
    status: number;
    message: string;
    data: LibraryStats & {
        papers: Paper[];
    };
}

export const getProjectLibrary = async (
    projectId: string
): Promise<LibraryResponse> => {
    try {
        const response = await authenticatedFetch(
            getApiUrl(`/api/v1/library/project/${projectId}`)
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `HTTP error! status: ${response.status}`
            );
        }

        const data: LibraryResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching project library:", error);
        throw error;
    }
};

export const getProjectLibraryStats = async (
    projectId: string
): Promise<LibraryResponse> => {
    try {
        const response = await authenticatedFetch(
            getApiUrl(`/api/v1/library/project/${projectId}/stats`)
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `HTTP error! status: ${response.status}`
            );
        }

        const data: LibraryResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching project library stats:", error);
        throw error;
    }
}; 