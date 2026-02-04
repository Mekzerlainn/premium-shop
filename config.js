// ==========================================
// SUPABASE KONFİGÜRASYONU
// Premium Shop E-Ticaret Sitesi
// ==========================================

const SUPABASE_CONFIG = {
    url: 'https://cjxzxnoayhtsjfpfwbhi.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeHp4bm9heWh0c2pmcGZ3YmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDYzOTIsImV4cCI6MjA4NTcyMjM5Mn0.Q7DoFbwXLbuVIu7fGo4n6HoGRXi849rXrFKzzhEzwrc',
    publishableKey: 'sb_publishable_hhOKgtZp8R0pJ1Oe3qZpzQ_EUNj1vlh'
};

// Supabase client global erişim için
let supabase = null;

// Supabase Client'ı başlat
function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase bağlantısı başarılı');
        return true;
    } else {
        console.error('❌ Supabase kütüphanesi yüklenemedi');
        return false;
    }
}

// Global erişim için
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.getSupabase = () => supabase;
window.initSupabase = initSupabase;
