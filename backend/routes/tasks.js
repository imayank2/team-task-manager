const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/tasks?projectId=xxx - get tasks for a project
router.get("/", protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) filter.project = req.query.projectId;
    // Members only see tasks in their projects or assigned to them
    if (req.user.role !== "Admin") {
      filter.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/dashboard - summary for dashboard
router.get("/dashboard", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "Admin"
        ? {}
        : { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] };

    const tasks = await Task.find(filter);
    const now = new Date();

    const summary = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "Todo").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      done: tasks.filter((t) => t.status === "Done").length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "Done"
      ).length,
    };
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks - create task
router.post("/", protect, async (req, res) => {
  const { title, description, status, priority, dueDate, projectId, assignedTo } =
    req.body;
  if (!title || !projectId)
    return res.status(400).json({ message: "Title and project are required" });

  try {
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project: projectId,
      assignedTo,
      createdBy: req.user._id,
    });
    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");
    await task.populate("project", "name");
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id - update task
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
