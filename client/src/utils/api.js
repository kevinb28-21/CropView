/**
 * API Utility
 * Handles API calls with environment-aware base URL
 */

// Use environment variable in production, fallback to localhost for dev
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'http://ec2-18-223-169-5.us-east-2.compute.amazonaws.com'
    : 'http://localhost:5050');

export const api = {
  /**
   * GET request
   */
  get: async (endpoint) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText} (${response.status})`);
      }
      return response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  /**
   * POST request with JSON body
   */
  post: async (endpoint, data) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText} (${response.status})`);
      }
      return response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  /**
   * POST request with FormData (for file uploads)
   */
  upload: async (endpoint, formData) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.statusText} (${response.status}) - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Upload Error:', error);
      throw error;
    }
  },
};

// Export API URL for direct use if needed
export { API_URL };

