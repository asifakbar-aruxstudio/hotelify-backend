const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const ApiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,

  // for FormData (file uploads), do NOT set Content-Type — the browser sets
  // the correct multipart boundary automatically
  getHeaders: (isFormData = false) => {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  handleResponse: async (response) => {
    const json = await response.json().catch(() => ({ message: 'Network error' }));
    if (!response.ok) {
      throw new Error(json.message || 'Something went wrong');
    }
    // backend wraps everything as { statusCode, data, message, success }
    // unwrap so callers get the actual payload directly
    return json.data !== undefined ? json.data : json;
  },

  handleError: (error) => {
    console.error('API Error:', error);
    throw error;
  },
};

export const apiGet = async (endpoint) => {
  try {
    const response = await fetch(`${ApiConfig.baseURL}${endpoint}`, {
      method: 'GET',
      headers: ApiConfig.getHeaders(),
      credentials: 'include', // send httpOnly cookies (accessToken/refreshToken)
    });
    return await ApiConfig.handleResponse(response);
  } catch (error) {
    ApiConfig.handleError(error);
  }
};

export const apiPost = async (endpoint, data, isFormData = false) => {
  try {
    const response = await fetch(`${ApiConfig.baseURL}${endpoint}`, {
      method: 'POST',
      headers: ApiConfig.getHeaders(isFormData),
      credentials: 'include',
      body: isFormData ? data : JSON.stringify(data),
    });
    return await ApiConfig.handleResponse(response);
  } catch (error) {
    ApiConfig.handleError(error);
  }
};

export const apiPatch = async (endpoint, data) => {
  try {
    const response = await fetch(`${ApiConfig.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: ApiConfig.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return await ApiConfig.handleResponse(response);
  } catch (error) {
    ApiConfig.handleError(error);
  }
};

export const apiPut = async (endpoint, data) => {
  try {
    const response = await fetch(`${ApiConfig.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: ApiConfig.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return await ApiConfig.handleResponse(response);
  } catch (error) {
    ApiConfig.handleError(error);
  }
};

export const apiDelete = async (endpoint) => {
  try {
    const response = await fetch(`${ApiConfig.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: ApiConfig.getHeaders(),
      credentials: 'include',
    });
    return await ApiConfig.handleResponse(response);
  } catch (error) {
    ApiConfig.handleError(error);
  }
};

export default ApiConfig;
