import { getRequest, postRequest, putRequest } from "./http.js";

export function fetchProducts() {
  return getRequest("/products");
}

export function createProduct(payload) {
  return postRequest("/products", payload);
}

export function updateProduct(id, payload) {
  return putRequest(`/products/${id}`, payload);
}
