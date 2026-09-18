/**
 * Shopping Bag logic — XIV STORE
 * Handles cart interactions, quantities, pricing, 3D interactive Visa card modal,
 * successful purchase animation, confetti celebration, and redirect to index.html.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Cart Elements
    const bagGrid = document.getElementById('bagGrid');
    const subtotalVal = document.getElementById('subtotalVal');
    const shippingVal = document.getElementById('shippingVal');
    const totalVal = document.getElementById('totalVal');
    const termsAgree = document.getElementById('termsAgree');
    const btnContinue = document.getElementById('btnContinue');

    // Modal Elements
    const modalOverlay = document.getElementById('checkoutModalOverlay');
    const modalCloseBtn = document.getElementById('checkoutModalClose');
    const formView = document.getElementById('checkoutFormView');
    const processView = document.getElementById('checkoutProcessView');
    const cardForm = document.getElementById('cardPaymentForm');

    // Live Card Preview Elements
    const card3DWrap = document.getElementById('card3DWrap');
    const cardPreview = document.getElementById('cardPreview');
    const cardGlassShine = document.getElementById('cardGlassShine');
    const previewNumber = document.getElementById('cardPreviewNumber');
    const previewName = document.getElementById('cardPreviewName');
    const previewExpiry = document.getElementById('cardPreviewExpiry');

    // Form Inputs
    const cardNumInput = document.getElementById('cardNumberInput');
    const cardNameInput = document.getElementById('cardNameInput');
    const cardExpInput = document.getElementById('cardExpiryInput');
    const cardCvvInput = document.getElementById('cardCvvInput');
    const modalPayAmount = document.getElementById('modalPayAmount');

    // Animation & Status Elements
    const spinnerContainer = document.getElementById('spinnerCheckmarkContainer');
    const confettiContainer = document.getElementById('confettiContainer');
    const statusProcessing = document.getElementById('statusStateProcessing');
    const statusSuccess = document.getElementById('statusStateSuccess');
    const receiptOrderId = document.getElementById('receiptOrderId');
    const receiptAmount = document.getElementById('receiptAmount');
    const receiptCard = document.getElementById('receiptCard');
    const redirectText = document.getElementById('redirectText');
    const redirectProgressFill = document.getElementById('redirectProgressFill');
    const paymentDoneBtn = document.getElementById('paymentDoneBtn');
    const screenCurtain = document.getElementById('screenCurtain');

    let isProcessing = false;
    let redirectTimer = null;

    // Default reference items if empty (matches Screenshot 2 1:1)
    const defaultBagItems = [
        {
            id: '4',
            name: 'Full Sleeve Zipper',
            category: 'Cotton T Shirt',
            size: 'L',
            color: '#111111',
            price: 99,
            quantity: 1,
            img: './src/Clothes/10/1.png',
            currentAngle: 1
        },
        {
            id: '2',
            name: 'Basic Slim Fit T-Shirt',
            category: 'Cotton T Shirt',
            size: 'L',
            color: '#111111',
            price: 99,
            quantity: 1,
            img: './src/Clothes/8/1.png',
            currentAngle: 1
        }
    ];

    let items = [];
    try {
        const saved = localStorage.getItem('xiv_cart_items');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                items = parsed;
            }
        }
    } catch (e) {
        console.warn('ShoppingBag: error reading cart', e);
    }

    if (items.length === 0) {
        items = defaultBagItems;
        saveCart();
    }

    function saveCart() {
        try {
            localStorage.setItem('xiv_cart_items', JSON.stringify(items));
        } catch (e) {
            console.warn('ShoppingBag: error saving cart', e);
        }
    }

    function calculateTotals() {
        const shippingFee = 10;
        const subtotal = items.reduce((sum, it) => sum + ((it.price || 99) * (it.quantity || 1)), 0);
        const total = subtotal > 0 ? subtotal + shippingFee : 0;
        return { subtotal, shippingFee, total };
    }

    function updateSummary() {
        const { subtotal, shippingFee, total } = calculateTotals();

        if (subtotalVal) subtotalVal.textContent = `$${subtotal}`;
        if (shippingVal) shippingVal.textContent = subtotal > 0 ? `$${shippingFee}` : '$0';
        if (totalVal) totalVal.textContent = `$${total}`;
        if (modalPayAmount) modalPayAmount.textContent = `$${total}`;
    }

    function renderItems() {
        if (!bagGrid) return;

        if (items.length === 0) {
            bagGrid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 48px; text-align: center; color: #777;">
                    <p style="font-size: 16px; margin-bottom: 16px;">Your shopping bag is empty.</p>
                    <a href="products.html" style="display: inline-block; padding: 10px 24px; background: #111; color: #fff; text-decoration: none; font-size: 13px; font-weight: 600;">Browse Collection</a>
                </div>
            `;
            updateSummary();
            return;
        }

        bagGrid.innerHTML = items.map((item, idx) => {
            const id = item.id;
            const name = item.name || 'Garment';
            const category = item.category || 'Cotton T Shirt';
            const size = item.size || 'L';
            const color = item.color || '#111111';
            const price = item.price || 99;
            const qty = item.quantity || 1;
            const img = item.img || (id == 4 ? './src/Clothes/10/1.png' : './src/Clothes/8/1.png');

            return `
                <article class="bag-item-card" data-id="${id}" style="animation-delay: ${0.1 + idx * 0.1}s;">
                    <div class="bag-card-top">
                        <div class="bag-card-media">
                            <img src="${img}" alt="${name}" id="img-${id}" onerror="this.src='./src/Clothes/8/1.png'">
                            <button class="bag-photo-fav-btn" data-action="fav" aria-label="Save to favourites">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="bag-card-controls">
                            <button class="ctrl-remove-btn" data-action="remove" data-id="${id}" title="Remove item">✕</button>
                            <span class="ctrl-size-badge">${size}</span>
                            <span class="ctrl-color-swatch" style="background-color: ${color};" title="Color"></span>
                            <div class="ctrl-stepper">
                                <button class="step-btn" data-action="inc" data-id="${id}" title="Increase quantity">+</button>
                                <span class="step-value" data-id="${id}">${qty}</span>
                                <button class="step-btn" data-action="dec" data-id="${id}" title="Decrease quantity">-</button>
                            </div>
                            <button class="ctrl-swap-btn" data-action="swap" data-id="${id}" title="Cycle views">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="bag-card-meta">
                        <div class="bag-item-category">${category}</div>
                        <div class="bag-item-title-row">
                            <span class="bag-item-title">${name}</span>
                            <span class="bag-item-price">$ ${price}</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        updateSummary();
    }

    // Event delegation for item controls
    if (bagGrid) {
        bagGrid.addEventListener('click', (e) => {
            const target = e.target;
            const actionBtn = target.closest('[data-action]');
            if (!actionBtn) return;

            const action = actionBtn.dataset.action;
            const id = actionBtn.dataset.id || actionBtn.closest('[data-id]')?.dataset.id;
            const item = items.find(it => String(it.id) === String(id));
            const cardEl = actionBtn.closest('.bag-item-card');

            if (action === 'remove' && cardEl) {
                // Smooth removal animation
                cardEl.classList.add('is-removing');
                setTimeout(() => {
                    items = items.filter(it => String(it.id) !== String(id));
                    saveCart();
                    renderItems();
                }, 320);
            } else if (action === 'inc' && item) {
                item.quantity = (item.quantity || 1) + 1;
                saveCart();
                const stepVal = cardEl.querySelector(`.step-value[data-id="${id}"]`);
                if (stepVal) {
                    stepVal.textContent = item.quantity;
                    stepVal.classList.remove('is-bouncing');
                    void stepVal.offsetWidth;
                    stepVal.classList.add('is-bouncing');
                }
                updateSummary();
            } else if (action === 'dec' && item) {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                    saveCart();
                    const stepVal = cardEl.querySelector(`.step-value[data-id="${id}"]`);
                    if (stepVal) {
                        stepVal.textContent = item.quantity;
                        stepVal.classList.remove('is-bouncing');
                        void stepVal.offsetWidth;
                        stepVal.classList.add('is-bouncing');
                    }
                    updateSummary();
                } else {
                    cardEl.classList.add('is-removing');
                    setTimeout(() => {
                        items = items.filter(it => String(it.id) !== String(id));
                        saveCart();
                        renderItems();
                    }, 320);
                }
            } else if (action === 'swap' && item) {
                // Spin animation
                actionBtn.classList.remove('is-spinning');
                void actionBtn.offsetWidth;
                actionBtn.classList.add('is-spinning');

                // Cycle angles 1..5
                const cur = item.currentAngle || 1;
                const next = (cur % 5) + 1;
                item.currentAngle = next;

                let folder = '8';
                if (item.id == 4) folder = '10';
                else if (item.id == 1) folder = '7';
                else if (item.id == 3) folder = '9';
                item.img = `./src/Clothes/${folder}/${next}.png`;

                const imgEl = document.getElementById(`img-${id}`);
                if (imgEl) {
                    imgEl.style.opacity = '0.3';
                    setTimeout(() => {
                        imgEl.src = item.img;
                        imgEl.style.opacity = '1';
                    }, 120);
                }
                saveCart();
            } else if (action === 'fav' && item) {
                if (window.FavouritesManager) {
                    const isAdded = window.FavouritesManager.toggle(item);
                    actionBtn.classList.toggle('is-active', isAdded);
                    if (isAdded) {
                        window.FavouritesManager.flyParticles(actionBtn);
                    }
                } else {
                    actionBtn.classList.toggle('is-active');
                }
            }
        });
    }

    // Favourites tab click
    const tabFav = document.getElementById('tabFavourites');
    if (tabFav) {
        tabFav.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'favourites.html';
        });
    }

    // ==========================================================================
    // 3D INTERACTIVE CREDIT CARD PREVIEW
    // ==========================================================================
    if (card3DWrap && cardPreview) {
        card3DWrap.addEventListener('mousemove', (e) => {
            const rect = card3DWrap.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 14;

            cardPreview.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

            if (cardGlassShine) {
                const shineX = (x / rect.width) * 100;
                const shineY = (y / rect.height) * 100;
                cardGlassShine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`;
            }
        });

        card3DWrap.addEventListener('mouseleave', () => {
            cardPreview.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            if (cardGlassShine) {
                cardGlassShine.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 65%)';
            }
        });
    }

    // Live Input Formatter & Sync with Preview
    if (cardNumInput) {
        cardNumInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 16);
            let formatted = val != '' ? val.match(/.{1,4}/g).join(' ') : '';
            e.target.value = formatted;

            if (previewNumber) {
                if (val.length === 0) {
                    previewNumber.textContent = '•••• •••• •••• ••••';
                } else {
                    let pad = val.padEnd(16, '•');
                    previewNumber.textContent = pad.match(/.{1,4}/g).join(' ');
                }
            }
        });
    }

    if (cardNameInput) {
        cardNameInput.addEventListener('input', (e) => {
            const val = e.target.value.toUpperCase();
            if (previewName) {
                previewName.textContent = val.trim() || 'ALEXANDER SMITH';
            }
        });
    }

    if (cardExpInput) {
        cardExpInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 4);
            if (val.length >= 2) {
                val = val.substring(0, 2) + '/' + val.substring(2);
            }
            e.target.value = val;

            if (previewExpiry) {
                previewExpiry.textContent = val || '12/28';
            }
        });
    }

    // ==========================================================================
    // MODAL OPEN / CLOSE LOGIC
    // ==========================================================================
    function openModal() {
        if (!modalOverlay) return;
        const { total } = calculateTotals();
        if (modalPayAmount) modalPayAmount.textContent = `$${total}`;

        // Reset to form view
        isProcessing = false;
        if (formView) {
            formView.classList.remove('is-hidden', 'is-exiting');
        }
        if (processView) {
            processView.classList.add('is-hidden');
        }
        if (spinnerContainer) {
            spinnerContainer.classList.remove('is-completed');
        }
        if (statusProcessing) {
            statusProcessing.classList.remove('is-hidden');
        }
        if (statusSuccess) {
            statusSuccess.classList.add('is-hidden');
        }
        if (redirectProgressFill) {
            redirectProgressFill.style.transition = 'none';
            redirectProgressFill.style.width = '0%';
        }

        modalOverlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (cardNumInput) cardNumInput.focus();
        }, 300);
    }

    function closeModal() {
        if (isProcessing) return;
        if (modalOverlay) {
            modalOverlay.classList.remove('is-open');
            document.body.style.overflow = '';
        }
        if (redirectTimer) {
            clearInterval(redirectTimer);
            redirectTimer = null;
        }
    }

    if (btnContinue) {
        btnContinue.addEventListener('click', (e) => {
            e.preventDefault();
            if (termsAgree && !termsAgree.checked) {
                termsAgree.focus();
                termsAgree.parentElement.style.color = '#e11d48';
                setTimeout(() => {
                    if (termsAgree.parentElement) termsAgree.parentElement.style.color = '';
                }, 1500);
                return;
            }
            openModal();
        });
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-open')) {
            closeModal();
        }
    });

    // ==========================================================================
    // CONFETTI BURST ANIMATION
    // ==========================================================================
    function burstConfetti() {
        if (!confettiContainer) return;
        confettiContainer.innerHTML = '';

        const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#18181b', '#ffffff', '#e2e8f0'];
        const numPieces = 45;

        for (let i = 0; i < numPieces; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';

            const angle = Math.random() * 2 * Math.PI;
            const dist = 60 + Math.random() * 110;
            const tx = Math.cos(angle) * dist + 'px';
            const ty = Math.sin(angle) * dist - 20 + 'px';
            const rot = (Math.random() * 720 - 360) + 'deg';
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 6 + Math.random() * 6;

            el.style.setProperty('--tx', tx);
            el.style.setProperty('--ty', ty);
            el.style.setProperty('--rot', rot);
            el.style.backgroundColor = color;
            el.style.width = size + 'px';
            el.style.height = (size * (Math.random() > 0.5 ? 1 : 1.6)) + 'px';
            el.style.animationDelay = (Math.random() * 0.15) + 's';

            confettiContainer.appendChild(el);
        }
    }

    // ==========================================================================
    // SUBMIT PAYMENT -> ANIMATION -> REDIRECT TO index.html
    // ==========================================================================
    if (cardForm) {
        cardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (isProcessing) return;

            isProcessing = true;
            const { total } = calculateTotals();
            const rawCardNum = cardNumInput ? cardNumInput.value.replace(/\s+/g, '') : '4400';
            const last4 = rawCardNum.slice(-4) || '4400';

            // Step 1: Smoothly animate out form view
            if (formView) {
                formView.classList.add('is-exiting');
            }

            setTimeout(() => {
                if (formView) formView.classList.add('is-hidden');
                if (processView) processView.classList.remove('is-hidden');

                // Step 2: Show processing state for ~1.5s
                setTimeout(() => {
                    // Step 3: Complete spinner & draw checkmark
                    if (spinnerContainer) {
                        spinnerContainer.classList.add('is-completed');
                    }

                    // Confetti burst
                    burstConfetti();

                    // Step 4: Show Success details & Receipt
                    setTimeout(() => {
                        if (statusProcessing) statusProcessing.classList.add('is-hidden');
                        if (statusSuccess) statusSuccess.classList.remove('is-hidden');

                        const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
                        if (receiptOrderId) receiptOrderId.textContent = `#ORD-${randomOrderNum}`;
                        if (receiptAmount) receiptAmount.textContent = `$${total}`;
                        if (receiptCard) receiptCard.textContent = `Visa •••• ${last4}`;

                        // Step 5: Start progress bar & countdown for automatic redirect
                        if (redirectProgressFill) {
                            redirectProgressFill.style.transition = 'width 3s linear';
                            void redirectProgressFill.offsetWidth;
                            redirectProgressFill.style.width = '100%';
                        }

                        let secondsLeft = 3;
                        if (redirectText) redirectText.textContent = `Redirecting to store in ${secondsLeft}s...`;

                        redirectTimer = setInterval(() => {
                            secondsLeft -= 1;
                            if (secondsLeft > 0) {
                                if (redirectText) redirectText.textContent = `Redirecting to store in ${secondsLeft}s...`;
                            } else {
                                clearInterval(redirectTimer);
                                triggerCurtainRedirect();
                            }
                        }, 1000);

                    }, 400);

                }, 1400);

            }, 300);
        });
    }

    // Trigger curtain wipe and redirect to index.html
    function triggerCurtainRedirect() {
        // Clear cart in storage as purchase was completed
        try {
            localStorage.removeItem('xiv_cart_items');
        } catch (err) {
            console.warn('Error clearing cart', err);
        }

        if (screenCurtain) {
            screenCurtain.classList.add('is-active');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 550);
        } else {
            window.location.href = 'index.html';
        }
    }

    if (paymentDoneBtn) {
        paymentDoneBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (redirectTimer) clearInterval(redirectTimer);
            triggerCurtainRedirect();
        });
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

    renderItems();
});
