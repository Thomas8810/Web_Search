const express = require("express");
const router = express.Router({ mergeParams: true });
const supabase = require("../config/supabaseClient");
const { isAuthenticated } = require("../middleware/auth");

// 🔹 Lấy comment theo task
router.get("/:taskId/comments", isAuthenticated, async (req, res) => {
  const { taskId } = req.params;
  try {
    const { data, error } = await supabase
      .from("task_comments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Thêm comment
router.post("/:taskId/comments", isAuthenticated, async (req, res) => {
  const { taskId } = req.params;
  const { comment_text } = req.body;
  if (!comment_text) return res.status(400).json({ success: false, message: "Nội dung trống" });

  try {
    const { data, error } = await supabase
      .from("task_comments")
      .insert([{ task_id: taskId, user: req.session.user.name, comment_text }])
      .select();
    if (error) throw error;
    res.json({ success: true, comment: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
