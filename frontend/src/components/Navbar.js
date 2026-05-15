import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>⚡ TaskFlow</div>
      <div style={styles.links}>
        <Link to="/dashboard" style={{ ...styles.link, ...(isActive("/dashboard") ? styles.active : {}) }}>
          Dashboard
        </Link>
        <Link to="/projects" style={{ ...styles.link, ...(isActive("/projects") ? styles.active : {}) }}>
          Projects
        </Link>
        <Link to="/tasks" style={{ ...styles.link, ...(isActive("/tasks") ? styles.active : {}) }}>
          Tasks
        </Link>
      </div>
      <div style={styles.right}>
        <span style={styles.userInfo}>
          <span style={styles.dot} />
          {user?.name}
          <span style={styles.role}>{user?.role}</span>
        </span>
        <button className="btn btn-outline" onClick={handleLogout} style={{ fontSize: 13 }}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "0 24px",
    height: 60,
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  logo: { fontWeight: 700, fontSize: 18, color: "var(--primary)", marginRight: 16 },
  links: { display: "flex", gap: 4, flex: 1 },
  link: {
    padding: "6px 14px",
    borderRadius: 8,
    textDecoration: "none",
    color: "var(--text-muted)",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s",
  },
  active: { background: "var(--surface2)", color: "var(--text)" },
  right: { display: "flex", alignItems: "center", gap: 12 },
  userInfo: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "var(--success)" },
  role: {
    background: "rgba(108,99,255,0.15)",
    color: "var(--primary)",
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
};
