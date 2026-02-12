// import { useState, useRef, useEffect } from "react";
// import Input from "../../components/ui/Input.jsx";
// import Button from "../../components/ui/Button.jsx";
// import Toast from "../../components/ui/Toast.jsx";
// import Loader from "../../components/ui/Loader.jsx";
// import { useAuthStore } from "../../store/authStore.js";
// import { login, fetchCaptcha } from "../../api/authApi.js";
// import { sendLogoutOtp, verifyLogoutOtp } from "../../api/otpApi.js";
// import { isBlank, isEmail, hasInjectionAttempt } from "../../utils/helpers.js";

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//     </div>
//   );
// }


import { useState, useRef, useEffect } from "react";
import OtpVerification from "../auth/OtpVerification";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Toast from "../../components/ui/Toast.jsx";
import Loader from "../../components/ui/Loader.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { useUiStore } from "../../store/uiStore.js";
import { login, fetchCaptcha } from "../../api/authApi.js";
import { sendLogoutOtp, verifyLogoutOtp } from "../../api/otpApi.js";
import { isBlank, hasInjectionAttempt } from "../../utils/helpers.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");

  const [otpRequired, setOtpRequired] = useState(false);
  // OTP state is now managed by OtpVerification component

  const usernameRef = useRef();
  const navigate = useNavigate();

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

  // focus + captcha load
  useEffect(() => {
    usernameRef.current?.focus();
    if (captchaRequired) {
      fetchCaptcha().then((data) => setCaptchaImg(data.image));
    }
  }, [captchaRequired]);

  // auto-send OTP when navigating to OTP screen
  // (Handled in OtpVerification or can be triggered in onResend)

  function validate() {
    if (isBlank(username)) return "Username required";
    if (isBlank(password)) return "Password required";
    if (password.length < 6) return "Password must be 6+ chars";
    if (password.length > 50) return "Password too long";
    if (hasInjectionAttempt(password)) return "Invalid password";
    if (isBlank(captcha) && captchaRequired) return "Captcha required";
    return "";
  }

  // ---------------- LOGIN ----------------
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
    const setLoading = useUiStore.getState().setLoading;
    setLoading(true);
    try {
      const resp = await login({
        username,
        password,
        captcha,
        remember: rememberMe
      });

      // Always navigate to dashboard if access_token is present
      if (resp.access_token) {
        setAuth({ token: resp.access_token, user: resp.user, role: resp.user.role });
        setSuccess("Login successful");
        navigate("/dashboard");
        return;
      }
      // Show OTP screen only if already_logged_in is 1 or legacy OTP required
      if (
        (resp.user && resp.user.already_logged_in === 1) ||
        (resp.status === "already_logged_in" && resp.otp_required) ||
        (resp.status === "fail" && resp.otp_required)
      ) {
        setOtpRequired(true);
        setLoginError(
          resp.message ||
          "You are already logged in elsewhere. Enter OTP to continue."
        );
        return;
      }
      // Fallback: show error
      setLoginError(resp.message || "Login failed");
      if (resp.captchaRequired) setCaptchaRequired(true);
    } catch (err) {
      // Handle OTP-required errors from backend
      if (
        err?.response?.status === 403 &&
        (
          err?.response?.data?.otp_required ||
          (typeof err?.response?.data?.detail === "string" &&
            err.response.data.detail.includes("OTP"))
        )
      ) {
        setOtpRequired(true);
        setLoginError(
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "You are already logged in elsewhere. Enter OTP to continue."
        );
      } else {
        setLoginError(
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Login failed"
        );
      }
    } finally {
      setLoginLoading(false);
      setLoading(false);
    }
  }

  // ---------------- VERIFY OTP ----------------
  async function handleVerifyOtp(otpVal) {
    const setLoading = useUiStore.getState().setLoading;
    setLoading(true);
    try {
      const resp = await verifyLogoutOtp({ username, otp: otpVal });
      if ((resp.status === "success") || resp.success) {
        setOtpRequired(false);
        setLoginError("");
        setSuccess(resp.message || "Logged out successfully. You can now log in from a new device.");
        if (resp.access_token && resp.user) {
          setAuth({ token: resp.access_token, user: resp.user, role: resp.user.role });
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
        return;
      }
      setLoginError(resp.message || "OTP verification failed");
    } catch (err) {
      setLoginError(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- RESEND OTP ----------------
  async function handleResendOtp() {
    try {
      await sendLogoutOtp({ username, password });
      setSuccess("OTP resent to your email.");
    } catch (err) {
      setLoginError("Failed to resend OTP. Try again.");
    }
  }

  // ================= UI =================
  if (otpRequired) {
    return (
      <OtpVerification
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onCancel={() => {
          setAuth({ token: "", user: "", role: "" });
          navigate("/login");
        }}
        loading={loginLoading}
        error={loginError}
        info={success}
        email={username}
      />
    );
  }

  return (
    <div style={{
      maxWidth: 400,
      margin: "80px auto",
      background: "#fff",
      padding: 32,
      borderRadius: 12,
      boxShadow: "0 2px 12px #e0e7ef"
    }}>
      <h2 style={{ marginBottom: 24 }}>Login</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          ref={usernameRef}
        />
        <Input
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
        />
        <div style={{ marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(v => !v)}
            id="showpass"
          />
          <label htmlFor="showpass" style={{ marginLeft: 8, fontSize: 13 }}>
            Show password
          </label>
        </div>
        {captchaRequired && (
          <div style={{ marginBottom: 16 }}>
            <img src={captchaImg} alt="captcha" style={{ marginBottom: 8 }} />
            <Input
              label="Enter Captcha"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
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
          disabled={loginLoading || !username || !password}
        >
          Login
        </Button>
      </form>
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <span style={{ fontSize: 14 }}>Don't have an account? </span>
        <a href="/signup" style={{ color: "#2563eb", fontWeight: 600 }}>
          Sign up
        </a>
      </div>
      {loginLoading && <Loader />}
      <Toast message={loginError} type="error" />
      <Toast message={success} type="success" />
    </div>
  );
}
