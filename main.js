// Complete Fixed main.js - Page Management and Navigation
async function loadPage(pageName) {
    try {
        const response = await fetch(`pages/${pageName}.html`);
        const content = await response.text();
        document.getElementById('main-content').innerHTML = content;
        
        // Initialize page-specific functionality with delay for DOM readiness
        setTimeout(() => {
            if (pageName === 'dashboard' && typeof initializeDashboard === 'function') {
                initializeDashboard();
            } else if (pageName === 'account' && typeof initializeAccount === 'function') {
                initializeAccount();
            } else if (pageName === 'landing') {
                // Landing page doesn't need special initialization
                console.log('Landing page loaded');
            }
        }, 100);
        
        console.log(`${pageName} page loaded successfully`);
    } catch (error) {
        console.error('Error loading page:', error);
        
        // Load default content based on page name
        if (pageName === 'landing') {
            loadLandingPageContent();
        } else if (pageName === 'account') {
            loadAccountPageContent();
        } else {
            document.getElementById('main-content').innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem;">
                    <h2>Page Not Found</h2>
                    <p>The requested page could not be loaded.</p>
                    <button onclick="loadPage('landing')" class="btn btn-primary">Go Home</button>
                </div>
            `;
        }
    }
}

// Load landing page content directly (for when pages folder doesn't exist)
function loadLandingPageContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <!-- Hero Section -->
            <section class="hero" id="home">
                <div class="hero-content">
                    <h1 class="hero-title">Complete Financial Management Platform</h1>
                    <p class="hero-subtitle">Send money instantly with UPI, track all your accounts, manage investments, and achieve your financial goals - all in one secure platform.</p>
                    <div class="cta-buttons">
                        <button onclick="openLoginModal()" class="btn btn-primary">
                            <i class="fas fa-rocket"></i>
                            Get Started Free
                        </button>
                        <button onclick="openProductsModal()" class="btn btn-secondary">
                            <i class="fas fa-th-large"></i>
                            Explore Products
                        </button>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="features-section" id="features">
                <h2 class="section-title">Everything You Need in One App</h2>
                <p class="section-subtitle">Comprehensive financial tools to manage, grow, and protect your money with bank-grade security.</p>
                
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon" style="background: #dbeafe; color: var(--primary);">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <h3 class="feature-title">Instant UPI Payments</h3>
                        <p class="feature-description">Send and receive money instantly using UPI. Pay bills, split expenses, and transfer funds with just a phone number or UPI ID.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon" style="background: #d1fae5; color: var(--success);">
                            <i class="fas fa-university"></i>
                        </div>
                        <h3 class="feature-title">Account Aggregation</h3>
                        <p class="feature-description">Connect all your bank accounts, credit cards, and investments. Get a unified view of your complete financial picture.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon" style="background: #fef3c7; color: var(--warning);">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3 class="feature-title">Investment Tracking</h3>
                        <p class="feature-description">Monitor your mutual funds, stocks, and SIP investments. Track performance and get personalized investment insights.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon" style="background: #e0e7ff; color: #6366f1;">
                            <i class="fas fa-receipt"></i>
                        </div>
                        <h3 class="feature-title">Expense Analytics</h3>
                        <p class="feature-description">Automatic expense categorization, spending insights, and budget tracking. Know where every rupee goes.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon" style="background: #f3e8ff; color: #a855f7;">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <h3 class="feature-title">Bill Management</h3>
                        <p class="feature-description">Never miss a payment. Set up automatic bill reminders and pay utilities, credit cards, and loans on time.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon" style="background: #fecaca; color: var(--danger);">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h3 class="feature-title">Financial Security</h3>
                        <p class="feature-description">Bank-grade encryption, biometric authentication, and real-time fraud detection keep your money safe.</p>
                    </div>
                </div>
            </section>

            <!-- Security Features -->
            <section class="security-section" id="security">
                <h2 class="section-title">Bank-Grade Security</h2>
                <p class="section-subtitle">Your money and data are protected with the highest security standards.</p>
                
                <div class="security-features">
                    <div class="security-card">
                        <div class="security-icon">
                            <i class="fas fa-fingerprint"></i>
                        </div>
                        <h3>Biometric Authentication</h3>
                        <p>Login with fingerprint or face recognition. Your biometrics never leave your device.</p>
                    </div>

                    <div class="security-card">
                        <div class="security-icon">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h3>256-bit Encryption</h3>
                        <p>All data is encrypted using military-grade AES-256 encryption, same as banks use.</p>
                    </div>

                    <div class="security-card">
                        <div class="security-icon">
                            <i class="fas fa-shield-virus"></i>
                        </div>
                        <h3>Fraud Detection</h3>
                        <p>AI-powered fraud detection monitors transactions 24/7 and alerts you of suspicious activity.</p>
                    </div>

                    <div class="security-card">
                        <div class="security-icon">
                            <i class="fas fa-user-shield"></i>
                        </div>
                        <h3>Two-Factor Authentication</h3>
                        <p>Additional security layer with OTP verification for all sensitive transactions.</p>
                    </div>
                </div>
            </section>
        `;
    }
}

// Load account page content directly
function loadAccountPageContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <section class="account-section">
                <div class="account-container">
                    <!-- Profile Header -->
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <div class="avatar-circle" id="userAvatar">
                                <span id="avatarInitials">U</span>
                            </div>
                        </div>
                        <div class="profile-info">
                            <h1 class="profile-name" id="profileDisplayName">Hi, User</h1>
                            <div class="account-status-alert">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>Complete your financial profile to unlock all investment and banking features.</span>
                                <button onclick="openProfileSetupModal()" class="btn-complete">Complete Setup</button>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Settings Section with iOS Toggle Switches -->
                    <div class="settings-toggle-section">
                        <h2 style="margin-bottom: 2rem; color: var(--text-primary);">Settings & Preferences</h2>
                        
                        <div class="toggle-setting-item">
                            <div class="toggle-setting-info">
                                <h3>Privacy mode</h3>
                                <p>Hide sensitive financial information with blur effect. When enabled, all amounts and balances will be hidden across the app.</p>
                            </div>
                            <button class="ios-toggle" id="privacyToggle" onclick="togglePrivacyMode()">
                                <div class="ios-toggle-slider"></div>
                            </button>
                        </div>

                        <div class="toggle-setting-item">
                            <div class="toggle-setting-info">
                                <h3>Dark theme</h3>
                                <p>Switch between light and dark theme for comfortable viewing. Dark theme reduces eye strain in low-light conditions.</p>
                            </div>
                            <button class="ios-toggle" id="themeToggle" onclick="toggleTheme()">
                                <div class="ios-toggle-slider"></div>
                            </button>
                        </div>

                        <div class="toggle-setting-item">
                            <div class="toggle-setting-info">
                                <h3>Email notifications</h3>
                                <p>Receive email notifications for important account activities, transactions, and updates.</p>
                            </div>
                            <button class="ios-toggle active" id="emailToggle" onclick="toggleEmailNotifications()">
                                <div class="ios-toggle-slider"></div>
                            </button>
                        </div>

                        <div class="toggle-setting-item">
                            <div class="toggle-setting-info">
                                <h3>SMS alerts</h3>
                                <p>Get SMS alerts for transactions, low balance warnings, and security notifications.</p>
                            </div>
                            <button class="ios-toggle active" id="smsToggle" onclick="toggleSmsAlerts()">
                                <div class="ios-toggle-slider"></div>
                            </button>
                        </div>
                    </div>

                    <!-- Family Account Section -->
                    <div class="family-section">
                        <h2 style="margin-bottom: 1rem; color: var(--text-primary);">Family Account</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">View your individual dashboard or switch to family view to see combined wealth and invite family members.</p>
                        
                        <button class="family-toggle-button" id="familyViewToggle" onclick="toggleFamilyView()">
                            Switch to Family View
                        </button>
                        
                        <!-- Individual Dashboard (Default) -->
                        <div id="individualDashboard">
                            <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Your Personal Dashboard</h3>
                            <div class="dashboard-cards">
                                <div class="dashboard-card">
                                    <div class="card-header">
                                        <span class="card-title">YOUR BALANCE</span>
                                        <i class="fas fa-wallet" style="color: var(--primary);"></i>
                                    </div>
                                    <div class="card-amount" data-private="₹5,93,672" data-placeholder="₹••••••">₹5,93,672</div>
                                    <div class="card-change positive">
                                        <i class="fas fa-arrow-up"></i>
                                        +12.5% this month
                                    </div>
                                </div>

                                <div class="dashboard-card">
                                    <div class="card-header">
                                        <span class="card-title">YOUR INVESTMENTS</span>
                                        <i class="fas fa-chart-line" style="color: var(--success);"></i>
                                    </div>
                                    <div class="card-amount" data-private="₹1,85,920" data-placeholder="₹••••••">₹1,85,920</div>
                                    <div class="card-change positive">
                                        <i class="fas fa-arrow-up"></i>
                                        +8.7% this year
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Family Dashboard (Hidden by default) -->
                        <div id="familyDashboard" class="family-view">
                            <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Family Wealth Overview</h3>
                            
                            <div class="dashboard-card" style="margin-bottom: 2rem;">
                                <div class="card-header">
                                    <span class="card-title">COMBINED FAMILY WEALTH</span>
                                    <i class="fas fa-users" style="color: var(--primary);"></i>
                                </div>
                                <div class="card-amount" data-private="₹12,45,890" data-placeholder="₹•••••••">₹12,45,890</div>
                                <div class="card-change positive">
                                    <i class="fas fa-arrow-up"></i>
                                    +18.3% combined growth
                                </div>
                            </div>
                            
                            <h4 style="color: var(--text-primary); margin-bottom: 1rem;">Family Members</h4>
                            <div class="family-members-grid" id="familyMembersContainer">
                                <!-- Family members will be loaded here by JavaScript -->
                            </div>
                        </div>
                    </div>

                    <!-- Account Management Grid -->
                    <div class="account-grid-header">
                        <h2>My Account</h2>
                    </div>

                    <div class="account-management-grid">
                        <!-- Account cards remain the same -->
                        <div class="account-card" onclick="openBankAccounts()">
                            <div class="card-icon" style="color: #059669;">
                                <i class="fas fa-university"></i>
                            </div>
                            <div class="card-content">
                                <h3>Bank Accounts</h3>
                                <p>Manage linked bank accounts & balances</p>
                            </div>
                        </div>

                        <div class="account-card" onclick="openMyProfile()">
                            <div class="card-icon" style="color: #3b82f6;">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="card-content">
                                <h3>My Profile</h3>
                                <p>Personal details, contact & address</p>
                            </div>
                        </div>

                        <div class="account-card" onclick="openInsurance()">
                            <div class="card-icon" style="color: #10b981;">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="card-content">
                                <h3>Insurance</h3>
                                <p>Health, Life, Motor insurance policies</p>
                            </div>
                        </div>

                        <div class="account-card" onclick="openRealEstateGold()">
                            <div class="card-icon" style="color: #f59e0b;">
                                <i class="fas fa-home"></i>
                            </div>
                            <div class="card-content">
                                <h3>Real Estate & Gold</h3>
                                <p>Property & gold investment tracking</p>
                            </div>
                        </div>

                        <div class="account-card" onclick="openPasswordSecurity()">
                            <div class="card-icon" style="color: #dc2626;">
                                <i class="fas fa-lock"></i>
                            </div>
                            <div class="card-content">
                                <h3>Password & Security</h3>
                                <p>Change password, 2FA & security settings</p>
                            </div>
                        </div>

                        <div class="account-card" onclick="openInvestments()">
                            <div class="card-icon" style="color: #8b5cf6;">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="card-content">
                                <h3>Investments</h3>
                                <p>Mutual funds, SIPs & portfolio tracking</p>
                            </div>
                        </div>

                        <div class="account-card" onclick="openAuthorizations()">
                            <div class="card-icon" style="color: #06b6d4;">
                                <i class="fas fa-key"></i>
                            </div>
                            <div class="card-content">
                                <h3>Authorizations</h3>
                                <p>API access, third-party permissions</p>
                            </div>
                        </div>

                        <div class="account-card" onclick="openCalendarReminders()">
                            <div class="card-icon" style="color: #84cc16;">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="card-content">
                                <h3>Calendar & Reminders</h3>
                                <p>SIP dates, bill payments & notifications</p>
                            </div>
                        </div>
                    </div>
                     
                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <h3>Quick Actions</h3>
                        <div class="quick-actions-grid">
                            <button onclick="loadDashboard()" class="quick-action-btn">
                                <i class="fas fa-chart-line"></i>
                                <span>Dashboard</span>
                            </button>
                            <button onclick="exportAccountData()" class="quick-action-btn">
                                <i class="fas fa-download"></i>
                                <span>Export Data</span>
                            </button>
                            <button onclick="openSupportChat()" class="quick-action-btn">
                                <i class="fas fa-headset"></i>
                                <span>Support</span>
                            </button>
                            <button onclick="logout()" class="quick-action-btn danger">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;

        // Initialize account page after content is loaded
        setTimeout(() => {
            if (typeof initializeAccount === 'function') {
                initializeAccount();
            }
        }, 100);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initializing...');
    
    // Load landing page by default
    loadPage('landing');
    
    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Close modals when clicking outside
    window.onclick = function(event) {
        const loginModal = document.getElementById('loginModal');
        const serviceModal = document.getElementById('serviceModal');
        if (event.target == loginModal) {
            if (typeof closeLoginModal === 'function') {
                closeLoginModal();
            }
        }
        if (event.target == serviceModal) {
            if (typeof closeServiceModal === 'function') {
                closeServiceModal();
            }
        }
    }

    console.log('App initialized successfully');
});