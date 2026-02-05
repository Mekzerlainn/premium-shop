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
// let supabase = null; // KALDIRILDI: Syntax error'a neden oluyor

// Supabase Client'ı başlat
function initSupabase() {
    // Kütüphane yüklü mü kontrol et (window.supabase kütüphane objesidir)
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        // Client oluştur
        const client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

        // Global erişim için window.supabase'i client ile güncelle (auth.js uyumluluğu için)
        // Orijinal kütüphaneyi _supabaseLib olarak sakla (gerekirse)
        if (!window._supabaseLib) {
            window._supabaseLib = window.supabase;
        }
        window.supabase = client;

        console.log('✅ Supabase bağlantısı başarılı');
        return true;
    } else {
        console.error('❌ Supabase kütüphanesi yüklenemedi');
        return false;
    }
}

// Global erişim için
// Global erişim için
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.getSupabase = () => window.supabase; // Artık client window.supabase içinde
window.initSupabase = initSupabase;
