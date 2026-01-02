// Service Modal Functions
function openProductsModal() {
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    const subtitle = document.getElementById('serviceModalSubtitle');
    const body = document.getElementById('serviceModalBody');
    
    title.textContent = 'Fintpe Products';
    subtitle.textContent = 'Complete financial services for modern India';
    body.innerHTML = `
        <div class="service-grid">
            <div class="service-item" onclick="alert('Financial Calculators: EMI, SIP, FD calculators coming soon!')">
                <h4><i class="fas fa-calculator"></i> Financial Calculators</h4>
                <p>EMI, SIP, FD, PPF, Retirement & Tax calculators for smart financial planning</p>
            </div>
            <div class="service-item" onclick="alert('Bill Payments: BBPS integrated bill payments coming soon!')">
                <h4><i class="fas fa-bolt"></i> Bill Payments (BBPS)</h4>
                <p>Pay electricity, mobile, gas, water bills & more through secure BBPS network</p>
            </div>
            <div class="service-item" onclick="alert('UPI Payments: Send & receive money instantly!')">
                <h4><i class="fas fa-mobile-alt"></i> UPI Payments</h4>
                <p>Send & receive money instantly using phone numbers, UPI IDs, or QR codes</p>
            </div>
            <div class="service-item" onclick="alert('Insurance Services: Compare insurance plans from top insurers!')">
                <h4><i class="fas fa-umbrella"></i> Insurance Services</h4>
                <p>Health, Life, Motor & Travel insurance from 15+ top insurers with best rates</p>
            </div>
            <div class="service-item" onclick="alert('Real Estate Tools: AI-powered property tools coming soon!')">
                <h4><i class="fas fa-building"></i> Real Estate Tools</h4>
                <p>AI-powered property valuation, market insights & investment analysis</p>
            </div>
            <div class="service-item" onclick="alert('Investment Tracking: Track your portfolio performance!')">
                <h4><i class="fas fa-chart-line"></i> Investment Tracking</h4>
                <p>Track mutual funds, stocks, SIPs with performance insights & portfolio analysis</p>
            </div>
            <div class="service-item" onclick="alert('Account Aggregation: Connect all your accounts!')">
                <h4><i class="fas fa-university"></i> Account Aggregation</h4>
                <p>Connect all bank accounts & credit cards for unified financial view</p>
            </div>
            <div class="service-item" onclick="alert('Tax Services: ITR filing and tax planning services!')">
                <h4><i class="fas fa-file-invoice-dollar"></i> Tax Services</h4>
                <p>ITR filing, tax planning & expert CA consultation with compliance support</p>
            </div>
            <div class="service-item" onclick="alert('Loan Services: Compare loan offers from multiple lenders!')">
                <h4><i class="fas fa-hand-holding-usd"></i> Loan Services</h4>
                <p>Personal, home, car loan comparison with instant eligibility & approval</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeServiceModal() {
    document.getElementById('serviceModal').style.display = 'none';
}