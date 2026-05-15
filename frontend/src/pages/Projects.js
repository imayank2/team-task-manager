import React, { useState, useEffect } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const [error, setError] = useState("");
  const isAdmin = user?.role === "Admin";

  const fetchProjects = async () => {
    const { data } = await API.get("/projects");
    setProjects(data);
  };

  const fetchUsers = async () => {
    const { data } = await API.get("/auth/users");
    setAllUsers(data);
  };

  useEffect(() => {
    fetchProjects();
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const openCreate = () => {
    setEditProject(null);
    setForm({ name: "", description: "", members: [] });
    setError("");
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      name: project.name,
      description: project.description || "",
      members: project.members.map((m) => m._id),
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editProject) {
        await API.put(`/projects/${editProject._id}`, form);
      } else {
        await API.post("/projects", form);
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving project");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await API.delete(`/projects/${id}`);
    fetchProjects();
  };

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Projects</h1>
          <p style={styles.sub}>{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>No projects yet.</p>
          {isAdmin && <button className="btn btn-primary" onClick={openCreate}>Create your first project</button>}
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map((project) => (
            <div key={project._id} className="card" style={styles.projectCard}>
              <div style={styles.cardTop}>
                <div style={styles.projectIcon}>{project.name[0].toUpperCase()}</div>
                <div>
                  <h3 style={styles.projectName}>{project.name}</h3>
                  <p style={styles.owner}>by {project.owner?.name}</p>
                </div>
              </div>
              {project.description && (
                <p style={styles.desc}>{project.description}</p>
              )}
              <div style={styles.members}>
                <span style={styles.memberLabel}>Members:</span>
                {project.members.length === 0 ? (
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>None</span>
                ) : (
                  project.members.map((m) => (
                    <span key={m._id} className="badge" style={styles.memberBadge}>
                      {m.name}
                    </span>
                  ))
                )}
              </div>
              {isAdmin && (
                <div style={styles.actions}>
                  <button className="btn btn-outline" onClick={() => openEdit(project)} style={{ fontSize: 13 }}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(project._id)} style={{ fontSize: 13 }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editProject ? "Edit Project" : "New Project"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Team Members</label>
                <div style={styles.memberList}>
                  {allUsers.map((u) => (
                    <label key={u._id} style={styles.memberCheck}>
                      <input
                        type="checkbox"
                        checked={form.members.includes(u._id)}
                        onChange={() => toggleMember(u._id)}
                      />
                      <span>{u.name} <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({u.role})</span></span>
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 28, maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  sub: { color: "var(--text-muted)", fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  projectCard: { display: "flex", flexDirection: "column", gap: 12 },
  cardTop: { display: "flex", gap: 12, alignItems: "center" },
  projectIcon: {
    width: 44, height: 44, borderRadius: 10,
    background: "var(--primary)", color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 20, flexShrink: 0,
  },
  projectName: { fontWeight: 600, fontSize: 16 },
  owner: { color: "var(--text-muted)", fontSize: 12, marginTop: 2 },
  desc: { color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5 },
  members: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" },
  memberLabel: { fontSize: 12, color: "var(--text-muted)", marginRight: 4 },
  memberBadge: { background: "var(--surface2)", color: "var(--text-muted)", fontSize: 12 },
  actions: { display: "flex", gap: 8, marginTop: 4 },
  memberList: { display: "flex", flexDirection: "column", gap: 8, padding: "8px 12px", background: "var(--surface2)", borderRadius: 8 },
  memberCheck: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 },
};
