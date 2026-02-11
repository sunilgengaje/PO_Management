import { postRequest } from "./http.js";

export function sendLogoutOtp(payload) {
  return postRequest("/otp/send-logout-otp", payload);
}

export function verifyLogoutOtp(payload) {
  return postRequest("/otp/verify-logout-otp", payload);
}
