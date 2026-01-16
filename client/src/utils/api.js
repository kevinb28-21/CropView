/**
 * API Utility
 * Handles API calls with environment-aware base URL
 */

/**
 * Resolve API base URL depending on environment
 * - Development: always use local server
 * - Production: 
 *   - If VITE_API_URL is set and is HTTPS, use it directly
 *   - Otherwise, use relative paths (empty string) to leverage Netlify proxy
 *   - This avoids mixed content errors (HTTPS frontend calling HTTP backend)
 */
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:5050';
  }
  
  // In production, check if VITE_API_URL is explicitly set
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl) {
    // Only use it if it's HTTPS (to avoid mixed content errors)
    if (viteApiUrl.startsWith('https://')) {
      return viteApiUrl;
    }
    // If HTTP is provided, warn and fall back to relative paths (Netlify proxy)
    console.warn(
      'VITE_API_URL is set to HTTP, but frontend is served over HTTPS. ' +
      'Using relative paths (Netlify proxy) to avoid mixed content errors. ' +
      'Set VITE_API_URL to HTTPS or leave it unset to use Netlify proxy.'
    );
  }
  
  // Default to same-origin requests so Netlify redirects/proxies can handle HTTPS
  // This allows the frontend (HTTPS) to call the backend (HTTP) via Netlify's proxy
  return '';
};

const API_URL = getApiBaseUrl();

const buildUrl = (endpoint) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  if (!API_URL) {
    return endpoint; // relative URL
  }
  return `${API_URL.replace(/\/$/, '')}${endpoint}`;
};

export const api = {
  /**
   * GET request
   */
  get: async (endpoint) => {
    const url = buildUrl(endpoint);
    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `API Error: ${response.statusText} (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch (e) {
          // If response isn't JSON, use status text
        }
        throw new Error(errorMessage);
      }
      
      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (!text) {
          return null; // Empty response
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          return text; // Return as text if not JSON
        }
      }
      
      return response.json();
    } catch (error) {
      // Enhanced error logging for debugging
      const errorDetails = {
        message: error.message,
        name: error.name,
        url: url,
        endpoint: endpoint,
        apiBaseUrl: API_URL || '(using relative paths)',
        isProduction: !import.meta.env.DEV,
        isNetlify: window.location.hostname.includes('netlify.app'),
        origin: window.location.origin,
        timestamp: new Date().toISOString()
      };
      
      console.error('API GET Error:', error);
      console.error('Error Details:', errorDetails);
      console.error('Failed URL:', url);
      
      // Provide helpful error message for connection failures
      if (error.message === 'Failed to fetch' || 
          error.name === 'TypeError' || 
          error.message.includes('fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('CORS')) {
        
        // Check if we're in production (Netlify)
        const isProduction = !import.meta.env.DEV;
        const isNetlify = window.location.hostname.includes('netlify.app');
        
        let helpfulMessage;
        if (isProduction && isNetlify) {
          helpfulMessage = `Cannot connect to backend server at ${url}. ` +
            `Possible causes: ` +
            `1) Backend server is down or not accessible, ` +
            `2) CORS is misconfigured (backend must allow ${window.location.origin}), ` +
            `3) Netlify proxy is not working (check netlify.toml redirects). ` +
            `Check browser console and network tab for details.`;
        } else {
          helpfulMessage = `Cannot connect to backend server at ${url}. ` +
            `Please ensure the backend server is running on port 5050. ` +
            `Run: cd server && npm run dev`;
        }
        
        const helpfulError = new Error(helpfulMessage);
        helpfulError.name = 'ConnectionError';
        helpfulError.originalError = error;
        helpfulError.url = url;
        helpfulError.details = errorDetails;
        throw helpfulError;
      }
      
      throw error;
    }
  },

  /**
   * POST request with JSON body
   */
  post: async (endpoint, data) => {
    const url = buildUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        let errorMessage = `API Error: ${response.statusText} (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch (e) {
          // If response isn't JSON, use status text
        }
        throw new Error(errorMessage);
      }
      
      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (!text) {
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          return text;
        }
      }
      
      return response.json();
    } catch (error) {
      // Enhanced error logging for debugging
      const errorDetails = {
        message: error.message,
        name: error.name,
        url: url,
        endpoint: endpoint,
        apiBaseUrl: API_URL || '(using relative paths)',
        isProduction: !import.meta.env.DEV,
        isNetlify: window.location.hostname.includes('netlify.app'),
        origin: window.location.origin,
        timestamp: new Date().toISOString()
      };
      
      console.error('API POST Error:', error);
      console.error('Error Details:', errorDetails);
      console.error('Failed URL:', url);
      
      // Handle connection errors
      if (error.message === 'Failed to fetch' || 
          error.name === 'TypeError' || 
          error.message.includes('fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('CORS')) {
        const isProduction = !import.meta.env.DEV;
        const isNetlify = window.location.hostname.includes('netlify.app');
        
        let helpfulMessage;
        if (isProduction && isNetlify) {
          helpfulMessage = `Cannot connect to backend server at ${url}. ` +
            `Check network connection, CORS configuration, and Netlify proxy settings.`;
        } else {
          helpfulMessage = `Cannot connect to backend server at ${url}. ` +
            `Check network connection and CORS configuration.`;
        }
        
        const helpfulError = new Error(helpfulMessage);
        helpfulError.name = 'ConnectionError';
        helpfulError.originalError = error;
        helpfulError.url = url;
        helpfulError.details = errorDetails;
        throw helpfulError;
      }
      
      throw error;
    }
  },

  /**
   * POST request with FormData (for file uploads)
   */
  upload: async (endpoint, formData) => {
    const url = buildUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorMessage = `API Error: ${response.statusText} (${response.status})`;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
              errorMessage = `${errorMessage} - ${errorText}`;
            }
          }
        } catch (e) {
          // Use default error message
        }
        throw new Error(errorMessage);
      }
      
      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (!text) {
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          return text;
        }
      }
      
      return response.json();
    } catch (error) {
      // Enhanced error logging for debugging
      const errorDetails = {
        message: error.message,
        name: error.name,
        url: url,
        endpoint: endpoint,
        apiBaseUrl: API_URL || '(using relative paths)',
        isProduction: !import.meta.env.DEV,
        isNetlify: window.location.hostname.includes('netlify.app'),
        origin: window.location.origin,
        timestamp: new Date().toISOString()
      };
      
      console.error('API Upload Error:', error);
      console.error('Error Details:', errorDetails);
      console.error('Failed URL:', url);
      
      // Handle connection errors
      if (error.message === 'Failed to fetch' || 
          error.name === 'TypeError' || 
          error.message.includes('fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('CORS')) {
        const isProduction = !import.meta.env.DEV;
        const isNetlify = window.location.hostname.includes('netlify.app');
        
        let helpfulMessage;
        if (isProduction && isNetlify) {
          helpfulMessage = `Cannot connect to backend server at ${url}. ` +
            `Check network connection, CORS configuration, and Netlify proxy settings.`;
        } else {
          helpfulMessage = `Cannot connect to backend server at ${url}. ` +
            `Check network connection and CORS configuration.`;
        }
        
        const helpfulError = new Error(helpfulMessage);
        helpfulError.name = 'ConnectionError';
        helpfulError.originalError = error;
        helpfulError.url = url;
        helpfulError.details = errorDetails;
        throw helpfulError;
      }
      
      throw error;
    }
  },
};

// Export API URL for direct use if needed
export { API_URL };

/**
 * Build proper image URL from path or S3 URL
 * Handles both relative paths (/uploads/file.jpg) and full URLs
 */
export const buildImageUrl = (image) => {
  if (!image) return null;
  
  // Prefer S3 URL if available
  if (image.s3Url) {
    return image.s3Url;
  }
  
  // If path is provided, check if it's already a full URL
  if (image.path) {
    if (image.path.startsWith('http://') || image.path.startsWith('https://')) {
      return image.path;
    }
    
    // If path starts with /uploads, it's a relative path - construct full URL
    if (image.path.startsWith('/uploads/')) {
      if (API_URL) {
        return `${API_URL.replace(/\/$/, '')}${image.path}`;
      }
      // In production with Netlify, use relative path (Netlify will proxy it)
      return image.path;
    }
    
    // If path doesn't start with /, it might be a local filesystem path
    // Try to construct a proper URL
    if (!image.path.startsWith('/')) {
      // Assume it's a filename and should be in /uploads/
      const filename = image.path.split('/').pop() || image.path;
      if (API_URL) {
        return `${API_URL.replace(/\/$/, '')}/uploads/${filename}`;
      }
      return `/uploads/${filename}`;
    }
    
    // Otherwise return as-is (might be a relative path)
    return image.path;
  }
  
  return null;
};

/**
 * Safely parse and format a date
 * Returns formatted string or fallback
 */
export const formatDate = (dateValue, format = 'date') => {
  if (!dateValue) return 'Unknown date';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    if (format === 'datetime' || format === 'string') {
      return date.toLocaleString();
    }
    return date.toLocaleDateString();
  } catch (e) {
    return 'Invalid date';
  }
};

