// compare.js - Ürün Karşılaştırma Mantığı

const COMPARE_STORAGE_KEY = 'compare_list';
const MAX_COMPARE_ITEMS = 3;

// Karşılaştırma listesini getir
function getCompareList() {
    const list = localStorage.getItem(COMPARE_STORAGE_KEY);
    return list ? JSON.parse(list) : [];
}

// Listeyi kaydet
function saveCompareList(list) {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list));
    updateCompareBadge(); // Varsa badge güncelle
}

// Ürünü karşılaştırmaya ekle
function addToCompare(product) {
    const list = getCompareList();

    // Zaten listede var mı?
    if (list.some(item => item.id === product.id)) {
        // Varsa direkt sayfaya git
        window.location.href = 'compare.html';
        return;
    }

    // Limit kontrolü
    if (list.length >= MAX_COMPARE_ITEMS) {
        showToast(`En fazla ${MAX_COMPARE_ITEMS} ürün karşılaştırabilirsiniz.`, 'warning');
        return;
    }

    list.push(product);
    saveCompareList(list);
    // Eklendikten sonra sayfaya git
    window.location.href = 'compare.html';
}

// Ürünü listeden çıkar
function removeFromCompare(productId) {
    let list = getCompareList();
    list = list.filter(item => item.id !== productId);
    saveCompareList(list);

    // Eğer compare.html sayfasındaysak sayfayı yenile
    if (window.location.pathname.includes('compare.html')) {
        renderComparisonTable();
    } else {
        showToast('Ürün karşılaştırma listesinden çıkarıldı.', 'info');
    }
}

// Badge güncelle (varsa)
function updateCompareBadge() {
    const list = getCompareList();
    const badge = document.getElementById('compare-badge');
    if (badge) {
        badge.textContent = list.length;
        badge.style.display = list.length > 0 ? 'flex' : 'none';
    }
}

// ID ile ekleme (HTML onclick için)
function addToCompareById(productId) {
    // Global state nesnesi üzerinden ürünü bulmaya çalış
    let product = null;

    // state nesnesi script.js veya products.js içinde tanımlı olmalı
    if (typeof state !== 'undefined' && state.products) {
        // == kullanıldığında string "1" ile number 1 eşleşir
        product = state.products.find(p => p.id == productId);
    }

    if (product) {
        addToCompare(product);
    } else {
        console.error('Ürün bulunamadı:', productId);
        showToast('Ürün bilgisi bulunamadı.', 'error');
    }
}

// Toast mesajı (Eğer script.js'teki yoksa basit bir fallback)
/* Not: script.js içindeki showToast fonksiyonunu kullanır. 
   Eğer o yoksa konsola yazar. */
function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // alert(message); // Alert rahatsız etmesin
    }
}
