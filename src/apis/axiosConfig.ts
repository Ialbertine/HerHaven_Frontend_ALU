import axios, { type AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_REACT_API_URL || 'https://ialbertine-herhaven-backend.onrender.com';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, 
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
    
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Response received from: ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('Response error:', error);
    
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('CORS Error detected. Check backend CORS configuration.');
    }
    
    const config = error.config;
    if (!config || config._retryCount >= 3) {
      return Promise.reject(error);
    }
    
    config._retryCount = (config._retryCount || 0) + 1;
    
    // Only retry on network errors 
    if (error.code === 'ERR_NETWORK' || (error.response && error.response.status >= 500)) {
      console.log(`Retrying request (attempt ${config._retryCount}/3): ${config.url}`);
      
      const delay = Math.pow(2, config._retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return apiClient(config);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
