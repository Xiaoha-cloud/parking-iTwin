import { createClient } from "@supabase/supabase-js";

// 从环境变量获取 Supabase URL 和 Key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

// 检查是否存在环境变量
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key. Please check your environment variables.");
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
