// Products Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initProductsPage();
});

let filteredProducts = [...state.products];
let currentView = 'grid';

function initProductsPage() {
    renderProductsGrid();
    initFilters();
    initViewToggle();
    initSort();
    initMobileFilters();
}

function renderProductsGrid() {
    const productsGrid = document.getElementById('productsGrid');
    const productsCount = document.getElementById('productsCount');

    if (!productsGrid) return;

    productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');

    if (productsCount) {
        productsCount.textContent = filteredProducts.length;
    }

    // Add event listeners
    productsGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(e.currentTarget.dataset.id);
            addToCart(productId);
        });
    });

    productsGrid.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(e.currentTarget.dataset.id);
            toggleWishlist(productId);
        });
    });

    // Update wishlist button states
    if (typeof updateWishlistButtons === 'function') {
        updateWishlistButtons();
    }

    feather.replace();
}

function initFilters() {
    const clearFilters = document.getElementById('clearFilters');
    const priceRange = document.getElementById('priceRange');
    const maxPrice = document.getElementById('maxPrice');

    // Category filters
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // Price range
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            if (maxPrice) {
                maxPrice.textContent = new Intl.NumberFormat('tr-TR').format(e.target.value) + ' TL';
            }
            applyFilters();
        });
    }

    // Color filters
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            applyFilters();
        });
    });

    // Size filters
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            applyFilters();
        });
    });

    // Rating filters
    document.querySelectorAll('input[name="rating"]').forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // Stock filter
    document.querySelectorAll('input[name="stock"]').forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // Clear filters
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            document.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
            document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
            document.querySelectorAll('.color-option.active').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.size-option.active').forEach(btn => btn.classList.remove('active'));
            if (priceRange) priceRange.value = 2000;
            if (maxPrice) maxPrice.textContent = '2.000 TL';
            applyFilters();
        });
    }
}

function applyFilters() {
    filteredProducts = [...state.products];

    // Category filter
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(input => input.value);

    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            selectedCategories.includes(product.category)
        );
    }

    // Price filter
    const maxPriceValue = parseInt(document.getElementById('priceRange')?.value || 2000);
    filteredProducts = filteredProducts.filter(product => product.price <= maxPriceValue);

    // Rating filter
    const selectedRating = document.querySelector('input[name="rating"]:checked');
    if (selectedRating) {
        const minRating = parseInt(selectedRating.value);
        filteredProducts = filteredProducts.filter(product => product.rating >= minRating);
    }

    renderProductsGrid();
    updateActiveFilters();
}

function updateActiveFilters() {
    const activeFiltersContainer = document.getElementById('activeFilters');
    if (!activeFiltersContainer) return;

    const filters = [];

    // Category filters
    document.querySelectorAll('input[name="category"]:checked').forEach(input => {
        filters.push({ type: 'category', value: input.value, label: input.value });
    });

    // Color filters
    document.querySelectorAll('.color-option.active').forEach(btn => {
        filters.push({ type: 'color', value: btn.dataset.color, label: btn.dataset.color });
    });

    // Size filters
    document.querySelectorAll('.size-option.active').forEach(btn => {
        filters.push({ type: 'size', value: btn.dataset.size, label: btn.dataset.size });
    });

    if (filters.length === 0) {
        activeFiltersContainer.innerHTML = '';
        activeFiltersContainer.style.display = 'none';
        return;
    }

    activeFiltersContainer.style.display = 'flex';
    activeFiltersContainer.innerHTML = filters.map(filter => `
        <div class="filter-tag">
            <span>${filter.label}</span>
            <button onclick="removeFilter('${filter.type}', '${filter.value}')">×</button>
        </div>
    `).join('');
}

function removeFilter(type, value) {
    if (type === 'category') {
        const input = document.querySelector(`input[name="category"][value="${value}"]`);
        if (input) input.checked = false;
    } else if (type === 'color') {
        const btn = document.querySelector(`.color-option[data-color="${value}"]`);
        if (btn) btn.classList.remove('active');
    } else if (type === 'size') {
        const btn = document.querySelector(`.size-option[data-size="${value}"]`);
        if (btn) btn.classList.remove('active');
    }

    applyFilters();
}

function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const productsGrid = document.getElementById('productsGrid');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const view = btn.dataset.view;
            currentView = view;

            if (view === 'list') {
                productsGrid.classList.add('list-view');
            } else {
                productsGrid.classList.remove('list-view');
            }
        });
    });
}

function initSort() {
    const sortSelect = document.getElementById('sortSelect');

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;

            switch (sortBy) {
                case 'price-low':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    filteredProducts.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                    filteredProducts.sort((a, b) => b.id - a.id);
                    break;
                default:
                    filteredProducts.sort((a, b) => b.reviews - a.reviews);
            }

            renderProductsGrid();
        });
    }
}

function initMobileFilters() {
    const mobileFilterToggle = document.getElementById('mobileFilterToggle');
    const filtersSidebar = document.getElementById('filtersSidebar');

    if (mobileFilterToggle) {
        mobileFilterToggle.addEventListener('click', () => {
            filtersSidebar.classList.toggle('active');
        });
    }

    // Close filters when clicking outside
    document.addEventListener('click', (e) => {
        if (!filtersSidebar.contains(e.target) && !mobileFilterToggle.contains(e.target)) {
            filtersSidebar.classList.remove('active');
        }
    });
}

// Make function globally available
window.removeFilter = removeFilter;
