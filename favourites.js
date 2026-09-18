/**
 * Favourites Page Logic — XIV STORE
 * Dynamically displays wishlist items, handles removals with animations, and quick-add to cart.
 */

document.addEventListener('DOMContentLoaded', () => {
    const favGrid = document.getElementById('favGrid');
    const emptyState = document.getElementById('favEmptyState');
    const actionsBar = document.getElementById('favActionsBar');
    const favCountHeader = document.getElementById('favCountHeader');
    const btnClearAll = document.getElementById('btnClearAll');

    function renderFavourites() {
        const items = window.FavouritesManager ? window.FavouritesManager.getItems() : [];

        if (favCountHeader) {
            const count = items.length;
            favCountHeader.textContent = count === 1 ? '1 ITEM' : `${count} ITEMS`;
        }

        if (items.length === 0) {
            if (favGrid) favGrid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            if (actionsBar) actionsBar.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (actionsBar) actionsBar.style.display = 'flex';

        if (favGrid) {
            favGrid.innerHTML = items.map((item, index) => {
                const id = item.id;
                const name = item.name || 'Editorial Garment';
                const category = item.category || 'Collection';
                const price = item.price || 99;
                const img = item.img || './src/Clothes/7/1.png';
                const delay = 0.05 * index;

                return `
                    <article class="fav-card" data-id="${id}" style="animation-delay: ${delay}s;">
                        <div class="fav-card-media">
                            <a href="product-detail.html?id=${id}">
                                <img src="${img}" alt="${escapeHtml(name)}" class="fav-card-img" onerror="this.src='./src/Clothes/8/1.png'">
                            </a>
                            <button type="button" class="card-fav-btn is-active" data-action="remove-fav" data-id="${id}" aria-label="Remove from Favourites">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="fav-card-info">
                            <span class="fav-card-cat">${escapeHtml(category)}</span>
                            <div class="fav-card-name-row">
                                <a href="product-detail.html?id=${id}" class="fav-card-name">${escapeHtml(name)}</a>
                                <span class="fav-card-price">$${price}</span>
                            </div>
                            <button type="button" class="fav-add-btn" data-action="add-to-bag" data-id="${id}" data-name="${escapeHtml(name)}" data-price="${price}" data-img="${img}" data-category="${escapeHtml(category)}">
                                <span>ADD TO BAG</span>
                            </button>
                        </div>
                    </article>
                `;
            }).join('');
        }
    }

    // Event delegation on the grid
    if (favGrid) {
        favGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const card = btn.closest('.fav-card');

            if (action === 'remove-fav' && card) {
                e.preventDefault();
                e.stopPropagation();

                // Smooth dismissal animation
                card.classList.add('is-removing');
                setTimeout(() => {
                    if (window.FavouritesManager) {
                        window.FavouritesManager.remove(id);
                    }
                    renderFavourites();
                }, 350);
            } else if (action === 'add-to-bag') {
                e.preventDefault();

                // Quick add to cart
                const product = {
                    id: String(id),
                    name: btn.dataset.name || 'Editorial Garment',
                    category: btn.dataset.category || 'Collection',
                    price: parseFloat(btn.dataset.price) || 99,
                    img: btn.dataset.img || './src/Clothes/7/1.png',
                    quantity: 1
                };

                addToCart(product);

                // Button visual feedback
                btn.classList.add('is-added');
                btn.innerHTML = `<span>ADDED ✓</span>`;
                setTimeout(() => {
                    btn.classList.remove('is-added');
                    btn.innerHTML = `<span>ADD TO BAG</span>`;
                }, 1800);
            }
        });
    }

    // Add to cart helper with localStorage synchronization
    function addToCart(product) {
        let cartItems = [];
        try {
            const saved = localStorage.getItem('xiv_cart_items');
            if (saved) cartItems = JSON.parse(saved);
        } catch (e) {
            console.warn('Could not read cart', e);
        }

        const existing = cartItems.find(it => String(it.id) === String(product.id));
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cartItems.push({ ...product, quantity: 1 });
        }

        try {
            localStorage.setItem('xiv_cart_items', JSON.stringify(cartItems));
        } catch (e) {
            console.warn('Could not save cart', e);
        }

        // Trigger cart badge update
        const totalQty = cartItems.reduce((sum, it) => sum + (it.quantity || 1), 0);
        const navBadges = document.querySelectorAll('#navCartCount, .cart-nav-badge');
        navBadges.forEach(b => b.textContent = totalQty);
    }

    // Clear All button
    if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
            if (window.FavouritesManager) {
                window.FavouritesManager.clearAll();
            }
            renderFavourites();
        });
    }

    // Listen to changes from other tabs or actions
    window.addEventListener('xiv_favourites_changed', () => {
        renderFavourites();
    });

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Mobile Drawer Controller
    const navHamburger = document.getElementById('navHamburger') || document.getElementById('mobileMenuBtn');
    const mobileOverlay = document.getElementById('mobileNavOverlay');
    const mobileClose = document.getElementById('mobileNavClose');

    if (navHamburger && mobileOverlay) {
        navHamburger.addEventListener('click', () => {
            mobileOverlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        });
    }

    if (mobileClose && mobileOverlay) {
        mobileClose.addEventListener('click', () => {
            mobileOverlay.classList.remove('is-open');
            document.body.style.overflow = '';
        });
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) {
                mobileOverlay.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        });
    }

    renderFavourites();
});
