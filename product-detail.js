/**
 * PRODUCT DETAILS PAGE (PDP) CONTROLLER
 * Loads garment data dynamically from bd.json based on URL ?id=...
 * Supports thumbnail angle switching, size & color selection, size guide,
 * and synchronized Cart / Visa checkout.
 */

(function () {
    'use strict';

    const PDPController = {
        item: null,
        selectedAngleIdx: 0,
        selectedColor: null,
        selectedSize: 'XS',

        async init() {
            const urlParams = new URLSearchParams(window.location.search);
            const targetId = parseInt(urlParams.get('id'), 10) || 1; // Default to ID 1

            await this.loadItem(targetId);
            this.bindEvents();
            this.bindHeroZoom();
            this.bindSizeGuide();
        },

        async loadItem(id) {
            try {
                const res = await fetch('./bd.json');
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const items = await res.json();
                this.item = items.find(p => p.id === id) || items[0];
            } catch (err) {
                console.warn('PDP: Falling back to static data', err);
                this.item = {
                    id: 2,
                    name: "Basic Slim Fit T-Shirt",
                    category: "Cotton T-Shirt",
                    price: 199,
                    description: "Premium Egyptian cotton slim-fit plain t-shirt with ribbed crewneck.",
                    img: [
                        "./src/Clothes/8/1.png",
                        "./src/Clothes/8/2.png",
                        "./src/Clothes/8/3.png",
                        "./src/Clothes/8/4.png",
                        "./src/Clothes/8/5.png"
                    ],
                    colors: ["#1E1E1E", "#D9D9D9", "#FFFFFF", "#A6D6CA", "#B9C1E8"],
                    sizes: ["XS", "S", "M", "L", "XL", "2X"],
                    inStock: true
                };
            }

            this.render();
        },

        render() {
            const item = this.item;
            if (!item) return;

            // 1. Titles & Meta
            document.title = `${item.name} — XIV STORE`;
            const bcTitle = document.getElementById('pdpBreadcrumbTitle');
            if (bcTitle) bcTitle.textContent = item.name;

            const titleEl = document.getElementById('pdpTitle');
            if (titleEl) titleEl.textContent = item.name;

            const priceEl = document.getElementById('pdpPrice');
            if (priceEl) priceEl.textContent = `$${item.price}`;

            const descEl = document.getElementById('pdpDescription');
            if (descEl) descEl.textContent = item.description || "Relaxed-fit luxury tailoring with premium fabric and editorial drape.";

            // 2. Images & Thumbnails
            const images = Array.isArray(item.img) ? item.img : [item.img];
            const heroImg = document.getElementById('pdpHeroImage');
            if (heroImg && images.length > 0) {
                heroImg.src = images[0];
                heroImg.alt = item.name;
            }

            const thumbsRail = document.getElementById('pdpThumbsRail');
            if (thumbsRail) {
                thumbsRail.innerHTML = images.map((src, idx) => `
                    <button type="button" class="pdp-thumb-btn ${idx === 0 ? 'is-active' : ''}" data-idx="${idx}" aria-label="Angle ${idx + 1}">
                        <img src="${src}" alt="${escapeHtml(item.name)} angle ${idx + 1}" loading="lazy" />
                    </button>
                `).join('');
            }

            // 3. Color Swatches
            const colorsRow = document.getElementById('pdpColorsRow');
            if (colorsRow) {
                const colorsList = Array.isArray(item.colors) && item.colors.length > 0
                    ? item.colors
                    : ["#1E1E1E", "#D4D3CD", "#A6D6CA", "#FFFFFF", "#B9C1E8"];

                this.selectedColor = colorsList[0];

                colorsRow.innerHTML = colorsList.map((hex, i) => {
                    const isSlashed = i >= 4; // Out-of-stock slash demonstration
                    return `
                        <button type="button" class="pdp-color-swatch ${i === 0 ? 'is-active' : ''} ${isSlashed ? 'is-slashed' : ''}"
                            style="background-color: ${hex};" data-color="${hex}" aria-label="Color ${i + 1}"></button>
                    `;
                }).join('');
            }

            // 4. Size Buttons
            const sizesRow = document.getElementById('pdpSizesRow');
            if (sizesRow) {
                const allSizes = ["XS", "S", "M", "L", "XL", "2X"];
                const availableSizes = item.sizes || allSizes;

                // Pick first available size
                this.selectedSize = availableSizes[0] || "XS";

                sizesRow.innerHTML = allSizes.map(s => {
                    const isAvailable = availableSizes.includes(s) || (s === '2X' && availableSizes.includes('XXL'));
                    const isSelected = s === this.selectedSize;
                    return `
                        <button type="button" class="pdp-size-btn ${isSelected ? 'is-active' : ''} ${!isAvailable ? 'is-disabled' : ''}"
                            data-size="${s}" ${!isAvailable ? 'disabled' : ''}>
                            ${s}
                        </button>
                    `;
                }).join('');
            }

            // 5. Stock Status
            const stockBox = document.getElementById('pdpStockStatus');
            if (stockBox) {
                if (!item.inStock) {
                    stockBox.classList.add('is-out-of-stock');
                    stockBox.innerHTML = `
                        <span class="stock-dot"></span>
                        <span class="stock-text">Temporarily out of stock</span>
                    `;
                } else {
                    stockBox.classList.remove('is-out-of-stock');
                    stockBox.innerHTML = `
                        <span class="stock-dot"></span>
                        <span class="stock-text">In stock & ready to ship</span>
                    `;
                }
            }
        },

        bindEvents() {
            // Thumbnail selection
            const thumbsRail = document.getElementById('pdpThumbsRail');
            const heroImg = document.getElementById('pdpHeroImage');

            if (thumbsRail) {
                thumbsRail.addEventListener('click', (e) => {
                    const btn = e.target.closest('.pdp-thumb-btn');
                    if (!btn) return;

                    const idx = parseInt(btn.dataset.idx, 10);
                    const images = Array.isArray(this.item?.img) ? this.item.img : [this.item?.img];

                    if (heroImg && images[idx]) {
                        const wrap = document.getElementById('heroImageWrap');
                        wrap?.classList.remove('is-zoomed');
                        heroImg.style.opacity = '0.4';
                        heroImg.style.transform = 'scale(0.98)';
                        heroImg.style.transformOrigin = 'center center';
                        setTimeout(() => {
                            heroImg.src = images[idx];
                            heroImg.style.opacity = '1';
                            heroImg.style.transform = 'scale(1)';
                        }, 120);
                    }

                    thumbsRail.querySelectorAll('.pdp-thumb-btn').forEach((b, i) => {
                        b.classList.toggle('is-active', i === idx);
                    });
                    this.selectedAngleIdx = idx;
                });
            }

            // Color Swatch Selection
            const colorsRow = document.getElementById('pdpColorsRow');
            if (colorsRow) {
                colorsRow.addEventListener('click', (e) => {
                    const swatch = e.target.closest('.pdp-color-swatch');
                    if (!swatch) return;

                    colorsRow.querySelectorAll('.pdp-color-swatch').forEach(s => s.classList.remove('is-active'));
                    swatch.classList.add('is-active');
                    this.selectedColor = swatch.dataset.color;
                });
            }

            // Size Button Selection
            const sizesRow = document.getElementById('pdpSizesRow');
            if (sizesRow) {
                sizesRow.addEventListener('click', (e) => {
                    const btn = e.target.closest('.pdp-size-btn:not(.is-disabled)');
                    if (!btn) return;

                    sizesRow.querySelectorAll('.pdp-size-btn').forEach(s => s.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    this.selectedSize = btn.dataset.size;
                });
            }

            // Wishlist Toggle
            const wishBtn = document.getElementById('pdpWishlistBtn');
            if (wishBtn) {
                if (window.FavouritesManager && this.item && window.FavouritesManager.has(this.item.id)) {
                    wishBtn.classList.add('is-saved');
                }
                wishBtn.addEventListener('click', () => {
                    if (this.item && window.FavouritesManager) {
                        const product = {
                            id: String(this.item.id),
                            name: this.item.name,
                            category: this.item.category,
                            price: this.item.price,
                            img: Array.isArray(this.item.img) ? this.item.img[0] : this.item.img
                        };
                        const added = window.FavouritesManager.toggle(product);
                        wishBtn.classList.toggle('is-saved', added);
                    } else {
                        wishBtn.classList.toggle('is-saved');
                    }
                });
            }

            // Main ADD Button
            const addBtn = document.getElementById('pdpAddBtn');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    if (!this.item) return;

                    const product = {
                        id: String(this.item.id),
                        name: this.item.name,
                        category: this.item.category,
                        price: this.item.price,
                        img: Array.isArray(this.item.img) ? this.item.img[0] : this.item.img,
                        size: this.selectedSize || 'M',
                        color: this.selectedColor || '#111111'
                    };

                    CartManager.addItem(product, null);

                    // Button feedback animation
                    addBtn.classList.add('is-added');
                    const btnText = addBtn.querySelector('.btn-text');
                    if (btnText) btnText.textContent = 'ADDED TO BAG ✓';

                    setTimeout(() => {
                        addBtn.classList.remove('is-added');
                        if (btnText) btnText.textContent = 'ADD';
                    }, 1400);
                });
            }
        },

        bindSizeGuide() {
            const modal = document.getElementById('sizeGuideModal');
            const trigger = document.getElementById('pdpSizeGuideTrigger');
            const closeBtn = document.getElementById('sizeGuideClose');

            if (trigger && modal) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    modal.classList.add('is-open');
                    document.body.style.overflow = 'hidden';
                });
            }

            if (closeBtn && modal) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('is-open');
                    document.body.style.overflow = '';
                });
            }

            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('is-open');
                        document.body.style.overflow = '';
                    }
                });
            }

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
                    modal.classList.remove('is-open');
                    document.body.style.overflow = '';
                }
            });
        },

        // --- Interactive Precision E-Commerce Zoom on Mouse Hover ---
        bindHeroZoom() {
            const wrap = document.getElementById('heroImageWrap');
            const img = document.getElementById('pdpHeroImage');
            if (!wrap || !img) return;

            let isZoomed = false;
            let rafId = null;

            // Updates the transform-origin based on cursor position relative to container
            const updateZoomPosition = (e) => {
                const rect = wrap.getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) return;

                const relX = ((e.clientX - rect.left) / rect.width) * 100;
                const relY = ((e.clientY - rect.top) / rect.height) * 100;

                const clampedX = Math.max(0, Math.min(100, relX));
                const clampedY = Math.max(0, Math.min(100, relY));

                img.style.transformOrigin = `${clampedX.toFixed(2)}% ${clampedY.toFixed(2)}%`;
            };

            wrap.addEventListener('mouseenter', (e) => {
                // Skip on touch-only devices to preserve native page scroll
                if (window.matchMedia('(hover: none)').matches) return;

                isZoomed = true;
                wrap.classList.add('is-zoomed');
                updateZoomPosition(e);

                // Fluid zoom-in transition
                img.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.08s ease-out';
                img.style.transform = 'scale(2.35)';
            });

            wrap.addEventListener('mousemove', (e) => {
                if (!isZoomed) return;
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    updateZoomPosition(e);
                });
            });

            wrap.addEventListener('mouseleave', () => {
                if (!isZoomed) return;
                isZoomed = false;
                wrap.classList.remove('is-zoomed');
                if (rafId) cancelAnimationFrame(rafId);

                // Smooth release back to original 1:1 scale
                img.style.transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.38s cubic-bezier(0.16, 1, 0.3, 1)';
                img.style.transform = 'scale(1)';

                setTimeout(() => {
                    if (!isZoomed) {
                        img.style.transformOrigin = 'center center';
                    }
                }, 380);
            });
        }
    };


    // =========================================================================
    // EDITORIAL CART MANAGER (SYNCHRONIZED VIA LOCALSTORAGE)
    // =========================================================================
    const CartManager = {
        items: [],

        init() {
            this.overlay = document.getElementById('cartDrawerOverlay');
            this.drawer = document.getElementById('cartDrawer');
            this.itemsList = document.getElementById('cartItemsList');
            this.subtotalEl = document.getElementById('cartSubtotal');
            this.countBadge = document.getElementById('cartCountBadge');
            this.navCountBadge = document.getElementById('navCartCount');
            this.toast = document.getElementById('cartToast');
            this.checkoutBtn = document.getElementById('checkoutBtn');

            try {
                const saved = localStorage.getItem('xiv_cart_items');
                if (saved) {
                    this.items = JSON.parse(saved);
                }
            } catch (e) {
                console.warn('Cart: could not restore', e);
            }

            this.bindEvents();
            this.render();
        },

        saveToStorage() {
            try {
                localStorage.setItem('xiv_cart_items', JSON.stringify(this.items));
            } catch (e) {
                console.warn('Cart: could not save', e);
            }
        },

        bindEvents() {
            const navBtn = document.getElementById('navCartBtn');
            if (navBtn) {
                navBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'checkout.html';
                });
            }

            const closeBtn = document.getElementById('cartCloseBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }

            const continueBtn = document.getElementById('continueShoppingBtn');
            if (continueBtn) {
                continueBtn.addEventListener('click', () => this.close());
            }

            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) this.close();
                });
            }

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay && this.overlay.classList.contains('is-open')) {
                    this.close();
                }
            });

            if (this.checkoutBtn) {
                this.checkoutBtn.addEventListener('click', () => {
                    window.location.href = 'checkout.html';
                });
            }

            const favBtn = document.getElementById('navFavBtn');
            if (favBtn) {
                favBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showToast('Item saved to your Wishlist ♥');
                });
            }
        },

        addItem(product) {
            const existing = this.items.find(i => i.id === product.id && i.size === product.size);
            if (existing) {
                existing.quantity += 1;
            } else {
                this.items.push({ ...product, quantity: 1 });
            }

            this.render();

            if (this.navCountBadge) {
                this.navCountBadge.classList.remove('pulse');
                void this.navCountBadge.offsetWidth;
                this.navCountBadge.classList.add('pulse');
            }

            this.showToast(`${product.name} added to bag`);
        },

        removeItem(id) {
            this.items = this.items.filter(i => i.id !== id);
            this.render();
        },

        updateQty(id, delta) {
            const item = this.items.find(i => i.id === id);
            if (!item) return;

            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.render();
            }
        },

        open() {
            if (this.overlay) {
                this.overlay.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            }
        },

        close() {
            if (this.overlay) {
                this.overlay.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        },

        showToast(msg) {
            if (!this.toast) return;
            const msgEl = this.toast.querySelector('.toast-msg');
            if (msgEl) msgEl.textContent = msg;

            this.toast.classList.add('show');
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => {
                this.toast.classList.remove('show');
            }, 2400);
        },

        render() {
            this.saveToStorage();

            const totalCount = this.items.reduce((sum, it) => sum + it.quantity, 0);
            const totalSum = this.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);

            if (this.countBadge) this.countBadge.textContent = `(${totalCount})`;
            if (this.navCountBadge) {
                this.navCountBadge.textContent = totalCount;
                this.navCountBadge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
            }
            if (this.subtotalEl) this.subtotalEl.textContent = `$${totalSum}`;

            if (!this.itemsList) return;

            if (this.items.length === 0) {
                this.itemsList.innerHTML = `
                    <div class="cart-empty-state">
                        <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <h4>YOUR BAG IS EMPTY</h4>
                        <p>Explore our editorial garments and timeless tailoring.</p>
                    </div>
                `;
                return;
            }

            let html = '';
            this.items.forEach(item => {
                const sizeLabel = item.size ? `Size: ${item.size}` : '';
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-img-wrap">
                            <img src="${item.img}" alt="${escapeHtml(item.name)}" class="cart-item-img" />
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-top">
                                <span class="cart-item-cat">${escapeHtml(item.category)} ${sizeLabel ? '• ' + sizeLabel : ''}</span>
                                <button type="button" class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M1 1L11 11M11 1L1 11" stroke="#888888" stroke-width="1.3" stroke-linecap="round"/>
                                    </svg>
                                </button>
                            </div>
                            <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
                            <div class="cart-item-bottom">
                                <div class="cart-qty-ctrl">
                                    <button type="button" class="qty-btn qty-minus" data-id="${item.id}" aria-label="Decrease">&minus;</button>
                                    <span class="qty-val">${item.quantity}</span>
                                    <button type="button" class="qty-btn qty-plus" data-id="${item.id}" aria-label="Increase">&#43;</button>
                                </div>
                                <span class="cart-item-price">$${item.price * item.quantity}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            this.itemsList.innerHTML = html;

            this.itemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => this.removeItem(btn.dataset.id));
            });

            this.itemsList.querySelectorAll('.qty-minus').forEach(btn => {
                btn.addEventListener('click', () => this.updateQty(btn.dataset.id, -1));
            });

            this.itemsList.querySelectorAll('.qty-plus').forEach(btn => {
                btn.addEventListener('click', () => this.updateQty(btn.dataset.id, 1));
            });
        }
    };


    // =========================================================================
    // VISA CHECKOUT MODAL
    // =========================================================================
    const CheckoutModal = {
        init() {
            this.overlay = document.getElementById('checkoutModalOverlay');
            this.closeBtn = document.getElementById('checkoutModalClose');
            this.formView = document.getElementById('checkoutFormView');
            this.successView = document.getElementById('checkoutSuccessView');
            this.form = document.getElementById('paymentForm');

            this.previewNumber = document.getElementById('cardPreviewNumber');
            this.previewName = document.getElementById('cardPreviewName');
            this.previewExpiry = document.getElementById('cardPreviewExpiry');

            this.inputNumber = document.getElementById('cardNumber');
            this.inputHolder = document.getElementById('cardHolder');
            this.inputExpiry = document.getElementById('cardExpiry');
            this.inputCvv = document.getElementById('cardCvv');

            this.returnBtn = document.getElementById('successReturnBtn');

            this.bindEvents();
        },

        bindEvents() {
            if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());

            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) this.close();
                });
            }

            if (this.returnBtn) {
                this.returnBtn.addEventListener('click', () => {
                    this.close();
                    CartManager.items = [];
                    CartManager.render();
                });
            }

            if (this.inputNumber) {
                this.inputNumber.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
                    let formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                    e.target.value = formatted;
                    if (this.previewNumber) {
                        this.previewNumber.textContent = formatted || '•••• •••• •••• ••••';
                    }
                });
            }

            if (this.inputHolder) {
                this.inputHolder.addEventListener('input', (e) => {
                    if (this.previewName) {
                        this.previewName.textContent = e.target.value.toUpperCase() || 'ALEXANDER SMITH';
                    }
                });
            }

            if (this.inputExpiry) {
                this.inputExpiry.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                    e.target.value = v;
                    if (this.previewExpiry) {
                        this.previewExpiry.textContent = v || '12/28';
                    }
                });
            }

            if (this.form) {
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitPayment();
                });
            }
        },

        open(total) {
            if (!this.overlay) return;
            CartManager.close();

            if (this.formView) this.formView.style.display = 'block';
            if (this.successView) this.successView.style.display = 'none';

            this.overlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        },

        close() {
            if (!this.overlay) return;
            this.overlay.classList.remove('is-open');
            document.body.style.overflow = '';
        },

        submitPayment() {
            const submitBtn = document.getElementById('submitOrderBtn');
            const btnText = submitBtn?.querySelector('.btn-text');
            const spinner = submitBtn?.querySelector('.btn-spinner');

            if (btnText) btnText.style.display = 'none';
            if (spinner) spinner.style.display = 'inline-block';

            setTimeout(() => {
                if (btnText) btnText.style.display = 'inline';
                if (spinner) spinner.style.display = 'none';

                if (this.formView) this.formView.style.display = 'none';
                if (this.successView) this.successView.style.display = 'block';

                const confId = document.getElementById('orderConfirmationId');
                if (confId) {
                    confId.textContent = `#XIV-${Math.floor(10000 + Math.random() * 90000)}`;
                }
            }, 1200);
        }
    };


    // =========================================================================
    // MOBILE NAVIGATION
    // =========================================================================
    const MobileNav = {
        init() {
            this.menuBtn = document.getElementById('mobileMenuBtn');
            this.overlay = document.getElementById('mobileNavOverlay');
            this.closeBtn = document.getElementById('mobileNavClose');

            if (this.menuBtn) {
                this.menuBtn.addEventListener('click', () => {
                    if (this.overlay) this.overlay.classList.add('is-open');
                    document.body.style.overflow = 'hidden';
                });
            }

            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => {
                    if (this.overlay) this.overlay.classList.remove('is-open');
                    document.body.style.overflow = '';
                });
            }

            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) {
                        this.overlay.classList.remove('is-open');
                        document.body.style.overflow = '';
                    }
                });
            }
        }
    };


    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    document.addEventListener('DOMContentLoaded', () => {
        PDPController.init();
        CartManager.init();
        CheckoutModal.init();
        MobileNav.init();
    });

})();
