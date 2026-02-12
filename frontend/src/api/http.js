// Helper for PUT requests
export async function putRequest(url, data = {}, config = {}) {
  const setLoading = useUiStore.getState().setLoading;
  setLoading(true);
  try {
    const response = await http.put(url, data, config);
    return response.data;
  } finally {
    setLoading(false);
  }
}

import axios from "axios";
import { BASE_URL } from "../utils/baseURL.js";
import { useAuthStore } from "../store/authStore.js";
import { parseJwt } from "../utils/helpers.js";
import { useUiStore } from "../store/uiStore.js";

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



// Helper for GET requests
export async function getRequest(url, config = {}) {
  const setLoading = useUiStore.getState().setLoading;
  setLoading(true);
  try {
    const response = await http.get(url, config);
    return response.data;
  } finally {
    setLoading(false);
  }
}

// Helper for POST requests
export async function postRequest(url, data = {}, config = {}) {
  const setLoading = useUiStore.getState().setLoading;
  setLoading(true);
  try {
    const response = await http.post(url, data, config);
    return response.data;
  } finally {
    setLoading(false);
  }
}

export default http;
