// System Details Page
let currentSystem = null;
let selectedUpgrades = {};
let basePrice = 0;
let quantity = 1;

// Load system data from URL parameter
async function loadSystemDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const systemId = urlParams.get('id');
    
    if (!systemId) {
        window.location.href = 'systems.html';
        return;
    }
    
    try {
        const response = await fetch('scripts/data/systems.json');
        const data = await response.json();
        currentSystem = data.systems.find(s => s.id === systemId);
        
        if (!currentSystem) {
            window.location.href = 'systems.html';
            return;
        }
        
        basePrice = currentSystem.basePrice;
        renderSystemDetails();
        loadRelatedSystems();
    } catch (error) {
        console.error('Error loading system details:', error);
    }
}

// Render system details
function renderSystemDetails() {
    // Hero section
    document.getElementById('system-name').textContent = currentSystem.name;
    document.getElementById('system-tag').textContent = currentSystem.tag;
    
    const heroImage = document.getElementById('system-hero-image');
    const imagePath = currentSystem.image || `assets/systems/Horizon_Hero_1250x.webp`;
    heroImage.innerHTML = `
        <img src="${imagePath}" alt="${currentSystem.name} - ${currentSystem.description}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'placeholder-content\\' style=\\'padding: 4rem; text-align: center;\\'><h2 style=\\'color: #ff4500; font-size: 3rem; margin-bottom: 1rem;\\'>${currentSystem.name}</h2><p style=\\'color: #ccc; font-size: 1.2rem;\\'>${currentSystem.description}</p></div>';">
    `;
    
    // Specifications table
    const specsBody = document.getElementById('specs-table-body');
    specsBody.innerHTML = `
        <tr>
            <td><i class="fas fa-microchip"></i> Processor</td>
            <td>${currentSystem.specs.cpu.name}</td>
        </tr>
        <tr>
            <td><i class="fas fa-fan"></i> Graphics Card</td>
            <td>${currentSystem.specs.gpu.name}</td>
        </tr>
        <tr>
            <td><i class="fas fa-memory"></i> Memory</td>
            <td>${currentSystem.specs.ram.name}</td>
        </tr>
        <tr>
            <td><i class="fas fa-hdd"></i> Storage</td>
            <td>${currentSystem.specs.storage.name}</td>
        </tr>
        <tr>
            <td><i class="fas fa-snowflake"></i> Cooling</td>
            <td>${currentSystem.specs.cooling.name}</td>
        </tr>
        <tr>
            <td><i class="fas fa-cube"></i> Case</td>
            <td>${currentSystem.specs.case.name}</td>
        </tr>
        <tr>
            <td><i class="fas fa-bolt"></i> Power Supply</td>
            <td>${currentSystem.specs.psu.name}</td>
        </tr>
        <tr>
            <td><i class="fas fa-microchip"></i> Motherboard</td>
            <td>${currentSystem.specs.motherboard.name}</td>
        </tr>
    `;
    
    // Performance benchmarks (simplified)
    loadBenchmarks();
    
    // Customization options
    renderCustomizationOptions();
    
    // Update price
    updatePrice();
}

// Load performance benchmarks
async function loadBenchmarks() {
    try {
        const response = await fetch('scripts/data/performance.json');
        const perfData = await response.json();
        
        const cpu = perfData.components.cpus.find(c => c.id === currentSystem.specs.cpu.id);
        const gpu = perfData.components.gpus.find(g => g.id === currentSystem.specs.gpu.id);
        
        if (cpu && gpu) {
            const totalScore = cpu.score + gpu.score + 
                (perfData.components.ram.find(r => r.id === currentSystem.specs.ram.id)?.score || 0) * 0.2;
            
            const benchmarksGrid = document.getElementById('benchmarks-grid');
            benchmarksGrid.innerHTML = `
                <div class="benchmark-card">
                    <h4>Performance Score</h4>
                    <div class="benchmark-value">${Math.round(totalScore).toLocaleString()}</div>
                    <div class="benchmark-label">Total Performance</div>
                </div>
                <div class="benchmark-card">
                    <h4>Cinebench R23</h4>
                    <div class="benchmark-value">${cpu.cinebench.toLocaleString()}</div>
                    <div class="benchmark-label">CPU Score</div>
                </div>
                <div class="benchmark-card">
                    <h4>3DMark</h4>
                    <div class="benchmark-value">${gpu.threeDMark.toLocaleString()}</div>
                    <div class="benchmark-label">GPU Score</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading benchmarks:', error);
    }
}

// Render customization options
function renderCustomizationOptions() {
    const optionsContainer = document.getElementById('customization-options');
    const upgrades = currentSystem.upgrades;
    
    if (!upgrades || Object.keys(upgrades).length === 0) {
        optionsContainer.innerHTML = '<p style="color: #aaa; text-align: center;">No upgrade options available for this system.</p>';
        return;
    }
    
    let html = '';
    
    // CPU Upgrades
    if (upgrades.cpu && upgrades.cpu.length > 0) {
        html += `
            <div class="customization-group">
                <label class="customization-label">CPU Upgrade</label>
                <select class="customization-select" data-category="cpu">
                    <option value="">Keep Current: ${currentSystem.specs.cpu.name}</option>
                    ${upgrades.cpu.map(upgrade => `
                        <option value="${upgrade.id}" data-price="${upgrade.upgradeCost}">
                            ${upgrade.name} (+$${upgrade.upgradeCost})
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }
    
    // GPU Upgrades
    if (upgrades.gpu && upgrades.gpu.length > 0) {
        html += `
            <div class="customization-group">
                <label class="customization-label">GPU Upgrade</label>
                <select class="customization-select" data-category="gpu">
                    <option value="">Keep Current: ${currentSystem.specs.gpu.name}</option>
                    ${upgrades.gpu.map(upgrade => `
                        <option value="${upgrade.id}" data-price="${upgrade.upgradeCost}">
                            ${upgrade.name} (+$${upgrade.upgradeCost})
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }
    
    // RAM Upgrades
    if (upgrades.ram && upgrades.ram.length > 0) {
        html += `
            <div class="customization-group">
                <label class="customization-label">RAM Upgrade</label>
                <select class="customization-select" data-category="ram">
                    <option value="">Keep Current: ${currentSystem.specs.ram.name}</option>
                    ${upgrades.ram.map(upgrade => `
                        <option value="${upgrade.id}" data-price="${upgrade.upgradeCost}">
                            ${upgrade.name} (+$${upgrade.upgradeCost})
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }
    
    // Storage Upgrades
    if (upgrades.storage && upgrades.storage.length > 0) {
        html += `
            <div class="customization-group">
                <label class="customization-label">Storage Upgrade</label>
                <select class="customization-select" data-category="storage">
                    <option value="">Keep Current: ${currentSystem.specs.storage.name}</option>
                    ${upgrades.storage.map(upgrade => `
                        <option value="${upgrade.id}" data-price="${upgrade.upgradeCost}">
                            ${upgrade.name} (+$${upgrade.upgradeCost})
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }
    
    optionsContainer.innerHTML = html;
    
    // Add event listeners
    document.querySelectorAll('.customization-select').forEach(select => {
        select.addEventListener('change', handleUpgradeChange);
    });
}

// Handle upgrade selection change
function handleUpgradeChange(e) {
    const category = e.target.dataset.category;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const upgradeCost = parseInt(selectedOption.dataset.price) || 0;
    
    if (selectedOption.value) {
        selectedUpgrades[category] = {
            id: selectedOption.value,
            name: selectedOption.text,
            cost: upgradeCost
        };
    } else {
        delete selectedUpgrades[category];
    }
    
    updatePrice();
    checkCompatibility();
}

// Update price display
function updatePrice() {
    const upgradesTotal = Object.values(selectedUpgrades).reduce((sum, upgrade) => sum + (upgrade.cost || 0), 0);
    const totalPrice = (basePrice + upgradesTotal) * quantity;
    
    const basePriceEl = document.getElementById('base-price');
    if (basePriceEl) {
        basePriceEl.textContent = `$${basePrice.toLocaleString()}`;
    }
    
    const upgradesRow = document.getElementById('upgrades-row');
    const upgradesPrice = document.getElementById('upgrades-price');
    if (upgradesRow && upgradesPrice) {
        if (upgradesTotal > 0) {
            upgradesRow.style.display = 'flex';
            upgradesPrice.textContent = `+$${upgradesTotal.toLocaleString()}`;
        } else {
            upgradesRow.style.display = 'none';
        }
    }
    
    const totalPriceEl = document.getElementById('total-price');
    if (totalPriceEl) {
        totalPriceEl.textContent = `$${totalPrice.toLocaleString()}`;
    }
}

// Check compatibility (basic implementation)
function checkCompatibility() {
    const warnings = [];
    // Basic compatibility checking can be expanded here
    // For now, just a placeholder
    
    const warningsContainer = document.getElementById('compatibility-warnings');
    if (warnings.length > 0) {
        warningsContainer.style.display = 'block';
        warningsContainer.innerHTML = warnings.map(w => `
            <div class="warning-message">
                <i class="fas fa-exclamation-triangle"></i> ${w}
            </div>
        `).join('');
    } else {
        warningsContainer.style.display = 'none';
    }
}

// Load related systems
async function loadRelatedSystems() {
    try {
        const response = await fetch('scripts/data/systems.json');
        const data = await response.json();
        const related = data.systems
            .filter(s => s.id !== currentSystem.id && s.performanceTier === currentSystem.performanceTier)
            .slice(0, 3);
        
        const grid = document.getElementById('related-systems-grid');
        if (related.length === 0) {
            grid.innerHTML = '<p style="color: #aaa; text-align: center; grid-column: 1 / -1;">No related systems found.</p>';
            return;
        }
        
        grid.innerHTML = related.map(system => `
            <div class="build-card">
                <div class="build-image" id="related-${system.id}">
                    <div class="build-overlay">
                        <span class="build-tag">${system.tag}</span>
                    </div>
                </div>
                <div class="build-info">
                    <h3 class="build-name">${system.name}</h3>
                    <p class="build-desc">${system.description}</p>
                    <ul class="build-specs">
                        <li><i class="fas fa-microchip"></i> ${system.specs.cpu.name}</li>
                        <li><i class="fas fa-fan"></i> ${system.specs.gpu.name}</li>
                    </ul>
                    <div class="build-price">
                        <span class="price">$${system.basePrice.toLocaleString()}</span>
                        <a href="system-details.html?id=${system.id}" class="btn-build">View Details <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add images
        related.forEach(system => {
            const img = document.getElementById(`related-${system.id}`);
            if (img) {
                const imagePath = system.image || `assets/systems/Horizon_Hero_1250x.webp`;
                img.innerHTML = `
                    <img src="${imagePath}" alt="${system.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'placeholder-content\\'><h3 style=\\'color: #ff4500;\\'>${system.name}</h3></div><div class=\\'build-overlay\\'><span class=\\'build-tag\\'>${system.tag}</span></div>';">
                    <div class="build-overlay">
                        <span class="build-tag">${system.tag}</span>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error('Error loading related systems:', error);
    }
}

// Add system to cart
function addSystemToCart() {
    if (!currentSystem) return;
    
    const upgradesTotal = Object.values(selectedUpgrades).reduce((sum, upgrade) => sum + (upgrade.cost || 0), 0);
    const totalPrice = (basePrice + upgradesTotal) * quantity;
    
    const cartItem = {
        id: currentSystem.id,
        type: 'system',
        name: currentSystem.name,
        specs: currentSystem.specs,
        price: totalPrice,
        quantity: quantity,
        customizations: selectedUpgrades,
        image: currentSystem.image
    };
    
    // Use the addToCart function from cart.js
    if (typeof window.addToCart === 'function') {
        window.addToCart(cartItem);
    } else if (typeof addToCart === 'function') {
        addToCart(cartItem);
    } else {
        console.error('Cart functions not loaded');
        alert('Error: Cart functionality not available. Please refresh the page.');
        return;
    }
    
    // Show success message
    const btn = document.getElementById('add-to-cart');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
    btn.style.background = '#4caf50';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 2000);
    
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
}

// Share build
function shareBuild() {
    const params = new URLSearchParams({
        id: currentSystem.id,
        ...Object.fromEntries(Object.entries(selectedUpgrades).map(([k, v]) => [`upgrade_${k}`, v.id]))
    });
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    if (navigator.share) {
        navigator.share({
            title: `${currentSystem.name} - Anvil Systems`,
            text: `Check out this ${currentSystem.name} build!`,
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Build link copied to clipboard!');
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSystemDetails();
    
    // Quantity controls
    const quantityDecrease = document.getElementById('quantity-decrease');
    const quantityIncrease = document.getElementById('quantity-increase');
    const quantityInput = document.getElementById('quantity-input');
    
    if (quantityDecrease) {
        quantityDecrease.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                if (quantityInput) quantityInput.value = quantity;
                updatePrice();
            }
        });
    }
    
    if (quantityIncrease) {
        quantityIncrease.addEventListener('click', () => {
            if (quantity < 10) {
                quantity++;
                if (quantityInput) quantityInput.value = quantity;
                updatePrice();
            }
        });
    }
    
    if (quantityInput) {
        quantityInput.addEventListener('change', (e) => {
            quantity = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
            e.target.value = quantity;
            updatePrice();
        });
    }
    
    // Action buttons
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addSystemToCart);
    }
    const shareBuildBtn = document.getElementById('share-build');
    if (shareBuildBtn) {
        shareBuildBtn.addEventListener('click', shareBuild);
    }
});
