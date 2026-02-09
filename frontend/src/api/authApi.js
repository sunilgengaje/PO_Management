import { getRequest, postRequest } from "./http.js";

export function fetchCaptcha() {
  return getRequest("/auth/captcha");
}

export function login(payload) {
  return postRequest("/auth/login", payload);
}

export function refreshSession(payload) {
  return postRequest("/auth/refresh", payload);
}

export function logout() {
  return postRequest("/auth/logout", {});
}

export function fetchMe() {
  return getRequest("/auth/me");
}
