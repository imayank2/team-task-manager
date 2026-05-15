import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Member" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password, form.role);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.logo}>⚡ TaskFlow</div>
        <h1 style={styles.title}>{isLogin ? "Welcome back" : "Create account"}</h1>
        <p style={styles.sub}>
          {isLogin ? "Sign in to your workspace" : "Get started for free"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}
          {error && <p className="error" style={{ marginBottom: 12 }}>{error}</p>}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px" }}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={styles.toggle}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={styles.link} onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  box: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--primary)",
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  sub: { color: "var(--text-muted)", fontSize: 14, marginBottom: 28 },
  toggle: { textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" },
  link: { color: "var(--primary)", cursor: "pointer", fontWeight: 500 },
};
