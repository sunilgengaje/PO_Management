import { postRequest } from "./http.js";

export function signupUser(payload) {
  return postRequest("/users/signup", payload);
}
