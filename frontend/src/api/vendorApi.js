import { getRequest, postRequest, putRequest } from "./http.js";

export function fetchVendors() {
  return getRequest("/vendors");
}

export function createVendor(payload) {
  return postRequest("/vendors", payload);
}

export function updateVendor(id, payload) {
  return putRequest(`/vendors/${id}`, payload);
}
