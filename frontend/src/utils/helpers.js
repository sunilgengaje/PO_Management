export function parseJwt(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const payload = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function isBlank(value) {
  return !value || !value.trim();
}

export function isEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

export function hasInjectionAttempt(value) {
  if (!value) return false;
  const lowered = value.toLowerCase();
  const sql = ["' or 1=1", "--", "/*", "*/", "union select", "drop table", "insert into"];
  const xss = ["<script", "</script>", "javascript:", "onerror=", "onload="];
  return [...sql, ...xss].some((pattern) => lowered.includes(pattern));
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
