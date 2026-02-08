import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
    : "https://snapurl-uhdx.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

const PUBLIC_ROUTES = [
  "/message-qr/messages/m/",
];

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      config.url?.includes(route)
    );

    if (token && !isPublicRoute) {
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
      console.log("Backend waking up, retrying...");
      await new Promise((res) => setTimeout(res, 3000));
      return api(error.config);
    }

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      error.config.url?.includes(route)
    );

    if (error.response?.status === 401 && !isPublicRoute) {
      localStorage.removeItem("access_token");
    }

    return Promise.reject(error);
  }
);

export default api;