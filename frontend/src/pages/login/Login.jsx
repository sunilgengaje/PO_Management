import { useState, useRef, useEffect } from "react";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Toast from "../../components/ui/Toast.jsx";
import Loader from "../../components/ui/Loader.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { login, fetchCaptcha } from "../../api/authApi.js";
import { isBlank, isEmail, hasInjectionAttempt } from "../../utils/helpers.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const emailRef = useRef();
  const {
    loginLoading,
    loginError,
    setLoginLoading,
    setLoginError,
    setAuth,
    captchaRequired,
    setCaptchaRequired,
    setRememberMe,
    rememberMe
  } = useAuthStore();

  useEffect(() => {
    emailRef.current?.focus();
    if (captchaRequired) {
      fetchCaptcha().then((data) => setCaptchaImg(data.image));
    }
  }, [captchaRequired]);

  function validate() {
    if (isBlank(email)) return "Email required";
    if (!isEmail(email)) return "Invalid email";
    if (isBlank(password)) return "Password required";
    if (password.length < 6) return "Password must be 6+ chars";
    if (password.length > 50) return "Password too long";
    if (hasInjectionAttempt(password)) return "Invalid password";
    if (isBlank(captcha) && captchaRequired) return "Captcha required";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoginError("");
    setSuccess("");
    const error = validate();
    if (error) {
      setLoginError(error);
      return;
    }
    setLoginLoading(true);
    try {
      const resp = await login({ email, password, captcha, remember: rememberMe });
      if (resp.status === "success") {
        setAuth({ token: resp.token, user: resp.user, role: resp.role });
        setSuccess("Login successful");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
      } else {
        setLoginError(resp.message || "Login failed");
        if (resp.captchaRequired) setCaptchaRequired(true);
      }
    } catch (err) {
      setLoginError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 12px #e0e7ef" }}>
      <h2 style={{ marginBottom: 24 }}>Login</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={loginError && !email ? loginError : ""}
          autoFocus
          ref={emailRef}
          type="email"
        />
        <Input
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={loginError && !password ? loginError : ""}
          type={showPassword ? "text" : "password"}
        />
        <div style={{ marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((v) => !v)}
            id="showpass"
          />
          <label htmlFor="showpass" style={{ marginLeft: 8, fontSize: 13 }}>
            Show password
          </label>
        </div>
        {captchaRequired && (
          <div style={{ marginBottom: 16 }}>
            <img src={captchaImg} alt="captcha" style={{ display: "block", marginBottom: 8 }} />
            <Input
              label="Enter Captcha"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              error={loginError && !captcha ? loginError : ""}
            />
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            id="rememberme"
          />
          <label htmlFor="rememberme" style={{ marginLeft: 8, fontSize: 13 }}>
            Remember me
          </label>
        </div>
        <Button
          type="submit"
          loading={loginLoading}
          disabled={loginLoading || !email || !password || (captchaRequired && !captcha)}
        >
          Login
        </Button>

      </form>
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <span style={{ fontSize: 14 }}>Don't have an account? </span>
        <a href="/signup" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 600 }}>Sign up</a>
      </div>
      {loginLoading && <Loader />}
      <Toast message={loginError} type="error" />
      <Toast message={success} type="success" />
    </div>
  );
}
