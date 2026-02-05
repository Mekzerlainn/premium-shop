// i18n.js - Multi-language Support
const I18N_STORAGE_KEY = 'site_lang';
let currentLang = localStorage.getItem(I18N_STORAGE_KEY) || 'tr';
let translations = {};

// Dinamik içerik değişikliklerini izle
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element
                    if (node.hasAttribute('data-i18n')) {
                        translateElement(node);
                    }
                    node.querySelectorAll('[data-i18n]').forEach(translateElement);
                }
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Observer'ı başlat
    observer.observe(document.body, { childList: true, subtree: true });
    // Dil geçiş düğmelerini oluştur (eğer yoksa)
    initLangToggle();
    // Çevirileri yükle
    loadTranslations(currentLang);
});

async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        translations = await response.json();
        applyTranslations(); // Mevcutları çevir

        // Save Language
        localStorage.setItem(I18N_STORAGE_KEY, lang);
        document.documentElement.lang = lang;

        // Update active class on buttons
        updateActiveLangButton(lang);

    } catch (e) {
        console.error('Dil dosyası yüklenemedi:', e);
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(translateElement);
}

function translateElement(element) {
    const key = element.getAttribute('data-i18n');
    const value = getNestedValue(translations, key);

    if (value) {
        if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
            element.placeholder = value;
        } else {
            element.textContent = value;
        }
    }
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function initLangToggle() {
    // Header actions içine ekle
    const headerActions = document.querySelector('.header-actions');
    const existingToggle = document.querySelector('.lang-toggle');

    if (headerActions && !existingToggle) {
        // Tema butonundan önce ekle
        const langDiv = document.createElement('div');
        langDiv.className = 'lang-toggle';
        langDiv.style.marginRight = '10px';
        langDiv.style.display = 'flex';
        langDiv.style.gap = '5px';
        langDiv.style.fontSize = '12px';
        langDiv.style.fontWeight = '600';

        langDiv.innerHTML = `
            <button onclick="changeLanguage('tr')" class="lang-btn ${currentLang === 'tr' ? 'active' : ''}" style="border:none; background:none; cursor:pointer;">TR</button>
            <span>|</span>
            <button onclick="changeLanguage('en')" class="lang-btn ${currentLang === 'en' ? 'active' : ''}" style="border:none; background:none; cursor:pointer;">EN</button>
        `;

        // Tema butonunun önüne ekle
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn && themeBtn.parentNode === headerActions) {
            headerActions.insertBefore(langDiv, themeBtn);
        } else if (themeBtn && themeBtn.parentNode) {
            // Eğer themeBtn başka bir yerdeyse, onun parent'ına ekle
            themeBtn.parentNode.insertBefore(langDiv, themeBtn);
        } else {
            headerActions.prepend(langDiv);
        }
    }
}

function updateActiveLangButton(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.style.color = 'var(--color-text-light)';
        btn.style.textDecoration = 'none';
    });

    // Aktif olana stil ver (Bulabilirsek)
    // Inline style ile basitçe (daha sonra CSS'e taşınabilir)
    const activeBtns = document.querySelectorAll(`.lang-btn`);
    activeBtns.forEach(btn => {
        if (btn.textContent.toLowerCase() === lang) {
            btn.style.color = 'var(--color-primary)';
            btn.style.textDecoration = 'underline';
        }
    });
}

// Global scope'a aç
window.changeLanguage = async (lang) => {
    currentLang = lang;
    await loadTranslations(lang);
};
