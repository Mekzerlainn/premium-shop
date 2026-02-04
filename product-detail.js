// ===================================
// PRODUCT DETAIL PAGE - JAVASCRIPT
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initProductDetailPage();
});

// Current product state
let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
let selectedRating = 0;

function initProductDetailPage() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (!productId) {
        showToast('Ürün bulunamadı');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 1500);
        return;
    }

    // Find product
    currentProduct = state.products.find(p => p.id === productId);

    if (!currentProduct) {
        showToast('Ürün bulunamadı');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 1500);
        return;
    }

    // Initialize page
    renderProductDetails();
    initGallery();
    initVariantSelectors();
    initQuantitySelector();
    initPurchaseActions();
    initReviewSystem();
    renderRelatedProducts();
    feather.replace();
}

// === RENDER PRODUCT DETAILS ===
function renderProductDetails() {
    // Update page title
    document.title = `${currentProduct.name} - Premium Shop`;

    // Update breadcrumb
    const breadcrumbProduct = document.getElementById('breadcrumbProduct');
    if (breadcrumbProduct) {
        breadcrumbProduct.textContent = currentProduct.name;
    }

    // Badges
    const badgesContainer = document.getElementById('productBadges');
    if (badgesContainer && currentProduct.badge) {
        badgesContainer.innerHTML = `
            <span class="badge ${currentProduct.badge}">
                ${currentProduct.badge === 'sale' ? 'İNDİRİM' : 'YENİ'}
            </span>
        `;
    }

    // Title
    document.getElementById('productTitle').textContent = currentProduct.name;

    // Rating
    const ratingContainer = document.getElementById('productRating');
    if (ratingContainer) {
        const stars = '★'.repeat(Math.floor(currentProduct.rating)) + '☆'.repeat(5 - Math.floor(currentProduct.rating));
        ratingContainer.querySelector('.stars').textContent = stars;
        ratingContainer.querySelector('.rating-text').textContent = `${currentProduct.rating} (${currentProduct.reviews} değerlendirme)`;
    }

    // Price
    const priceContainer = document.getElementById('productPrice');
    if (priceContainer) {
        priceContainer.querySelector('.current-price').textContent = formatPrice(currentProduct.price);

        if (currentProduct.oldPrice) {
            priceContainer.querySelector('.old-price').textContent = formatPrice(currentProduct.oldPrice);
            const discount = Math.round((1 - currentProduct.price / currentProduct.oldPrice) * 100);
            priceContainer.querySelector('.discount-badge').textContent = `%${discount} İndirim`;
        } else {
            priceContainer.querySelector('.old-price').style.display = 'none';
            priceContainer.querySelector('.discount-badge').style.display = 'none';
        }
    }

    // Description
    const description = document.getElementById('productDescription');
    if (description) {
        description.textContent = currentProduct.description || 'Bu ürün hakkında detaylı bilgi bulunmamaktadır.';
    }

    // Features
    const featuresContainer = document.getElementById('productFeatures');
    if (featuresContainer && currentProduct.features) {
        featuresContainer.innerHTML = currentProduct.features.map(feature => `
            <span class="feature-tag">
                <i data-feather="check"></i>
                ${escapeHtml(feature)}
            </span>
        `).join('');
    }

    // Stock info
    updateStockInfo();
}

function updateStockInfo() {
    const stockInfo = document.getElementById('stockInfo');
    if (!stockInfo) return;

    if (currentProduct.stock > 10) {
        stockInfo.className = 'stock-info in-stock';
        stockInfo.innerHTML = `
            <i data-feather="check-circle"></i>
            <span>Stokta mevcut</span>
        `;
    } else if (currentProduct.stock > 0) {
        stockInfo.className = 'stock-info low-stock';
        stockInfo.innerHTML = `
            <i data-feather="alert-circle"></i>
            <span>Son ${currentProduct.stock} adet!</span>
        `;
    } else {
        stockInfo.className = 'stock-info out-of-stock';
        stockInfo.innerHTML = `
            <i data-feather="x-circle"></i>
            <span>Stokta yok</span>
        `;
    }
    feather.replace();
}

// === GALLERY ===
function initGallery() {
    const mainImage = document.getElementById('mainImage');
    const thumbnailStrip = document.getElementById('thumbnailStrip');

    if (!mainImage || !thumbnailStrip) return;

    // Get images array or use single image
    const images = currentProduct.images || [currentProduct.image];

    // Set main image
    mainImage.src = images[0];
    mainImage.alt = currentProduct.name;

    // Create thumbnails
    thumbnailStrip.innerHTML = images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${img}" alt="${currentProduct.name} - ${index + 1}">
        </div>
    `).join('');

    // Thumbnail click handlers
    thumbnailStrip.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
            const index = parseInt(thumb.dataset.index);
            mainImage.src = images[index];

            // Update active state
            thumbnailStrip.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
}

// === VARIANT SELECTORS ===
function initVariantSelectors() {
    if (!currentProduct.variants) {
        document.getElementById('colorSelector').style.display = 'none';
        document.getElementById('sizeSelector').style.display = 'none';
        return;
    }

    // Color selector
    const colorOptions = document.getElementById('colorOptions');
    const selectedColorName = document.getElementById('selectedColorName');

    if (colorOptions && currentProduct.variants.colors) {
        colorOptions.innerHTML = currentProduct.variants.colors.map((color, index) => `
            <button class="color-btn ${index === 0 ? 'active' : ''}" 
                    style="background-color: ${color.hex};"
                    data-color="${color.name}"
                    title="${color.name}">
            </button>
        `).join('');

        // Set default selection
        selectedColor = currentProduct.variants.colors[0].name;
        selectedColorName.textContent = selectedColor;

        // Color click handlers
        colorOptions.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                colorOptions.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedColor = btn.dataset.color;
                selectedColorName.textContent = selectedColor;
            });
        });
    } else {
        document.getElementById('colorSelector').style.display = 'none';
    }

    // Size selector
    const sizeOptions = document.getElementById('sizeOptions');
    const selectedSizeName = document.getElementById('selectedSizeName');

    if (sizeOptions && currentProduct.variants.sizes) {
        sizeOptions.innerHTML = currentProduct.variants.sizes.map((size, index) => `
            <button class="size-btn ${index === 0 ? 'active' : ''}" data-size="${size}">
                ${size}
            </button>
        `).join('');

        // Set default selection
        selectedSize = currentProduct.variants.sizes[0];
        selectedSizeName.textContent = selectedSize;

        // Size click handlers
        sizeOptions.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sizeOptions.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSize = btn.dataset.size;
                selectedSizeName.textContent = selectedSize;
            });
        });
    } else {
        document.getElementById('sizeSelector').style.display = 'none';
    }
}

// === QUANTITY SELECTOR ===
function initQuantitySelector() {
    const qtyInput = document.getElementById('quantity');
    const qtyDecrease = document.getElementById('qtyDecrease');
    const qtyIncrease = document.getElementById('qtyIncrease');

    if (!qtyInput) return;

    qtyDecrease.addEventListener('click', () => {
        let value = parseInt(qtyInput.value) || 1;
        if (value > 1) {
            qtyInput.value = value - 1;
        }
    });

    qtyIncrease.addEventListener('click', () => {
        let value = parseInt(qtyInput.value) || 1;
        if (value < Math.min(10, currentProduct.stock)) {
            qtyInput.value = value + 1;
        }
    });

    qtyInput.addEventListener('change', () => {
        let value = parseInt(qtyInput.value) || 1;
        value = Math.max(1, Math.min(value, Math.min(10, currentProduct.stock)));
        qtyInput.value = value;
    });
}

// === PURCHASE ACTIONS ===
// === PURCHASE ACTIONS ===
function initPurchaseActions() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const wishlistBtn = document.getElementById('wishlistBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const compareBtn = document.getElementById('compareBtn');

    // Check if product is in wishlist
    updateWishlistButtonState();

    // Add to cart
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(document.getElementById('quantity').value) || 1;

            // Validate variant selection
            if (currentProduct.variants) {
                if (currentProduct.variants.colors && !selectedColor) {
                    showToast('Lütfen bir renk seçin');
                    return;
                }
                if (currentProduct.variants.sizes && !selectedSize) {
                    showToast('Lütfen bir beden seçin');
                    return;
                }
            }

            // Add to cart with variants
            addToCartWithVariants(currentProduct.id, quantity, selectedSize, selectedColor);
        });
    }

    // Wishlist
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            toggleWishlist(currentProduct.id);
            updateWishlistButtonState();
        });
    }

    // Compare Button
    if (compareBtn) {
        compareBtn.addEventListener('click', () => {
            if (typeof addToCompare === 'function') {
                addToCompare(currentProduct);
            } else {
                console.error('addToCompare function not found');
            }
        });
    }

    // Copy link
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('Link kopyalandı!');
            });
        });
    }
}

function updateWishlistButtonState() {
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (!wishlistBtn) return;

    const isInWishlist = state.wishlist.some(item => item.id === currentProduct.id);
    wishlistBtn.classList.toggle('active', isInWishlist);
}

// Add to cart with variants
function addToCartWithVariants(productId, quantity, size, color) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // Check if same product with same variants exists
    const existingIndex = state.cart.findIndex(item =>
        item.id === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingIndex > -1) {
        state.cart[existingIndex].quantity += quantity;
    } else {
        state.cart.push({
            ...product,
            quantity: quantity,
            size: size,
            color: color
        });
    }

    saveCart();
    updateCartCount();
    renderMiniCart();

    let message = `${product.name} sepete eklendi!`;
    if (size || color) {
        message = `${product.name} (${[size, color].filter(Boolean).join(', ')}) sepete eklendi!`;
    }
    showToast(message);

    // Animate cart button
    animateAddToCart();
}

// === REVIEW SYSTEM ===
function initReviewSystem() {
    renderReviewSummary();
    renderReviews();
    initReviewForm();
}

function getProductReviews(productId) {
    const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
    return allReviews[productId] || [];
}

function saveProductReview(productId, review) {
    const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
    if (!allReviews[productId]) {
        allReviews[productId] = [];
    }
    allReviews[productId].unshift(review);
    localStorage.setItem('productReviews', JSON.stringify(allReviews));

    // Update product rating
    updateProductRatingFromReviews(productId);
}

function updateProductRatingFromReviews(productId) {
    const reviews = getProductReviews(productId);
    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Update in state
    const product = state.products.find(p => p.id === productId);
    if (product) {
        product.rating = Math.round(avgRating * 10) / 10;
        product.reviews = reviews.length;
        localStorage.setItem('products', JSON.stringify(state.products));
    }
}

function renderReviewSummary() {
    const reviews = getProductReviews(currentProduct.id);

    // Average rating
    const avgRatingEl = document.getElementById('avgRating');
    const avgStarsEl = document.getElementById('avgStars');
    const totalReviewsEl = document.getElementById('totalReviews');
    const ratingBarsEl = document.getElementById('ratingBars');

    let avgRating = currentProduct.rating || 0;
    let totalReviews = reviews.length || currentProduct.reviews || 0;

    if (reviews.length > 0) {
        avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        avgRating = Math.round(avgRating * 10) / 10;
    }

    if (avgRatingEl) avgRatingEl.textContent = avgRating.toFixed(1);
    if (avgStarsEl) avgStarsEl.textContent = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
    if (totalReviewsEl) totalReviewsEl.textContent = `${totalReviews} yorum`;

    // Rating bars
    if (ratingBarsEl && reviews.length > 0) {
        const ratingCounts = [0, 0, 0, 0, 0];
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                ratingCounts[r.rating - 1]++;
            }
        });

        ratingBarsEl.innerHTML = [5, 4, 3, 2, 1].map(star => {
            const count = ratingCounts[star - 1];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return `
                <div class="rating-bar">
                    <span>${star}</span>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span>${count}</span>
                </div>
            `;
        }).join('');
    }
}

function renderReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    const reviews = getProductReviews(currentProduct.id);

    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="empty-reviews">
                <i data-feather="message-square"></i>
                <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
            </div>
        `;
        feather.replace();
        return;
    }

    reviewsList.innerHTML = reviews.map(review => {
        const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${initials}</div>
                        <div>
                            <div class="reviewer-name">${escapeHtml(review.name)}</div>
                            <div class="review-date">${review.date}</div>
                        </div>
                    </div>
                    <div class="review-rating">${stars}</div>
                </div>
                <div class="review-content">
                    ${escapeHtml(review.comment)}
                </div>
                ${review.verified ? `
                    <div class="verified-badge">
                        <i data-feather="check-circle"></i>
                        Doğrulanmış Satın Alma
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    feather.replace();
}

function initReviewForm() {
    const starRatingInput = document.getElementById('starRatingInput');
    const ratingInput = document.getElementById('ratingInput');
    const reviewForm = document.getElementById('reviewForm');

    // Star rating selection
    if (starRatingInput) {
        const stars = starRatingInput.querySelectorAll('.star');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                selectedRating = rating;
                ratingInput.value = rating;

                stars.forEach((s, index) => {
                    s.classList.toggle('active', index < rating);
                });
            });

            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, index) => {
                    s.style.color = index < rating ? '#ffc107' : '#ddd';
                });
            });
        });

        starRatingInput.addEventListener('mouseleave', () => {
            stars.forEach((s, index) => {
                s.style.color = index < selectedRating ? '#ffc107' : '#ddd';
            });
        });
    }

    // Form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('reviewerName').value.trim();
            const comment = document.getElementById('reviewComment').value.trim();
            const rating = parseInt(ratingInput.value);

            if (!rating) {
                showToast('Lütfen bir puan verin');
                return;
            }

            if (!name || !comment) {
                showToast('Lütfen tüm alanları doldurun');
                return;
            }

            const review = {
                id: Date.now(),
                name: name,
                comment: comment,
                rating: rating,
                date: new Date().toLocaleDateString('tr-TR'),
                verified: false
            };

            saveProductReview(currentProduct.id, review);

            // Reset form
            reviewForm.reset();
            selectedRating = 0;
            starRatingInput.querySelectorAll('.star').forEach(s => s.classList.remove('active'));

            // Refresh displays
            renderReviewSummary();
            renderReviews();

            showToast('Yorumunuz eklendi! Teşekkür ederiz.');
        });
    }
}

// === RELATED PRODUCTS ===
function renderRelatedProducts() {
    const container = document.getElementById('relatedProducts');
    if (!container) return;

    // Get products from same category, excluding current
    const related = state.products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);

    // If not enough, add other products
    if (related.length < 4) {
        const others = state.products
            .filter(p => p.id !== currentProduct.id && !related.find(r => r.id === p.id))
            .slice(0, 4 - related.length);
        related.push(...others);
    }

    container.innerHTML = related.map(product => createProductCardWithLink(product)).join('');

    // Add event listeners
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
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

    updateWishlistButtons();
    feather.replace();
}

function createProductCardWithLink(product) {
    const badgeHTML = product.badge ?
        `<div class="product-badge ${product.badge}">${product.badge === 'sale' ? 'İNDİRİM' : 'YENİ'}</div>` : '';

    const oldPriceHTML = product.oldPrice ?
        `<span class="price-old">${formatPrice(product.oldPrice)}</span>` : '';

    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    const safeName = escapeHtml(product.name);

    return `
        <div class="product-card">
            <a href="product-detail.html?id=${product.id}" class="product-link">
                <div class="product-image">
                    <img src="${product.image}" alt="${safeName}" loading="lazy">
                    ${badgeHTML}
                    <div class="product-actions">
                        <button class="product-action-btn wishlist-btn" data-id="${product.id}" title="Favorilere Ekle">
                            <i data-feather="heart"></i>
                        </button>
                        <button class="product-action-btn" onclick="addToCompareById(${product.id}); return false;" title="Karşılaştır">
                            <i data-feather="columns"></i>
                        </button>
                    </div>
                </div>
            </a>
            <div class="product-info">
                <a href="product-detail.html?id=${product.id}">
                    <h3 class="product-title">${safeName}</h3>
                </a>
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
