import React, { useState, useRef } from "react";

export default function OtpVerification({
  onVerify,
  onResend,
  onCancel,
  loading = false,
  error = "",
  info = "",
  email = ""
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  // Handle OTP input
  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) {
      inputs.current[idx + 1].focus();
    }
  };

  const handlePaste = e => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (paste.length) {
      setOtp(paste.concat(Array(6 - paste.length).fill("")));
      setTimeout(() => {
        const next = paste.length < 6 ? paste.length : 5;
        inputs.current[next].focus();
      }, 10);
    }
    e.preventDefault();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1].focus();
    }
  };

  const handleVerify = e => {
    e.preventDefault();
    onVerify && onVerify(otp.join(""));
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6fa" }}>
      <form onSubmit={handleVerify} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px #e0e7ef", padding: 36, minWidth: 340, maxWidth: 380, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 8 }}>OTP Verification</div>
        <div style={{ color: "#64748b", fontSize: 15, marginBottom: 18, textAlign: "center" }}>
          Enter the 6-digit OTP sent to your email{email ? ` (${email})` : ""}.
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={el => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(e, i)}
              onPaste={handlePaste}
              onKeyDown={e => handleKeyDown(e, i)}
              style={{
                width: 40,
                height: 48,
                fontSize: 24,
                textAlign: "center",
                border: "1.5px solid #2563eb",
                borderRadius: 8,
                outline: "none",
                background: loading ? "#f1f5f9" : "#fff"
              }}
              autoFocus={i === 0}
              disabled={loading}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>
        {error && <div style={{ color: "#ef4444", marginBottom: 10, fontSize: 14 }}>{error}</div>}
        {info && <div style={{ color: "#2563eb", marginBottom: 10, fontSize: 14 }}>{info}</div>}
        <button
          type="submit"
          style={{
            width: "100%",
            background: loading ? "#a5b4fc" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 0",
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 10,
            cursor: loading ? "not-allowed" : "pointer"
          }}
          disabled={loading || otp.some(d => !d)}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        <button
          type="button"
          style={{ width: "100%", background: "#e0e7ef", color: "#222", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 600, fontSize: 15, marginBottom: 8, cursor: loading ? "not-allowed" : "pointer" }}
          onClick={onResend}
          disabled={loading}
        >
          Resend OTP
        </button>
        <button
          type="button"
          style={{ width: "100%", background: "#fff", color: "#ef4444", border: "1.5px solid #ef4444", borderRadius: 8, padding: "10px 0", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
