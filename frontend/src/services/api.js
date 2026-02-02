import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
    "https://snapurl-uhdx.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token && !config.url.includes("/auth")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
    }
    return Promise.reject(error);
  }
);

export default api;