// Complete Fixed auth.js - Authentication and Login Management

// Global variables for login state
let isLoggedIn = false;
let userEmail = '';
let otpSent = false;

// Login Modal Functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        resetLoginForm();
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        resetLoginForm();
    }
}

function resetLoginForm() {
    const emailForm = document.getElementById('emailForm');
    const otpContainer = document.getElementById('otpContainer');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const emailInput = document.getElementById('email');
    
    if (emailForm) emailForm.style.display = 'block';
    if (otpContainer) otpContainer.style.display = 'none';
    if (modalTitle) modalTitle.textContent = 'Login to Fintpe';
    if (modalSubtitle) modalSubtitle.textContent = 'Access your financial dashboard';
    if (emailInput) emailInput.value = '';
    
    // Reset OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => input.value = '');
    
    otpSent = false;
}

// Email Form Submit Handler
document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            if (!emailInput) return;
            
            const email = emailInput.value;
            
            if (!email || !email.includes('@')) {
                alert('Please enter a valid email address');
                return;
            }

            userEmail = email;
            const button = this.querySelector('button[type="submit"]');
            if (!button) return;
            
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
            button.disabled = true;

            // Simulate OTP sending
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                
                // Show OTP form
                const emailForm = document.getElementById('emailForm');
                const otpContainer = document.getElementById('otpContainer');
                const emailDisplay = document.getElementById('emailDisplay');
                const modalTitle = document.getElementById('modalTitle');
                const modalSubtitle = document.getElementById('modalSubtitle');
                
                if (emailForm) emailForm.style.display = 'none';
                if (otpContainer) otpContainer.style.display = 'block';
                if (emailDisplay) emailDisplay.textContent = email;
                if (modalTitle) modalTitle.textContent = 'Verify OTP';
                if (modalSubtitle) modalSubtitle.textContent = 'Complete your login';
                
                otpSent = true;
                
                // Focus first OTP input
                const firstOtpInput = document.querySelector('.otp-input');
                if (firstOtpInput) firstOtpInput.focus();
                
                alert('OTP sent successfully! Use any 6 digits for demo (e.g., 123456)');
            }, 2000);
        });
    }

    // OTP Input Handling
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (e.target.value.length === 1) {
                // Move to next input
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && e.target.value === '') {
                // Move to previous input
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });

    // Initialize auth state check
    setTimeout(initAuth, 100);
});

// Verify OTP
function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    let otp = '';
    otpInputs.forEach(input => otp += input.value);

    if (otp.length !== 6) {
        alert('Please enter complete 6-digit OTP');
        return;
    }

    // Find the verify button
    const verifyButton = document.querySelector('button[onclick="verifyOTP()"]');
    if (!verifyButton) return;
    
    const originalText = verifyButton.innerHTML;
    
    verifyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    verifyButton.disabled = true;

    // Simulate OTP verification
    setTimeout(() => {
        verifyButton.innerHTML = '<i class="fas fa-check"></i> Login Successful!';
        verifyButton.style.background = 'var(--success)';
        
        setTimeout(() => {
            // Login successful - save session and load dashboard
            isLoggedIn = true;
            saveSession();
            closeLoginModal();
            loadDashboard();
            
            // Update navigation
            updateNavigationForLogin();
        }, 1500);
    }, 2000);
}

// Update navigation after login
function updateNavigationForLogin() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Dashboard';
        loginBtn.onclick = () => loadDashboard();
    }
}

// Enhanced Load Dashboard function
function loadDashboard() {
    if (!isLoggedIn || !userEmail) {
        console.log('User not logged in, redirecting to login');
        openLoginModal();
        return;
    }

    // Get financial data
    const financialData = getFinancialData();
    
    // Hide main content and show dashboard
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="dashboard-container" style="display: block;">
                <div class="dashboard-content">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <div>
                                <h2 style="margin-bottom: 0.5rem;">Welcome to Fintpe! 👋</h2>
                                <p style="color: var(--text-secondary); margin: 0;">${userEmail}</p>
                            </div>
                            <div style="display: flex; gap: 1rem;">
                                <button onclick="loadPage('account')" class="btn btn-secondary">
                                    <i class="fas fa-user-cog"></i>
                                    My Account
                                </button>
                                <button onclick="logout()" class="btn btn-secondary">
                                    <i class="fas fa-sign-out-alt"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                        
                        <div class="dashboard-cards">
                            <div class="dashboard-card">
                                <div class="card-header">
                                    <span class="card-title">TOTAL BALANCE</span>
                                    <i class="fas fa-wallet" style="color: var(--primary);"></i>
                                </div>
                                <div class="card-amount" data-private="₹${financialData.totalBalance.toLocaleString()}" data-placeholder="₹••••••">₹${financialData.totalBalance.toLocaleString()}</div>
                                <div class="card-change positive">
                                    <i class="fas fa-arrow-up"></i>
                                    +₹15,230 this month
                                </div>
                            </div>

                            <div class="dashboard-card">
                                <div class="card-header">
                                    <span class="card-title">MONTHLY SPENDING</span>
                                    <i class="fas fa-credit-card" style="color: var(--danger);"></i>
                                </div>
                                <div class="card-amount" data-private="₹${financialData.monthlyExpenses.toLocaleString()}" data-placeholder="₹••••••">₹${financialData.monthlyExpenses.toLocaleString()}</div>
                                <div class="card-change negative">
                                    <i class="fas fa-arrow-down"></i>
                                    -₹2,100 vs last month
                                </div>
                            </div>

                            <div class="dashboard-card">
                                <div class="card-header">
                                    <span class="card-title">INVESTMENTS</span>
                                    <i class="fas fa-chart-line" style="color: var(--success);"></i>
                                </div>
                                <div class="card-amount" data-private="₹${financialData.totalInvestments.toLocaleString()}" data-placeholder="₹••••••">₹${financialData.totalInvestments.toLocaleString()}</div>
                                <div class="card-change positive">
                                    <i class="fas fa-arrow-up"></i>
                                    +8.5% returns (YTD)
                                </div>
                            </div>

                            <div class="dashboard-card">
                                <div class="card-header">
                                    <span class="card-title">CREDIT SCORE</span>
                                    <i class="fas fa-star" style="color: var(--warning);"></i>
                                </div>
                                <div class="card-amount" data-private="${financialData.creditScore}" data-placeholder="•••">${financialData.creditScore}</div>
                                <div class="card-change positive">
                                    <i class="fas fa-arrow-up"></i>
                                    +15 points
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="transactions-section">
                        <h4 style="margin-bottom: 1rem; color: var(--text-primary);">Recent Transactions</h4>
                        <table class="transactions-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Jan 20</td>
                                    <td>Salary Credit - TechCorp Ltd</td>
                                    <td>Income</td>
                                    <td><span class="transaction-type type-credit">Credit</span></td>
                                    <td style="color: var(--success); font-weight: 600;" data-private="+₹${financialData.monthlyIncome.toLocaleString()}" data-placeholder="+₹••••••">+₹${financialData.monthlyIncome.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td>Jan 19</td>
                                    <td>UPI Transfer to Rahul Kumar</td>
                                    <td>Transfer</td>
                                    <td><span class="transaction-type type-transfer">UPI</span></td>
                                    <td style="color: var(--primary); font-weight: 600;" data-private="-₹2,500" data-placeholder="-₹••••">-₹2,500</td>
                                </tr>
                                <tr>
                                    <td>Jan 18</td>
                                    <td>Grocery Shopping - BigBasket</td>
                                    <td>Food & Dining</td>
                                    <td><span class="transaction-type type-debit">Debit</span></td>
                                    <td style="color: var(--danger); font-weight: 600;" data-private="-₹3,250" data-placeholder="-₹••••">-₹3,250</td>
                                </tr>
                                <tr>
                                    <td>Jan 17</td>
                                    <td>SIP Investment - HDFC MF</td>
                                    <td>Investment</td>
                                    <td><span class="transaction-type type-debit">SIP</span></td>
                                    <td style="color: var(--danger); font-weight: 600;" data-private="-₹${financialData.monthlyInvestment.toLocaleString()}" data-placeholder="-₹••••••">-₹${financialData.monthlyInvestment.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize dashboard features
        setTimeout(() => {
            if (typeof initializeDashboard === 'function') {
                initializeDashboard();
            }
            
            // Apply saved privacy mode if enabled
            const privacyEnabled = localStorage.getItem('fintpe_privacy') === 'true';
            if (privacyEnabled && typeof setPrivacyMode === 'function') {
                setPrivacyMode(true);
            }
        }, 100);
    }
}

// Enhanced Account Data Export
function exportAccountData() {
    if (confirm('Are you sure you want to export all your account data? This will download a file containing your profile information and transaction history.')) {
        // Simulate data export
        const data = {
            profile: JSON.parse(localStorage.getItem('fintpe_profile') || '{}'),
            preferences: JSON.parse(localStorage.getItem('fintpe_preferences') || '{}'),
            financial: JSON.parse(localStorage.getItem('fintpe_financial') || '{}'),
            bankAccounts: JSON.parse(localStorage.getItem('fintpe_bank_accounts') || '[]'),
            settings: {
                theme: localStorage.getItem('fintpe_theme') || 'light',
                privacy: localStorage.getItem('fintpe_privacy') === 'true'
            },
            exportDate: new Date().toISOString(),
            accountEmail: userEmail
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fintpe-account-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage('Account data exported successfully!');
        }
    }
}

// Resend OTP
function resendOTP() {
    alert('OTP resent successfully! Use any 6 digits for demo.');
}

// Enhanced Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        isLoggedIn = false;
        userEmail = '';
        
        // Clear session
        clearSession();
        
        // Load landing page
        if (typeof loadPage === 'function') {
            loadPage('landing');
        }
        
        // Reset navigation
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.innerHTML = 'Login';
            loginBtn.onclick = openLoginModal;
        }
        
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage('Logged out successfully!');
        }
    }
}

// Check if user is logged in (for session management)
function checkAuthState() {
    return isLoggedIn;
}

// Initialize auth state on page load
function initAuth() {
    // Check for existing session
    const savedEmail = localStorage.getItem('fintpe_user_email');
    if (savedEmail) {
        isLoggedIn = true;
        userEmail = savedEmail;
        updateNavigationForLogin();
        console.log('Session restored for:', userEmail);
    }
}

// Enhanced session management
function saveSession() {
    if (userEmail) {
        localStorage.setItem('fintpe_user_email', userEmail);
        console.log('Session saved for:', userEmail);
    }
}

function clearSession() {
    localStorage.removeItem('fintpe_user_email');
    console.log('Session cleared');
}

// Get financial data from localStorage
function getFinancialData() {
    const saved = localStorage.getItem('fintpe_financial');
    const bankAccounts = getBankAccounts();
    
    // Calculate total balance from bank accounts
    const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            return {
                totalBalance: totalBalance || parseInt(data.totalBalance) || 349904,
                totalInvestments: parseInt(data.totalInvestments) || 185920,
                monthlyInvestment: parseInt(data.monthlyInvestment) || 15000,
                monthlyExpenses: parseInt(data.monthlyExpenses) || 32450,
                monthlyIncome: parseInt(data.monthlyIncome) || 85000,
                creditScore: parseInt(data.creditScore) || 785
            };
        } catch (e) {
            console.error('Error parsing financial data:', e);
        }
    }
    
    // Return default values
    return {
        totalBalance: totalBalance || 349904,
        totalInvestments: 185920,
        monthlyInvestment: 15000,
        monthlyExpenses: 32450,
        monthlyIncome: 85000,
        creditScore: 785
    };
}

// Get bank accounts from localStorage
function getBankAccounts() {
    const saved = localStorage.getItem('fintpe_bank_accounts');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing bank accounts:', e);
        }
    }
    
    // Return default accounts
    const defaultAccounts = [
        { name: 'SBI Savings', accountNumber: '****2932', balance: 279932, type: 'savings' },
        { name: 'HDFC Salary', accountNumber: '****8630', balance: 258630, type: 'salary' },
        { name: 'Axis Current', accountNumber: '****5110', balance: 55110, type: 'current' }
    ];
    localStorage.setItem('fintpe_bank_accounts', JSON.stringify(defaultAccounts));
    return defaultAccounts;
}

// Show success message with notification
function showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Global export for use in other files
window.isLoggedIn = function() { return isLoggedIn; };
window.getUserEmail = function() { return userEmail; };
window.getFinancialData = getFinancialData;
window.getBankAccounts = getBankAccounts;
window.showSuccessMessage = showSuccessMessage;