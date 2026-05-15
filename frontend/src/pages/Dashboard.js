import React, { useState, useEffect } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          API.get("/tasks/dashboard"),
          API.get("/tasks"),
        ]);
        setSummary(summaryRes.data);
        setRecentTasks(tasksRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const cards = [
    { label: "Total Tasks", value: summary?.total || 0, color: "var(--primary)" },
    { label: "To Do", value: summary?.todo || 0, color: "var(--todo)" },
    { label: "In Progress", value: summary?.inProgress || 0, color: "var(--warning)" },
    { label: "Completed", value: summary?.done || 0, color: "var(--success)" },
    { label: "Overdue", value: summary?.overdue || 0, color: "var(--danger)" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Good day, {user?.name}! 👋</h1>
          <p style={styles.sub}>Here's what's happening with your tasks.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {cards.map((card) => (
          <div key={card.label} className="card" style={styles.statCard}>
            <div style={{ ...styles.statValue, color: card.color }}>{card.value}</div>
            <div style={styles.statLabel}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <h2 style={styles.sectionTitle}>Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No tasks found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Task</th>
                <th style={styles.th}>Project</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((task) => (
                <tr key={task._id} style={styles.tr}>
                  <td style={styles.td}>{task.title}</td>
                  <td style={styles.td}>{task.project?.name || "—"}</td>
                  <td style={styles.td}>
                    <StatusBadge status={task.status} />
                  </td>
                  <td style={styles.td}>
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td style={styles.td}>{task.assignedTo?.name || "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = status === "Todo" ? "badge-todo" : status === "In Progress" ? "badge-inprogress" : "badge-done";
  return <span className={`badge ${cls}`}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const cls = priority === "High" ? "badge-high" : priority === "Medium" ? "badge-medium" : "badge-low";
  return <span className={`badge ${cls}`}>{priority}</span>;
}

const styles = {
  page: { padding: 28, maxWidth: 1100, margin: "0 auto" },
  loading: { padding: 40, textAlign: "center", color: "var(--text-muted)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  sub: { color: "var(--text-muted)", fontSize: 14 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { textAlign: "center" },
  statValue: { fontSize: 36, fontWeight: 700, marginBottom: 4 },
  statLabel: { fontSize: 13, color: "var(--text-muted)" },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)" },
  tr: { borderBottom: "1px solid var(--border)" },
  td: { padding: "12px 12px", fontSize: 14 },
};
