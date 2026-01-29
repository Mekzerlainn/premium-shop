// Account Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initAccountPage();
});

function initAccountPage() {
    initTabs();
    loadAccountData(); // Load dynamic data
    renderWishlist();
    initForms();
    feather.replace();
}

function loadAccountData() {
    // 1. Dashboard Stats
    const totalOrdersEl = document.querySelector('.dashboard-card:nth-child(1) h3');
    const totalWishlistEl = document.querySelector('.dashboard-card:nth-child(2) h3');

    if (totalOrdersEl) totalOrdersEl.textContent = state.orders.length;
    if (totalWishlistEl) totalWishlistEl.textContent = state.wishlist.length;

    // 2. Recent Orders (Dashboard)
    renderRecentOrders();

    // 3. All Orders (Orders Tab)
    renderAllOrders();
}

function renderRecentOrders() {
    const recentOrdersContainer = document.querySelector('.recent-orders .order-list');
    if (!recentOrdersContainer) return;

    const recentOrders = state.orders.slice(0, 3); // Last 3

    if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = '<p class="text-muted">Henüz siparişiniz yok.</p>';
        return;
    }

    recentOrdersContainer.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <div class="order-info">
                <strong>#${order.id}</strong>
                <span>${order.date}</span>
            </div>
            <div class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</div>
            <div class="order-total">${formatPrice(order.amount)}</div>
        </div>
    `).join('');
}

function renderAllOrders() {
    const ordersList = document.querySelector('.orders-list');
    if (!ordersList) return;

    if (state.orders.length === 0) {
        ordersList.innerHTML = '<p class="empty-message">Henüz siparişiniz bulunmuyor.</p>';
        return;
    }

    ordersList.innerHTML = state.orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <strong>Sipariş #${order.id}</strong>
                    <span>${order.date}</span>
                </div>
                <div class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</div>
            </div>
            <div class="order-items">
                ${order.cartItems.map(item => `
                    <div class="order-product">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <h4>${item.name}</h4>
                            <p>Adet: ${item.quantity}</p>
                        </div>
                        <span>${formatPrice(item.price)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">Toplam: <strong>${formatPrice(order.amount)}</strong></div>
                <div class="order-actions">
                    <button class="btn btn-secondary">Detayları Gör</button>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusClass(status) {
    const map = {
        'completed': 'success',
        'shipping': 'warning',
        'pending': 'warning',
        'cancelled': 'error'
    };
    return map[status] || 'secondary';
}

function getStatusText(status) {
    const map = {
        'completed': 'Teslim Edildi',
        'shipping': 'Kargoda',
        'pending': 'Beklemede',
        'cancelled': 'İptal'
    };
    return map[status] || status;
}

function initTabs() {
    const menuItems = document.querySelectorAll('.menu-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const tabId = item.dataset.tab;

            // Update menu
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // Update content
            tabContents.forEach(tc => tc.classList.remove('active'));
            document.getElementById(tabId)?.classList.add('active');
        });
    });
}

function renderWishlist() {
    const wishlistGrid = document.getElementById('wishlistGrid');

    if (!wishlistGrid) return;

    if (state.wishlist.length === 0) {
        wishlistGrid.innerHTML = '<p class="empty-message">Favori listeniz boş</p>';
        return;
    }

    wishlistGrid.innerHTML = state.wishlist.map(product => createProductCard(product)).join('');

    // Add event listeners (assuming createProductCard uses standard classes)
    wishlistGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        });
    });

    wishlistGrid.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            toggleWishlist(productId);
            renderWishlist();
        });
    });

    feather.replace();
}

function initForms() {
    const profileForm = document.querySelector('.profile-form');
    const passwordForm = document.querySelector('.password-form');

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('✅ Bilgileriniz başarıyla güncellendi!');
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('✅ Şifreniz başarıyla değiştirildi!');
            passwordForm.reset();
        });
    }
}
