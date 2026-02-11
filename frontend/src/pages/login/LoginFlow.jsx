import { useState, useRef } from "react";
import { login } from "../../api/authApi.js";
import { sendLogoutOtp, verifyLogoutOtp } from "../../api/otpApi.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

export default function LoginFlow() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [device_ip, setDeviceIp] = useState("");
  const [device_name, setDeviceName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const usernameRef = useRef();

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      const resp = await login({ username, password, device_ip, device_name });
      if (resp.status === "success") {
        window.location.href = "/dashboard";
      } else if (resp.status === "already_logged_in" && resp.otp_required) {
        setOtpRequired(true);
        setLoginError(resp.message || "You are already logged in elsewhere.");
      } else {
        setLoginError(resp.message || "Login failed");
      }
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.otp_required) {
        setOtpRequired(true);
        setLoginError(err?.response?.data?.message || "You are already logged in elsewhere.");
      } else {
        setLoginError(err?.response?.data?.message || "Login failed");
      }
    }
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setOtpError("");
    try {
      await sendLogoutOtp({ username, password });
      setOtpSent(true);
    } catch (err) {
      setOtpError("Failed to send OTP. Try again.");
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setOtpError("");
    try {
      const resp = await verifyLogoutOtp({ username, otp });
      if (resp.status === "success") {
        setOtpRequired(false);
        setOtpSent(false);
        setOtp("");
        setLoginError("");
        // Retry login and navigate immediately if successful
        const loginResp = await login({ username, password, device_ip, device_name });
        if (loginResp.status === "success") {
          window.location.href = "/dashboard";
        } else {
          setLoginError(loginResp.message || "Login failed");
        }
      } else {
        setOtpError(resp.message || "OTP verification failed");
      }
    } catch (err) {
      setOtpError(err?.response?.data?.message || "OTP verification failed");
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 12px #e0e7ef" }}>
      <h2 style={{ marginBottom: 24 }}>Login</h2>
      {!otpRequired ? (
        <form onSubmit={handleLogin} autoComplete="off">
          <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} autoFocus ref={usernameRef} />
          <Input label="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
          <Input label="Device IP" value={device_ip} onChange={e => setDeviceIp(e.target.value)} />
          <Input label="Device Name" value={device_name} onChange={e => setDeviceName(e.target.value)} />
          <Button type="submit">Login</Button>
          {loginError && <div style={{ color: '#991b1b', marginTop: 12 }}>{loginError}</div>}
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} autoComplete="off">
          {!otpSent ? (
            <Button type="button" onClick={handleSendOtp} style={{ marginBottom: 16 }}>Send OTP to Email</Button>
          ) : (
            <>
              <Input label="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} autoFocus />
              <Button type="submit">Verify OTP & Logout Previous</Button>
            </>
          )}
          {otpError && <div style={{ color: '#991b1b', marginTop: 12 }}>{otpError}</div>}
        </form>
      )}
    </div>
  );
}