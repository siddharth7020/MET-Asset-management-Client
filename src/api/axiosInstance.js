import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // replace with actual base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally add interceptors for auth tokens
// axiosInstance.interceptors.request.use(...)

export default axiosInstance;
