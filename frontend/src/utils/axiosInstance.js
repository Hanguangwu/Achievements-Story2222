import axios from "axios";

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Set BASE_URL dynamically based on environment
let BASE_URL;
if (process.env.NODE_ENV === "production") {
  BASE_URL = ""; // Use an empty string for production, so axios will use the current domain
} else {
  BASE_URL = "http://localhost:5000";
}

axiosInstance.defaults.baseURL = BASE_URL;

export default axiosInstance;