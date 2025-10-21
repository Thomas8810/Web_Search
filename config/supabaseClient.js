const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Kiểm tra và thông báo rõ ràng
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials! Check Environment Variables on Vercel.");
  // Ném lỗi để Vercel dừng và báo lỗi cụ thể (thay vì 500 mù)
  throw new Error("Supabase credentials not found (SUPABASE_URL or SUPABASE_KEY).");
}

// Khởi tạo client thật
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase client initialized successfully:", supabaseUrl);

module.exports = supabase;
