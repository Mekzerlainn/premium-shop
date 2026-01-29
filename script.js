// ===================================
// PREMIUM E-COMMERCE - JAVASCRIPT
// ===================================

// Initialize Feather Icons
document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    initializeApp();
});

// === GLOBAL STATE ===
// === GLOBAL STATE ===
const state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],
    products: [],
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    orders: JSON.parse(localStorage.getItem('orders')) || []
};

// === SAMPLE PRODUCTS DATA ===
const sampleProducts = [
    {
        id: 1,
        name: 'Premium Deri Ceket',
        price: 1299,
        oldPrice: 1899,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
        rating: 4.8,
        reviews: 124,
        badge: 'sale',
        category: 'Kadın',
        stock: 45,
        status: 'active'
    },
    {
        id: 2,
        name: 'Klasik Beyaz Gömlek',
        price: 299,
        oldPrice: null,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop',
        rating: 4.5,
        reviews: 89,
        badge: 'new',
        category: 'Erkek',
        stock: 120,
        status: 'active'
    },
    {
        id: 3,
        name: 'Spor Ayakkabı',
        price: 899,
        oldPrice: 1299,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
        rating: 4.9,
        reviews: 256,
        badge: 'sale',
        category: 'Ayakkabı',
        stock: 8,
        status: 'active'
    },
    {
        id: 4,
        name: 'Denim Pantolon',
        price: 449,
        oldPrice: null,
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop',
        rating: 4.6,
        reviews: 178,
        badge: null,
        category: 'Erkek',
        stock: 67,
        status: 'active'
    },
    {
        id: 5,
        name: 'Şık Elbise',
        price: 799,
        oldPrice: 1199,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
        rating: 4.7,
        reviews: 145,
        badge: 'sale',
        category: 'Kadın',
        stock: 15,
        status: 'active'
    },
    {
        id: 6,
        name: 'Deri Çanta',
        price: 649,
        oldPrice: null,
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=500&fit=crop',
        rating: 4.8,
        reviews: 203,
        badge: 'new',
        category: 'Aksesuar',
        stock: 34,
        status: 'active'
    },
    {
        id: 7,
        name: 'Kışlık Mont',
        price: 1599,
        oldPrice: 2299,
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=500&fit=crop',
        rating: 4.9,
        reviews: 312,
        badge: 'sale',
        category: 'Kadın',
        stock: 23,
        status: 'active'
    },
    {
        id: 8,
        name: 'Spor Sweatshirt',
        price: 349,
        oldPrice: null,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
        rating: 4.4,
        reviews: 98,
        badge: null,
        category: 'Erkek',
        stock: 89,
        status: 'active'
    }
];

// Load products from LocalStorage or initialize with sample data
const storedProducts = localStorage.getItem('products');
if (storedProducts) {
    state.products = JSON.parse(storedProducts);
} else {
    state.products = sampleProducts;
    localStorage.setItem('products', JSON.stringify(sampleProducts));
}

// === INITIALIZATION ===
function initializeApp() {
    initTheme();
    initHeader();
    initHeroSlider();
    initProducts();
    initCart();
    initWishlist();
    initSearch();
    initNewsletter();
    initScrollAnimations();
    updateCartCount();
    updateWishlistCount();
}

// === THEME MANAGEMENT ===
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Eğer tema butonu yoksa (bazı sayfalarda olmayabilir) fonksiyonu durdur
    if (!themeToggle) return;

    // İkon güncelleme yardımcı fonksiyonu
    const updateIcon = (isDark) => {
        themeToggle.innerHTML = isDark
            ? '<i data-feather="sun"></i>'
            : '<i data-feather="moon"></i>';
        feather.replace();
    };

    // Load saved theme
    const savedTheme = localStorage.getItem('siteTheme') || 'light';
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        updateIcon(true);
    } else {
        updateIcon(false);
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        body.classList.toggle('dark-mode');

        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('siteTheme', isDark ? 'dark' : 'light');
        updateIcon(isDark);
    });
}

// === HEADER ===
function initHeader() {
    const header = document.getElementById('header');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    // Sticky header on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// === HERO SLIDER ===
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('heroDots');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');

    if (!slides.length) return;

    // Initialize current slide
    state.currentSlide = 0;
    let autoSlideInterval;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `hero-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetAutoSlide();
        });
        dotsContainer.appendChild(dot);
    });

    function goToSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        document.querySelectorAll('.hero-dot').forEach(dot => dot.classList.remove('active'));

        slides[index].classList.add('active');
        document.querySelectorAll('.hero-dot')[index].classList.add('active');
        state.currentSlide = index;
    }

    function nextSlide() {
        const next = (state.currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    function prevSlide() {
        const prev = (state.currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prev);
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
    }

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    const sliderContainer = document.querySelector('.hero-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                nextSlide();
            } else {
                // Swipe right - prev slide
                prevSlide();
            }
            resetAutoSlide();
        }
    }

    // Start auto slide
    startAutoSlide();
}

// === PRODUCTS ===
function initProducts() {
    const bestSellersContainer = document.getElementById('bestSellers');
    const newArrivalsContainer = document.getElementById('newArrivals');

    if (bestSellersContainer) {
        renderProducts(state.products.slice(0, 6), bestSellersContainer, true);
    }

    if (newArrivalsContainer) {
        renderProducts(state.products.slice(0, 4), newArrivalsContainer, false);
    }
}

function renderProducts(products, container, isCarousel = false) {
    container.innerHTML = products.map(product => createProductCard(product)).join('');

    // Add event listeners
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(e.currentTarget.dataset.id);
            addToCart(productId);
        });
    });

    container.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(e.currentTarget.dataset.id);
            toggleWishlist(productId);
        });
    });

    // Update wishlist button states
    updateWishlistButtons();

    // Re-initialize feather icons
    feather.replace();
}

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

function createProductCard(product) {
    const badgeHTML = product.badge ?
        `<div class="product-badge ${product.badge}">${product.badge === 'sale' ? 'İNDİRİM' : 'YENİ'}</div>` : '';

    const oldPriceHTML = product.oldPrice ?
        `<span class="price-old">${formatPrice(product.oldPrice)}</span>` : '';

    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));

    // Security: Escape product name
    const safeName = escapeHtml(product.name);

    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${safeName}" loading="lazy">
                ${badgeHTML}
                <div class="product-actions">
                    <button class="product-action-btn wishlist-btn" data-id="${product.id}" title="Favorilere Ekle">
                        <i data-feather="heart"></i>
                    </button>
                    <button class="product-action-btn" title="Hızlı Görünüm">
                        <i data-feather="eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${safeName}</h3>
                <div class="product-rating">
                    ${stars}
                    <span>(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="price-current">${formatPrice(product.price)}</span>
                    ${oldPriceHTML}
                </div>
                <button class="add-to-cart-btn" data-id="${product.id}">
                    <i data-feather="shopping-bag"></i>
                    Sepete Ekle
                </button>
            </div>
        </div>
    `;
}

function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

// === CART ===
function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    const miniCart = document.getElementById('miniCart');
    const closeMiniCart = document.getElementById('closeMiniCart');

    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            miniCart.classList.add('active');
        });
    }

    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            miniCart.classList.add('active');
        });
    }

    if (closeMiniCart) {
        closeMiniCart.addEventListener('click', () => {
            miniCart.classList.remove('active');
        });
    }

    renderMiniCart();
}

function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    renderMiniCart();
    showToast(`${product.name} sepete eklendi!`);

    // Flying animation
    animateAddToCart();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderMiniCart();
}

function updateCartQuantity(productId, quantity) {
    const item = state.cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
        updateCartCount();
        renderMiniCart();
    }
}

function renderMiniCart() {
    const miniCartItems = document.getElementById('miniCartItems');
    const miniCartTotal = document.getElementById('miniCartTotal');
    const miniCartCount = document.getElementById('miniCartCount');

    if (!miniCartItems) return;

    if (state.cart.length === 0) {
        miniCartItems.innerHTML = '<p class="empty-cart">Sepetiniz boş</p>';
        miniCartTotal.textContent = formatPrice(0);
        miniCartCount.textContent = '0';
        return;
    }

    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    miniCartItems.innerHTML = state.cart.map(item => `
        <div class="mini-cart-item">
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
                <h4 style="font-size: 14px; margin-bottom: 4px;">${item.name}</h4>
                <p style="font-size: 12px; color: var(--color-text-light);">${item.quantity} x ${formatPrice(item.price)}</p>
            </div>
            <button onclick="removeFromCart(${item.id})" style="color: var(--color-error);">
                <i data-feather="trash-2"></i>
            </button>
        </div>
    `).join('');

    miniCartTotal.textContent = formatPrice(total);
    miniCartCount.textContent = state.cart.length;

    feather.replace();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const mobileCartCount = document.getElementById('mobileCartCount');
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCount) cartCount.textContent = count;
    if (mobileCartCount) mobileCartCount.textContent = count;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
}

function animateAddToCart() {
    // Simple animation feedback
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
        }, 300);
    }
}

// === WISHLIST ===
function initWishlist() {
    const wishlistBtn = document.getElementById('wishlistBtn');

    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'favorites.html';
        });
    }

    // Update wishlist button states on product cards
    updateWishlistButtons();
}

function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = parseInt(btn.dataset.id);
        const isInWishlist = state.wishlist.some(item => item.id === productId);

        if (isInWishlist) {
            btn.classList.add('active');
            btn.title = 'Favorilerden Çıkar';
        } else {
            btn.classList.remove('active');
            btn.title = 'Favorilere Ekle';
        }
    });
}

function toggleWishlist(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const index = state.wishlist.findIndex(item => item.id === productId);

    if (index > -1) {
        state.wishlist.splice(index, 1);
        showToast(`${product.name} favorilerden çıkarıldı`);
    } else {
        state.wishlist.push(product);
        showToast(`${product.name} favorilere eklendi!`);
    }

    saveWishlist();
    updateWishlistCount();
    updateWishlistButtons();
}

function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = state.wishlist.length;
    }
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
}

// === SEARCH ===
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (!searchInput) return;

    let selectedIndex = -1;
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Debounced search function
    const debouncedSearch = debounce((query) => {
        performSearch(query);
    }, 300);

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        selectedIndex = -1;

        if (query.length < 2) {
            if (query.length === 0 && searchHistory.length > 0) {
                showSearchHistory();
            } else {
                searchSuggestions.classList.remove('active');
            }
            return;
        }

        debouncedSearch(query);
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const items = searchSuggestions.querySelectorAll('.search-result-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                items[selectedIndex].click();
            }
        } else if (e.key === 'Escape') {
            searchSuggestions.classList.remove('active');
            searchInput.blur();
        }
    });

    // Show search history on focus
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim() === '' && searchHistory.length > 0) {
            showSearchHistory();
        }
    });

    function performSearch(query) {
        const lowerQuery = query.toLowerCase();

        const results = state.products.filter(product =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.category.toLowerCase().includes(lowerQuery)
        );

        if (results.length > 0) {
            searchSuggestions.innerHTML = results.slice(0, 5).map((product, index) => `
                <div class="search-result-item ${index === selectedIndex ? 'selected' : ''}" 
                     data-product-id="${product.id}"
                     style="padding: 12px; border-bottom: 1px solid var(--color-border); cursor: pointer; display: flex; gap: 12px; align-items: center; transition: background var(--transition-fast);">
                    <img src="${product.image}" alt="${escapeHtml(product.name)}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 14px;">${escapeHtml(product.name)}</div>
                        <div style="font-size: 12px; color: var(--color-text-light);">
                            ${product.category} • ${formatPrice(product.price)}
                        </div>
                    </div>
                </div>
            `).join('');

            searchSuggestions.classList.add('active');

            // Add click handlers
            searchSuggestions.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const productId = item.dataset.productId;
                    saveToSearchHistory(query);
                    // Navigate to products page with search query
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                });

                item.addEventListener('mouseenter', function () {
                    this.style.background = 'var(--color-bg-light)';
                });

                item.addEventListener('mouseleave', function () {
                    this.style.background = '';
                });
            });
        } else {
            searchSuggestions.innerHTML = `
                <div style="padding: 12px; text-align: center; color: var(--color-text-light);">
                    Sonuç bulunamadı
                    <div style="margin-top: 8px; font-size: 12px;">
                        Farklı kelimeler deneyin
                    </div>
                </div>
            `;
            searchSuggestions.classList.add('active');
        }
    }

    function showSearchHistory() {
        if (searchHistory.length === 0) return;

        searchSuggestions.innerHTML = `
            <div style="padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--color-text-light); border-bottom: 1px solid var(--color-border);">
                Son Aramalar
            </div>
            ${searchHistory.slice(0, 5).map(term => `
                <div class="search-history-item" style="padding: 10px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background var(--transition-fast);">
                    <i data-feather="clock" style="width: 16px; height: 16px; color: var(--color-text-light);"></i>
                    <span style="flex: 1; font-size: 14px;">${escapeHtml(term)}</span>
                </div>
            `).join('')}
        `;

        searchSuggestions.classList.add('active');
        feather.replace();

        // Add click handlers
        searchSuggestions.querySelectorAll('.search-history-item').forEach(item => {
            item.addEventListener('click', () => {
                const term = item.querySelector('span').textContent;
                searchInput.value = term;
                performSearch(term);
            });

            item.addEventListener('mouseenter', function () {
                this.style.background = 'var(--color-bg-light)';
            });

            item.addEventListener('mouseleave', function () {
                this.style.background = '';
            });
        });
    }

    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
                item.style.background = 'var(--color-bg-light)';
            } else {
                item.classList.remove('selected');
                item.style.background = '';
            }
        });
    }

    function saveToSearchHistory(query) {
        // Remove if already exists
        searchHistory = searchHistory.filter(term => term !== query);
        // Add to beginning
        searchHistory.unshift(query);
        // Keep only last 10
        searchHistory = searchHistory.slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });
}

// === NEWSLETTER ===
function initNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            showToast(`${email} başarıyla kaydedildi! Kampanyalardan haberdar olacaksınız.`);
            e.target.reset();
        });
    }
}

// === SCROLL ANIMATIONS ===
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Add animation class to sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });
}

// === TOAST NOTIFICATION ===
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// === UTILITY FUNCTIONS ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleWishlist = toggleWishlist;
