/**
 * Favourites Manager — XIV STORE
 * Universal wishlist engine across all store pages.
 * Handles storage, live UI badge sync, button toggles, floating heart particles, and toasts.
 */

(function () {
    const STORAGE_KEY = 'xiv_favourites';

    const FavouritesManager = {
        items: [],

        init() {
            this.load();
            this.bindGlobalEvents();
            this.updateUI();
        },

        load() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) {
                        this.items = parsed;
                    }
                }
            } catch (e) {
                console.warn('FavouritesManager: error reading storage', e);
                this.items = [];
            }
        },

        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
            } catch (e) {
                console.warn('FavouritesManager: error saving storage', e);
            }
            window.dispatchEvent(new CustomEvent('xiv_favourites_changed', { detail: { items: this.items } }));
        },

        getItems() {
            return [...this.items];
        },

        has(id) {
            const strId = String(id);
            return this.items.some(item => String(item.id) === strId);
        },

        toggle(product) {
            const strId = String(product.id);
            const exists = this.has(strId);

            if (exists) {
                this.items = this.items.filter(item => String(item.id) !== strId);
                this.save();
                this.updateUI();
                this.showToast(product.name || 'Item', false);
                return false;
            } else {
                const itemToAdd = {
                    id: strId,
                    name: product.name || 'Editorial Garment',
                    category: product.category || 'Collection',
                    price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 99,
                    img: product.img || './src/Clothes/7/1.png',
                    addedAt: Date.now()
                };
                this.items.unshift(itemToAdd);
                this.save();
                this.updateUI();
                this.showToast(itemToAdd.name, true);
                return true;
            }
        },

        remove(id) {
            const strId = String(id);
            const item = this.items.find(it => String(it.id) === strId);
            this.items = this.items.filter(it => String(it.id) !== strId);
            this.save();
            this.updateUI();
            if (item) {
                this.showToast(item.name, false);
            }
        },

        clearAll() {
            this.items = [];
            this.save();
            this.updateUI();
        },

        updateUI() {
            // 1. Update header badges
            const count = this.items.length;
            const badges = document.querySelectorAll('#navFavCount, .fav-nav-badge, [data-fav-counter]');
            badges.forEach(badge => {
                badge.textContent = count > 0 ? count : '0';
                badge.style.display = count > 0 ? 'inline-flex' : 'none';
            });

            // 2. Update card favourite buttons
            const favButtons = document.querySelectorAll('.card-fav-btn, .bag-photo-fav-btn, [data-fav-id]');
            favButtons.forEach(btn => {
                const id = btn.dataset.favId || btn.dataset.id || btn.closest('[data-id]')?.dataset.id;
                if (id) {
                    if (this.has(id)) {
                        btn.classList.add('is-active');
                    } else {
                        btn.classList.remove('is-active');
                    }
                }
            });
        },

        showToast(name, isAdded) {
            let toast = document.getElementById('xivFavToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'xivFavToast';
                toast.className = 'xiv-fav-toast';
                document.body.appendChild(toast);
            }

            const iconHtml = isAdded
                ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="#e11d48"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
                : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#71717a" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

            const message = isAdded ? `Added to Favourites` : `Removed from Favourites`;

            toast.innerHTML = `
                <span class="fav-toast-icon">${iconHtml}</span>
                <div class="fav-toast-text">
                    <span class="fav-toast-title">${escapeHtml(name)}</span>
                    <span class="fav-toast-msg">${message}</span>
                </div>
            `;

            toast.classList.remove('is-visible');
            void toast.offsetWidth;
            toast.classList.add('is-visible');

            if (this._toastTimer) clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => {
                toast.classList.remove('is-visible');
            }, 2800);
        },

        flyParticles(buttonEl) {
            if (!buttonEl) return;
            const rect = buttonEl.getBoundingClientRect();
            const count = 7;

            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.className = 'fav-sparkle-particle';
                p.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="#e11d48"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
                
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                p.style.left = `${x}px`;
                p.style.top = `${y}px`;

                const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
                const dist = 30 + Math.random() * 25;
                p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
                p.style.setProperty('--dy', `${Math.sin(angle) * dist - 15}px`);

                document.body.appendChild(p);

                setTimeout(() => {
                    p.remove();
                }, 800);
            }
        },

        bindGlobalEvents() {
            // Global click listener for favorite toggle buttons in CAPTURE phase
            // Using capture: true guarantees that the heart click is intercepted BEFORE
            // any card click listener, container link, or parent redirect handler can run.
            document.addEventListener('click', (e) => {
                const favBtn = e.target.closest('.card-fav-btn, [data-action="fav"]');
                if (!favBtn) return;

                if (favBtn.dataset.action === 'remove-fav') {
                    // Handled specifically by favourites.js with dismissal animation
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const id = favBtn.dataset.favId || favBtn.dataset.id || favBtn.closest('[data-id]')?.dataset.id;
                if (!id) return;

                // Attempt to extract product data
                let name = favBtn.dataset.name;
                let price = favBtn.dataset.price;
                let img = favBtn.dataset.img;
                let category = favBtn.dataset.category;

                // Look in parent card if not on button
                const card = favBtn.closest('.product-card, .bag-item-card, .ajax-search-item');
                if (card) {
                    if (!name) name = card.querySelector('.product-name, .bag-item-title, .search-card-name')?.textContent?.trim();
                    if (!price) {
                        const priceText = card.querySelector('.price, .bag-item-price, .search-card-price')?.textContent;
                        if (priceText) price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                    }
                    if (!img) img = card.querySelector('img')?.getAttribute('src');
                    if (!category) category = card.querySelector('.category, .bag-item-category, .search-card-cat')?.textContent?.trim();
                }

                const product = {
                    id: id,
                    name: name || `Collection Item #${id}`,
                    price: parseFloat(price) || 99,
                    img: img || `./src/Clothes/7/1.png`,
                    category: category || 'Apparel'
                };

                const added = this.toggle(product);

                // Animations
                favBtn.classList.remove('is-animating');
                void favBtn.offsetWidth;
                favBtn.classList.add('is-animating');

                if (added) {
                    this.flyParticles(favBtn);
                }
            }, true);

            // Route all nav wishlist buttons to favourites.html
            document.addEventListener('click', (e) => {
                const navFavBtn = e.target.closest('#navFavBtn, .favorites, [data-open-favourites]');
                if (!navFavBtn) return;

                // If already on favourites.html, don't renavigate
                if (window.location.pathname.endsWith('favourites.html')) return;

                e.preventDefault();
                window.location.href = 'favourites.html';
            });

            // React to storage events across tabs/windows
            window.addEventListener('storage', (e) => {
                if (e.key === STORAGE_KEY) {
                    this.load();
                    this.updateUI();
                }
            });

            // Initial UI sync after DOM loads
            window.addEventListener('load', () => this.updateUI());
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Expose globally
    window.FavouritesManager = FavouritesManager;
    FavouritesManager.init();
})();
