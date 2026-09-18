/**
 * Checkout logic — XIV STORE
 * Synchronizes with localStorage and routes to shopping.html upon checkout.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checkoutForm');
    const orderItemsList = document.getElementById('orderItemsList');
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderTotal = document.getElementById('orderTotal');
    const orderCountBadge = document.getElementById('orderCountBadge');
    const backBtn = document.getElementById('backBtn');

    // Default reference items if cart is empty
    const defaultOrderItems = [
        {
            id: '4',
            name: 'Basic Heavy T-Shirt',
            variant: 'Black / L',
            price: 99,
            quantity: 1,
            img: './src/Clothes/10/1.png'
        },
        {
            id: '2',
            name: 'Basic Fit T-Shirt',
            variant: 'Black / L',
            price: 90,
            quantity: 1,
            img: './src/Clothes/8/1.png'
        }
    ];

    // Load items from localStorage or seed with defaults
    let cartItems = [];
    try {
        const saved = localStorage.getItem('xiv_cart_items');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                cartItems = parsed;
            }
        }
    } catch (e) {
        console.warn('Checkout: error reading cart', e);
    }

    // If cart is empty, seed with reference items so page matches Screenshot 1 1:1
    if (cartItems.length === 0) {
        cartItems = defaultOrderItems;
        try {
            localStorage.setItem('xiv_cart_items', JSON.stringify(cartItems));
        } catch (e) {
            console.warn('Checkout: error saving cart', e);
        }
    }

    // Render Order Items
    function renderOrder() {
        if (!orderItemsList) return;

        let totalQty = 0;
        let subtotal = 0;

        orderItemsList.innerHTML = cartItems.map(item => {
            const qty = item.quantity || 1;
            const price = typeof item.price === 'number' ? item.price : 99;
            totalQty += qty;
            subtotal += price * qty;

            const name = item.name || 'Basic Fit T-Shirt';
            const variant = item.variant || 'Black / L';
            const img = item.img || (item.id == 4 ? './src/Clothes/10/1.png' : './src/Clothes/8/1.png');

            return `
                <div class="order-item" data-id="${item.id}">
                    <div class="item-thumb-box">
                        <img src="${img}" alt="${name}" onerror="this.src='./src/Clothes/8/1.png'">
                    </div>
                    <div class="item-details">
                        <div class="item-name">${name}</div>
                        <div class="item-variant">${variant}</div>
                        <div class="item-qty-badge">(${qty})</div>
                    </div>
                    <div class="item-actions-price">
                        <a href="shopping.html" class="item-change-link" title="Modify item">Change</a>
                        <div class="item-price">$ ${price}</div>
                    </div>
                </div>
            `;
        }).join('');

        if (orderCountBadge) {
            orderCountBadge.textContent = `(${totalQty})`;
        }
        if (orderSubtotal) {
            orderSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        }
        if (orderTotal) {
            orderTotal.textContent = `$${subtotal.toFixed(2)}`;
        }
    }

    renderOrder();

    // Restore any previously saved checkout info
    try {
        const savedInfo = localStorage.getItem('xiv_checkout_info');
        if (savedInfo) {
            const info = JSON.parse(savedInfo);
            if (info.email && document.getElementById('email')) document.getElementById('email').value = info.email;
            if (info.phone && document.getElementById('phone')) document.getElementById('phone').value = info.phone;
            if (info.firstName && document.getElementById('firstName')) document.getElementById('firstName').value = info.firstName;
            if (info.lastName && document.getElementById('lastName')) document.getElementById('lastName').value = info.lastName;
            if (info.country && document.getElementById('country')) document.getElementById('country').value = info.country;
            if (info.state && document.getElementById('state')) document.getElementById('state').value = info.state;
            if (info.address && document.getElementById('address')) document.getElementById('address').value = info.address;
            if (info.city && document.getElementById('city')) document.getElementById('city').value = info.city;
            if (info.postalCode && document.getElementById('postalCode')) document.getElementById('postalCode').value = info.postalCode;
        }
    } catch (e) {
        console.warn('Checkout: could not restore form data', e);
    }

    // Handle Form Submit -> Route to shopping.html (Screenshot 2)
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Save form input to localStorage
            const checkoutData = {
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                firstName: document.getElementById('firstName')?.value || '',
                lastName: document.getElementById('lastName')?.value || '',
                country: document.getElementById('country')?.value || '',
                state: document.getElementById('state')?.value || '',
                address: document.getElementById('address')?.value || '',
                city: document.getElementById('city')?.value || '',
                postalCode: document.getElementById('postalCode')?.value || '',
                timestamp: Date.now()
            };

            try {
                localStorage.setItem('xiv_checkout_info', JSON.stringify(checkoutData));
            } catch (err) {
                console.warn('Error saving checkout data', err);
            }

            // User requirement: "ипосле чекаута нас должно перекидывать в шопинг а тоесть во второй скрин шот"
            window.location.href = 'shopping.html';
        });
    }

    // Back button behavior
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.history.length > 1 && document.referrer && !document.referrer.includes('checkout.html')) {
                window.history.back();
            } else {
                window.location.href = 'shopping.html';
            }
        });
    }
});
