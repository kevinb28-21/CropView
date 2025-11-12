/**
 * API Utility
 * Handles API calls with environment-aware base URL
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export const api = {
  /**
   * GET request
   */
  get: async (endpoint) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * POST request with JSON body
   */
  post: async (endpoint, data) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * POST request with FormData (for file uploads)
   */
  upload: async (endpoint, formData) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
};

// Export API URL for direct use if needed
export { API_URL };

