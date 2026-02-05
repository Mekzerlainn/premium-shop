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
            // GİRİŞ YAPMAMIŞ KULLANICI - Modal açan buton
            authContainer.innerHTML = `
                <button type="button" class="btn-header-auth" onclick="openLoginModal()" title="Giriş Yap">
                    <i data-feather="log-in"></i>
                    <span data-i18n="header.login">Giriş Yap</span>
                </button>
                <span class="header-register-link">
                    veya <a href="#" onclick="openRegisterModal(); return false;">Kayıt Ol</a>
                </span>
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
                // Buton yoksa modal açan ikonlu buton oluştur
                const authBtnHTML = `
                    <button type="button" class="icon-btn" id="authButton" title="Giriş Yap" onclick="openLoginModal()">
                        <i data-feather="user"></i>
                    </button>
                `;
                headerIcons.insertAdjacentHTML('afterbegin', authBtnHTML);
            }
        }
    }

    // --- 3. MOBİL BOTTOM NAV GÜNCELLEMESİ ---
    const mobileAccountBtn = document.getElementById('mobileAccountBtn');
    const mobileAccountText = document.getElementById('mobileAccountText');

    if (mobileAccountBtn && mobileAccountText) {
        if (user) {
            // Giriş yapmış - account sayfasına git
            mobileAccountText.textContent = 'Hesabım';
            mobileAccountBtn.setAttribute('data-logged-in', 'true');
        } else {
            // Giriş yapmamış - modal aç
            mobileAccountText.textContent = 'Giriş';
            mobileAccountBtn.setAttribute('data-logged-in', 'false');
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

// ==========================================
// MODAL FONKSİYONLARI
// ==========================================

/**
 * Login modalını aç
 */
function openLoginModal() {
    const overlay = document.getElementById('authModalOverlay');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    if (overlay && loginModal) {
        overlay.classList.add('active');
        loginModal.classList.add('active');
        registerModal?.classList.remove('active');
        document.body.style.overflow = 'hidden';

        // İkonları yenile
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // İlk input'a focus
        setTimeout(() => {
            document.getElementById('loginEmail')?.focus();
        }, 100);
    }
}

/**
 * Register modalını aç
 */
function openRegisterModal() {
    const overlay = document.getElementById('authModalOverlay');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    if (overlay && registerModal) {
        overlay.classList.add('active');
        registerModal.classList.add('active');
        loginModal?.classList.remove('active');
        document.body.style.overflow = 'hidden';

        // İkonları yenile
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // İlk input'a focus
        setTimeout(() => {
            document.getElementById('registerName')?.focus();
        }, 100);
    }
}

/**
 * Auth modallarını kapat
 */
function closeAuthModal() {
    const overlay = document.getElementById('authModalOverlay');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    overlay?.classList.remove('active');
    loginModal?.classList.remove('active');
    registerModal?.classList.remove('active');
    document.body.style.overflow = '';

    // Formları temizle
    document.getElementById('loginModalForm')?.reset();
    document.getElementById('registerModalForm')?.reset();

    // Alert'leri gizle
    const loginAlert = document.getElementById('loginModalAlert');
    const registerAlert = document.getElementById('registerModalAlert');
    if (loginAlert) loginAlert.style.display = 'none';
    if (registerAlert) registerAlert.style.display = 'none';
}

/**
 * Login'den Register'a geç
 */
function switchToRegister() {
    document.getElementById('loginModal')?.classList.remove('active');
    document.getElementById('registerModal')?.classList.add('active');

    // İkonları yenile
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    setTimeout(() => {
        document.getElementById('registerName')?.focus();
    }, 100);
}

/**
 * Register'dan Login'e geç
 */
function switchToLogin() {
    document.getElementById('registerModal')?.classList.remove('active');
    document.getElementById('loginModal')?.classList.add('active');

    // İkonları yenile
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    setTimeout(() => {
        document.getElementById('loginEmail')?.focus();
    }, 100);
}

/**
 * Şifre görünürlüğünü toggle et
 */
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    // const icon = button.querySelector('i'); // Hata kaynağı: SVG dönüşümü sonrası 'i' bulunamaz

    let newIcon;
    if (input.type === 'password') {
        input.type = 'text';
        newIcon = 'eye-off';
    } else {
        input.type = 'password';
        newIcon = 'eye';
    }

    // Buton içeriğini tamamen yenile (En güvenli yöntem)
    button.innerHTML = `<i data-feather="${newIcon}"></i>`;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Modal içi alert göster
 */
function showModalAlert(alertId, type, message) {
    const alertEl = document.getElementById(alertId);
    if (!alertEl) return;

    const icon = type === 'error' ? 'alert-circle' : type === 'success' ? 'check-circle' : 'info';

    alertEl.className = `auth-alert ${type}`;
    alertEl.innerHTML = `
        <i data-feather="${icon}"></i>
        <span>${message}</span>
    `;
    alertEl.style.display = 'flex';

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// ==========================================
// MODAL FORM İŞLEYİCİLERİ
// ==========================================

// DOM hazır olduğunda form event listener'ları ekle
document.addEventListener('DOMContentLoaded', () => {

    // Login Modal Form Submit
    const loginForm = document.getElementById('loginModalForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const loginBtn = document.getElementById('loginModalBtn');

            // Buton loading state
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<div class="spinner"></div><span>Giriş yapılıyor...</span>';

            try {
                const result = await signIn(email, password);

                if (result.error) {
                    showModalAlert('loginModalAlert', 'error', getErrorMessage(result.error));
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = '<span>Giriş Yap</span>';
                    return;
                }

                // Başarılı giriş
                showModalAlert('loginModalAlert', 'success', 'Giriş başarılı! Hoş geldiniz.');

                // Modal kapat ve toast göster
                setTimeout(() => {
                    closeAuthModal();
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = '<span>Giriş Yap</span>';

                    if (typeof showToast === 'function') {
                        const userName = result.data?.user?.user_metadata?.full_name ||
                            result.data?.user?.email?.split('@')[0] || 'Kullanıcı';
                        showToast(`Hoş geldiniz, ${userName}! 👋`);
                    }
                }, 1000);

            } catch (error) {
                console.error('Login modal error:', error);
                showModalAlert('loginModalAlert', 'error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<span>Giriş Yap</span>';
            }
        });
    }

    // Register Modal Form Submit
    const registerForm = document.getElementById('registerModalForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerPasswordConfirm').value;
            const terms = document.getElementById('registerTerms').checked;
            const registerBtn = document.getElementById('registerModalBtn');

            // Validasyonlar
            if (password !== confirmPassword) {
                showModalAlert('registerModalAlert', 'error', 'Şifreler eşleşmiyor');
                return;
            }

            if (password.length < 6) {
                showModalAlert('registerModalAlert', 'error', 'Şifre en az 6 karakter olmalıdır');
                return;
            }

            if (!terms) {
                showModalAlert('registerModalAlert', 'error', 'Kullanım şartlarını kabul etmelisiniz');
                return;
            }

            // Buton loading state
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<div class="spinner"></div><span>Kayıt yapılıyor...</span>';

            try {
                const result = await signUp(email, password, fullName);

                if (result.error) {
                    showModalAlert('registerModalAlert', 'error', getErrorMessage(result.error));
                    registerBtn.disabled = false;
                    registerBtn.innerHTML = '<span>Kayıt Ol</span>';
                    return;
                }

                // E-posta zaten kayıtlı kontrolü
                if (result.data?.user?.identities?.length === 0) {
                    showModalAlert('registerModalAlert', 'error', 'Bu e-posta adresi zaten kayıtlı');
                    registerBtn.disabled = false;
                    registerBtn.innerHTML = '<span>Kayıt Ol</span>';
                    return;
                }

                // Başarılı kayıt - otomatik giriş dene (e-posta onayı kapalıysa)
                try {
                    const supabase = window.getSupabase();
                    if (supabase) {
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                            email: email,
                            password: password
                        });

                        if (!signInError && signInData?.session) {
                            showModalAlert('registerModalAlert', 'success', 'Kayıt başarılı! Hoş geldiniz.');

                            setTimeout(() => {
                                closeAuthModal();
                                registerBtn.disabled = false;
                                registerBtn.innerHTML = '<span>Kayıt Ol</span>';

                                if (typeof showToast === 'function') {
                                    showToast(`Hoş geldiniz, ${fullName}! 🎉`);
                                }
                            }, 1000);
                            return;
                        }
                    }
                } catch (e) {
                    console.log('Auto login after register failed:', e);
                }

                // Otomatik giriş başarısızsa login'e yönlendir
                showModalAlert('registerModalAlert', 'success', 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                registerBtn.innerHTML = '<span>Kayıt Tamamlandı</span>';

                setTimeout(() => {
                    switchToLogin();
                    registerBtn.disabled = false;
                    registerBtn.innerHTML = '<span>Kayıt Ol</span>';
                }, 1500);

            } catch (error) {
                console.error('Register modal error:', error);
                showModalAlert('registerModalAlert', 'error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
                registerBtn.disabled = false;
                registerBtn.innerHTML = '<span>Kayıt Ol</span>';
            }
        });
    }

    // Google Login (Modal)
    const googleLoginBtn = document.getElementById('googleLoginModal');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            const supabase = window.getSupabase();
            if (!supabase) {
                showModalAlert('loginModalAlert', 'error', 'Bağlantı hatası');
                return;
            }

            try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + '/index.html'
                    }
                });

                if (error) {
                    showModalAlert('loginModalAlert', 'error', 'Google ile giriş yapılamadı: ' + error.message);
                }
            } catch (error) {
                console.error('Google login modal error:', error);
                showModalAlert('loginModalAlert', 'error', 'Bir hata oluştu');
            }
        });
    }

    // ESC tuşu ile modal kapat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('authModalOverlay');
            if (overlay?.classList.contains('active')) {
                closeAuthModal();
            }
        }
    });

    // Overlay'e tıklayınca kapat
    const overlay = document.getElementById('authModalOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAuthModal();
            }
        });
    }
});

// ==========================================
// MODAL FONKSİYONLARI - GLOBAL ERİŞİM
// ==========================================

window.openLoginModal = openLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeAuthModal = closeAuthModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.togglePasswordVisibility = togglePasswordVisibility;
window.showModalAlert = showModalAlert;

// ==========================================
// MOBİL HESAP BUTONU HANDLERİ
// ==========================================

/**
 * Mobil bottom nav'daki hesap butonunu işle
 * - Giriş yapmışsa account.html'e git
 * - Giriş yapmamışsa login modal aç
 */
function handleMobileAccountClick() {
    const user = getCurrentUser();

    if (user) {
        // Giriş yapmış - hesap sayfasına git
        window.location.href = 'account.html';
    } else {
        // Giriş yapmamış - login modal aç
        openLoginModal();
    }
}

window.handleMobileAccountClick = handleMobileAccountClick;
