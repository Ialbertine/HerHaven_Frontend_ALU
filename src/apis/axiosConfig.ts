import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_REACT_API_URL || 'https://ialbertine-herhaven-backend.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    const token = localStorage.getItem('token');
    const guestSessionId = localStorage.getItem('guestSessionId');
    const accessType = localStorage.getItem('accessType');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (accessType === 'guest' && guestSessionId) {
      // For guest users
      config.headers['X-Guest-Session-Id'] = guestSessionId;
    }
    
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (!originalRequest || originalRequest._retryCount >= 3) {
      return Promise.reject(error);
    }
    
    if (error.response) {
      const status = error.response.status;
      
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        return Promise.reject(error);
      }
      
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.reject(error);
      }
      
      if (status >= 500 || status === 408 || status === 429) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount), 10000);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    } else if (error.request) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount), 10000);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retryCount?: number;
  }
}

export default apiClient;