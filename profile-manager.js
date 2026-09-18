/**
 * XIV PROFILE & AUTHENTICATION MANAGER (profile-manager.js)
 * Universal account system across all pages of the XIV STORE.
 * Handles user sessions, registration, login, dashboard, dynamic navbar badges, and checkout autofill.
 */

(function () {
    'use strict';

    const STORAGE_SESSION = 'xiv_user_session';
    const STORAGE_USERS = 'xiv_registered_users';

    // Default Demo Accounts for testing
    const DEFAULT_USERS = [
        {
            name: 'Alexandre Laurent',
            email: 'alex@xiv.luxury',
            password: 'password123',
            phone: '+1 (555) 234-5678',
            tier: 'XIV Privileged Member',
            memberSince: '2024'
        }
    ];

    const ProfileManager = {
        currentUser: null,
        modalMounted: false,

        init() {
            this.ensureDefaultUsers();
            this.loadSession();
            this.mountModal();
            this.bindEvents();
            this.updateNavbarUI();
            this.autofillCheckout();

            // Multi-tab sync
            window.addEventListener('storage', (e) => {
                if (e.key === STORAGE_SESSION || e.key === STORAGE_USERS) {
                    this.loadSession();
                    this.updateNavbarUI();
                    if (this.isModalOpen()) {
                        this.renderCurrentView();
                    }
                }
            });

            // Live cart / favourites sync
            window.addEventListener('xiv_favourites_changed', () => this.updateDashboardStats());
            window.addEventListener('storage', () => this.updateDashboardStats());
        },

        /* -------------------------------------------------------------
         * 1. STORAGE & SESSION MANAGEMENT
         * ----------------------------------------------------------- */
        ensureDefaultUsers() {
            try {
                const users = localStorage.getItem(STORAGE_USERS);
                if (!users) {
                    localStorage.setItem(STORAGE_USERS, JSON.stringify(DEFAULT_USERS));
                }
            } catch (e) {
                console.warn('ProfileManager: localStorage access error', e);
            }
        },

        getRegisteredUsers() {
            try {
                const users = localStorage.getItem(STORAGE_USERS);
                return users ? JSON.parse(users) : DEFAULT_USERS;
            } catch (e) {
                return DEFAULT_USERS;
            }
        },

        saveRegisteredUsers(users) {
            try {
                localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
            } catch (e) {
                console.warn('ProfileManager: error saving users', e);
            }
        },

        loadSession() {
            try {
                const session = localStorage.getItem(STORAGE_SESSION);
                this.currentUser = session ? JSON.parse(session) : null;
            } catch (e) {
                this.currentUser = null;
            }
        },

        setSession(user) {
            this.currentUser = {
                name: user.name,
                email: user.email.toLowerCase(),
                phone: user.phone || '',
                tier: user.tier || 'XIV Privileged Member',
                memberSince: user.memberSince || new Date().getFullYear().toString(),
                initials: this.getInitials(user.name)
            };

            try {
                localStorage.setItem(STORAGE_SESSION, JSON.stringify(this.currentUser));
            } catch (e) {
                console.warn('ProfileManager: error saving session', e);
            }

            window.dispatchEvent(new CustomEvent('xiv_auth_changed', { detail: { user: this.currentUser } }));
            this.updateNavbarUI();
            this.autofillCheckout();
        },

        clearSession() {
            this.currentUser = null;
            try {
                localStorage.removeItem(STORAGE_SESSION);
            } catch (e) {
                console.warn('ProfileManager: error clearing session', e);
            }

            window.dispatchEvent(new CustomEvent('xiv_auth_changed', { detail: { user: null } }));
            this.updateNavbarUI();
        },

        getInitials(name) {
            if (!name) return 'XIV';
            const parts = name.trim().split(/\s+/);
            if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        },

        /* -------------------------------------------------------------
         * 2. MODAL MOUNTING & HTML INJECTION
         * ----------------------------------------------------------- */
        mountModal() {
            if (document.getElementById('xivAuthOverlay')) {
                this.modalMounted = true;
                return;
            }

            const html = `
            <div id="xivAuthOverlay" class="xiv-auth-overlay" role="dialog" aria-modal="true" aria-labelledby="xivAuthTitle">
                <div class="xiv-auth-modal">
                    
                    <!-- Header -->
                    <div class="xiv-auth-header">
                        <div class="xiv-auth-brand-badge">
                            <svg class="xiv-auth-brand-logo" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="17.5" width="24.7487" height="24.7487" transform="rotate(45 17.5 0)" fill="#D9D9D9"/>
                                <path d="M34.6466 17.5002L17.75 34.3969V0.603527L34.6466 17.5002Z" fill="black" stroke="#060606" stroke-width="0.5"/>
                            </svg>
                            <span class="xiv-auth-brand-title" id="xivAuthTitle">XIV CLIENT SUITE</span>
                        </div>
                        <p class="xiv-auth-subtitle" id="xivAuthSubtitle">High Fashion Account & Privileges</p>
                        
                        <button type="button" class="xiv-auth-close-btn" id="xivAuthCloseBtn" aria-label="Close dialog">
                            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Tabs Switcher (Sign In / Register) -->
                    <div class="xiv-auth-tabs" id="xivAuthTabs">
                        <button type="button" class="xiv-auth-tab active" data-view="signin" id="tabSignIn">Sign In</button>
                        <button type="button" class="xiv-auth-tab" data-view="register" id="tabRegister">Create Account</button>
                    </div>

                    <!-- Main Body Views -->
                    <div class="xiv-auth-body">
                        
                        <!-- Global Error Notice -->
                        <div class="xiv-auth-error" id="xivAuthError" role="alert"></div>

                        <!-- 1. SIGN IN VIEW -->
                        <form class="xiv-auth-view active" id="xivViewSignIn" novalidate autocomplete="on">
                            <div class="xiv-form-group">
                                <label class="xiv-form-label" for="xivSignInEmail">Email Address</label>
                                <div class="xiv-input-wrap">
                                    <input type="email" id="xivSignInEmail" class="xiv-form-input" placeholder="name@example.com" required autocomplete="email">
                                </div>
                            </div>

                            <div class="xiv-form-group">
                                <label class="xiv-form-label" for="xivSignInPassword">Password</label>
                                <div class="xiv-input-wrap">
                                    <input type="password" id="xivSignInPassword" class="xiv-form-input" placeholder="••••••••" required autocomplete="current-password">
                                    <button type="button" class="xiv-password-toggle" data-target="xivSignInPassword" aria-label="Toggle password visibility">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div class="xiv-form-extra">
                                <label class="xiv-checkbox-wrap">
                                    <input type="checkbox" id="xivRememberMe" checked>
                                    <span>Remember me</span>
                                </label>
                                <button type="button" class="xiv-link-btn" id="xivForgotPasswordBtn">Forgot password?</button>
                            </div>

                            <button type="submit" class="xiv-submit-btn" id="xivSignInSubmit">
                                <span>SIGN IN TO ACCOUNT</span>
                                <svg width="16" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 6H22M17 1L22 6L17 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <!-- Quick Demo Access -->
                            <button type="button" class="xiv-demo-btn" id="xivDemoLoginBtn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>Demo Fast Access (1-Click)</span>
                            </button>
                        </form>

                        <!-- 2. REGISTER VIEW -->
                        <form class="xiv-auth-view" id="xivViewRegister" novalidate autocomplete="on">
                            <div class="xiv-form-group">
                                <label class="xiv-form-label" for="xivRegName">Full Name</label>
                                <div class="xiv-input-wrap">
                                    <input type="text" id="xivRegName" class="xiv-form-input" placeholder="Jane Doe" required autocomplete="name">
                                </div>
                            </div>

                            <div class="xiv-form-group">
                                <label class="xiv-form-label" for="xivRegEmail">Email Address</label>
                                <div class="xiv-input-wrap">
                                    <input type="email" id="xivRegEmail" class="xiv-form-input" placeholder="jane@example.com" required autocomplete="email">
                                </div>
                            </div>

                            <div class="xiv-form-group">
                                <label class="xiv-form-label" for="xivRegPassword">Create Password</label>
                                <div class="xiv-input-wrap">
                                    <input type="password" id="xivRegPassword" class="xiv-form-input" placeholder="Min. 6 characters" required autocomplete="new-password">
                                    <button type="button" class="xiv-password-toggle" data-target="xivRegPassword" aria-label="Toggle password visibility">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div class="xiv-form-group">
                                <label class="xiv-form-label" for="xivRegConfirmPassword">Confirm Password</label>
                                <div class="xiv-input-wrap">
                                    <input type="password" id="xivRegConfirmPassword" class="xiv-form-input" placeholder="Repeat password" required autocomplete="new-password">
                                </div>
                            </div>

                            <div class="xiv-form-extra">
                                <label class="xiv-checkbox-wrap">
                                    <input type="checkbox" id="xivRegTerms" checked required>
                                    <span>I agree to XIV Privileges & Privacy</span>
                                </label>
                            </div>

                            <button type="submit" class="xiv-submit-btn" id="xivRegisterSubmit">
                                <span>CREATE XIV ACCOUNT</span>
                                <svg width="16" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 6H22M17 1L22 6L17 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </form>

                        <!-- 3. LOGGED-IN DASHBOARD VIEW -->
                        <div class="xiv-auth-view" id="xivViewDashboard">
                            <div class="xiv-profile-card">
                                <div class="xiv-profile-avatar-wrap">
                                    <span id="xivProfileAvatarText">JD</span>
                                    <span class="xiv-profile-online-badge" title="Active"></span>
                                </div>
                                <h3 class="xiv-profile-name" id="xivProfileDisplayName">Jane Doe</h3>
                                <div class="xiv-profile-email" id="xivProfileDisplayEmail">jane@example.com</div>
                                <span class="xiv-profile-tier-badge" id="xivProfileDisplayTier">XIV Privileged Member</span>

                                <!-- Stats Counters -->
                                <div class="xiv-profile-stats">
                                    <a href="favourites.html" class="xiv-stat-box" id="statWishlistBox">
                                        <span class="xiv-stat-value" id="xivStatWishlist">0</span>
                                        <span class="xiv-stat-label">Saved Items</span>
                                    </a>
                                    <a href="shopping.html" class="xiv-stat-box" id="statCartBox">
                                        <span class="xiv-stat-value" id="xivStatCart">0</span>
                                        <span class="xiv-stat-label">In Bag</span>
                                    </a>
                                </div>

                                <!-- Action Buttons -->
                                <div class="xiv-profile-actions">
                                    <a href="favourites.html" class="xiv-profile-btn-secondary">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                        </svg>
                                        <span>View Wishlist</span>
                                    </a>

                                    <a href="shopping.html" class="xiv-profile-btn-secondary">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                            <line x1="3" y1="6" x2="21" y2="6"/>
                                            <path d="M16 10a4 4 0 0 1-8 0"/>
                                        </svg>
                                        <span>View Shopping Bag</span>
                                    </a>

                                    <button type="button" class="xiv-logout-btn" id="xivLogoutBtn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        <span>Sign Out of Account</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>`;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper.firstElementChild);
            this.modalMounted = true;
        },

        /* -------------------------------------------------------------
         * 3. EVENT BINDINGS
         * ----------------------------------------------------------- */
        bindEvents() {
            // Click on profile buttons in navbar
            document.addEventListener('click', (e) => {
                const profileTrigger = e.target.closest('.profile, #navProfileBtn, [aria-label="User Profile" i], [aria-label="User profile" i]');
                if (profileTrigger) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openModal();
                }
            });

            const overlay = document.getElementById('xivAuthOverlay');
            const closeBtn = document.getElementById('xivAuthCloseBtn');
            const tabs = document.querySelectorAll('.xiv-auth-tab');

            // Close actions
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }

            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeModal();
                    }
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isModalOpen()) {
                    this.closeModal();
                }
            });

            // Tabs toggle (Sign In vs Register)
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const view = tab.getAttribute('data-view');
                    this.switchView(view);
                });
            });

            // Password eye toggles
            document.querySelectorAll('.xiv-password-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = btn.getAttribute('data-target');
                    const input = document.getElementById(targetId);
                    if (!input) return;

                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    btn.style.color = isPassword ? '#111111' : '#888888';
                });
            });

            // Sign In form submit
            const signInForm = document.getElementById('xivViewSignIn');
            if (signInForm) {
                signInForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSignIn();
                });
            }

            // Register form submit
            const regForm = document.getElementById('xivViewRegister');
            if (regForm) {
                regForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }

            // Demo Login Button
            const demoBtn = document.getElementById('xivDemoLoginBtn');
            if (demoBtn) {
                demoBtn.addEventListener('click', () => {
                    this.handleDemoLogin();
                });
            }

            // Forgot password mock
            const forgotBtn = document.getElementById('xivForgotPasswordBtn');
            if (forgotBtn) {
                forgotBtn.addEventListener('click', () => {
                    alert('Password reset link will be sent to your registered email address.');
                });
            }

            // Logout button
            const logoutBtn = document.getElementById('xivLogoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    this.handleLogout();
                });
            }
        },

        /* -------------------------------------------------------------
         * 4. MODAL OPEN/CLOSE & VIEW SWITCHING
         * ----------------------------------------------------------- */
        openModal() {
            this.mountModal();
            const overlay = document.getElementById('xivAuthOverlay');
            if (!overlay) return;

            this.clearError();
            this.renderCurrentView();

            overlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        },

        closeModal() {
            const overlay = document.getElementById('xivAuthOverlay');
            if (!overlay) return;

            overlay.classList.remove('is-open');

            // Only restore body scrolling if cart drawer or other modals are not open
            const cartOpen = document.querySelector('.cart-drawer-overlay.is-open');
            const checkoutOpen = document.querySelector('.checkout-modal-overlay.is-open');
            if (!cartOpen && !checkoutOpen) {
                document.body.style.overflow = '';
            }
        },

        isModalOpen() {
            const overlay = document.getElementById('xivAuthOverlay');
            return overlay && overlay.classList.contains('is-open');
        },

        renderCurrentView() {
            const tabsContainer = document.getElementById('xivAuthTabs');
            const subtitle = document.getElementById('xivAuthSubtitle');

            if (this.currentUser) {
                // Show dashboard
                if (tabsContainer) tabsContainer.style.display = 'none';
                if (subtitle) subtitle.textContent = 'Active Client Membership';

                document.querySelectorAll('.xiv-auth-view').forEach(v => v.classList.remove('active'));
                const dash = document.getElementById('xivViewDashboard');
                if (dash) dash.classList.add('active');

                // Populate dashboard
                const nameEl = document.getElementById('xivProfileDisplayName');
                const emailEl = document.getElementById('xivProfileDisplayEmail');
                const tierEl = document.getElementById('xivProfileDisplayTier');
                const avatarEl = document.getElementById('xivProfileAvatarText');

                if (nameEl) nameEl.textContent = this.currentUser.name;
                if (emailEl) emailEl.textContent = this.currentUser.email;
                if (tierEl) tierEl.textContent = this.currentUser.tier;
                if (avatarEl) avatarEl.textContent = this.currentUser.initials;

                this.updateDashboardStats();
            } else {
                // Show sign in by default
                if (tabsContainer) tabsContainer.style.display = 'flex';
                if (subtitle) subtitle.textContent = 'High Fashion Account & Privileges';
                this.switchView('signin');
            }
        },

        switchView(viewName) {
            this.clearError();

            const tabSignIn = document.getElementById('tabSignIn');
            const tabReg = document.getElementById('tabRegister');
            const viewSignIn = document.getElementById('xivViewSignIn');
            const viewReg = document.getElementById('xivViewRegister');
            const viewDash = document.getElementById('xivViewDashboard');

            if (viewDash) viewDash.classList.remove('active');

            if (viewName === 'signin') {
                if (tabSignIn) tabSignIn.classList.add('active');
                if (tabReg) tabReg.classList.remove('active');
                if (viewSignIn) viewSignIn.classList.add('active');
                if (viewReg) viewReg.classList.remove('active');
            } else if (viewName === 'register') {
                if (tabReg) tabReg.classList.add('active');
                if (tabSignIn) tabSignIn.classList.remove('active');
                if (viewReg) viewReg.classList.add('active');
                if (viewSignIn) viewSignIn.classList.remove('active');
            }
        },

        showError(message) {
            const err = document.getElementById('xivAuthError');
            if (err) {
                err.textContent = message;
                err.classList.add('is-visible');
            }
        },

        clearError() {
            const err = document.getElementById('xivAuthError');
            if (err) {
                err.textContent = '';
                err.classList.remove('is-visible');
            }
        },

        /* -------------------------------------------------------------
         * 5. AUTH LOGIC (SIGN IN, REGISTER, LOGOUT)
         * ----------------------------------------------------------- */
        handleSignIn() {
            const emailInput = document.getElementById('xivSignInEmail');
            const passInput = document.getElementById('xivSignInPassword');
            if (!emailInput || !passInput) return;

            const email = emailInput.value.trim().toLowerCase();
            const password = passInput.value;

            if (!email || !password) {
                this.showError('Please enter both your email address and password.');
                return;
            }

            const users = this.getRegisteredUsers();
            const matchedUser = users.find(u => u.email.toLowerCase() === email && u.password === password);

            if (!matchedUser) {
                this.showError('Invalid email or password. You can use the 1-Click Demo button or create a new account.');
                return;
            }

            // Success!
            this.setSession(matchedUser);
            this.renderCurrentView();
            this.showToast(`Welcome back, ${matchedUser.name}!`);
        },

        handleRegister() {
            const nameInput = document.getElementById('xivRegName');
            const emailInput = document.getElementById('xivRegEmail');
            const passInput = document.getElementById('xivRegPassword');
            const confirmInput = document.getElementById('xivRegConfirmPassword');
            const termsInput = document.getElementById('xivRegTerms');

            if (!nameInput || !emailInput || !passInput || !confirmInput) return;

            const name = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const password = passInput.value;
            const confirmPassword = confirmInput.value;

            if (!name) {
                this.showError('Please enter your full name.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                this.showError('Please enter a valid email address.');
                return;
            }

            if (password.length < 6) {
                this.showError('Password must contain at least 6 characters.');
                return;
            }

            if (password !== confirmPassword) {
                this.showError('Passwords do not match. Please verify.');
                return;
            }

            if (termsInput && !termsInput.checked) {
                this.showError('You must agree to the XIV Privileges & Privacy terms.');
                return;
            }

            const users = this.getRegisteredUsers();
            if (users.some(u => u.email.toLowerCase() === email)) {
                this.showError('An account with this email address already exists.');
                return;
            }

            const newUser = {
                name,
                email,
                password,
                phone: '',
                tier: 'XIV Privileged Member',
                memberSince: new Date().getFullYear().toString()
            };

            users.push(newUser);
            this.saveRegisteredUsers(users);
            this.setSession(newUser);

            this.renderCurrentView();
            this.showToast(`Account created! Welcome to XIV, ${newUser.name}.`);
        },

        handleDemoLogin() {
            const demoUser = DEFAULT_USERS[0];
            this.setSession(demoUser);
            this.renderCurrentView();
            this.showToast(`Logged in as Demo Client: ${demoUser.name}`);
        },

        handleLogout() {
            this.clearSession();
            this.renderCurrentView();
            this.showToast('You have been signed out.');
        },

        /* -------------------------------------------------------------
         * 6. UI SYNCHRONIZATION (NAVBAR, STATS, CHECKOUT)
         * ----------------------------------------------------------- */
        updateNavbarUI() {
            const profileButtons = document.querySelectorAll('.profile, #navProfileBtn, [aria-label="User Profile" i], [aria-label="User profile" i]');

            profileButtons.forEach(btn => {
                if (this.currentUser) {
                    btn.innerHTML = `<span class="nav-profile-badge" title="Signed in as ${this.currentUser.name}">${this.currentUser.initials}</span>`;
                    btn.setAttribute('aria-label', `Profile of ${this.currentUser.name}`);
                    btn.classList.add('is-logged-in');
                } else {
                    btn.innerHTML = `
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff" style="color: #ffffff; fill: #ffffff;">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V21.6h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="#ffffff"/>
                        </svg>`;
                    btn.setAttribute('aria-label', 'User Profile');
                    btn.classList.remove('is-logged-in');
                }
            });
        },

        updateDashboardStats() {
            const statWishlist = document.getElementById('xivStatWishlist');
            const statCart = document.getElementById('xivStatCart');

            if (statWishlist) {
                let count = 0;
                if (window.FavouritesManager && typeof window.FavouritesManager.getItems === 'function') {
                    count = window.FavouritesManager.getItems().length;
                } else {
                    try {
                        const favs = JSON.parse(localStorage.getItem('xiv_favourites') || '[]');
                        count = Array.isArray(favs) ? favs.length : 0;
                    } catch (_) {}
                }
                statWishlist.textContent = count;
            }

            if (statCart) {
                let count = 0;
                try {
                    const cart = JSON.parse(localStorage.getItem('xiv_cart_items') || '[]');
                    if (Array.isArray(cart)) {
                        count = cart.reduce((sum, it) => sum + (it.quantity || 1), 0);
                    }
                } catch (_) {}
                statCart.textContent = count;
            }
        },

        autofillCheckout() {
            if (!this.currentUser) return;

            const emailInput = document.getElementById('email');
            const firstNameInput = document.getElementById('firstName');
            const lastNameInput = document.getElementById('lastName');
            const phoneInput = document.getElementById('phone');

            if (emailInput && !emailInput.value) {
                emailInput.value = this.currentUser.email;
            }

            if (firstNameInput && !firstNameInput.value && this.currentUser.name) {
                const parts = this.currentUser.name.split(' ');
                firstNameInput.value = parts[0] || '';
                if (lastNameInput && !lastNameInput.value && parts.length > 1) {
                    lastNameInput.value = parts.slice(1).join(' ');
                }
            }

            if (phoneInput && !phoneInput.value && this.currentUser.phone) {
                phoneInput.value = this.currentUser.phone;
            }
        },

        showToast(message) {
            // Use existing toast system if available or create a luxury toast
            const existingToast = document.querySelector('.fav-toast-notification, .cart-toast');
            if (existingToast) {
                const msgEl = existingToast.querySelector('.fav-toast-msg, span') || existingToast;
                msgEl.textContent = message;
                existingToast.classList.add('show');
                setTimeout(() => existingToast.classList.remove('show'), 3000);
                return;
            }

            let toast = document.getElementById('xivAuthToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'xivAuthToast';
                toast.style.cssText = `
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: #111111;
                    color: #ffffff;
                    padding: 14px 22px;
                    border-radius: 9999px;
                    font-size: 13px;
                    font-weight: 600;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    z-index: 100010;
                    transform: translateY(20px);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    pointer-events: none;
                    font-family: 'Inter', Arial, sans-serif;
                    letter-spacing: 0.2px;
                `;
                document.body.appendChild(toast);
            }

            toast.textContent = message;
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
            }, 3000);
        }
    };

    // Auto-init on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ProfileManager.init());
    } else {
        ProfileManager.init();
    }

    window.ProfileManager = ProfileManager;
})();
