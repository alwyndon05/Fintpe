// Complete Fixed dashboard.js - Dashboard and Account Management

// Global variables
let currentTheme = 'light';
let privacyModeEnabled = false;
let familyViewEnabled = false;

// Dashboard initialization and functions
function initializeDashboard() {
    console.log('Dashboard initialized');
    
    // Initialize enhanced features
    setTimeout(initializeEnhancedFeatures, 100);
    
    // Update user email if logged in
    const userEmail = window.getUserEmail ? window.getUserEmail() : '';
    if (userEmail) {
        const emailDisplay = document.getElementById('userEmailDisplay');
        if (emailDisplay) {
            emailDisplay.textContent = userEmail;
        }
    }
}

// Enhanced Features Initialization
function initializeEnhancedFeatures() {
    // Load saved preferences
    const savedTheme = localStorage.getItem('fintpe_theme') || 'light';
    const savedPrivacy = localStorage.getItem('fintpe_privacy') === 'true';
    
    if (savedTheme === 'dark') {
        setTheme('dark');
    }
    
    if (savedPrivacy) {
        setPrivacyMode(true);
    }
    
    console.log('Enhanced features initialized');
}

// Theme Management
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    currentTheme = theme;
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        if (theme === 'dark') {
            themeToggle.classList.add('active');
        } else {
            themeToggle.classList.remove('active');
        }
    }
    
    localStorage.setItem('fintpe_theme', theme);
    
    if (typeof showSuccessMessage === 'function') {
        showSuccessMessage(`${theme === 'dark' ? 'Dark' : 'Light'} theme activated`);
    }
}

// Privacy Mode Management
function togglePrivacyMode() {
    setPrivacyMode(!privacyModeEnabled);
}

function setPrivacyMode(enabled) {
    privacyModeEnabled = enabled;
    
    const privacyToggle = document.getElementById('privacyToggle');
    if (privacyToggle) {
        if (enabled) {
            privacyToggle.classList.add('active');
        } else {
            privacyToggle.classList.remove('active');
        }
    }
    
    // Apply privacy mode to all elements with data-private attribute
    const privateElements = document.querySelectorAll('[data-private]');
    privateElements.forEach(element => {
        if (enabled) {
            element.classList.add('privacy-blur');
            const placeholder = element.getAttribute('data-placeholder') || '••••••';
            // Store original value before replacing
            const originalValue = element.textContent;
            element.setAttribute('data-private', originalValue);
            element.textContent = placeholder;
        } else {
            element.classList.remove('privacy-blur');
            const originalValue = element.getAttribute('data-private');
            if (originalValue) {
                element.textContent = originalValue;
            }
        }
    });
    
    localStorage.setItem('fintpe_privacy', enabled);
    
    if (typeof showSuccessMessage === 'function') {
        showSuccessMessage(`Privacy mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Family View Management
function toggleFamilyView() {
    familyViewEnabled = !familyViewEnabled;
    updateFamilyView();
}

function updateFamilyView() {
    const individualSection = document.getElementById('individualDashboard');
    const familySection = document.getElementById('familyDashboard');
    const toggleButton = document.getElementById('familyViewToggle');
    
    if (familyViewEnabled) {
        if (individualSection) individualSection.style.display = 'none';
        if (familySection) {
            familySection.style.display = 'block';
            loadFamilyMembers();
        }
        if (toggleButton) toggleButton.textContent = 'Switch to Individual View';
        
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage('Switched to Family View');
        }
    } else {
        if (individualSection) individualSection.style.display = 'block';
        if (familySection) familySection.style.display = 'none';
        if (toggleButton) toggleButton.textContent = 'Switch to Family View';
        
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage('Switched to Individual View');
        }
    }
}

function loadFamilyMembers() {
    const familyContainer = document.getElementById('familyMembersContainer');
    if (!familyContainer) return;
    
    const familyMembers = [
        { name: 'John Doe', role: 'You', wealth: '₹7,85,920', avatar: 'JD' },
        { name: 'Jane Doe', role: 'Spouse', wealth: '₹3,25,470', avatar: 'JD' },
        { name: 'Alex Doe', role: 'Child', wealth: '₹34,500', avatar: 'AD' }
    ];
    
    familyContainer.innerHTML = familyMembers.map(member => `
        <div class="family-member-card">
            <div class="family-member-avatar">${member.avatar}</div>
            <div class="family-member-name">${member.name}</div>
            <div class="family-member-role">${member.role}</div>
            <div class="family-member-wealth" data-private="${member.wealth}" data-placeholder="₹•••••••">${member.wealth}</div>
        </div>
    `).join('');
    
    // Add invite member card
    familyContainer.innerHTML += `
        <div class="family-member-card add-family-member" onclick="inviteFamilyMember()" style="border: 2px dashed var(--border); cursor: pointer;">
            <div style="color: var(--text-secondary); font-size: 2rem; margin-bottom: 1rem;">+</div>
            <div class="family-member-name">Invite Member</div>
            <div class="family-member-role">Add family member</div>
        </div>
    `;
    
    // Apply privacy mode if enabled
    if (privacyModeEnabled) {
        setTimeout(() => setPrivacyMode(true), 100);
    }
}

function inviteFamilyMember() {
    const email = prompt('Enter family member email:');
    if (email && email.includes('@')) {
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage(`Invitation sent to ${email}`);
        }
    } else if (email) {
        alert('Please enter a valid email address');
    }
}

// Notification toggle functions
function toggleEmailNotifications() {
    const toggle = document.getElementById('emailToggle');
    if (toggle) {
        toggle.classList.toggle('active');
        const enabled = toggle.classList.contains('active');
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage(`Email notifications ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
}

function toggleSmsAlerts() {
    const toggle = document.getElementById('smsToggle');
    if (toggle) {
        toggle.classList.toggle('active');
        const enabled = toggle.classList.contains('active');
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage(`SMS alerts ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
}

// Enhanced Set user information from stored data
function setUserInfo() {
    console.log('Setting user info');
    
    const userEmail = window.getUserEmail ? window.getUserEmail() : '';
    
    if (userEmail) {
        // Extract name from email or use stored profile data
        const savedProfile = localStorage.getItem('fintpe_profile');
        let displayName = 'User';
        let initials = 'U';
        
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                if (profile.firstName && profile.lastName) {
                    displayName = `${profile.firstName} ${profile.lastName}`;
                    initials = `${profile.firstName.charAt(0).toUpperCase()}${profile.lastName.charAt(0).toUpperCase()}`;
                } else if (profile.firstName) {
                    displayName = profile.firstName;
                    initials = profile.firstName.charAt(0).toUpperCase();
                }
            } catch (e) {
                console.error('Error parsing saved profile:', e);
            }
        }
        
        // If no profile data, extract from email
        if (displayName === 'User' && userEmail) {
            try {
                const emailName = userEmail.split('@')[0];
                const cleanName = emailName.replace(/[._-]/g, ' ');
                const words = cleanName.split(' ');
                
                if (words.length > 1) {
                    displayName = words.map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                    initials = words.slice(0, 2).map(word => 
                        word.charAt(0).toUpperCase()
                    ).join('');
                } else {
                    displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
                    initials = emailName.charAt(0).toUpperCase();
                }
            } catch (e) {
                console.error('Error processing email:', e);
                displayName = 'User';
                initials = 'U';
            }
        }
        
        // Update UI elements
        const nameElement = document.getElementById('profileDisplayName');
        const initialsElement = document.getElementById('avatarInitials');
        
        if (nameElement) {
            nameElement.textContent = `Hi, ${displayName}`;
            console.log('Updated name element:', displayName);
        }
        
        if (initialsElement) {
            initialsElement.textContent = initials;
            console.log('Updated initials element:', initials);
        }
    } else {
        console.log('No userEmail found');
        const nameElement = document.getElementById('profileDisplayName');
        const initialsElement = document.getElementById('avatarInitials');
        
        if (nameElement) nameElement.textContent = 'Hi, User';
        if (initialsElement) initialsElement.textContent = 'U';
    }
}

// Initialize Account
function initializeAccount() {
    console.log('Account page initialized');
    
    // Set user info with delay
    setTimeout(() => {
        setUserInfo();
        updateProfileProgress();
        initializeEnhancedFeatures();
    }, 200);
}

// Update profile completion progress
function updateProfileProgress() {
    const savedProfile = localStorage.getItem('fintpe_profile');
    const savedFinancial = localStorage.getItem('fintpe_financial');
    const savedBanks = localStorage.getItem('fintpe_bank_accounts');
    
    let completedSteps = 1; // Email is always verified for logged-in users
    let totalSteps = 5;
    
    // Check profile completion
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            if (profile.phone) completedSteps++;
            if (profile.firstName && profile.lastName && profile.address) completedSteps++;
        } catch (e) {
            console.error('Error parsing profile:', e);
        }
    }
    
    // Check bank accounts
    if (savedBanks) {
        try {
            const banks = JSON.parse(savedBanks);
            if (banks.length > 0) completedSteps++;
        } catch (e) {
            console.error('Error parsing bank accounts:', e);
        }
    }
    
    // Check income details
    if (savedFinancial) {
        try {
            const financial = JSON.parse(savedFinancial);
            if (financial.monthlyIncome) completedSteps++;
        } catch (e) {
            console.error('Error parsing financial data:', e);
        }
    }
    
    // Update progress bar
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
    const progressElement = document.getElementById('setupProgress');
    const percentageElement = document.getElementById('progressPercentage');
    
    if (progressElement) progressElement.style.width = `${progressPercentage}%`;
    if (percentageElement) percentageElement.textContent = progressPercentage;
    
    console.log(`Profile progress: ${progressPercentage}% (${completedSteps}/${totalSteps})`);
}

// Account section handlers
function openBankAccounts() {
    alert('Bank accounts management coming soon!');
}

function openMyProfile() {
    alert('Profile management modal coming soon!');
}

function openInsurance() {
    alert('Insurance management coming soon!');
}

function openRealEstateGold() {
    alert('Real Estate & Gold tracking coming soon!');
}

function openPasswordSecurity() {
    alert('Password & Security settings coming soon!');
}

function openInvestments() {
    alert('Investment tracking coming soon!');
}

function openAuthorizations() {
    alert('API authorizations coming soon!');
}

function openCalendarReminders() {
    alert('Calendar & Reminders coming soon!');
}

// Profile setup modal functions
function openProfileSetupModal() {
    const modalElement = document.getElementById('profileSetupModal');
    if (modalElement) {
        modalElement.style.display = 'block';
    } else {
        alert('Complete your profile setup to unlock all features!');
    }
}

function closeProfileSetupModal() {
    const modalElement = document.getElementById('profileSetupModal');
    if (modalElement) modalElement.style.display = 'none';
}

function startProfileSetup() {
    closeProfileSetupModal();
    alert('Profile setup wizard coming soon!');
}

// Support and logout functions
function openSupportChat() {
    alert('Support chat is coming soon! For now, please email us at support@fintpe.com');
}

// DOM content loaded handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard DOM loaded');
    
    // Initialize when account page elements are detected
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.querySelector && 
                            (node.querySelector('.account-management-grid') || 
                             node.querySelector('.profile-header'))) {
                            console.log('Account page content detected, initializing...');
                            setTimeout(() => {
                                initializeAccount();
                            }, 150);
                        }
                    }
                });
            }
        });
    });
    
    // Start observing
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        observer.observe(mainContent, { 
            childList: true, 
            subtree: true 
        });
    }
});

// Global exports
window.initializeDashboard = initializeDashboard;
window.initializeAccount = initializeAccount;
window.toggleTheme = toggleTheme;
window.togglePrivacyMode = togglePrivacyMode;
window.toggleFamilyView = toggleFamilyView;
window.toggleEmailNotifications = toggleEmailNotifications;
window.toggleSmsAlerts = toggleSmsAlerts;
window.setPrivacyMode = setPrivacyMode;