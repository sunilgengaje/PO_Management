import http from "./http";

// Call backend /auth/logout endpoint
export async function logout({ access_token, device_ip, device_name }) {
  return http.post("/auth/logout", {
    access_token,
    device_ip,
    device_name
  });
}
