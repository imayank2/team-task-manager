const express = require("express");
const Project = require("../models/Project");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET /api/projects - get all projects user belongs to
router.get("/", protect, async (req, res) => {
  try {
    const query =
      req.user.role === "Admin"
        ? {} // Admins see all projects
        : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const projects = await Project.find(query)
      .populate("owner", "name email")
      .populate("members", "name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects - create project (Admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  const { name, description, members } = req.body;
  if (!name) return res.status(400).json({ message: "Project name is required" });

  try {
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: members || [],
    });
    await project.populate("owner", "name email");
    await project.populate("members", "name email");
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id - update project (Admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("owner", "name email")
      .populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id (Admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
