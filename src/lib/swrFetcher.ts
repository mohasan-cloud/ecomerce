/**
 * SWR Fetcher function for API calls
 */
export const swrFetcher = async (url: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Enable caching for better performance
      cache: 'force-cache',
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      const error: any = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    // If response doesn't have success/data structure, return the whole response
    if (data) {
      return data;
    }

    throw new Error('Invalid response format');
  } catch (error: any) {
    // Enhance error with status code if available
    if (error.status) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError: any = new Error('Unable to connect to server. Please check if the API server is running.');
      networkError.status = 0;
      throw networkError;
    }
    
    throw error;
  }
};

