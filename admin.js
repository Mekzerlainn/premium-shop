// ===================================
// ADMIN PANEL - JAVASCRIPT
// ===================================

// === GLOBAL STATE ===
// === GLOBAL STATE ===
const adminState = {
    currentPage: 'dashboard',
    theme: localStorage.getItem('adminTheme') || 'dark',
    products: [],
    orders: [],
    customers: [],
    categories: []
};

// Initialize Admin State from LocalStorage
function loadAdminState() {
    // Products (Shared with Frontend)
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        adminState.products = JSON.parse(storedProducts);
    }

    // Orders (Shared with Frontend)
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
        adminState.orders = JSON.parse(storedOrders);
    } else {
        // Sample orders if empty
        adminState.orders = [
            { id: 12345, customer: 'Ayşe Yılmaz', product: 'Premium Deri Ceket', date: '2025-01-15', items: 2, amount: 2598, payment: 'Kredi Kartı', status: 'completed' }
        ];
        localStorage.setItem('orders', JSON.stringify(adminState.orders));
    }

    // Customers (Mock for now, can be shared later)
    adminState.customers = [
        { id: 1, name: 'Ayşe Yılmaz', email: 'ayse@example.com', phone: '+90 555 123 4567', orders: 12, spent: 15680, joined: '2024-03-15' },
        { id: 2, name: 'Mehmet Demir', email: 'mehmet@example.com', phone: '+90 555 234 5678', orders: 8, spent: 9450, joined: '2024-05-20' }
    ];

    // Categories
    adminState.categories = [
        { id: 1, name: 'Kadın', products: adminState.products.filter(p => p.category === 'Kadın').length, icon: 'user' },
        { id: 2, name: 'Erkek', products: adminState.products.filter(p => p.category === 'Erkek').length, icon: 'user' },
        { id: 3, name: 'Ayakkabı', products: adminState.products.filter(p => p.category === 'Ayakkabı').length, icon: 'shopping-bag' },
        { id: 4, name: 'Aksesuar', products: adminState.products.filter(p => p.category === 'Aksesuar').length, icon: 'watch' }
    ];
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

function initAdmin() {
    loadAdminState();
    initTheme();
    initNavigation();
    initMobileMenu();
    initCharts();
    loadDashboardData();
    loadProductsData();
    loadOrdersData();
    loadCustomersData();
    loadCategoriesData();
    initModals();
    feather.replace();
}

// === THEME MANAGEMENT ===
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (!themeToggle) return;

    const updateIcon = (isDark) => {
        themeToggle.innerHTML = isDark
            ? '<i data-feather="sun"></i>'
            : '<i data-feather="moon"></i>';
        feather.replace();
    };

    // Apply saved theme
    if (adminState.theme === 'light') {
        body.classList.remove('dark-mode');
        updateIcon(false);
    } else {
        body.classList.add('dark-mode');
        updateIcon(true);
    }

    // Theme toggle
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            adminState.theme = 'dark';
            updateIcon(true);
        } else {
            adminState.theme = 'light';
            updateIcon(false);
        }

        localStorage.setItem('adminTheme', adminState.theme);
        // Update charts with new theme
        updateChartsTheme();
    });
}

// === NAVIGATION ===
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.dataset.page;

            // Update nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(pageId)?.classList.add('active');

            adminState.currentPage = pageId;

            // Close mobile menu
            document.getElementById('sidebar').classList.remove('active');
        });
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');

    mobileMenuBtn?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// === CHARTS ===
let salesChart, categoryChart, revenueChart, trafficChart, deviceChart;

function initCharts() {
    createSalesChart();
    createCategoryChart();
    createRevenueChart();
    createTrafficChart();
    createDeviceChart();
}

function createSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#E9ECEF' : '#212529';
    const gridColor = isDark ? '#2D3548' : '#E9ECEF';

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
            datasets: [{
                label: 'Satışlar',
                data: [12000, 15000, 19000, 22000, 25000, 28000, 30000, 32000, 35000, 38000, 42000, 45000],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#1A1F2E' : '#FFFFFF',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return 'Satış: ₺' + context.parsed.y.toLocaleString('tr-TR');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        callback: function (value) {
                            return '₺' + value.toLocaleString('tr-TR');
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function createCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Kadın', 'Erkek', 'Ayakkabı', 'Aksesuar'],
            datasets: [{
                data: [98, 87, 45, 18],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#E9ECEF' : '#212529',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#E9ECEF' : '#212529';
    const gridColor = isDark ? '#2D3548' : '#E9ECEF';

    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
            datasets: [{
                label: 'Gelir',
                data: [4500, 5200, 4800, 6100, 7200, 8900, 6700],
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        callback: function (value) {
                            return '₺' + value.toLocaleString('tr-TR');
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createTrafficChart() {
    const ctx = document.getElementById('trafficChart');
    if (!ctx) return;

    trafficChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Organik', 'Sosyal Medya', 'Direkt', 'Referans'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#E9ECEF' : '#212529',
                        padding: 15
                    }
                }
            }
        }
    });
}

function createDeviceChart() {
    const ctx = document.getElementById('deviceChart');
    if (!ctx) return;

    deviceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Mobil', 'Desktop', 'Tablet'],
            datasets: [{
                data: [60, 30, 10],
                backgroundColor: ['#667eea', '#764ba2', '#f093fb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#E9ECEF' : '#212529',
                        padding: 15
                    }
                }
            }
        }
    });
}

function updateChartsTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#E9ECEF' : '#212529';
    const gridColor = isDark ? '#2D3548' : '#E9ECEF';

    // Update all charts
    [salesChart, revenueChart].forEach(chart => {
        if (chart) {
            chart.options.scales.x.ticks.color = textColor;
            chart.options.scales.y.ticks.color = textColor;
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.y.grid.color = gridColor;
            chart.update();
        }
    });

    [categoryChart, trafficChart, deviceChart].forEach(chart => {
        if (chart) {
            chart.options.plugins.legend.labels.color = textColor;
            chart.update();
        }
    });
}

// === DASHBOARD DATA ===
function loadDashboardData() {
    loadRecentOrders();
    loadTopProducts();
}

function loadRecentOrders() {
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;

    tbody.innerHTML = adminState.orders.slice(0, 5).map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td><strong>₺${order.amount.toLocaleString('tr-TR')}</strong></td>
            <td><span class="status-badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></td>
            <td>
                <button class="action-btn" title="Görüntüle">
                    <i data-feather="eye"></i>
                </button>
                <button class="action-btn" title="Düzenle">
                    <i data-feather="edit"></i>
                </button>
            </td>
        </tr>
    `).join('');

    feather.replace();
}

function loadTopProducts() {
    const container = document.getElementById('topProducts');
    if (!container) return;

    const topProducts = adminState.products
        .sort((a, b) => b.price - a.price)
        .slice(0, 5);

    container.innerHTML = topProducts.map(product => `
        <div class="top-product-item">
            <img src="${product.image}" alt="${product.name}" class="top-product-image">
            <div class="top-product-info">
                <div class="top-product-name">${product.name}</div>
                <div class="top-product-sales">${product.stock} adet stokta</div>
            </div>
            <div class="top-product-price">₺${product.price.toLocaleString('tr-TR')}</div>
        </div>
    `).join('');
}

// === PRODUCTS DATA ===
function loadProductsData() {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;

    tbody.innerHTML = adminState.products.map(product => `
        <tr>
            <td><input type="checkbox"></td>
            <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${product.image}" alt="${product.name}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;">
                    <strong>${product.name}</strong>
                </div>
            </td>
            <td>${product.category}</td>
            <td>
                <span class="${product.stock < 10 ? 'status-badge warning' : ''}">${product.stock}</span>
            </td>
            <td><strong>₺${product.price.toLocaleString('tr-TR')}</strong></td>
            <td><span class="status-badge ${product.status === 'active' ? 'success' : 'error'}">${product.status === 'active' ? 'Aktif' : 'Pasif'}</span></td>
            <td>
                <button class="action-btn" title="Düzenle" onclick="editProduct(${product.id})">
                    <i data-feather="edit"></i>
                </button>
                <button class="action-btn" title="Sil" onclick="deleteProduct(${product.id})">
                    <i data-feather="trash-2"></i>
                </button>
            </td>
        </tr>
    `).join('');

    feather.replace();
}

// === ORDERS DATA ===
function loadOrdersData() {
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;

    tbody.innerHTML = adminState.orders.map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${order.customer}</td>
            <td>${order.date}</td>
            <td>${order.items}</td>
            <td><strong>₺${order.amount.toLocaleString('tr-TR')}</strong></td>
            <td>${order.payment}</td>
            <td><span class="status-badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></td>
            <td>
                <button class="action-btn" title="Görüntüle">
                    <i data-feather="eye"></i>
                </button>
                <button class="action-btn" title="Yazdır">
                    <i data-feather="printer"></i>
                </button>
            </td>
        </tr>
    `).join('');

    feather.replace();
}

// === CUSTOMERS DATA ===
function loadCustomersData() {
    const tbody = document.getElementById('customersTable');
    if (!tbody) return;

    tbody.innerHTML = adminState.customers.map(customer => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=667eea&color=fff" 
                         style="width: 36px; height: 36px; border-radius: 50%;">
                    <strong>${customer.name}</strong>
                </div>
            </td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.orders}</td>
            <td><strong>₺${customer.spent.toLocaleString('tr-TR')}</strong></td>
            <td>${customer.joined}</td>
            <td>
                <button class="action-btn" title="Görüntüle">
                    <i data-feather="eye"></i>
                </button>
                <button class="action-btn" title="Düzenle">
                    <i data-feather="edit"></i>
                </button>
                <button class="action-btn" title="Mail Gönder">
                    <i data-feather="mail"></i>
                </button>
            </td>
        </tr>
    `).join('');

    feather.replace();
}

// === CATEGORIES DATA ===
function loadCategoriesData() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    container.innerHTML = adminState.categories.map(category => `
        <div class="category-card">
            <div class="category-icon">
                <i data-feather="${category.icon}"></i>
            </div>
            <div class="category-name">${category.name}</div>
            <div class="category-count">${category.products} ürün</div>
            <div style="margin-top: 16px; display: flex; gap: 8px;">
                <button class="btn btn-secondary" style="flex: 1;">Düzenle</button>
                <button class="btn btn-secondary" style="flex: 1;">Sil</button>
            </div>
        </div>
    `).join('');

    feather.replace();
}

// === MODALS ===
function initModals() {
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const modalCloses = document.querySelectorAll('.modal-close');

    addProductBtn?.addEventListener('click', () => {
        productModal.classList.add('active');
    });

    modalCloses.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });

    // Close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Product form submit
    const productForm = document.getElementById('productForm');
    productForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        // Simple ID generation
        const newId = adminState.products.length > 0 ? Math.max(...adminState.products.map(p => p.id)) + 1 : 1;

        // Collect form data (simplified)
        const inputs = productForm.querySelectorAll('input, select, textarea');
        const newProduct = {
            id: newId,
            name: inputs[0].value,
            category: inputs[1].value,
            price: parseFloat(inputs[2].value),
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', // Placeholder
            rating: 5.0,
            reviews: 0,
            badge: 'new',
            stock: parseInt(inputs[4].value),
            status: 'active'
        };

        adminState.products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(adminState.products));

        loadProductsData();
        showToast('Ürün başarıyla eklendi!', 'success');
        productModal.classList.remove('active');
        productForm.reset();
    });
}

// === UTILITY FUNCTIONS ===
function getStatusClass(status) {
    const statusMap = {
        'completed': 'success',
        'shipping': 'info',
        'processing': 'warning',
        'pending': 'warning',
        'cancelled': 'error'
    };
    return statusMap[status] || 'info';
}

function getStatusText(status) {
    const textMap = {
        'completed': 'Tamamlandı',
        'shipping': 'Kargoda',
        'processing': 'Hazırlanıyor',
        'pending': 'Beklemede',
        'cancelled': 'İptal'
    };
    return textMap[status] || status;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('adminToast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function editProduct(id) {
    showToast('Ürün düzenleme özelliği yakında...', 'info');
}

function deleteProduct(id) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        adminState.products = adminState.products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(adminState.products));
        loadProductsData();
        showToast('Ürün silindi!', 'success');
    }
}

// Make functions globally available
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
