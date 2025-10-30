import axios from 'axios';

// 1. Define the base URL of our backend
const API_URL = 'http://localhost:5001/api';

// 2. Create the axios instance
const api = axios.create({
  baseURL: API_URL,
});

// 3. Add an "interceptor"
// This function runs BEFORE any request is sent
api.interceptors.request.use(
  (config) => {
    // Get the user data from localStorage
    const userStorage = localStorage.getItem('educampusUser');

    if (userStorage) {
      // Parse the JSON and get the token
      const token = JSON.parse(userStorage).token;

      if (token) {
        // Set the Authorization header for this request
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
