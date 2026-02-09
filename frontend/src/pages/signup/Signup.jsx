import { useState, useRef, useEffect } from "react";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Toast from "../../components/ui/Toast.jsx";
import { signupUser } from "../../api/userApi.js";

const roles = ["admin", "user", "manager", "staff"];

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    mobile: "",
    email: "",
    department: "",
    role: "user",
    status: "active"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdDate, setCreatedDate] = useState("");
  const [lastLogin, setLastLogin] = useState("");
  const emailRef = useRef();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  function validate() {
    if (!form.username.trim()) return "Username required";
    if (!form.password.trim()) return "Password required";
    if (form.password.length < 6) return "Password must be 6+ chars";
    if (!form.full_name.trim()) return "Full name required";
    if (!form.mobile.trim()) return "Mobile required";
    if (!/^\d{10,15}$/.test(form.mobile)) return "Invalid mobile number";
    if (!form.email.trim()) return "Email required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Invalid email";
    if (!form.department.trim()) return "Department required";
    if (!form.role) return "Role required";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      const resp = await signupUser(form);
      setSuccess(resp.message || "Signup successful!");
      if (resp.data) {
        setCreatedDate(resp.data.created_date || "");
        setLastLogin(resp.data.last_login || "");
      } else {
        setCreatedDate("");
        setLastLogin("");
      }
      setForm({
        username: "",
        password: "",
        full_name: "",
        mobile: "",
        email: "",
        department: "",
        role: "user",
        status: "active"
      });
    } catch (err) {
      setError(err?.response?.data?.detail || "Signup failed");
      setCreatedDate("");
      setLastLogin("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", background: "#fff", padding: 50, borderRadius: 12, boxShadow: "0 2px 12px #e0e7ef" }}>
      <h2 style={{ marginBottom: 24 }}>Sign Up</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <Input label="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} error={error && !form.username ? error : ""} autoFocus ref={emailRef} />
        <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} error={error && !form.password ? error : ""} />
        <Input label="Full Name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} error={error && !form.full_name ? error : ""} />
        <Input label="Mobile" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} error={error && !form.mobile ? error : ""} />
        <Input label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={error && !form.email ? error : ""} type="email" />
        <Input label="Department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} error={error && !form.department ? error : ""} />
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Role</span>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ width: "100%", padding: "50px", borderRadius: 8, border: "1px solid #cbd5f5" }}>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <Button type="submit" loading={loading} disabled={loading} style={{ padding: "50px" }}>Sign Up</Button>
      </form>
      <Toast message={error} type="error" />
      <Toast message={success} type="success" />
      {createdDate && (
        <div style={{ marginTop: 16, color: '#166534', fontWeight: 500 }}>
          Created date: {createdDate}
        </div>
      )}
      {lastLogin && (
        <div style={{ color: '#166534', fontWeight: 500 }}>
          Last login: {lastLogin}
        </div>
      )}
    </div>
  );
}
