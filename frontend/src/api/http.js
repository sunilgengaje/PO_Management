import axios from "axios";
import { BASE_URL } from "../utils/baseURL.js";
import { useAuthStore } from "../store/authStore.js";

const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export async function getRequest(url, config = {}) {
  const response = await http.get(url, config);
  return response.data;
}

export async function postRequest(url, data = {}, config = {}) {
  const response = await http.post(url, data, config);
  return response.data;
}

export async function putRequest(url, data = {}, config = {}) {
  const response = await http.put(url, data, config);
  return response.data;
}

export default http;
