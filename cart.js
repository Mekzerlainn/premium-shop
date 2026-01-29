// Cart Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initCartPage();
});

const FREE_SHIPPING_THRESHOLD = 500;

function initCartPage() {
    renderCartItems();
    updateCartSummary();
    initCoupon();
    feather.replace();
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const emptyCart = document.getElementById('emptyCart');
    const cartLayout = document.getElementById('cartLayout');

    if (!cartItemsContainer) return;

    if (state.cart.length === 0) {
        cartLayout.style.display = 'none';
        emptyCart.style.display = 'flex';
        emptyCart.style.flexDirection = 'column';
        emptyCart.style.alignItems = 'center';
        feather.replace();
        return;
    }

    cartLayout.style.display = 'grid';
    emptyCart.style.display = 'none';

    cartItemsContainer.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-details">
                    <span>Beden: M</span>
                    <span>Renk: Siyah</span>
                </div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="remove-item" onclick="removeFromCartPage(${item.id})">
                    <i data-feather="trash-2"></i>
                </button>
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
        </div>
    `).join('');

    feather.replace();
}

function updateCartSummary() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 29.90;

    // Check for active coupon
    const activeCoupon = sessionStorage.getItem('activeCoupon');
    let discount = 0;

    if (activeCoupon === 'WELCOME10') {
        discount = subtotal * 0.10; // 10% discount
    }

    const total = subtotal + shipping - discount;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = shipping === 0 ? 'Ücretsiz' : formatPrice(shipping);
    document.getElementById('discount').textContent = formatPrice(discount);
    document.getElementById('total').textContent = formatPrice(total);

    updateFreeShippingProgress(subtotal);
}

// ... existing code ...

function initCoupon() {
    const applyCoupon = document.getElementById('applyCoupon');
    const couponInput = document.getElementById('couponInput');

    // Check if coupon already applied
    if (sessionStorage.getItem('activeCoupon') === 'WELCOME10') {
        if (couponInput) couponInput.value = 'WELCOME10';
        // UI feedback could be added here
    }

    if (applyCoupon) {
        applyCoupon.addEventListener('click', () => {
            const code = couponInput.value.trim().toUpperCase();

            if (code === 'WELCOME10') {
                sessionStorage.setItem('activeCoupon', 'WELCOME10');
                updateCartSummary();
                showToast('✅ İndirim kodu uygulandı! %10 indirim kazandınız.');
            } else if (code === '') {
                showToast('⚠️ Lütfen bir indirim kodu girin');
            } else {
                showToast('❌ Geçersiz indirim kodu');
                sessionStorage.removeItem('activeCoupon');
                updateCartSummary();
            }
        });
    }
}

// Make functions globally available
window.removeFromCartPage = removeFromCartPage;
window.updateQuantity = updateQuantity;
