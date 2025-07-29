/**
 * URL utilities for normalizing and comparing URLs consistently
 * Fixes gap analysis job filtering issues with URL mismatches
 */

/**
 * Normalizes a URL for consistent comparison
 * Handles protocol normalization, trailing slashes, encoding, etc.
 * 
 * @param url - The URL to normalize
 * @returns Normalized URL string
 */
export function normalizeUrl(url: string): string {
  try {
    // Handle empty/null URLs
    if (!url || typeof url !== 'string') {
      return '';
    }

    // Create URL object for parsing
    const urlObj = new URL(url);
    
    // Normalize protocol to https (prefer secure)
    urlObj.protocol = 'https:';
    
    // Remove trailing slash from pathname (except for root)
    if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    // Sort query parameters for consistent ordering
    urlObj.searchParams.sort();
    
    // Return normalized URL
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return cleaned version of original
    console.warn('Failed to normalize URL:', url, error);
    return url.trim().replace(/\/+$/, ''); // Remove trailing slashes as fallback
  }
}

/**
 * Compares two URLs for equality using normalization
 * More flexible than strict equality - handles common URL variations
 * 
 * @param url1 - First URL to compare
 * @param url2 - Second URL to compare
 * @returns True if URLs are considered equivalent
 */
export function areUrlsEquivalent(url1: string, url2: string): boolean {
  // Quick check for exact match first
  if (url1 === url2) {
    return true;
  }
  
  // Normalize both URLs and compare
  const normalized1 = normalizeUrl(url1);
  const normalized2 = normalizeUrl(url2);
  
  if (normalized1 === normalized2) {
    return true;
  }
  
  // Additional fuzzy matching for common cases
  // Remove protocol differences (http vs https)
  const withoutProtocol1 = normalized1.replace(/^https?:\/\//, '');
  const withoutProtocol2 = normalized2.replace(/^https?:\/\//, '');
  
  return withoutProtocol1 === withoutProtocol2;
}

/**
 * Extracts the core identifier from a URL for matching purposes
 * Useful for matching papers across different URL formats
 * 
 * @param url - The URL to extract identifier from
 * @returns Core identifier string
 */
export function extractUrlIdentifier(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // For ArXiv URLs, extract the paper ID
    if (urlObj.hostname.includes('arxiv.org')) {
      const match = urlObj.pathname.match(/\/(abs|pdf)\/([^\/\?]+)/);
      if (match) {
        return `arxiv:${match[2]}`;
      }
    }
    
    // For DOI URLs, extract the DOI
    if (urlObj.hostname.includes('doi.org')) {
      const doi = urlObj.pathname.substring(1); // Remove leading slash
      return `doi:${doi}`;
    }
    
    // For B2 URLs, extract the file ID if present
    if (urlObj.hostname.includes('backblazeb2.com') || urlObj.searchParams.has('fileId')) {
      const fileId = urlObj.searchParams.get('fileId');
      if (fileId) {
        return `b2:${fileId}`;
      }
    }
    
    // Fallback: use normalized URL
    return normalizeUrl(url);
  } catch (error) {
    console.warn('Failed to extract URL identifier:', url, error);
    return normalizeUrl(url);
  }
}

/**
 * Debug function to help troubleshoot URL matching issues
 * Logs URL comparison details for debugging
 * 
 * @param url1 - First URL
 * @param url2 - Second URL
 * @param context - Context for debugging (e.g., "job filtering")
 */
export function debugUrlComparison(url1: string, url2: string, context: string = 'comparison'): void {
  console.group(`🔍 URL Debug - ${context}`);
  console.log('URL 1 (original):', url1);
  console.log('URL 2 (original):', url2);
  console.log('URL 1 (normalized):', normalizeUrl(url1));
  console.log('URL 2 (normalized):', normalizeUrl(url2));
  console.log('URLs equivalent:', areUrlsEquivalent(url1, url2));
  console.log('URL 1 identifier:', extractUrlIdentifier(url1));
  console.log('URL 2 identifier:', extractUrlIdentifier(url2));
  console.groupEnd();
}