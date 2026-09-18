/**
 * =========================================================================
 * ПОЛЬЗОВАТЕЛЬСКИЙ ФАЙЛ НАСТРОЕК И ИНИЦИАЛИЗАЦИИ КАРУСЕЛЕЙ (Index.js)
 * =========================================================================
 * 
 * В этом файле вы управляете всеми каруселями на сайте.
 * Каждая карусель создается через вызов `new Carousel({ ... })` с набором простых и понятных параметров (API):
 * 
 * ДОСТУПНЫЕ ПАРАМЕТРЫ КОНФИГУРАЦИИ:
 * - container: Селектор контейнера карусели (обязательно)
 * - prevBtn: Селектор кнопки "Назад"
 * - nextBtn: Селектор кнопки "Вперед"
 * - dataSource: Путь к файлу JSON базы данных (например, './bd.json')
 * - itemsPerSlide: Сколько картинок выводить в каждом слайде (по умолчанию 2)
 * - speed: Скорость перемещения в миллисекундах (например: 800 мс)
 * - interval: Задержка автопрокрутки в мс (3000 мс = 3 секунды)
 * - slidesToScroll: По сколько блоков перелистывать за 1 шаг
 * - autoplay: Автоматическое перелистывание (true / false)
 * - infinite: Бесконечный цикл в одну сторону без отката (true / false)
 * - pauseOnHover: Пауза при наведении мыши (true / false)
 * - responsive: Настройки адаптивности под разную ширину экрана
 */

document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // 1. ИНИЦИАЛИЗАЦИЯ КАРУСЕЛИ HERO СЕКЦИИ
    // =====================================================================
    window.heroCarousel = new Carousel({
        // Элементы и селекторы
        container: '.hero .carousel',
        prevBtn: '.hero .carousel-nav .prev',
        nextBtn: '.hero .carousel-nav .next',
        
        // Источник данных и количество картинок в блоке
        dataSource: './bd.json',        // Путь к базе данных (берёт 1-ю картинку каждого товара)
        itemsPerSlide: 2,               // Отображать по 2 картинки в одном слайде
        
        // Настройки анимации и скорости
        speed: 800,                     // Плавность/скорость анимации (в миллисекундах)
        interval: 3000,                 // Пауза между перелистываниями (3000 мс = 3 сек)
        slidesToScroll: 1,              // Перелистывать по 1 блоку за раз
        
        // Режимы работы
        autoplay: true,                 // Автоматическое перелистывание
        infinite: true,                 // Бесконечный цикл в одну сторону (без перемотки назад)
        pauseOnHover: true,             // Ставить на паузу при наведении курсора
        
        // Мобильная адаптация (Responsive API)
        responsive: [
            {
                breakpoint: 768,        // На экранах меньше или равных 768px
                settings: {
                    itemsPerSlide: 1,   // Показывать по 1 картинке в блоке
                    speed: 500          // Уменьшенное время анимации
                }
            }
        ]
    });

    // 1.0 "Go To Shop" Hero Navigation Handler
    const heroShopBtn = document.querySelector('.carousel-nav .shop-btn');
    if (heroShopBtn) {
        heroShopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'products.html';
        });
    }

    // =====================================================================
    // 1.1 ИНИЦИАЛИЗАЦИЯ КАРУСЕЛИ СЕКЦИИ "NEW THIS WEEK"
    // =====================================================================
    window.newThisWeekCarousel = new Carousel({
        container: '.new-this-week .products-carousel',
        prevBtn: '.new-this-week .section-nav-arrows .prev',
        nextBtn: '.new-this-week .section-nav-arrows .next',
        speed: 800,
        autoplay: false,
        infinite: true,
        slidesToScroll: 1
    });

    // Universal PDP redirection for "NEW THIS WEEK" cards
    const newThisWeekSectionEl = document.getElementById('newThisWeekSection');
    if (newThisWeekSectionEl) {
        newThisWeekSectionEl.addEventListener('click', (e) => {
            if (e.target.closest('.card-fav-btn') || e.target.closest('.quick-add') || e.target.closest('.section-nav-arrows') || e.target.closest('.see-all')) return;
            const card = e.target.closest('.product-card');
            if (card) {
                const addBtn = card.querySelector('.quick-add');
                const id = addBtn ? (addBtn.dataset.id || '1') : '1';
                window.location.href = `product-detail.html?id=${id}`;
            }
        });
    }

    // =====================================================================
    // 1.2 HIGH FASHION EDITORIAL MOBILE NAVIGATION DRAWER CONTROLLER
    // =====================================================================
    const MobileNavManager = {
        init() {
            this.menuBtn = document.getElementById('mobileMenuBtn');
            this.overlay = document.getElementById('mobileNavOverlay');
            this.closeBtn = document.getElementById('mobileNavClose');
            this.links = document.querySelectorAll('.mobile-link');
            this.catBtns = document.querySelectorAll('.mobile-cat-btn');
            this.drawerCartBtn = document.getElementById('mobileDrawerCartBtn');
            this.drawerFavBtn = document.getElementById('mobileDrawerFavBtn');

            this.bindEvents();
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
                const cartOpen = window.CartManager?.overlay?.classList.contains('is-open');
                const checkoutOpen = window.CheckoutModal?.overlay?.classList.contains('is-open');
                if (!cartOpen && !checkoutOpen) {
                    document.body.style.overflow = '';
                }
            }
        },

        bindEvents() {
            if (this.menuBtn) {
                this.menuBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.open();
                });
            }

            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();
                });
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

            // Navigation links inside drawer
            this.links.forEach(link => {
                link.addEventListener('click', (e) => {
                    const action = link.dataset.action;
                    const filter = link.dataset.filter;

                    this.close();

                    if (filter && window.XIVCollectionsManager) {
                        window.XIVCollectionsManager.setCategory(filter);
                    }

                    if (action === 'new') {
                        const el = document.getElementById('newThisWeekSection');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else if (action === 'collections') {
                        const el = document.getElementById('collectionsSection');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else if (action === 'lookbook') {
                        const el = document.getElementById('dzLookbook');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else if (action === 'home') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            });

            // Categories buttons inside drawer (MEN, WOMEN, KIDS)
            this.catBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetCat = btn.dataset.cat;
                    this.close();

                    if (window.XIVCollectionsManager) {
                        window.XIVCollectionsManager.setCategory(targetCat);
                    }

                    const el = document.getElementById('collectionsSection');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                });
            });

            // Bag button inside drawer
            if (this.drawerCartBtn) {
                this.drawerCartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();
                    window.location.href = 'checkout.html';
                });
            }

            // Favorites button inside drawer
            if (this.drawerFavBtn) {
                this.drawerFavBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();
                    if (window.CartManager) {
                        window.CartManager.showToast('Item saved to your Wishlist ♥');
                    }
                });
            }
        }
    };

    window.MobileNavManager = MobileNavManager;
    MobileNavManager.init();

    // =====================================================================
    // 2. HIGH FASHION EDITORIAL CART MANAGER
    // =====================================================================
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
                console.warn('CartManager: could not restore cart', e);
            }

            this.bindEvents();
            this.render();
        },

        saveToStorage() {
            try {
                localStorage.setItem('xiv_cart_items', JSON.stringify(this.items));
            } catch (e) {
                console.warn('CartManager: could not save cart', e);
            }
        },

        bindEvents() {
            // Кнопка открытия корзины в правом верхнем углу (шапка) -> переход на Checkout
            const navCartBtn = document.getElementById('navCartBtn');
            if (navCartBtn) {
                navCartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = 'checkout.html';
                });
            }

            // Кнопка закрытия корзины
            const closeBtn = document.getElementById('cartCloseBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();
                });
            }

            // Кнопка продолжения покупок
            const continueBtn = document.getElementById('continueShoppingBtn');
            if (continueBtn) {
                continueBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();
                });
            }

            // Клик вне боковой панели (по затемнению)
            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) {
                        this.close();
                    }
                });
            }

            // Закрытие по клавише Escape
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay && this.overlay.classList.contains('is-open')) {
                    this.close();
                }
            });

            // Клик по кнопке "+" в карточках товаров
            document.addEventListener('click', (e) => {
                const addBtn = e.target.closest('.quick-add');
                if (addBtn) {
                    e.preventDefault();
                    e.stopPropagation();

                    const product = {
                        id: addBtn.dataset.id || String(Date.now()),
                        name: addBtn.dataset.name || 'Editorial Garment',
                        category: addBtn.dataset.category || 'Apparel',
                        price: parseFloat(addBtn.dataset.price) || 99,
                        img: addBtn.dataset.img || './src/Clothes/7/1.png'
                    };

                    this.addItem(product, addBtn);
                }
            });

            // Кнопка оформления заказа (переход на Checkout)
            if (this.checkoutBtn) {
                this.checkoutBtn.addEventListener('click', () => {
                    window.location.href = 'checkout.html';
                });
            }
        },

        addItem(product, btnElement) {
            const existing = this.items.find(item => item.id === product.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                this.items.push({ ...product, quantity: 1 });
            }

            this.render();

            // Визуальный фидбек на кнопке "+"
            if (btnElement) {
                btnElement.classList.add('added');
                btnElement.innerHTML = `
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6L5 9L10 3" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
                setTimeout(() => {
                    btnElement.classList.remove('added');
                    btnElement.innerHTML = `
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 1V11M1 6H11" stroke="#333333" stroke-width="1.2" stroke-linecap="round"/>
                        </svg>
                    `;
                }, 1200);
            }

            // Анимация бейджа в шапке
            if (this.navCountBadge) {
                this.navCountBadge.classList.remove('pulse');
                void this.navCountBadge.offsetWidth;
                this.navCountBadge.classList.add('pulse');
            }

            this.showToast(`${product.name} added to bag`);
        },

        removeItem(id) {
            this.items = this.items.filter(item => item.id !== id);
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

        showToast(message) {
            if (!this.toast) return;
            const msgEl = this.toast.querySelector('.toast-msg');
            if (msgEl) msgEl.textContent = message;

            this.toast.classList.add('show');
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => {
                this.toast.classList.remove('show');
            }, 2500);
        },

        render() {
            this.saveToStorage();
            const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalSum = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Обновление бейджей количества
            if (this.countBadge) this.countBadge.textContent = `(${totalCount})`;
            if (this.navCountBadge) {
                this.navCountBadge.textContent = totalCount;
                this.navCountBadge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
            }
            const mobileDrawerCount = document.getElementById('mobileDrawerCartCount');
            if (mobileDrawerCount) {
                mobileDrawerCount.textContent = totalCount;
            }
            if (this.subtotalEl) this.subtotalEl.textContent = `$${totalSum}`;

            // Рендер списка товаров или пустого состояния
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
                        <p>Discover our latest collection and timeless pieces for the season.</p>
                        <button class="shop-now-btn" id="emptyShopBtn">EXPLORE COLLECTION</button>
                    </div>
                `;

                const emptyShopBtn = document.getElementById('emptyShopBtn');
                if (emptyShopBtn) {
                    emptyShopBtn.addEventListener('click', () => this.close());
                }

                if (this.checkoutBtn) {
                    this.checkoutBtn.style.opacity = '0.5';
                    this.checkoutBtn.style.pointerEvents = 'none';
                }
            } else {
                if (this.checkoutBtn) {
                    this.checkoutBtn.style.opacity = '1';
                    this.checkoutBtn.style.pointerEvents = 'auto';
                }

                let html = '';
                this.items.forEach(item => {
                    html += `
                        <div class="cart-item" data-id="${item.id}">
                            <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                            <div class="cart-item-info">
                                <span class="cart-item-cat">${item.category}</span>
                                <h4 class="cart-item-name">${item.name}</h4>
                                <div class="cart-item-bottom">
                                    <div class="qty-controls">
                                        <button class="qty-minus" aria-label="Decrease quantity" data-id="${item.id}">−</button>
                                        <span>${item.quantity}</span>
                                        <button class="qty-plus" aria-label="Increase quantity" data-id="${item.id}">+</button>
                                    </div>
                                    <span class="cart-item-price">$${item.price * item.quantity}</span>
                                </div>
                                <button class="cart-item-remove" data-id="${item.id}">Remove</button>
                            </div>
                        </div>
                    `;
                });

                this.itemsList.innerHTML = html;

                this.itemsList.querySelectorAll('.qty-minus').forEach(btn => {
                    btn.addEventListener('click', () => this.updateQty(btn.dataset.id, -1));
                });

                this.itemsList.querySelectorAll('.qty-plus').forEach(btn => {
                    btn.addEventListener('click', () => this.updateQty(btn.dataset.id, 1));
                });

                this.itemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
                    btn.addEventListener('click', () => this.removeItem(btn.dataset.id));
                });
            }
        }
    };

    window.CartManager = CartManager;
    CartManager.init();

    // =====================================================================
    // 2.1 VISA CHECKOUT MODAL CONTROLLER & 3S SUCCESS ANIMATION
    // =====================================================================
    const CheckoutModal = {
        isProcessing: false,
        currentTotal: 0,

        init() {
            this.overlay = document.getElementById('checkoutModalOverlay');
            this.modal = document.getElementById('checkoutModal');
            this.closeBtn = document.getElementById('checkoutModalClose');
            this.formView = document.getElementById('checkoutFormView');
            this.processView = document.getElementById('checkoutProcessView');
            this.form = document.getElementById('checkoutForm');

            // Form Inputs
            this.cardNumInput = document.getElementById('cardNumberInput');
            this.cardNameInput = document.getElementById('cardNameInput');
            this.cardExpInput = document.getElementById('cardExpiryInput');
            this.cardCvvInput = document.getElementById('cardCvvInput');
            this.modalPayAmount = document.getElementById('modalPayAmount');

            // Live Card Preview Elements
            this.previewNumber = document.getElementById('cardPreviewNumber');
            this.previewName = document.getElementById('cardPreviewName');
            this.previewExpiry = document.getElementById('cardPreviewExpiry');

            // Animation & Status Elements
            this.spinnerContainer = document.getElementById('spinnerCheckmarkContainer');
            this.statusProcessing = document.getElementById('statusStateProcessing');
            this.statusSuccess = document.getElementById('statusStateSuccess');
            this.receiptOrderId = document.getElementById('receiptOrderId');
            this.receiptAmount = document.getElementById('receiptAmount');
            this.receiptCard = document.getElementById('receiptCard');
            this.paymentDoneBtn = document.getElementById('paymentDoneBtn');

            this.bindEvents();
        },

        bindEvents() {
            // Close Button
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();
                });
            }

            // Click Overlay to Close
            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay && !this.isProcessing) {
                        this.close();
                    }
                });
            }

            // Escape key
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay && this.overlay.classList.contains('is-open') && !this.isProcessing) {
                    this.close();
                }
            });

            // Card Number Input Formatting & Masking
            if (this.cardNumInput) {
                this.cardNumInput.addEventListener('input', (e) => {
                    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const formatted = rawVal.match(/.{1,4}/g)?.join(' ') || rawVal;
                    e.target.value = formatted;

                    if (this.previewNumber) {
                        this.previewNumber.textContent = formatted || '•••• •••• •••• ••••';
                    }
                });
            }

            // Cardholder Name Formatting
            if (this.cardNameInput) {
                this.cardNameInput.addEventListener('input', (e) => {
                    const val = e.target.value.toUpperCase();
                    e.target.value = val;

                    if (this.previewName) {
                        this.previewName.textContent = val.trim() || 'ALEXANDER SMITH';
                    }
                });
            }

            // Expiry Date Formatting (MM/YY)
            if (this.cardExpInput) {
                this.cardExpInput.addEventListener('input', (e) => {
                    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (val.length >= 2) {
                        val = val.slice(0, 2) + '/' + val.slice(2);
                    }
                    e.target.value = val;

                    if (this.previewExpiry) {
                        this.previewExpiry.textContent = val || '12/28';
                    }
                });
            }

            // CVV Formatting
            if (this.cardCvvInput) {
                this.cardCvvInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
                });
            }

            // Form Submit (Payment Trigger)
            if (this.form) {
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.startPayment();
                });
            }

            // Done / Continue Shopping Button
            if (this.paymentDoneBtn) {
                this.paymentDoneBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();
                    if (CartManager) {
                        CartManager.close();
                    }
                });
            }
        },

        open(totalAmount) {
            this.currentTotal = totalAmount || 0;
            if (this.modalPayAmount) {
                this.modalPayAmount.textContent = `$${this.currentTotal}`;
            }

            // Reset views & animation states
            this.isProcessing = false;
            if (this.formView) {
                this.formView.classList.remove('is-hidden', 'is-exiting');
            }
            if (this.processView) {
                this.processView.classList.add('is-hidden');
            }
            if (this.spinnerContainer) {
                this.spinnerContainer.classList.remove('is-completed');
            }
            if (this.statusProcessing) {
                this.statusProcessing.classList.remove('is-hidden');
            }
            if (this.statusSuccess) {
                this.statusSuccess.classList.add('is-hidden');
            }

            // If inputs are empty, populate friendly initial test values
            if (this.cardNumInput && !this.cardNumInput.value) {
                this.cardNumInput.value = '4400 8592 1039 4821';
                if (this.previewNumber) this.previewNumber.textContent = '4400 8592 1039 4821';
            }
            if (this.cardNameInput && !this.cardNameInput.value) {
                this.cardNameInput.value = 'ALEXANDER SMITH';
                if (this.previewName) this.previewName.textContent = 'ALEXANDER SMITH';
            }
            if (this.cardExpInput && !this.cardExpInput.value) {
                this.cardExpInput.value = '12/28';
                if (this.previewExpiry) this.previewExpiry.textContent = '12/28';
            }
            if (this.cardCvvInput && !this.cardCvvInput.value) {
                this.cardCvvInput.value = '842';
            }

            // Show Overlay
            if (this.overlay) {
                this.overlay.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            }

            setTimeout(() => {
                if (this.cardNumInput) this.cardNumInput.focus();
            }, 150);
        },

        close() {
            if (this.isProcessing) return; // Prevent closing mid-transaction
            if (this.overlay) {
                this.overlay.classList.remove('is-open');
                // Restore body scrolling if cart drawer is also closed
                const cartOpen = CartManager.overlay && CartManager.overlay.classList.contains('is-open');
                if (!cartOpen) {
                    document.body.style.overflow = '';
                }
            }
        },

        startPayment() {
            if (this.isProcessing) return;
            this.isProcessing = true;

            // 1. Smoothly fade out the card form
            if (this.formView) {
                this.formView.classList.add('is-exiting');
            }

            setTimeout(() => {
                if (this.formView) {
                    this.formView.classList.add('is-hidden');
                    this.formView.classList.remove('is-exiting');
                }
                if (this.processView) {
                    this.processView.classList.remove('is-hidden');
                }

                // 2. Make sure spinner is in active chasing/rotating state
                if (this.spinnerContainer) {
                    this.spinnerContainer.classList.remove('is-completed');
                }
                if (this.statusProcessing) {
                    this.statusProcessing.classList.remove('is-hidden');
                }
                if (this.statusSuccess) {
                    this.statusSuccess.classList.add('is-hidden');
                }

                // 3. Exactly 3 Seconds of self-chasing green ring rotation
                setTimeout(() => {
                    // Ring catches up, circle fills solid green, softly bounces, white checkmark draws
                    if (this.spinnerContainer) {
                        this.spinnerContainer.classList.add('is-completed');
                    }

                    // Populate confirmation order details
                    const digits = (this.cardNumInput.value || '').replace(/\D/g, '');
                    const last4 = digits.slice(-4) || '4400';
                    const orderNum = 'ORD-' + Math.floor(10000 + Math.random() * 90000);

                    if (this.receiptOrderId) this.receiptOrderId.textContent = '#' + orderNum;
                    if (this.receiptAmount) this.receiptAmount.textContent = `$${this.currentTotal}`;
                    if (this.receiptCard) this.receiptCard.textContent = `Visa •••• ${last4}`;

                    // Smooth transition to Success status text and receipt card
                    setTimeout(() => {
                        if (this.statusProcessing) this.statusProcessing.classList.add('is-hidden');
                        if (this.statusSuccess) this.statusSuccess.classList.remove('is-hidden');

                        // Clear cart items and refresh UI
                        if (CartManager) {
                            CartManager.items = [];
                            CartManager.render();
                        }
                        this.isProcessing = false;
                    }, 400);

                }, 3000); // 3000ms = 3.0 seconds verification

            }, 250);
        }
    };

    window.CheckoutModal = CheckoutModal;
    CheckoutModal.init();

    // =====================================================================
    // 2.2 XIV COLLECTIONS 23-24 CONTROLLER & LOOKBOOK CATALOG MODAL
    // =====================================================================
    const XIVCollectionsManager = {
        items: [],
        currentFilter: 'ALL',
        currentSort: 'default',

        async init() {
            this.grid = document.getElementById('xivGrid');
            this.filterTabs = document.querySelectorAll('.xiv-tab');
            this.sortTrigger = document.getElementById('xivSortTrigger');
            this.sortDropdown = document.getElementById('xivSortDropdown');
            this.sortMenu = document.getElementById('xivSortMenu');
            this.sortLabel = document.getElementById('xivSortLabel');
            this.moreBtn = document.getElementById('xivMoreBtn');

            // Catalog Modal Elements
            this.catalogOverlay = document.getElementById('catalogModalOverlay');
            this.catalogGrid = document.getElementById('catalogModalGrid');
            this.catalogCloseBtn = document.getElementById('catalogCloseBtn');
            this.catalogPills = document.querySelectorAll('.cat-pill');

            await this.loadData();
            this.bindEvents();
            this.render();
        },

        async loadData() {
            try {
                const res = await fetch('./bd.json');
                if (res.ok) {
                    this.items = await res.json();
                } else {
                    throw new Error('Failed to load bd.json');
                }
            } catch (err) {
                console.warn('XIVCollections: Using fallback items', err);
                this.items = [
                    { id: 1, gender: 'Men', category: 'Shirts', name: 'Embroidered Seersucker Shirt', price: 149, colorCount: 3, img: ['./src/Clothes/7/1.png'] },
                    { id: 2, gender: 'Men', category: 'T-Shirts', name: 'Basic Slim Fit T-Shirt', price: 199, colorCount: 5, img: ['./src/Clothes/8/1.png'] },
                    { id: 3, gender: 'Men', category: 'T-Shirts', name: 'Blurred Print T-Shirt', price: 169, colorCount: 3, img: ['./src/Clothes/9/1.png'] },
                    { id: 9, gender: 'Women', category: 'Blouse', name: 'Silk Gathered Blouse', price: 249, colorCount: 4, img: ['./src/Clothes/Women/1/1.png'] },
                    { id: 10, gender: 'Women', category: 'Shirts', name: 'Linen Oversized Shirt', price: 189, colorCount: 3, img: ['./src/Clothes/Women/2/1.png'] },
                    { id: 11, gender: 'Women', category: 'Knitwear', name: 'Cashmere Relaxed Jumper', price: 289, colorCount: 5, img: ['./src/Clothes/Women/3/1.png'] },
                    { id: 15, gender: 'KID', category: 'Fleece', name: 'Cozy Fleece Crewneck', price: 129, colorCount: 3, img: ['./src/Clothes/Kid/1/1.png'] },
                    { id: 16, gender: 'KID', category: 'Jackets', name: 'Kids Vintage Chore Jacket', price: 159, colorCount: 4, img: ['./src/Clothes/Kid/2/1.png'] },
                    { id: 17, gender: 'KID', category: 'T-Shirts', name: 'Relaxed Striped T-Shirt', price: 89, colorCount: 2, img: ['./src/Clothes/Kid/3/1.png'] }
                ];
            }
        },

        setCategory(targetCategory) {
            this.filterTabs.forEach(t => {
                const isMatch = t.dataset.filter === targetCategory;
                t.classList.toggle('active', isMatch);
                t.setAttribute('aria-selected', isMatch ? 'true' : 'false');
            });
            this.currentFilter = targetCategory;
            this.render();
        },

        bindEvents() {
            // Category Tabs: (ALL), Men, Women, KID
            this.filterTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.filterTabs.forEach(t => {
                        t.classList.remove('active');
                        t.setAttribute('aria-selected', 'false');
                    });
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');
                    this.currentFilter = tab.dataset.filter;
                    this.render();
                });
            });

            // Category Buttons in Search Section (MEN, WOMEN, KIDS)
            document.querySelectorAll('.search .variants').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let targetCategory = 'ALL';
                    if (btn.classList.contains('var1')) targetCategory = 'Men';
                    else if (btn.classList.contains('var2')) targetCategory = 'Women';
                    else if (btn.classList.contains('var3')) targetCategory = 'KID';

                    this.filterTabs.forEach(t => {
                        const isMatch = t.dataset.filter === targetCategory;
                        t.classList.toggle('active', isMatch);
                        t.setAttribute('aria-selected', isMatch ? 'true' : 'false');
                    });
                    this.currentFilter = targetCategory;
                    this.render();

                    const collectionsSec = document.getElementById('collectionsSection');
                    if (collectionsSec) {
                        collectionsSec.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });

            // Sort Dropdown Toggle
            if (this.sortTrigger && this.sortMenu) {
                this.sortTrigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.sortMenu.classList.toggle('is-open');
                });

                document.addEventListener('click', (e) => {
                    if (this.sortDropdown && !this.sortDropdown.contains(e.target)) {
                        this.sortMenu.classList.remove('is-open');
                    }
                });

                this.sortMenu.querySelectorAll('.sort-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.sortMenu.querySelectorAll('.sort-item').forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        this.currentSort = item.dataset.sort;
                        if (this.sortLabel) {
                            this.sortLabel.textContent = item.dataset.sort === 'default' ? 'Sorts(-)' : item.textContent;
                        }
                        this.sortMenu.classList.remove('is-open');
                        this.render();
                    });
                });
            }

            // Quick add, photo switch and PDP navigation in Grid
            if (this.grid) {
                let startX = 0;
                let isDragging = false;
                let activeCard = null;
                let wasDragged = false;

                this.grid.addEventListener('click', (e) => {
                    const card = e.target.closest('.xiv-card');
                    if (!card) return;

                    const id = parseInt(card.dataset.id, 10);
                    const item = this.items.find(p => p.id === id);
                    if (!item) return;

                    const addBtn = e.target.closest('.xiv-quick-add');
                    if (addBtn) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.CartManager) {
                            const product = {
                                id: String(item.id),
                                name: item.name,
                                category: item.category,
                                price: item.price,
                                img: Array.isArray(item.img) ? item.img[0] : item.img
                            };
                            window.CartManager.addItem(product, addBtn);
                        }
                        return;
                    }

                    // Favourite button click
                    if (e.target.closest('.card-fav-btn')) {
                        e.stopPropagation();
                        return;
                    }

                    // Multi-photo navigation arrows
                    const prevBtn = e.target.closest('.card-nav-prev');
                    const nextBtn = e.target.closest('.card-nav-next');
                    const dot = e.target.closest('.angle-dot');

                    if (prevBtn || nextBtn || dot) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handlePhotoSwitch(card, item, prevBtn ? -1 : (nextBtn ? 1 : null), dot ? parseInt(dot.dataset.idx, 10) : null);
                        return;
                    }

                    // Universal PDP redirection
                    if (!wasDragged) {
                        window.location.href = `product-detail.html?id=${id}`;
                    }
                });

                // Multi-Photo swipe and drag gesture ("зажатием и перелистованием")
                this.grid.addEventListener('pointerdown', (e) => {
                    const wrap = e.target.closest('.xiv-card-img-wrap');
                    if (!wrap || e.target.closest('.xiv-quick-add') || e.target.closest('.card-fav-btn') || e.target.closest('.card-nav-prev') || e.target.closest('.card-nav-next')) return;
                    startX = e.clientX;
                    isDragging = true;
                    wasDragged = false;
                    activeCard = wrap.closest('.xiv-card');
                });

                window.addEventListener('pointermove', (e) => {
                    if (!isDragging || !activeCard) return;
                    const dx = e.clientX - startX;
                    if (Math.abs(dx) > 6) wasDragged = true;
                });

                window.addEventListener('pointerup', (e) => {
                    if (!isDragging || !activeCard) return;
                    isDragging = false;
                    const dx = e.clientX - startX;
                    if (wasDragged && Math.abs(dx) > 28) {
                        const id = parseInt(activeCard.dataset.id, 10);
                        const item = this.items.find(p => p.id === id);
                        if (item) {
                            this.handlePhotoSwitch(activeCard, item, dx < 0 ? 1 : -1, null);
                        }
                    }
                    setTimeout(() => {
                        wasDragged = false;
                    }, 120);
                    activeCard = null;
                });
            }

            // More Button (Navigates to dedicated products page)
            if (this.moreBtn) {
                this.moreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'products.html';
                });
            }

            // Catalog Modal Events
            if (this.catalogCloseBtn) {
                this.catalogCloseBtn.addEventListener('click', () => this.closeCatalog());
            }

            if (this.catalogOverlay) {
                this.catalogOverlay.addEventListener('click', (e) => {
                    if (e.target === this.catalogOverlay) this.closeCatalog();
                });
            }

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.catalogOverlay && this.catalogOverlay.classList.contains('is-open')) {
                    this.closeCatalog();
                }
            });

            // Catalog Filter Pills
            this.catalogPills.forEach(pill => {
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.catalogPills.forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    this.renderCatalogGrid(pill.dataset.cat);
                });
            });

            // Quick add and photo switch in Catalog Modal
            if (this.catalogGrid) {
                this.catalogGrid.addEventListener('click', (e) => {
                    const card = e.target.closest('.xiv-card');
                    if (!card) return;

                    const id = parseInt(card.dataset.id, 10);
                    const item = this.items.find(p => p.id === id);
                    if (!item) return;

                    const addBtn = e.target.closest('.xiv-quick-add');
                    if (addBtn) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.CartManager) {
                            const product = {
                                id: String(item.id),
                                name: item.name,
                                category: item.category,
                                price: item.price,
                                img: Array.isArray(item.img) ? item.img[0] : item.img
                            };
                            window.CartManager.addItem(product, addBtn);
                        }
                        return;
                    }

                    // Favourite button click
                    if (e.target.closest('.card-fav-btn')) {
                        e.stopPropagation();
                        return;
                    }

                    const prevBtn = e.target.closest('.card-nav-prev');
                    const nextBtn = e.target.closest('.card-nav-next');
                    const dot = e.target.closest('.angle-dot');

                    if (prevBtn || nextBtn || dot) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handlePhotoSwitch(card, item, prevBtn ? -1 : (nextBtn ? 1 : null), dot ? parseInt(dot.dataset.idx, 10) : null);
                        return;
                    }

                    // Universal PDP redirection
                    window.location.href = `product-detail.html?id=${id}`;
                });
            }
        },

        handlePhotoSwitch(card, item, delta, directIndex) {
            if (!item.img || !Array.isArray(item.img) || item.img.length <= 1) return;
            const imgEl = card.querySelector('.xiv-card-img-wrap img');
            const dots = card.querySelectorAll('.angle-dot');
            let currentIdx = parseInt(card.dataset.currentIdx || '0', 10);

            if (directIndex !== null) {
                currentIdx = directIndex;
            } else if (delta !== null) {
                currentIdx = (currentIdx + delta + item.img.length) % item.img.length;
            }

            card.dataset.currentIdx = String(currentIdx);
            if (imgEl) {
                imgEl.src = item.img[currentIdx];
            }

            dots.forEach((d, i) => {
                d.classList.toggle('active', i === currentIdx);
            });
        },

        getFilteredItems() {
            let list = [...this.items];

            if (this.currentFilter === 'Men') {
                list = list.filter(item => item.gender === 'Men');
            } else if (this.currentFilter === 'Women') {
                list = list.filter(item => item.gender === 'Women');
            } else if (this.currentFilter === 'KID') {
                list = list.filter(item => item.gender === 'KID');
            } else {
                // (ALL) - Show flagship cards (1 Men, 1 Women, 1 Kid, plus other premier pieces)
                const menFirst = list.find(i => i.gender === 'Men');
                const womenFirst = list.find(i => i.gender === 'Women');
                const kidFirst = list.find(i => i.gender === 'KID');
                const others = list.filter(i => ![menFirst?.id, womenFirst?.id, kidFirst?.id].includes(i.id));
                list = [menFirst, womenFirst, kidFirst, ...others].filter(Boolean);
            }

            // Apply Sort
            if (this.currentSort === 'asc') {
                list.sort((a, b) => a.price - b.price);
            } else if (this.currentSort === 'desc') {
                list.sort((a, b) => b.price - a.price);
            }

            return list;
        },

        buildCardHtml(item, index) {
            const images = Array.isArray(item.img) ? item.img : [item.img];
            const imgUrl = images[0];
            const colorMeta = item.colorCount
                ? `<span class="xiv-color-tag"><span class="color-box"></span>+${item.colorCount}</span>`
                : '';

            const dotsHtml = images.length > 1
                ? `<div class="xiv-card-angles-strip">
                    ${images.map((_, i) => `<button class="angle-dot ${i === 0 ? 'active' : ''}" data-idx="${i}" aria-label="Photo ${i + 1}"></button>`).join('')}
                   </div>`
                : '';

            const navArrowsHtml = images.length > 1
                ? `<button class="card-nav-prev" aria-label="Previous photo">
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M5 9L1 5L5 1" stroke="#222" stroke-width="1.3" stroke-linecap="round"/></svg>
                   </button>
                   <button class="card-nav-next" aria-label="Next photo">
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 9L5 5L1 1" stroke="#222" stroke-width="1.3" stroke-linecap="round"/></svg>
                   </button>`
                : '';

            return `
                <div class="xiv-card" data-id="${item.id}" data-current-idx="0" style="animation-delay: ${index * 0.05}s;">
                    <div class="xiv-card-img-wrap">
                        <span class="xiv-pack-badge">5 Angles</span>
                        <img src="${imgUrl}" alt="${item.name}" loading="lazy">
                        ${navArrowsHtml}
                        <button type="button" class="card-fav-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-img="${imgUrl}" data-category="${item.category || 'Apparel'}" aria-label="Save to Favourites">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                        <button class="xiv-quick-add" aria-label="Add ${item.name} to bag" data-id="${item.id}">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 1V11M1 6H11" stroke="#333333" stroke-width="1.3" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    ${dotsHtml}
                    <div class="xiv-card-info">
                        <div class="xiv-card-meta">
                            <span>${item.category}</span>
                            ${colorMeta}
                        </div>
                        <div class="xiv-card-main">
                            <h3 class="xiv-product-name">${item.name}</h3>
                            <span class="xiv-price">$ ${item.price}</span>
                        </div>
                    </div>
                </div>
            `;
        },

        render() {
            if (!this.grid) return;
            const displayItems = this.getFilteredItems();
            let html = '';
            displayItems.forEach((item, index) => {
                html += this.buildCardHtml(item, index);
            });
            this.grid.innerHTML = html;
        },

        openCatalog() {
            if (!this.catalogOverlay) return;
            this.renderCatalogGrid('ALL');
            this.catalogOverlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        },

        closeCatalog() {
            if (!this.catalogOverlay) return;
            this.catalogOverlay.classList.remove('is-open');
            const cartOpen = CartManager.overlay && CartManager.overlay.classList.contains('is-open');
            if (!cartOpen) {
                document.body.style.overflow = '';
            }
        },

        renderCatalogGrid(category) {
            if (!this.catalogGrid) return;
            let list = [...this.items];
            if (category && category !== 'ALL') {
                list = list.filter(item => item.gender === category);
            }

            let html = '';
            list.forEach((item, index) => {
                html += this.buildCardHtml(item, index);
            });

            this.catalogGrid.innerHTML = html;
        }
    };

    window.XIVCollectionsManager = XIVCollectionsManager;
    XIVCollectionsManager.init();


    // =====================================================================
    // 3. АНИМАЦИЯ ПРОЯВЛЕНИЯ ЗАГОЛОВКОВ (H1, H2) ПРИ СКРОЛЛЕ
    // =====================================================================
    function initHeadingObserver() {
        const headingObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05
        });

        // Visible headings in viewport reveal with staggered delay AFTER preloader
        const visibleHeadings = Array.from(document.querySelectorAll('h1, h2')).filter(h => {
            const rect = h.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        });

        visibleHeadings.forEach((heading, idx) => {
            setTimeout(() => {
                heading.classList.add('revealed');
            }, 100 + idx * 180);
        });

        // Headings below fold are observed on scroll
        document.querySelectorAll('h1, h2').forEach(h => {
            if (!visibleHeadings.includes(h)) {
                headingObserver.observe(h);
            }
        });
    }

    // =====================================================================
    // 4. TYPOGRAPHIC STORE PRELOADER (РАВНОМЕРНАЯ ЗАКРАСКА И РАЗБЕГ БУКВ)
    // =====================================================================
    function setupPreloader() {
        const preloader = document.getElementById('preloader');
        const slots = document.querySelectorAll('.store-letter-slot');
        const fillElements = document.querySelectorAll('.letter-fill');

        // Управление блокировкой скролла во время анимации прелоадера
        const preventScrollEvent = (e) => {
            e.preventDefault();
        };

        const preventScrollKeys = (e) => {
            const scrollKeys = ['Space', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            if (scrollKeys.includes(e.code) || scrollKeys.includes(e.key) || e.keyCode === 32 || (e.keyCode >= 33 && e.keyCode <= 40)) {
                e.preventDefault();
            }
        };

        const disableScroll = () => {
            window.scrollTo(0, 0);
            if ('scrollRestoration' in history) {
                try {
                    history.scrollRestoration = 'manual';
                } catch (_) {}
            }
            document.documentElement.classList.add('preloader-locked');
            document.body.classList.add('preloader-locked');
            document.body.style.overflow = 'hidden';
            window.addEventListener('wheel', preventScrollEvent, { passive: false });
            window.addEventListener('touchmove', preventScrollEvent, { passive: false });
            window.addEventListener('keydown', preventScrollKeys, { passive: false });
        };

        const enableScroll = () => {
            document.documentElement.classList.remove('preloader-locked');
            document.body.classList.remove('preloader-locked');
            document.body.style.overflow = '';
            window.removeEventListener('wheel', preventScrollEvent);
            window.removeEventListener('touchmove', preventScrollEvent);
            window.removeEventListener('keydown', preventScrollKeys);
            if ('scrollRestoration' in history) {
                try {
                    history.scrollRestoration = 'auto';
                } catch (_) {}
            }
        };

        if (!preloader || slots.length === 0) {
            enableScroll();
            initHeadingObserver();
            return;
        }

        // Блокируем скролл на время выполнения анимации
        disableScroll();

        // Защита при возврате по истории назад/вперед (bfcache)
        window.addEventListener('pageshow', (event) => {
            if (event.persisted && preloader && preloader.classList.contains('is-done')) {
                enableScroll();
            }
        });

        let startTime = null;
        const duration = 2200; // 2.2 секунды равномерной закраски

        function animateProgress(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const t = Math.min(elapsed / duration, 1);
            const progress = t * 100; // Равномерная линейная шкала 0 -> 100

            // Распределение закраски по 5 буквам S-T-O-R-E
            slots.forEach((slot, i) => {
                const letterStart = i * 20;
                const letterEnd = (i + 1) * 20;
                let fillPercent = 0;

                if (progress >= letterEnd) {
                    fillPercent = 100;
                } else if (progress > letterStart) {
                    fillPercent = ((progress - letterStart) / 20) * 100;
                }

                if (fillElements[i]) {
                    fillElements[i].style.setProperty('--fill', `${fillPercent.toFixed(2)}%`);
                }
            });

            if (t < 1) {
                requestAnimationFrame(animateProgress);
            } else {
                fillElements.forEach(el => {
                    el.style.setProperty('--fill', '100%');
                    el.style.clipPath = 'none';
                    el.style.webkitClipPath = 'none';
                });
                onPreloaderComplete();
            }
        }

        // Старт закрашивания
        setTimeout(() => {
            requestAnimationFrame(animateProgress);
        }, 120);

        function onPreloaderComplete() {
            // Пауза перед разбегом букв
            setTimeout(() => {
                // Шаг 1: Буквы разбегаются каждая в середину своей вертикальной полосы
                const columnWidth = window.innerWidth / 5;
                const deltas = [];

                slots.forEach((slot, i) => {
                    const rect = slot.getBoundingClientRect();
                    const currentCenterX = rect.left + rect.width / 2;
                    const targetCenterX = (i + 0.5) * columnWidth;
                    const deltaX = targetCenterX - currentCenterX;
                    deltas.push(deltaX);

                    slot.style.transform = `translateX(${deltaX}px)`;
                });

                // Шаг 2: Полосы раздвигаются, унося буквы с собой
                setTimeout(() => {
                    preloader.classList.add('curtains-open');
                    preloader.style.pointerEvents = 'none';

                    slots.forEach((slot, i) => {
                        const deltaX = deltas[i];
                        const moveUp = (i % 2 === 0);
                        const translateY = moveUp ? '-101vh' : '101vh';
                        const delay = i * 0.06;

                        slot.style.transition = `transform 0.95s cubic-bezier(0.85, 0, 0.15, 1) ${delay}s`;
                        slot.style.transform = `translateX(${deltaX}px) translateY(${translateY})`;
                    });

                    // Шаг 3: Полное скрытие прелоадера и запуск анимации заголовков ТОЛЬКО ПОСЛЕ ЗАВЕРШЕНИЯ
                    setTimeout(() => {
                        preloader.classList.add('is-done');
                        preloader.style.display = 'none';

                        // Восстанавливаем возможность скроллить после полного завершения прелоадера
                        enableScroll();

                        // Заголовки сайта анимируются строго после того, как прелоадер полностью открыл сайт
                        initHeadingObserver();
                    }, 1150);
                }, 850);
            }, 200);
        }
    }

    // =====================================================================
    // 6. DZ WAVE GALLERY SMOOTH HOVER (FINISH TO FINAL POINT & PAUSE)
    // =====================================================================
    function initDzWaveGallery() {
        const viewport = document.getElementById('dzWaveGallery');
        if (!viewport) return;

        const track = viewport.querySelector('.dz-wave-track');
        const items = viewport.querySelectorAll('.dz-gallery-item');
        if (!track) return;

        const TOTAL_DURATION = 20000; // 20s total loop
        const STEP_COUNT = 8;
        const STEP_DURATION = TOTAL_DURATION / STEP_COUNT; // 2500ms per step
        const HOLD_DURATION = 1000; // 1000ms hold at final top/bottom point (0% - 5% of 20s)

        let isHovered = false;
        let pendingTimeout = null;
        let isPaused = false;

        // Fallback animation timer tracker
        let animStartTime = performance.now();
        let accumulatedTime = 0;

        function getAnimationTime() {
            try {
                if (track.getAnimations) {
                    const anims = track.getAnimations();
                    if (anims && anims.length > 0 && typeof anims[0].currentTime === 'number') {
                        return anims[0].currentTime;
                    }
                }
            } catch (err) {
                // Fallback to performance.now tracking
            }
            if (isPaused) {
                return accumulatedTime;
            }
            return accumulatedTime + (performance.now() - animStartTime);
        }

        function pauseAll() {
            if (isPaused) return;
            track.style.animationPlayState = 'paused';
            items.forEach(item => item.style.animationPlayState = 'paused');
            accumulatedTime = getAnimationTime();
            isPaused = true;
        }

        function resumeAll() {
            if (!isPaused) return;
            track.style.animationPlayState = 'running';
            items.forEach(item => item.style.animationPlayState = 'running');
            animStartTime = performance.now();
            isPaused = false;
        }

        function handlePointerEnter() {
            isHovered = true;
            if (isPaused) return;

            if (pendingTimeout) {
                clearTimeout(pendingTimeout);
                pendingTimeout = null;
            }

            const currentMs = getAnimationTime();
            const cycleProgress = currentMs % STEP_DURATION;

            // If cycleProgress < HOLD_DURATION (0 to 1000ms):
            // The cards have ALREADY reached their final top/bottom position (in hold state)
            if (cycleProgress < HOLD_DURATION) {
                pauseAll();
            } else {
                // Cards are in mid-flight (1000ms to 2500ms).
                // Let them finish the wave to the next final top/bottom point before pausing!
                const remainingTime = STEP_DURATION - cycleProgress;
                pendingTimeout = setTimeout(() => {
                    if (isHovered) {
                        requestAnimationFrame(() => {
                            if (isHovered) pauseAll();
                        });
                    }
                    pendingTimeout = null;
                }, Math.max(0, remainingTime));
            }
        }

        function handlePointerLeave() {
            isHovered = false;
            if (pendingTimeout) {
                clearTimeout(pendingTimeout);
                pendingTimeout = null;
            }
            resumeAll();
        }

        // Attach to the entire gallery viewport and individual items
        viewport.addEventListener('mouseenter', handlePointerEnter);
        viewport.addEventListener('mouseleave', handlePointerLeave);

        items.forEach(item => {
            item.addEventListener('mouseenter', handlePointerEnter);
        });

        // Mobile touch events: smoothly finish to final point on tap
        viewport.addEventListener('touchstart', handlePointerEnter, { passive: true });
        viewport.addEventListener('touchend', () => {
            // Brief pause on mobile touch release before resuming
            setTimeout(() => {
                if (!isHovered) handlePointerLeave();
            }, 1000);
        }, { passive: true });
    }

    // =====================================================================
    // 7. XIV FOOTER INTERACTIONS (LANGUAGES & LINKS)
    // =====================================================================
    function initXivFooter() {
        const langBtns = document.querySelectorAll('.xiv-footer-lang-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                langBtns.forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            });
        });
    }

    initDzWaveGallery();
    initXivFooter();
    setupPreloader();
});
