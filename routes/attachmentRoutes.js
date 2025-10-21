const express = require("express");
const router = express.Router({ mergeParams: true });
const supabase = require("../config/supabaseClient");
const multer = require("multer");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const upload = multer({ storage: multer.memoryStorage() });

// 🔹 Upload file
router.post("/:taskId/attachments", isAuthenticated, upload.single("file"), async (req, res) => {
  const { taskId } = req.params;
  if (!req.file) return res.status(400).json({ success: false, message: "Thiếu file" });

  try {
    const filePath = `task_${taskId}/${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
    const { error: upErr } = await supabase.storage
      .from("tasks-attachments")
      .upload(filePath, req.file.buffer, { contentType: req.file.mimetype });
    if (upErr) throw upErr;

    const { data: publicData } = supabase.storage.from("tasks-attachments").getPublicUrl(filePath);
    const { data, error } = await supabase
      .from("task_attachments")
      .insert([{ task_id: taskId, file_name: req.file.originalname, file_url: publicData.publicUrl, file_path: filePath }])
      .select();
    if (error) throw error;
    res.json({ success: true, attachment: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Lấy danh sách file
router.get("/:taskId/attachments", isAuthenticated, async (req, res) => {
  const { taskId } = req.params;
  try {
    const { data, error } = await supabase.from("task_attachments").select("*").eq("task_id", taskId);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Xóa file
router.delete("/attachments/:attachmentId", isAuthenticated, isAdmin, async (req, res) => {
  const { attachmentId } = req.params;
  try {
    const { data } = await supabase.from("task_attachments").select("file_path").eq("id", attachmentId).single();
    if (data?.file_path) await supabase.storage.from("tasks-attachments").remove([data.file_path]);
    await supabase.from("task_attachments").delete().eq("id", attachmentId);
    res.json({ success: true, message: "Đã xóa file" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
