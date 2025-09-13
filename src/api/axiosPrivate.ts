// axiosPrivate.ts
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from "axios";

// ✅ Use environment variable (Vite style) or fallback
const baseURL: string = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "http://3.109.159.43:8086/api";

const axiosPrivate = (): AxiosInstance => {
  const instance = axios.create({ baseURL });

  // Request Interceptor: Attach Access Token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response Interceptor: Auto-refresh token if expired
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // If unauthorized (401) and we haven’t retried yet → try refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token found");

          // Request new access token
          const res = await axios.post(`${baseURL}/auth/refresh`, {
            token: refreshToken,
          });

          const newAccessToken = res.data?.accessToken;
          if (newAccessToken) {
            localStorage.setItem("token", newAccessToken);

            // Update headers and retry original request
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newAccessToken}`,
            };

            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh token failed ❌", refreshError);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          // optional: redirect to login
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default axiosPrivate;
