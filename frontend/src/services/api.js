import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
    "https://snapurl-uhdx.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
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
  async (error) => {
    
    if (
      error.code === "ECONNABORTED" &&
      !error.config.__isRetryRequest
    ) {
      error.config.__isRetryRequest = true;
      console.log("⏳ Backend waking up, retrying...");
      await new Promise((res) => setTimeout(res, 3000));
      return api(error.config);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
    }

    return Promise.reject(error);
  }
);

export default api;