const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Ghi lịch sử thay đổi
async function logTaskHistory(taskId, changedBy, action, oldValue, newValue) {
  try {
    const { error } = await supabase
      .from("task_history")
      .insert([{ task_id: taskId, changed_by: changedBy, action, old_value: oldValue, new_value: newValue }]);
    if (error) console.error("Error logging history:", error.message);
  } catch (err) {
    console.error("Exception log history:", err.message);
  }
}

// 🔹 Lấy danh sách task
router.get("/", isAuthenticated, async (req, res) => {
  try {
    let query = supabase.from("tasks").select("*").order("id", { ascending: true });

    if (req.session.user.role !== "admin") {
      query = query.eq("assignedTo", req.session.user.name);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Tạo task mới (chỉ admin)
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, assignedTo, priority, deadline, description, status = "Chưa thực hiện" } = req.body;
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title, assignedTo, priority, deadline, description, status, created_by: req.session.user.name }])
      .select();
    if (error) throw error;
    await logTaskHistory(data[0].id, req.session.user.name, "create", null, JSON.stringify(data[0]));
    res.json({ success: true, task: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Cập nhật task
router.put("/:id", isAuthenticated, async (req, res) => {
  const taskId = req.params.id;
  try {
    const { data: oldTask } = await supabase.from("tasks").select("*").eq("id", taskId).single();
    if (!oldTask) return res.status(404).json({ success: false, message: "Không tìm thấy task" });

    if (req.session.user.role !== "admin" && oldTask.assignedTo !== req.session.user.name)
      return res.status(403).json({ success: false, message: "Không có quyền cập nhật" });

    const updatePayload = { ...req.body };
    if (req.session.user.role !== "admin") delete updatePayload.assignedTo;

    const { data, error } = await supabase.from("tasks").update(updatePayload).eq("id", taskId).select();
    if (error) throw error;

    await logTaskHistory(taskId, req.session.user.name, "update", JSON.stringify(oldTask), JSON.stringify(data[0]));
    res.json({ success: true, task: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Xóa task
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const { data: task } = await supabase.from("tasks").select("*").eq("id", id).single();
    if (!task) return res.status(404).json({ success: false, message: "Không tìm thấy task" });

    await supabase.from("task_history").delete().eq("task_id", id);
    await supabase.from("task_comments").delete().eq("task_id", id);
    await supabase.from("task_attachments").delete().eq("task_id", id);
    await supabase.from("tasks").delete().eq("id", id);

    await logTaskHistory(id, req.session.user.name, "delete", JSON.stringify(task), null);
    res.json({ success: true, message: "Đã xóa task và dữ liệu liên quan" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
