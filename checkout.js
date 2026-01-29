// Checkout Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initCheckoutPage();
});

function initCheckoutPage() {
    renderOrderSummary();
    initPaymentToggle();
    initCardFormatting();
    initCheckoutForm();
    feather.replace();
}

function renderOrderSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryTotal = document.getElementById('summaryTotal');

    if (!summaryItems) return;

    if (state.cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    summaryItems.innerHTML = state.cart.map(item => `
        <div class="summary-item">
            <div class="summary-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="summary-item-info">
                <div class="summary-item-title">${item.name}</div>
                <div class="summary-item-details">Adet: ${item.quantity}</div>
            </div>
            <div class="summary-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    summarySubtotal.textContent = formatPrice(subtotal);
    summaryShipping.textContent = shipping === 0 ? 'Ücretsiz' : formatPrice(shipping);
    summaryTotal.textContent = formatPrice(total);
}

function initPaymentToggle() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const cardForm = document.getElementById('cardForm');

    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                cardForm.style.display = 'block';
            } else {
                cardForm.style.display = 'none';
            }
        });
    });
}

function initCardFormatting() {
    const cardNumber = document.querySelector('input[name="cardNumber"]');
    const cardExpiry = document.querySelector('input[name="cardExpiry"]');
    const cardCvv = document.querySelector('input[name="cardCvv"]');

    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    if (cardExpiry) {
        cardExpiry.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    if (cardCvv) {
        cardCvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

function initCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(checkoutForm);
            const customerInfo = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                district: formData.get('district')
            };

            // Calculate totals
            const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= 500 ? 0 : 29.90; // Should ideally match cart logic
            const total = subtotal + shipping; // Ignoring coupon for simplicity or could read from sessionStorage

            // Create Order Object
            const newOrder = {
                id: Math.floor(100000 + Math.random() * 900000), // Random 6 digit ID
                customer: `${customerInfo.firstName} ${customerInfo.lastName}`,
                customerEmail: customerInfo.email,
                date: new Date().toISOString().split('T')[0],
                items: state.cart.length, // Count of unique items or total quantity? Admin shows unique usually
                amount: total,
                payment: formData.get('payment'),
                status: 'pending',
                cartItems: [...state.cart] // Snapshot of cart
            };

            // Save to Orders (using shared state)
            const currentOrders = JSON.parse(localStorage.getItem('orders')) || [];
            currentOrders.unshift(newOrder); // Add to top
            localStorage.setItem('orders', JSON.stringify(currentOrders));

            // Clear Cart
            localStorage.removeItem('cart');
            state.cart = [];
            sessionStorage.removeItem('activeCoupon'); // Clear coupon

            showToast('Siparişiniz işleniyor...');

            setTimeout(() => {
                showToast('✅ Siparişiniz başarıyla oluşturuldu!');
                setTimeout(() => {
                    window.location.href = 'index.html'; // Or success page if existed
                }, 2000);
            }, 1500);
        });
    }
}
