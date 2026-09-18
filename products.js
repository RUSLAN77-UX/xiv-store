/**
 * PRODUCTS CATALOG CONTROLLER (XIV STORE)
 * Supports live sidebar filters, AJAX instant search dropdown (3-4 cards preview),
 * top filter pills, synchronized cart storage, and Visa checkout.
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. DATA SOURCE & STATE MANAGEMENT
    // =========================================================================
    const CatalogState = {
        allItems: [],
        filteredItems: [],

        // Active filter criteria
        filters: {
            search: '',
            topPill: null,
            sizes: new Set(),
            availability: new Set(), // 'inStock', 'outOfStock'
            categories: new Set(),
            colors: new Set(),
            maxPrice: 300,
            priceBracket: 'all',
            collections: new Set(),
            tags: new Set(),
            minRating: 0
        },

        init() {
            this.loadData();
        },

        async loadData() {
            try {
                const res = await fetch('./bd.json');
                if (!res.ok) throw new Error('HTTP ' + res.status);
                this.allItems = await res.json();
            } catch (err) {
                console.warn('Catalog: Failed to fetch bd.json, fallback items loaded', err);
                this.allItems = this.getFallbackItems();
            }

            CatalogUI.init();
            this.applyFilters();
        },

        getFallbackItems() {
            return [
                {
                    id: 1, category: "Shirts", name: "Embroidered Seersucker Shirt", price: 149, colorCount: 3,
                    img: ["./src/Clothes/7/1.png", "./src/Clothes/7/2.png"], colors: ["#A19F8D", "#1E1E1E", "#D4D3CD"],
                    colorNames: ["Olive", "Black", "Beige"], sizes: ["XS", "S", "M", "L", "XL", "2X"],
                    gender: "Men", inStock: true, stockCount: 24, rating: 4.9, collection: "XIV 23-24",
                    tags: ["new", "relaxed-fit", "cotton"]
                },
                {
                    id: 2, category: "T-Shirts", name: "Basic Slim Fit T-Shirt", price: 199, colorCount: 5,
                    img: ["./src/Clothes/8/1.png", "./src/Clothes/8/2.png"], colors: ["#FFFFFF", "#D9D9D9", "#1E1E1E"],
                    colorNames: ["White", "Grey", "Black"], sizes: ["XS", "S", "M", "L", "XL", "2X"],
                    gender: "Men", inStock: true, stockCount: 42, rating: 5.0, collection: "XIV 23-24",
                    tags: ["best-seller", "minimalist", "cotton"]
                },
                {
                    id: 3, category: "T-Shirts", name: "Blurred Print T-Shirt", price: 169, colorCount: 3,
                    img: ["./src/Clothes/9/1.png"], colors: ["#D4D3CD", "#1E1E1E"],
                    colorNames: ["Beige", "Black"], sizes: ["XS", "S", "M", "L", "XL"],
                    gender: "Men", inStock: true, stockCount: 18, rating: 4.8, collection: "XIV 23-24",
                    tags: ["new", "cotton"]
                },
                {
                    id: 4, category: "T-Shirts", name: "Full Sleeve Zipper", price: 199, colorCount: 2,
                    img: ["./src/Clothes/10/1.png"], colors: ["#FFFFFF", "#1E1E1E"],
                    colorNames: ["White", "Black"], sizes: ["S", "M", "L", "XL", "2X"],
                    gender: "Men", inStock: true, stockCount: 31, rating: 4.7, collection: "XIV 23-24",
                    tags: ["best-seller", "minimalist"]
                },
                {
                    id: 9, category: "Shirts", name: "Minimalist Pure Silk Blouse", price: 249, colorCount: 3,
                    img: ["./src/Clothes/Women/1/1.png"], colors: ["#F4F1EA", "#1E1E1E"],
                    colorNames: ["Beige", "Black"], sizes: ["XS", "S", "M", "L", "XL"],
                    gender: "Women", inStock: true, stockCount: 22, rating: 5.0, collection: "XIV 23-24",
                    tags: ["new", "best-seller", "silk"]
                },
                {
                    id: 13, category: "Suits", name: "Single-Breasted Wool Blazer", price: 299, colorCount: 3,
                    img: ["./src/Clothes/Women/5/1.png"], colors: ["#2B2B2B", "#C2B8A3"],
                    colorNames: ["Black", "Beige"], sizes: ["XS", "S", "M", "L", "XL"],
                    gender: "Women", inStock: true, stockCount: 14, rating: 5.0, collection: "XIV 23-24",
                    tags: ["best-seller", "suits"]
                },
                {
                    id: 16, category: "Jackets", name: "Kids Vintage Chore Jacket", price: 149, colorCount: 2,
                    img: ["./src/Clothes/Kid/2/1.png"], colors: ["#5B7C99", "#E0DACB"],
                    colorNames: ["Blue", "Beige"], sizes: ["XS", "S", "M", "L"],
                    gender: "KID", inStock: true, stockCount: 17, rating: 4.9, collection: "XIV 23-24",
                    tags: ["new", "jackets"]
                },
                {
                    id: 20, category: "Jackets", name: "Everyday Essential Fleece Hoodie", price: 119, colorCount: 4,
                    img: ["./src/Clothes/Kid/6/1.png"], colors: ["#4A5340", "#1E1E1E"],
                    colorNames: ["Olive", "Black"], sizes: ["XS", "S", "M", "L", "XL"],
                    gender: "KID", inStock: true, stockCount: 38, rating: 4.9, collection: "XIV 23-24",
                    tags: ["new", "cotton", "fleece"]
                }
            ];
        },

        applyFilters() {
            const f = this.filters;

            this.filteredItems = this.allItems.filter(item => {
                // 1. Text Search Query
                if (f.search) {
                    const q = f.search.toLowerCase().trim();
                    const nameMatch = item.name.toLowerCase().includes(q);
                    const catMatch = (item.category || '').toLowerCase().includes(q) || (item.subcategory || '').toLowerCase().includes(q);
                    const descMatch = (item.description || '').toLowerCase().includes(q);
                    const collMatch = (item.collection || '').toLowerCase().includes(q);
                    const tagMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));

                    if (!nameMatch && !catMatch && !descMatch && !collMatch && !tagMatch) {
                        return false;
                    }
                }

                // 2. Active Top Pill (NEW, SHIRTS, POLO SHIRTS, SHORTS, SUITS, BEST SELLERS, T-SHIRTS, JEANS, JACKETS, COATS)
                if (f.topPill) {
                    const pill = f.topPill;
                    const cat = (item.category || '').toLowerCase();
                    const subcat = (item.subcategory || '').toLowerCase();
                    const tags = (item.tags || []).map(t => t.toLowerCase());

                    if (pill === 'new') {
                        if (!tags.includes('new')) return false;
                    } else if (pill === 'best-sellers') {
                        if (!tags.includes('best-seller')) return false;
                    } else if (pill === 'shirts') {
                        const isShirt = (cat.includes('shirt') || subcat.includes('shirt')) && !cat.includes('polo') && !cat.includes('t-shirt') && !subcat.includes('t-shirt');
                        if (!isShirt && cat !== 'shirts') return false;
                    } else if (pill === 'polo-shirts') {
                        if (!cat.includes('polo') && !subcat.includes('polo')) return false;
                    } else if (pill === 'shorts') {
                        if (!cat.includes('short') && !subcat.includes('short') && !cat.includes('tank')) return false;
                    } else if (pill === 'suits') {
                        if (!cat.includes('suit') && !subcat.includes('blazer') && !cat.includes('tailored')) return false;
                    } else if (pill === 't-shirts') {
                        if (!cat.includes('t-shirt') && !subcat.includes('t-shirt') && !subcat.includes('tee')) return false;
                    } else if (pill === 'jeans') {
                        if (!cat.includes('jean') && !subcat.includes('denim') && !tags.includes('jeans')) return false;
                    } else if (pill === 'jackets') {
                        if (!cat.includes('jacket') && !subcat.includes('sweatshirt') && !tags.includes('jackets')) return false;
                    } else if (pill === 'coats') {
                        if (!cat.includes('coat') && !subcat.includes('knit') && !subcat.includes('sweater') && !subcat.includes('cardigan')) return false;
                    }
                }

                // 3. Sizes (XS, S, M, L, XL, 2X)
                if (f.sizes.size > 0) {
                    const itemSizes = (item.sizes || []).map(s => (s === 'XXL' ? '2X' : s));
                    const hasSize = Array.from(f.sizes).some(s => itemSizes.includes(s));
                    if (!hasSize) return false;
                }

                // 4. Availability (inStock, outOfStock)
                if (f.availability.size > 0) {
                    const wantsInStock = f.availability.has('inStock');
                    const wantsOutOfStock = f.availability.has('outOfStock');

                    if (wantsInStock && !wantsOutOfStock && !item.inStock) return false;
                    if (wantsOutOfStock && !wantsInStock && item.inStock) return false;
                }

                // 5. Category Checkboxes
                if (f.categories.size > 0) {
                    const cat = item.category || '';
                    if (!f.categories.has(cat)) return false;
                }

                // 6. Colors Filter
                if (f.colors.size > 0) {
                    const colorNames = item.colorNames || [];
                    const hasColor = Array.from(f.colors).some(c => colorNames.includes(c));
                    if (!hasColor) return false;
                }

                // 7. Price Filter (Slider & Radio Brackets)
                if (item.price > f.maxPrice) return false;

                if (f.priceBracket === 'under-100' && item.price >= 100) return false;
                if (f.priceBracket === '100-200' && (item.price < 100 || item.price > 200)) return false;
                if (f.priceBracket === 'over-200' && item.price <= 200) return false;

                // 8. Collections
                if (f.collections.size > 0) {
                    if (!f.collections.has(item.collection)) return false;
                }

                // 9. Tags
                if (f.tags.size > 0) {
                    const itemTags = (item.tags || []).map(t => t.toLowerCase());
                    const hasTag = Array.from(f.tags).some(t => itemTags.includes(t.toLowerCase()));
                    if (!hasTag) return false;
                }

                // 10. Minimum Rating
                if (f.minRating > 0) {
                    if ((item.rating || 0) < f.minRating) return false;
                }

                return true;
            });

            // Smooth grid transition: subtle fade down then staggered luxury entrance
            if (CatalogUI.grid && CatalogUI.grid.children.length > 0) {
                CatalogUI.grid.classList.add('is-filtering');
                setTimeout(() => {
                    CatalogUI.renderProducts(this.filteredItems);
                    CatalogUI.renderActiveChips(f);
                    if (CatalogUI.grid) {
                        CatalogUI.grid.classList.remove('is-filtering');
                    }
                }, 140);
            } else {
                CatalogUI.renderProducts(this.filteredItems);
                CatalogUI.renderActiveChips(f);
            }
        },

        resetAllFilters() {
            this.filters.search = '';
            this.filters.topPill = null;
            this.filters.sizes.clear();
            this.filters.availability.clear();
            this.filters.categories.clear();
            this.filters.colors.clear();
            this.filters.maxPrice = 300;
            this.filters.priceBracket = 'all';
            this.filters.collections.clear();
            this.filters.tags.clear();
            this.filters.minRating = 0;

            CatalogUI.resetControls();
            this.applyFilters();
        }
    };


    // =========================================================================
    // 2. USER INTERFACE & COMPONENT BINDINGS
    // =========================================================================
    const CatalogUI = {
        grid: null,
        noResults: null,
        activeFiltersBar: null,
        activeChipsWrap: null,
        resultsBadge: null,

        // AJAX Search components
        searchInput: null,
        searchClearBtn: null,
        ajaxDropdown: null,
        ajaxCardsList: null,
        ajaxCount: null,
        searchTimer: null,

        // Top Pills
        pillBtns: [],

        init() {
            this.grid = document.getElementById('productsGrid');
            this.noResults = document.getElementById('noResultsBox');
            this.activeFiltersBar = document.getElementById('activeFiltersBar');
            this.activeChipsWrap = document.getElementById('activeChipsWrap');
            this.resultsBadge = document.getElementById('catalogResultsCount');

            this.searchInput = document.getElementById('ajaxSearchInput');
            this.searchClearBtn = document.getElementById('searchClearBtn');
            this.ajaxDropdown = document.getElementById('ajaxSearchDropdown');
            this.ajaxCardsList = document.getElementById('ajaxCardsList');
            this.ajaxCount = document.getElementById('ajaxDropdownCount');
            this.pillBtns = document.querySelectorAll('.filter-pill');

            this.bindAccordions();
            this.bindAjaxSearch();
            this.bindTopPills();
            this.bindSidebarFilters();
            this.bindCardInteractions();
            this.bindMobileFilters();
        },

        // --- Accordions Slide Toggle with Chevron Rotation ---
        bindAccordions() {
            document.querySelectorAll('.filter-accordion').forEach(acc => {
                const header = acc.querySelector('.accordion-header');
                if (!header) return;

                header.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isOpen = acc.classList.contains('is-open');
                    acc.classList.toggle('is-open', !isOpen);
                    header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
                });
            });
        },

        // --- Live AJAX Instant Search Input with 3-4 Cards Popup ---
        bindAjaxSearch() {
            if (!this.searchInput) return;

            this.searchInput.addEventListener('input', (e) => {
                const val = e.target.value;
                if (this.searchClearBtn) {
                    this.searchClearBtn.style.display = val.length > 0 ? 'block' : 'none';
                }

                clearTimeout(this.searchTimer);
                this.searchTimer = setTimeout(() => {
                    CatalogState.filters.search = val.trim();
                    CatalogState.applyFilters();
                    this.updateAjaxDropdown(val.trim());
                }, 140);
            });

            if (this.searchClearBtn) {
                this.searchClearBtn.addEventListener('click', () => {
                    this.searchInput.value = '';
                    this.searchClearBtn.style.display = 'none';
                    CatalogState.filters.search = '';
                    this.hideAjaxDropdown();
                    CatalogState.applyFilters();
                });
            }

            // Close AJAX dropdown on outside click or Escape
            document.addEventListener('click', (e) => {
                const wrap = document.getElementById('ajaxSearchWrapper');
                if (wrap && !wrap.contains(e.target)) {
                    this.hideAjaxDropdown();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideAjaxDropdown();
                }
            });
        },

        updateAjaxDropdown(query) {
            if (!this.ajaxDropdown || !this.ajaxCardsList) return;

            if (!query || query.length < 1) {
                this.hideAjaxDropdown();
                return;
            }

            // Find matching items from all items
            const q = query.toLowerCase();
            const matches = CatalogState.allItems.filter(item => {
                const name = item.name.toLowerCase();
                const cat = (item.category || '').toLowerCase();
                const desc = (item.description || '').toLowerCase();
                const tags = (item.tags || []).join(' ').toLowerCase();
                return name.includes(q) || cat.includes(q) || desc.includes(q) || tags.includes(q);
            });

            // Display top 3-4 cards as requested
            const topCards = matches.slice(0, 4);

            if (this.ajaxCount) {
                this.ajaxCount.textContent = `${matches.length} found`;
            }

            if (topCards.length === 0) {
                this.ajaxCardsList.innerHTML = `
                    <div class="ajax-no-results">
                        No pieces found for "${escapeHtml(query)}"
                    </div>
                `;
            } else {
                let html = '';
                topCards.forEach(item => {
                    const img = Array.isArray(item.img) ? item.img[0] : item.img;
                    html += `
                        <div class="ajax-card-item" data-id="${item.id}">
                            <img src="${img}" alt="${escapeHtml(item.name)}" class="ajax-card-thumb" loading="lazy" />
                            <div class="ajax-card-details">
                                <div class="ajax-card-cat">${escapeHtml(item.category || 'Apparel')}</div>
                                <div class="ajax-card-name">${escapeHtml(item.name)}</div>
                                <div class="ajax-card-price">$ ${item.price}</div>
                            </div>
                            <div class="ajax-card-action">
                                <button type="button" class="ajax-card-add-btn" data-id="${item.id}" title="Quick Add">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M6 1V11M1 6H11" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `;
                });
                this.ajaxCardsList.innerHTML = html;
            }

            this.ajaxDropdown.classList.add('is-visible');
        },

        hideAjaxDropdown() {
            if (this.ajaxDropdown) {
                this.ajaxDropdown.classList.remove('is-visible');
            }
        },

        // --- Top Category Filter Pills (NEW, SHIRTS, BEST SELLERS, etc.) ---
        bindTopPills() {
            this.pillBtns.forEach(pill => {
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pillKey = pill.dataset.pill;

                    if (CatalogState.filters.topPill === pillKey) {
                        // Toggle off
                        CatalogState.filters.topPill = null;
                        pill.classList.remove('is-active');
                    } else {
                        // Toggle on
                        this.pillBtns.forEach(p => p.classList.remove('is-active'));
                        pill.classList.add('is-active');
                        CatalogState.filters.topPill = pillKey;
                    }

                    CatalogState.applyFilters();
                });
            });
        },

        // --- Left Sidebar Filters (Sizes, Availability, Categories, Colors, Price, Collections, Tags, Ratings) ---
        bindSidebarFilters() {
            // 1. Size Buttons (XS, S, M, L, XL, 2X)
            document.querySelectorAll('.size-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const size = btn.dataset.size;
                    if (CatalogState.filters.sizes.has(size)) {
                        CatalogState.filters.sizes.delete(size);
                        btn.classList.remove('is-active');
                    } else {
                        CatalogState.filters.sizes.add(size);
                        btn.classList.add('is-active');
                    }
                    CatalogState.applyFilters();
                });
            });

            // 2. Availability Checkboxes
            document.querySelectorAll('.avail-chk').forEach(chk => {
                chk.addEventListener('change', () => {
                    const availKey = chk.dataset.avail;
                    if (chk.checked) {
                        CatalogState.filters.availability.add(availKey);
                    } else {
                        CatalogState.filters.availability.delete(availKey);
                    }
                    CatalogState.applyFilters();
                });
            });

            // 3. Category Checkboxes
            document.querySelectorAll('.cat-chk').forEach(chk => {
                chk.addEventListener('change', () => {
                    const cat = chk.dataset.cat;
                    if (chk.checked) {
                        CatalogState.filters.categories.add(cat);
                    } else {
                        CatalogState.filters.categories.delete(cat);
                    }
                    CatalogState.applyFilters();
                });
            });

            // 4. Color Swatches
            document.querySelectorAll('.color-filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const color = btn.dataset.color;
                    if (CatalogState.filters.colors.has(color)) {
                        CatalogState.filters.colors.delete(color);
                        btn.classList.remove('is-active');
                    } else {
                        CatalogState.filters.colors.add(color);
                        btn.classList.add('is-active');
                    }
                    CatalogState.applyFilters();
                });
            });

            // 5. Price Range Slider & Brackets
            const priceSlider = document.getElementById('priceRangeSlider');
            const priceDisplay = document.getElementById('priceDisplayMax');
            if (priceSlider && priceDisplay) {
                priceSlider.addEventListener('input', (e) => {
                    const val = parseInt(e.target.value, 10);
                    priceDisplay.textContent = `$${val}`;
                    CatalogState.filters.maxPrice = val;
                    CatalogState.applyFilters();
                });
            }

            document.querySelectorAll('.price-radio').forEach(radio => {
                radio.addEventListener('change', () => {
                    CatalogState.filters.priceBracket = radio.value;
                    CatalogState.applyFilters();
                });
            });

            // 6. Collections Checkboxes
            document.querySelectorAll('.collection-chk').forEach(chk => {
                chk.addEventListener('change', () => {
                    const coll = chk.dataset.coll;
                    if (chk.checked) {
                        CatalogState.filters.collections.add(coll);
                    } else {
                        CatalogState.filters.collections.delete(coll);
                    }
                    CatalogState.applyFilters();
                });
            });

            // 7. Tags Badges
            document.querySelectorAll('.tag-filter-badge').forEach(badge => {
                badge.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tag = badge.dataset.tag;
                    if (CatalogState.filters.tags.has(tag)) {
                        CatalogState.filters.tags.delete(tag);
                        badge.classList.remove('is-active');
                    } else {
                        CatalogState.filters.tags.add(tag);
                        badge.classList.add('is-active');
                    }
                    CatalogState.applyFilters();
                });
            });

            // 8. Rating Checkboxes
            document.querySelectorAll('.rating-chk').forEach(chk => {
                chk.addEventListener('change', () => {
                    if (chk.checked) {
                        // Uncheck other ratings (single select)
                        document.querySelectorAll('.rating-chk').forEach(c => {
                            if (c !== chk) c.checked = false;
                        });
                        CatalogState.filters.minRating = parseFloat(chk.dataset.minRating);
                    } else {
                        CatalogState.filters.minRating = 0;
                    }
                    CatalogState.applyFilters();
                });
            });

            // Reset Buttons
            const resetBtn = document.getElementById('resetFiltersBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => CatalogState.resetAllFilters());
            }

            const emptyResetBtn = document.getElementById('emptyResetBtn');
            if (emptyResetBtn) {
                emptyResetBtn.addEventListener('click', () => CatalogState.resetAllFilters());
            }

            const clearAllChipsBtn = document.getElementById('clearAllChipsBtn');
            if (clearAllChipsBtn) {
                clearAllChipsBtn.addEventListener('click', () => CatalogState.resetAllFilters());
            }
        },

        // --- Switch Product Card Angle (Arrows, Drag, Dots) ---
        switchCardAngle(card, delta, directIndex) {
            if (!card) return;
            const img = card.querySelector('.card-image');
            const dots = card.querySelectorAll('.card-dot');
            const id = parseInt(card.dataset.id, 10);
            const item = CatalogState.allItems.find(p => p.id === id);
            if (!item || !Array.isArray(item.img) || item.img.length <= 1) return;

            let currentIdx = parseInt(card.dataset.currentIdx || '0', 10);
            const total = item.img.length;

            if (directIndex !== null && directIndex !== undefined) {
                currentIdx = directIndex;
            } else if (delta) {
                currentIdx = (currentIdx + delta + total) % total;
            }

            card.dataset.currentIdx = String(currentIdx);

            if (img) {
                img.style.opacity = '0.4';
                img.style.transform = 'scale(0.97)';
                setTimeout(() => {
                    img.src = item.img[currentIdx];
                    img.style.opacity = '1';
                    img.style.transform = '';
                }, 100);
            }

            dots.forEach((d, i) => {
                d.classList.toggle('is-active', i === currentIdx);
            });
        },

        // --- Drag to Swipe Gesture ("зажатием и перелистованием") ---
        setupCardGestures(wrap) {
            let startX = 0;
            let startY = 0;
            let currentX = 0;
            let isDragging = false;
            let isTouch = false;
            let hasMoved = false;

            const img = wrap.querySelector('.card-image');
            const card = wrap.closest('.product-card');

            const onStart = (e) => {
                if (e.target.closest('.card-quick-add') || e.target.closest('.card-fav-btn') || e.target.closest('.card-dot') || e.target.closest('.card-edge-nav')) return;
                isTouch = e.type === 'touchstart';
                const point = isTouch ? e.touches[0] : e;
                startX = point.clientX;
                startY = point.clientY;
                currentX = startX;
                isDragging = true;
                hasMoved = false;
                wrap.classList.add('is-dragging');
            };

            const onMove = (e) => {
                if (!isDragging) return;
                const point = isTouch ? e.touches[0] : e;
                const dx = point.clientX - startX;
                const dy = point.clientY - startY;

                if (Math.abs(dx) > 6) {
                    hasMoved = true;
                }

                // If horizontal drag is dominant, give live spring drag feedback
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (isTouch && e.cancelable) e.preventDefault();
                    if (img) {
                        img.style.transition = 'none';
                        img.style.transform = `scale(1.02) translateX(${dx * 0.22}px)`;
                    }
                }
            };

            const onEnd = (e) => {
                if (!isDragging) return;
                isDragging = false;
                wrap.classList.remove('is-dragging');

                const point = isTouch ? (e.changedTouches ? e.changedTouches[0] : e) : e;
                const dx = (point.clientX || currentX) - startX;

                if (img) {
                    img.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                    img.style.transform = '';
                }

                // Threshold of 28px flips to next/previous photo angle
                if (Math.abs(dx) > 28 && hasMoved) {
                    const direction = dx < 0 ? 1 : -1; // drag left -> next, drag right -> prev
                    CatalogUI.switchCardAngle(card, direction);
                }
                if (hasMoved) {
                    wrap.dataset.wasDragged = 'true';
                    setTimeout(() => {
                        delete wrap.dataset.wasDragged;
                    }, 150);
                }
            };

            wrap.addEventListener('mousedown', onStart);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onEnd);

            wrap.addEventListener('touchstart', onStart, { passive: true });
            wrap.addEventListener('touchmove', onMove, { passive: false });
            wrap.addEventListener('touchend', onEnd);
            wrap.addEventListener('touchcancel', onEnd);
        },

        // --- Card Interactions (Angle Switch, Quick Add, AJAX Card Selection) ---
        bindCardInteractions() {
            // Main Grid click delegations
            if (this.grid) {
                this.grid.addEventListener('click', (e) => {
                    const card = e.target.closest('.product-card');
                    if (!card) return;

                    const id = parseInt(card.dataset.id, 10);
                    const item = CatalogState.allItems.find(p => p.id === id);
                    if (!item) return;

                    // Quick Add button click
                    const addBtn = e.target.closest('.card-quick-add');
                    if (addBtn) {
                        e.preventDefault();
                        e.stopPropagation();
                        CartManager.addItem({
                            id: String(item.id),
                            name: item.name,
                            category: item.category,
                            price: item.price,
                            img: Array.isArray(item.img) ? item.img[0] : item.img
                        }, addBtn);
                        return;
                    }

                    // Favourite button click (handled by FavouritesManager)
                    const favBtn = e.target.closest('.card-fav-btn');
                    if (favBtn) {
                        e.stopPropagation();
                        return;
                    }

                    // Invisible edge nav arrows (Prev / Next)
                    const edgeNav = e.target.closest('.card-edge-nav');
                    if (edgeNav) {
                        e.preventDefault();
                        e.stopPropagation();
                        const dir = parseInt(edgeNav.dataset.dir, 10) || 1;
                        this.switchCardAngle(card, dir);
                        return;
                    }

                    // Angle dot click
                    const dot = e.target.closest('.card-dot');
                    if (dot) {
                        e.preventDefault();
                        e.stopPropagation();
                        const idx = parseInt(dot.dataset.idx, 10);
                        this.switchCardAngle(card, null, idx);
                        return;
                    }

                    // Check if card media was being swiped/dragged
                    const wrap = card.querySelector('.card-media-wrap');
                    if (wrap && wrap.dataset.wasDragged === 'true') {
                        return;
                    }

                    // Universal PDP redirection
                    window.location.href = `product-detail.html?id=${id}`;
                });
            }

            // AJAX Dropdown card clicks & Add button animation
            if (this.ajaxCardsList) {
                this.ajaxCardsList.addEventListener('click', (e) => {
                    const addBtn = e.target.closest('.ajax-card-add-btn');
                    const cardItem = e.target.closest('.ajax-card-item');

                    if (addBtn) {
                        e.preventDefault();
                        e.stopPropagation();
                        const id = parseInt(addBtn.dataset.id, 10);
                        const item = CatalogState.allItems.find(p => p.id === id);
                        if (item) {
                            CartManager.addItem({
                                id: String(item.id),
                                name: item.name,
                                category: item.category,
                                price: item.price,
                                img: Array.isArray(item.img) ? item.img[0] : item.img
                            }, null);

                            this.triggerAjaxAddAnimation(addBtn, item);
                        }
                        return;
                    }

                    if (e.target.closest('.card-fav-btn')) {
                        e.stopPropagation();
                        return;
                    }

                    if (cardItem) {
                        e.preventDefault();
                        const id = cardItem.dataset.id;
                        this.hideAjaxDropdown();
                        window.location.href = `product-detail.html?id=${id}`;
                    }
                });
            }
        },

        // --- AJAX Add Button Morph & Flying Ghost Thumbnail Animation ---
        triggerAjaxAddAnimation(btn, item) {
            btn.classList.add('is-success');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;

            // Flying ghost clone to cart icon
            const navCartBtn = document.getElementById('navCartBtn');
            const btnRect = btn.getBoundingClientRect();
            const cartRect = navCartBtn ? navCartBtn.getBoundingClientRect() : null;

            if (cartRect) {
                const flyer = document.createElement('div');
                flyer.className = 'ghost-cart-flyer';
                const imgSrc = Array.isArray(item.img) ? item.img[0] : item.img;
                flyer.style.backgroundImage = `url('${imgSrc}')`;
                flyer.style.left = `${btnRect.left}px`;
                flyer.style.top = `${btnRect.top}px`;
                flyer.style.width = '36px';
                flyer.style.height = '36px';
                document.body.appendChild(flyer);

                requestAnimationFrame(() => {
                    const destX = cartRect.left + cartRect.width / 2 - btnRect.left - 18;
                    const destY = cartRect.top + cartRect.height / 2 - btnRect.top - 18;
                    flyer.style.transform = `translate(${destX}px, ${destY}px) scale(0.2)`;
                    flyer.style.opacity = '0';
                });

                setTimeout(() => {
                    flyer.remove();
                    const badge = document.getElementById('navCartCount');
                    if (badge) {
                        badge.classList.remove('pulse');
                        void badge.offsetWidth;
                        badge.classList.add('pulse');
                    }
                }, 650);
            }

            setTimeout(() => {
                btn.classList.remove('is-success');
                btn.innerHTML = originalHtml;
            }, 1200);
        },

        // --- Mobile Filter Drawer Handling ---
        bindMobileFilters() {
            const trigger = document.getElementById('mobileFilterTrigger');
            const sidebar = document.getElementById('catalogSidebar');
            const closeBtn = document.getElementById('sidebarCloseBtn');

            let backdrop = document.querySelector('.catalog-sidebar-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'catalog-sidebar-backdrop';
                document.body.appendChild(backdrop);
            }

            function openSidebar() {
                sidebar.classList.add('is-open');
                backdrop.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            }

            function closeSidebar() {
                sidebar.classList.remove('is-open');
                backdrop.classList.remove('is-open');
                document.body.style.overflow = '';
            }

            if (trigger) trigger.addEventListener('click', openSidebar);
            if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
            if (backdrop) backdrop.addEventListener('click', closeSidebar);
        },

        // --- Render Product Cards in 3-Column Grid ---
        renderProducts(items) {
            if (!this.grid) return;

            if (items.length === 0) {
                this.grid.innerHTML = '';
                if (this.noResults) this.noResults.style.display = 'block';
                if (this.resultsBadge) this.resultsBadge.textContent = '0 pieces';
                return;
            }

            if (this.noResults) this.noResults.style.display = 'none';
            if (this.resultsBadge) this.resultsBadge.textContent = `Showing ${items.length} pieces`;

            let html = '';
            items.forEach((item, index) => {
                const images = Array.isArray(item.img) ? item.img : [item.img];
                const mainImg = images[0];
                const delay = Math.min(index * 0.045, 0.45);

                // Multi-photo angle dots
                const dotsHtml = images.length > 1
                    ? `<div class="card-dots-bar">
                        ${images.map((_, i) => `<button type="button" class="card-dot ${i === 0 ? 'is-active' : ''}" data-idx="${i}" aria-label="Angle ${i + 1}"></button>`).join('')}
                       </div>`
                    : '';

                // Invisible edge arrows (reveals softly on hover)
                const edgeNavHtml = images.length > 1
                    ? `<button type="button" class="card-edge-nav nav-prev" data-dir="-1" aria-label="Previous angle">
                           <span class="edge-arrow-bubble">
                               <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                   <path d="M6 11L1 6L6 1" stroke="#111111" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                               </svg>
                           </span>
                       </button>
                       <button type="button" class="card-edge-nav nav-next" data-dir="1" aria-label="Next angle">
                           <span class="edge-arrow-bubble">
                               <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                   <path d="M1 11L6 6L1 1" stroke="#111111" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                               </svg>
                           </span>
                       </button>`
                    : '';

                // Color swatch box
                const sampleColor = (item.colors && item.colors[0]) || '#111111';
                const colorMeta = item.colorCount
                    ? `<span class="card-color-box" style="background-color: ${sampleColor};"></span>
                       <span class="card-color-count">+${item.colorCount}</span>`
                    : '';

                const outOfStockBadge = !item.inStock
                    ? `<span class="card-stock-tag">Out of stock</span>`
                    : '';

                html += `
                    <article class="product-card" data-id="${item.id}" data-current-idx="0" style="animation-delay: ${delay}s;">
                        <div class="card-media-wrap">
                            <img src="${mainImg}" alt="${escapeHtml(item.name)}" class="card-image" loading="lazy" />
                            ${edgeNavHtml}
                            ${dotsHtml}
                            <button type="button" class="card-fav-btn" data-id="${item.id}" data-name="${escapeHtml(item.name)}" data-price="${item.price}" data-img="${mainImg}" data-category="${escapeHtml(item.category || item.subcategory || 'Apparel')}" aria-label="Save to Favourites">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                            <button type="button" class="card-quick-add" data-id="${item.id}" aria-label="Add ${escapeHtml(item.name)} to bag">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M6 1V11M1 6H11" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div class="card-details">
                            <div class="card-meta-row">
                                <div class="card-category-swatch">
                                    <span>${escapeHtml(item.subcategory || item.category || 'Apparel')}</span>
                                    ${colorMeta}
                                </div>
                                <div class="card-price">$ ${item.price}</div>
                            </div>
                            <h3 class="card-title">${escapeHtml(item.name)}</h3>
                            ${outOfStockBadge}
                        </div>
                    </article>
                `;
            });

            this.grid.innerHTML = html;

            // Attach drag-to-swipe gesture handlers to all newly rendered cards
            this.grid.querySelectorAll('.card-media-wrap').forEach(wrap => {
                this.setupCardGestures(wrap);
            });
        },

        // --- Render Active Filter Chips ---
        renderActiveChips(filters) {
            if (!this.activeFiltersBar || !this.activeChipsWrap) return;

            const chips = [];

            if (filters.search) {
                chips.push({ label: `"${filters.search}"`, key: 'search' });
            }
            if (filters.topPill) {
                chips.push({ label: filters.topPill.toUpperCase(), key: 'topPill' });
            }
            filters.sizes.forEach(s => chips.push({ label: `Size: ${s}`, key: 'size', val: s }));
            filters.availability.forEach(a => chips.push({ label: a === 'inStock' ? 'In Stock' : 'Out of Stock', key: 'avail', val: a }));
            filters.categories.forEach(c => chips.push({ label: c, key: 'cat', val: c }));
            filters.colors.forEach(c => chips.push({ label: c, key: 'color', val: c }));
            if (filters.maxPrice < 300) {
                chips.push({ label: `Under $${filters.maxPrice}`, key: 'maxPrice' });
            }
            if (filters.priceBracket !== 'all') {
                chips.push({ label: filters.priceBracket, key: 'priceBracket' });
            }
            filters.collections.forEach(c => chips.push({ label: c, key: 'coll', val: c }));
            filters.tags.forEach(t => chips.push({ label: t, key: 'tag', val: t }));
            if (filters.minRating > 0) {
                chips.push({ label: `★ ${filters.minRating}+`, key: 'rating' });
            }

            // Mobile badge count
            const mobileCount = document.getElementById('mobileFilterActiveCount');
            if (mobileCount) mobileCount.textContent = chips.length;

            if (chips.length === 0) {
                this.activeFiltersBar.style.display = 'none';
                this.activeChipsWrap.innerHTML = '';
                return;
            }

            this.activeFiltersBar.style.display = 'flex';
            this.activeChipsWrap.innerHTML = chips.map((c, i) => `
                <span class="filter-chip">
                    ${escapeHtml(c.label)}
                    <button type="button" class="filter-chip-remove" data-chip-idx="${i}" aria-label="Remove filter">&times;</button>
                </span>
            `).join('');

            // Chip removal events
            this.activeChipsWrap.querySelectorAll('.filter-chip-remove').forEach((btn, idx) => {
                btn.addEventListener('click', () => {
                    const chip = chips[idx];
                    if (!chip) return;

                    if (chip.key === 'search') {
                        CatalogState.filters.search = '';
                        if (CatalogUI.searchInput) CatalogUI.searchInput.value = '';
                    } else if (chip.key === 'topPill') {
                        CatalogState.filters.topPill = null;
                        CatalogUI.pillBtns.forEach(p => p.classList.remove('is-active'));
                    } else if (chip.key === 'size') {
                        CatalogState.filters.sizes.delete(chip.val);
                        const b = document.querySelector(`.size-btn[data-size="${chip.val}"]`);
                        if (b) b.classList.remove('is-active');
                    } else if (chip.key === 'avail') {
                        CatalogState.filters.availability.delete(chip.val);
                        const chk = document.querySelector(`.avail-chk[data-avail="${chip.val}"]`);
                        if (chk) chk.checked = false;
                    } else if (chip.key === 'cat') {
                        CatalogState.filters.categories.delete(chip.val);
                        const chk = document.querySelector(`.cat-chk[data-cat="${chip.val}"]`);
                        if (chk) chk.checked = false;
                    } else if (chip.key === 'color') {
                        CatalogState.filters.colors.delete(chip.val);
                        const b = document.querySelector(`.color-filter-btn[data-color="${chip.val}"]`);
                        if (b) b.classList.remove('is-active');
                    } else if (chip.key === 'maxPrice') {
                        CatalogState.filters.maxPrice = 300;
                        const s = document.getElementById('priceRangeSlider');
                        const l = document.getElementById('priceDisplayMax');
                        if (s) s.value = 300;
                        if (l) l.textContent = '$300';
                    } else if (chip.key === 'priceBracket') {
                        CatalogState.filters.priceBracket = 'all';
                        const r = document.querySelector('.price-radio[value="all"]');
                        if (r) r.checked = true;
                    } else if (chip.key === 'coll') {
                        CatalogState.filters.collections.delete(chip.val);
                        const chk = document.querySelector(`.collection-chk[data-coll="${chip.val}"]`);
                        if (chk) chk.checked = false;
                    } else if (chip.key === 'tag') {
                        CatalogState.filters.tags.delete(chip.val);
                        const b = document.querySelector(`.tag-filter-badge[data-tag="${chip.val}"]`);
                        if (b) b.classList.remove('is-active');
                    } else if (chip.key === 'rating') {
                        CatalogState.filters.minRating = 0;
                        document.querySelectorAll('.rating-chk').forEach(c => c.checked = false);
                    }

                    CatalogState.applyFilters();
                });
            });
        },

        resetControls() {
            if (this.searchInput) this.searchInput.value = '';
            if (this.searchClearBtn) this.searchClearBtn.style.display = 'none';
            this.hideAjaxDropdown();

            this.pillBtns.forEach(p => p.classList.remove('is-active'));
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('is-active'));
            document.querySelectorAll('.avail-chk').forEach(c => c.checked = false);
            document.querySelectorAll('.cat-chk').forEach(c => c.checked = false);
            document.querySelectorAll('.color-filter-btn').forEach(b => b.classList.remove('is-active'));
            document.querySelectorAll('.collection-chk').forEach(c => c.checked = false);
            document.querySelectorAll('.tag-filter-badge').forEach(b => b.classList.remove('is-active'));
            document.querySelectorAll('.rating-chk').forEach(c => c.checked = false);

            const priceSlider = document.getElementById('priceRangeSlider');
            const priceDisplay = document.getElementById('priceDisplayMax');
            if (priceSlider) priceSlider.value = 300;
            if (priceDisplay) priceDisplay.textContent = '$300';

            const defaultRadio = document.querySelector('.price-radio[value="all"]');
            if (defaultRadio) defaultRadio.checked = true;
        }
    };


    // =========================================================================
    // 3. EDITORIAL CART MANAGER (SYNCHRONIZED VIA LOCALSTORAGE)
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

            // Wishlist toast
            const favBtn = document.getElementById('navFavBtn');
            if (favBtn) {
                favBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showToast('Item saved to your Wishlist ♥');
                });
            }
        },

        addItem(product, btnElement) {
            const existing = this.items.find(i => i.id === product.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                this.items.push({ ...product, quantity: 1 });
            }

            this.render();

            if (btnElement) {
                btnElement.classList.add('is-added');
                setTimeout(() => {
                    btnElement.classList.remove('is-added');
                }, 900);
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
                        <p>Explore our latest pieces and functional filters.</p>
                    </div>
                `;
                return;
            }

            let html = '';
            this.items.forEach(item => {
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-img-wrap">
                            <img src="${item.img}" alt="${escapeHtml(item.name)}" class="cart-item-img" />
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-top">
                                <span class="cart-item-cat">${escapeHtml(item.category)}</span>
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

            // Bind remove & quantity buttons
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
    // 4. VISA CHECKOUT MODAL
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

            // Real-time card formatting & preview sync
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
    // 5. MOBILE DRAWER NAVIGATION
    // =========================================================================
    const MobileNav = {
        init() {
            this.menuBtn = document.getElementById('mobileMenuBtn');
            this.overlay = document.getElementById('mobileNavOverlay');
            this.drawer = document.getElementById('mobileNavDrawer');
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


    // --- Helper Utilities ---
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    // =========================================================================
    // 6. INITIALIZATION
    // =========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        CatalogState.init();
        CartManager.init();
        CheckoutModal.init();
        MobileNav.init();

        // Navbar shadow on scroll
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.catalog-navbar');
            if (nav) {
                nav.classList.toggle('scrolled', window.scrollY > 20);
            }
        });
    });

    window.CatalogState = CatalogState;
    window.CartManager = CartManager;

})();
