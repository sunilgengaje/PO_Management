import { create } from "zustand";
import { parseJwt } from "../utils/helpers.js";

const ACCESS_TOKEN_KEY = "po_access_token";
const USER_KEY = "po_user";
const ROLE_KEY = "po_role";
const REMEMBER_KEY = "po_remember_me";
const DEVICE_KEY = "po_device_id";

function generateDeviceId() {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random()}`;
  localStorage.setItem(DEVICE_KEY, id);
  return id;
}

function loadSession() {
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || "";
  const user = sessionStorage.getItem(USER_KEY) || "";
  const role = sessionStorage.getItem(ROLE_KEY) || "";
  const rememberMe = localStorage.getItem(REMEMBER_KEY) === "true";
  return { accessToken, user, role, rememberMe };
}

export const useAuthStore = create((set, get) => ({
  ...loadSession(),
  deviceId: generateDeviceId(),
  captchaRequired: false,
  loginLoading: false,
  loginError: "",
  setCaptchaRequired: (value) => set({ captchaRequired: value }),
  setLoginLoading: (value) => set({ loginLoading: value }),
  setLoginError: (value) => set({ loginError: value }),
  setRememberMe: (value) => {
    localStorage.setItem(REMEMBER_KEY, value ? "true" : "false");
    set({ rememberMe: value });
  },
  setAuth: ({ token, user, role }) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token || "");
    sessionStorage.setItem(USER_KEY, user || "");
    sessionStorage.setItem(ROLE_KEY, role || "");
    set({ accessToken: token || "", user: user || "", role: role || "" });
  },
  clearAuth: () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    set({ accessToken: "", user: "", role: "" });
  },
  isTokenExpired: () => {
    const { accessToken } = get();
    const payload = parseJwt(accessToken);
    if (!payload?.exp) return true;
    return payload.exp * 1000 < Date.now();
  }
}));
