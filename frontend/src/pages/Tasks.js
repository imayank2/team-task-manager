import React, { useState, useEffect } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProject, setFilterProject] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", status: "Todo", priority: "Medium",
    dueDate: "", projectId: "", assignedTo: "",
  });
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    const params = filterProject ? `?projectId=${filterProject}` : "";
    const { data } = await API.get(`/tasks${params}`);
    setTasks(data);
  };

  const fetchProjects = async () => {
    const { data } = await API.get("/projects");
    setProjects(data);
  };

  const fetchUsers = async () => {
    const { data } = await API.get("/auth/users");
    setAllUsers(data);
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, [filterProject]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: "", description: "", status: "Todo", priority: "Medium", dueDate: "", projectId: projects[0]?._id || "", assignedTo: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      projectId: task.project?._id || "",
      assignedTo: task.assignedTo?._id || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editTask) {
        await API.put(`/tasks/${editTask._id}`, form);
      } else {
        await API.post("/tasks", form);
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving task");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const handleStatusChange = async (task, newStatus) => {
    await API.put(`/tasks/${task._id}`, { status: newStatus });
    fetchTasks();
  };

  const filtered = filterStatus === "All" ? tasks : tasks.filter((t) => t.status === filterStatus);

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tasks</h1>
          <p style={styles.sub}>{filtered.length} task{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Task</button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {["All", "Todo", "In Progress", "Done"].map((s) => (
          <button
            key={s}
            className="btn"
            onClick={() => setFilterStatus(s)}
            style={{
              ...styles.filterBtn,
              ...(filterStatus === s ? styles.filterActive : {}),
            }}
          >
            {s}
          </button>
        ))}
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          style={styles.select}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>No tasks found.</p>
          <button className="btn btn-primary" onClick={openCreate}>Create your first task</button>
        </div>
      ) : (
        <div style={styles.taskList}>
          {filtered.map((task) => (
            <div key={task._id} className="card" style={{ ...styles.taskCard, ...(isOverdue(task) ? styles.overdue : {}) }}>
              <div style={styles.taskTop}>
                <div style={styles.taskMain}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                </div>
                <div style={styles.taskActions}>
                  <button className="btn btn-outline" onClick={() => openEdit(task)} style={{ fontSize: 12, padding: "5px 12px" }}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(task._id)} style={{ fontSize: 12, padding: "5px 12px" }}>Delete</button>
                </div>
              </div>

              <div style={styles.taskMeta}>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.project && <span className="badge" style={styles.projectBadge}>{task.project.name}</span>}
                {isOverdue(task) && <span className="badge badge-high">OVERDUE</span>}
                {task.assignedTo && (
                  <span style={styles.assigned}>👤 {task.assignedTo.name}</span>
                )}
                {task.dueDate && (
                  <span style={styles.due}>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>

              {/* Quick status change */}
              <div style={styles.statusChange}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Move to:</span>
                {["Todo", "In Progress", "Done"].filter((s) => s !== task.status).map((s) => (
                  <button key={s} className="btn btn-outline" onClick={() => handleStatusChange(task, s)} style={{ fontSize: 11, padding: "3px 10px" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editTask ? "Edit Task" : "New Task"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Optional details"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Todo</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Project *</label>
                <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  page: { padding: 28, maxWidth: 900, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  sub: { color: "var(--text-muted)", fontSize: 14 },
  filters: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  filterBtn: { background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)", fontSize: 13 },
  filterActive: { background: "var(--primary)", color: "white", borderColor: "var(--primary)" },
  select: { padding: "7px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" },
  taskList: { display: "flex", flexDirection: "column", gap: 12 },
  taskCard: { display: "flex", flexDirection: "column", gap: 10 },
  overdue: { borderColor: "rgba(255,92,92,0.3)", background: "rgba(255,92,92,0.04)" },
  taskTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  taskMain: { flex: 1 },
  taskTitle: { fontWeight: 600, fontSize: 15, marginBottom: 4 },
  taskDesc: { color: "var(--text-muted)", fontSize: 13 },
  taskActions: { display: "flex", gap: 6, flexShrink: 0 },
  taskMeta: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  projectBadge: { background: "var(--surface2)", color: "var(--text-muted)", fontSize: 12 },
  assigned: { fontSize: 12, color: "var(--text-muted)" },
  due: { fontSize: 12, color: "var(--text-muted)" },
  statusChange: { display: "flex", gap: 8, alignItems: "center", paddingTop: 4, borderTop: "1px solid var(--border)" },
};
