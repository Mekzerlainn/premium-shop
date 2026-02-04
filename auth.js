// ==========================================
// AUTH MODÜLü - Supabase Authentication
// Premium Shop E-Ticaret Sitesi
// ==========================================

// Auth State
const authState = {
    user: null,
    session: null,
    loading: true
};

// ==========================================
// AUTH BAŞLATMA
// ==========================================

async function initAuth() {
    try {
        // Supabase'in yüklenmesini bekle
        if (!window.getSupabase || !window.getSupabase()) {
            if (window.initSupabase) {
                window.initSupabase();
            }
        }

        const supabase = window.getSupabase();
        if (!supabase) {
            console.error('Supabase client bulunamadı');
            authState.loading = false;
            return;
        }

        // Mevcut oturumu kontrol et
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Oturum kontrol hatası:', error);
        }

        if (session) {
            authState.session = session;
            authState.user = session.user;
            console.log('✅ Kullanıcı oturumu aktif:', session.user.email);
        }

        authState.loading = false;

        // Auth değişikliklerini dinle
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth durumu değişti:', event);
            authState.session = session;
            authState.user = session?.user || null;
            updateAuthUI();

            if (event === 'SIGNED_IN') {
                onSignIn(session.user);
            } else if (event === 'SIGNED_OUT') {
                onSignOut();
            }
        });

        // UI'ı güncelle
        updateAuthUI();

    } catch (error) {
        console.error('Auth başlatma hatası:', error);
        authState.loading = false;
    }
}

// ==========================================
// KAYIT OL
// ==========================================

async function signUp(email, password, fullName) {
    const supabase = window.getSupabase();
    if (!supabase) {
        return { error: { message: 'Supabase bağlantısı yok' } };
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    created_at: new Date().toISOString()
                }
            }
        });

        if (error) {
            console.error('Kayıt hatası:', error);
            return { error };
        }

        console.log('✅ Kayıt başarılı:', data);
        return { data };

    } catch (error) {
        console.error('Kayıt exception:', error);
        return { error: { message: 'Beklenmeyen bir hata oluştu' } };
    }
}

// ==========================================
// GİRİŞ YAP
// ==========================================

async function signIn(email, password) {
    const supabase = window.getSupabase();
    if (!supabase) {
        return { error: { message: 'Supabase bağlantısı yok' } };
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Giriş hatası:', error);
            return { error };
        }

        console.log('✅ Giriş başarılı:', data.user.email);
        return { data };

    } catch (error) {
        console.error('Giriş exception:', error);
        return { error: { message: 'Beklenmeyen bir hata oluştu' } };
    }
}

// ==========================================
// ÇIKIŞ YAP
// ==========================================

async function signOut() {
    const supabase = window.getSupabase();
    if (!supabase) {
        return { error: { message: 'Supabase bağlantısı yok' } };
    }

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Çıkış hatası:', error);
            return { error };
        }

        console.log('✅ Çıkış başarılı');
        // LocalStorage'daki kullanıcı verisini temizle
        localStorage.removeItem('currentUser');

        return { success: true };

    } catch (error) {
        console.error('Çıkış exception:', error);
        return { error: { message: 'Beklenmeyen bir hata oluştu' } };
    }
}

// ==========================================
// ŞİFRE SIFIRLAMA
// ==========================================

async function resetPassword(email) {
    const supabase = window.getSupabase();
    if (!supabase) {
        return { error: { message: 'Supabase bağlantısı yok' } };
    }

    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });

        if (error) {
            console.error('Şifre sıfırlama hatası:', error);
            return { error };
        }

        console.log('✅ Şifre sıfırlama e-postası gönderildi');
        return { data };

    } catch (error) {
        console.error('Şifre sıfırlama exception:', error);
        return { error: { message: 'Beklenmeyen bir hata oluştu' } };
    }
}

// ==========================================
// ŞİFRE GÜNCELLEME
// ==========================================

async function updatePassword(newPassword) {
    const supabase = window.getSupabase();
    if (!supabase) {
        return { error: { message: 'Supabase bağlantısı yok' } };
    }

    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Şifre güncelleme hatası:', error);
            return { error };
        }

        console.log('✅ Şifre güncellendi');
        return { data };

    } catch (error) {
        console.error('Şifre güncelleme exception:', error);
        return { error: { message: 'Beklenmeyen bir hata oluştu' } };
    }
}

// ==========================================
// MEVCUT KULLANICI
// ==========================================

function getCurrentUser() {
    return authState.user;
}

function isAuthenticated() {
    return authState.user !== null;
}

function isAuthLoading() {
    return authState.loading;
}

// ==========================================
// SAYFA KORUMA
// ==========================================

function requireAuth(redirectUrl = 'login.html') {
    // Auth yüklenene kadar bekle
    if (authState.loading) {
        setTimeout(() => requireAuth(redirectUrl), 100);
        return;
    }

    if (!isAuthenticated()) {
        // Giriş yapılmamış, login sayfasına yönlendir
        const currentPage = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `${redirectUrl}?redirect=${currentPage}`;
    }
}

// Giriş yapmış kullanıcı için - login sayfasından yönlendir
function redirectIfAuthenticated(redirectUrl = 'account.html') {
    if (authState.loading) {
        setTimeout(() => redirectIfAuthenticated(redirectUrl), 100);
        return;
    }

    if (isAuthenticated()) {
        window.location.href = redirectUrl;
    }
}

// ==========================================
// UI GÜNCELLEME
// ==========================================

// Polling mekanizması (Sadece container için)
let authRetryCount = 0;
const MAX_RETRIES = 10;

function updateAuthUI() {
    const user = getCurrentUser();

    // Container'ı bul
    const authContainer = document.getElementById('auth-container');

    console.log(`🔄 updateAuthUI çalışıyor (Container: ${authContainer ? '✅ Var' : '❌ Yok'})`);

    if (!authContainer) {
        if (authRetryCount < MAX_RETRIES) {
            // Mevcut auth butonunu bul veya oluştur
            let authBtn = document.getElementById('authButton');
            let userMenu = document.getElementById('userMenu');

            console.warn('⚠️ auth-container bulunamadı, bekleniyor...');
            authRetryCount++;
            setTimeout(updateAuthUI, 500);
        }
    } else {
        // Retry sayacını sıfırla
        authRetryCount = 0;

        if (user) {
            // GİRİŞ YAPMIŞ KULLANICI
            const userName = user.user_metadata?.full_name || user.email.split('@')[0];
            authContainer.innerHTML = `
                <a href="account.html" class="btn-header-auth" title="Hesabım">
                    <i data-feather="user"></i>
                    <span>${escapeHtml(userName)}</span>
                </a>
            `;
        } else {
            // GİRİŞ YAPMAMIŞ KULLANICI
            authContainer.innerHTML = `
                <a href="login.html" class="btn-header-auth">\r
                    <i data-feather="log-in"></i>\r
                    <span data-i18n="header.login">Giriş Yap</span>\r
                </a>\r
            `;
        }
    }

    // --- 2. DİĞER AUTH UI EŞLEŞTİRMELERİ ---



    // Sağ Üst Header Icons
    const headerIcons = document.querySelector('.header-icons');
    if (headerIcons) {
        let authBtn = document.getElementById('authButton');
        let userMenu = document.getElementById('userMenu');

        if (user) {
            // Kullanıcı giriş yapmış
            const userName = user.user_metadata?.full_name || user.email.split('@')[0];

            if (!userMenu) {
                const userMenuHTML = `
                    <div class="user-menu" id="userMenu">
                        <button class="user-menu-toggle" id="userMenuToggle">
                            <div class="user-avatar-small">
                                <i data-feather="user"></i>
                            </div>
                            <span class="user-name">${escapeHtml(userName)}</span>
                            <i data-feather="chevron-down" class="user-chevron"></i>
                        </button>
                        <div class="user-dropdown" id="userDropdown">\r
                            <a href="account.html" class="dropdown-item">\r
                                <i data-feather="user"></i>\r
                                <span data-i18n="header.account">Hesabım</span>\r
                            </a>\r
                            <a href="account.html#orders" class="dropdown-item">\r
                                <i data-feather="package"></i>\r
                                <span data-i18n="header.orders">Siparişlerim</span>\r
                            </a>\r
                            <a href="account.html#wishlist" class="dropdown-item">\r
                                <i data-feather="heart"></i>\r
                                <span data-i18n="header.favorites">Favorilerim</span>\r
                            </a>\r
                            <hr class="dropdown-divider">\r
                            <button class="dropdown-item logout-btn" onclick="handleLogout()">\r
                                <i data-feather="log-out"></i>\r
                                <span data-i18n="header.logout">Çıkış Yap</span>\r
                            </button>\r
                        </div>\r
                    </div >
                        `;

                // Auth butonunu kaldır ve user menu ekle
                if (authBtn) authBtn.remove();
                headerIcons.insertAdjacentHTML('afterbegin', userMenuHTML);

                // Dropdown event listeners
                const toggle = document.getElementById('userMenuToggle');
                const dropdown = document.getElementById('userDropdown');

                toggle?.addEventListener('click', () => {
                    dropdown?.classList.toggle('active');
                });

                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.user-menu')) {
                        dropdown?.classList.remove('active');
                    }
                });
            }
        } else {
            // Kullanıcı giriş yapmamış
            if (userMenu) userMenu.remove();

            if (!authBtn) {
                // Buton yoksa basit ikonlu buton oluştur
                const authBtnHTML = `
                        < a href = "login.html" class="icon-btn" id = "authButton" title = "Giriş Yap" >
                            <i data-feather="user"></i>
                    </a >
                        `;
                headerIcons.insertAdjacentHTML('afterbegin', authBtnHTML);
            }
        }
    }

    // İkonları yenile
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function onSignIn(user) {
    console.log('Kullanıcı giriş yaptı:', user.email);

    // LocalStorage'a kullanıcı bilgisi kaydet (uyumluluk için)
    const userData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0]
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));

    // state.currentUser güncelle
    if (typeof state !== 'undefined') {
        state.currentUser = userData;
    }

    // Toast göster
    if (typeof showToast === 'function') {
        showToast(`Hoş geldiniz, ${userData.name} ! 👋`);
    }
}

function onSignOut() {
    console.log('Kullanıcı çıkış yaptı');

    // LocalStorage temizle
    localStorage.removeItem('currentUser');

    // state.currentUser temizle
    if (typeof state !== 'undefined') {
        state.currentUser = null;
    }

    // Toast göster
    if (typeof showToast === 'function') {
        showToast('Güvenli çıkış yapıldı');
    }
}

async function handleLogout() {
    const result = await signOut();
    if (!result.error) {
        window.location.href = 'index.html';
    }
}

// ==========================================
// YARDIMCI FONKSİYONLAR
// ==========================================

function escapeHtml(text) {
    if (!text) return '';
    return text
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Hata mesajlarını Türkçeleştir
function getErrorMessage(error) {
    console.warn('Auth Hatası:', error); // Detaylı log

    if (!error) return 'Bilinmeyen bir hata oluştu';

    // Hata mesajını düzgün formatta al
    let message = error.message || error.error_description || error.msg;

    if (!message && typeof error === 'string') {
        message = error;
    } else if (!message) {
        // Eğer message property yoksa json stringify dene
        try {
            message = JSON.stringify(error);
        } catch (e) {
            message = 'Bir hata oluştu';
        }
    }

    const messages = {
        'Invalid login credentials': 'Geçersiz e-posta veya şifre',
        'Email not confirmed': 'E-posta adresi onaylanmamış. Lütfen gelen kutunuzu kontrol edin.',
        'User already registered': 'Bu e-posta adresi zaten kayıtlı',
        'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalı',
        'Invalid email': 'Geçersiz e-posta adresi',
        'Signup requires a valid password': 'Geçerli bir şifre gerekli',
        'Unable to validate email address: invalid format': 'Geçersiz e-posta formatı',
        'Rate limit exceeded': 'Çok fazla deneme yaptınız. Lütfen biraz bekleyin.',
        'Auth session missing!': 'Oturum bilgisi bulunamadı.'
    };

    return messages[message] || message;
}

// ==========================================
// GLOBAL ERİŞİM
// ==========================================

window.authState = authState;
window.initAuth = initAuth;
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.resetPassword = resetPassword;
window.updatePassword = updatePassword;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
window.isAuthLoading = isAuthLoading;
window.requireAuth = requireAuth;
window.redirectIfAuthenticated = redirectIfAuthenticated;
window.updateAuthUI = updateAuthUI;
window.handleLogout = handleLogout;
window.getErrorMessage = getErrorMessage;
