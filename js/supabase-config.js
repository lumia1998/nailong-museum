// Supabase client init config
var SUPABASE_URL = 'https://datenwietosgfprmxcua.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_m_E8-AmJo1tMuAI8ZphX1g_TBGK3CN6';

// 检查 API Key 格式
if (!SUPABASE_ANON_KEY.startsWith('eyJ')) {
    console.warn('警告: Supabase API Key 格式可能不正确，请检查 Dashboard 中的 anon key（正确格式应以 eyJ 开头）');
}

try {
    var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase 客户端初始化成功');
} catch (err) {
    console.error('Supabase 初始化失败:', err);
}
