// PC Configurator - Step-by-step builder
let currentStep = 0;
let selectedComponents = {};
let componentsData = null;
let systemsData = null;
const steps = [
    { id: 'cpu', name: 'CPU', category: 'cpu' },
    { id: 'gpu', name: 'GPU', category: 'gpu' },
    { id: 'ram', name: 'RAM', category: 'ram' },
    { id: 'storage', name: 'Storage', category: 'storage' },
    { id: 'cooling', name: 'Cooling', category: 'cooling' },
    { id: 'case', name: 'Case', category: 'case' },
    { id: 'psu', name: 'Power Supply', category: 'psu' },
    { id: 'motherboard', name: 'Motherboard', category: 'motherboard' }
];

// Load data
async function loadData() {
    try {
        const componentsRes = await fetch('scripts/data/components.json');
        componentsData = await componentsRes.json();
        
        // Check for saved build or URL parameters
        loadBuildFromURL();
        if (Object.keys(selectedComponents).length === 0) {
            renderStep();
        } else {
            renderStep();
            updateSummary();
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Render current step
function renderStep() {
    const step = steps[currentStep];
    const stepContent = document.getElementById('step-content');
    
    if (!stepContent || !step) return;
    
    updateProgress();
    updateNavigation();
    renderComponentStep(stepContent, step);
}


// Render component selection step
function renderComponentStep(container, step) {
    const category = step.category;
    const components = componentsData.components[category] || [];
    
    container.innerHTML = `
        <h2 class="step-title">Select ${step.name}</h2>
        <p class="step-description">Choose the ${step.name.toLowerCase()} for your build</p>
        <div class="component-options">
            ${components.map(component => {
                const isSelected = selectedComponents[category]?.id === component.id;
                const isRecommended = component.anvilCertified;
                return `
                    <div class="component-option ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}" 
                         data-component-id="${component.id}">
                        <div class="option-name">${component.name}</div>
                        <div class="option-specs">${formatComponentSpecs(component)}</div>
                        <div class="option-price">$${component.price.toLocaleString()}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Add event listeners
    container.querySelectorAll('.component-option').forEach(option => {
        option.addEventListener('click', () => {
            container.querySelectorAll('.component-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            const componentId = option.dataset.componentId;
            const component = components.find(c => c.id === componentId);
            if (component) {
                selectedComponents[category] = component;
                updateSummary();
                checkCompatibility();
            }
        });
    });
}

// Format component specs for display
function formatComponentSpecs(component) {
    const specs = component.specs;
    let text = [];
    
    if (specs.cores) text.push(`${specs.cores}C/${specs.threads}T`);
    if (specs.vram) text.push(specs.vram);
    if (specs.capacity) text.push(specs.capacity);
    if (specs.speed) text.push(specs.speed);
    if (specs.wattage) text.push(`${specs.wattage}W`);
    if (specs.type) text.push(specs.type);
    if (specs.chipset) text.push(specs.chipset);
    if (specs.socket) text.push(specs.socket);
    if (specs.ramType) text.push(specs.ramType);
    if (specs.formFactor) text.push(specs.formFactor);
    
    return text.join(' • ') || 'See details';
}

// Update progress indicator
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        const progress = ((currentStep + 1) / steps.length) * 100;
        progressFill.style.width = `${progress}%`;
    }
    
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < currentStep) {
            step.classList.add('completed');
        } else if (index === currentStep) {
            step.classList.add('active');
        }
    });
}

// Update navigation buttons
function updateNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
        prevBtn.style.display = currentStep > 0 ? 'flex' : 'none';
    }
    
    if (nextBtn) {
        // Remove existing event listeners by cloning and replacing
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        
        // Update button content and add new listener
        if (currentStep === steps.length - 1) {
            newNextBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            newNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addBuildToCart();
            });
        } else {
            newNextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
            newNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                nextStep();
            });
        }
    }
}

// Next step
function nextStep() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep();
    }
}

// Previous step
function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
    }
}


// Update summary panel
function updateSummary() {
    const summaryItems = document.getElementById('summary-items');
    const buildTotalPrice = document.getElementById('build-total-price');
    if (!summaryItems || !buildTotalPrice) return;
    
    const totalPrice = calculateTotalPrice();
    
    let html = '';
    let hasItems = false;
    
    Object.entries(selectedComponents).forEach(([category, component]) => {
        if (component && component.name) {
            hasItems = true;
            html += `
                <div class="summary-item">
                    <span class="summary-item-name">${component.name}</span>
                    <span class="summary-item-price">$${component.price.toLocaleString()}</span>
                </div>
            `;
        }
    });
    
    if (!hasItems) {
        html = '<p style="color: #aaa; text-align: center;">No components selected yet</p>';
    }
    
    summaryItems.innerHTML = html;
    buildTotalPrice.textContent = `$${totalPrice.toLocaleString()}`;
}

// Calculate total price
function calculateTotalPrice() {
    return Object.values(selectedComponents).reduce((total, component) => {
        if (component && component.price) {
            return total + component.price;
        }
        return total;
    }, 0);
}

// Check compatibility
function checkCompatibility() {
    const warnings = [];
    const warningsContainer = document.getElementById('config-warnings');
    if (!warningsContainer) return;
    
    // Basic compatibility checks
    if (selectedComponents.cpu && selectedComponents.motherboard) {
        const cpuSocket = selectedComponents.cpu.specs?.socket || selectedComponents.cpu.compatibility?.socket;
        const mbSocket = selectedComponents.motherboard.specs?.socket || selectedComponents.motherboard.compatibility?.socket;
        if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
            warnings.push('CPU socket does not match motherboard socket');
        }
    }
    
    if (selectedComponents.ram && selectedComponents.motherboard) {
        const ramType = selectedComponents.ram.specs?.type || selectedComponents.ram.compatibility?.type;
        const mbRamType = selectedComponents.motherboard.specs?.ramType || selectedComponents.motherboard.compatibility?.ramType;
        if (ramType && mbRamType && ramType !== mbRamType) {
            warnings.push('RAM type does not match motherboard');
        }
    }
    
    // PSU wattage check
    if (selectedComponents.psu && selectedComponents.cpu && selectedComponents.gpu) {
        const psuWattage = selectedComponents.psu.specs?.wattage || selectedComponents.psu.compatibility?.wattage;
        const cpuTdp = selectedComponents.cpu.specs?.tdp || 100;
        const gpuTdp = selectedComponents.gpu.specs?.powerDraw || selectedComponents.gpu.specs?.tdp || 200;
        const requiredWattage = cpuTdp + gpuTdp + 200; // 200W overhead
        
        if (psuWattage && psuWattage < requiredWattage) {
            warnings.push(`PSU wattage may be insufficient. Recommended: ${requiredWattage}W+`);
        }
    }
    
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

// Save build
function saveBuild() {
    const buildId = 'build_' + Date.now();
    const build = {
        id: buildId,
        components: selectedComponents,
        totalPrice: calculateTotalPrice(),
        createdAt: new Date().toISOString()
    };
    
    const savedBuilds = JSON.parse(localStorage.getItem('anvil_saved_builds') || '[]');
    savedBuilds.push(build);
    localStorage.setItem('anvil_saved_builds', JSON.stringify(savedBuilds));
    
    alert('Build saved successfully!');
}

// Share build link
function shareBuildLink() {
    const params = new URLSearchParams();
    Object.entries(selectedComponents).forEach(([category, component]) => {
        if (component && component.id) {
            params.append(category, component.id);
        }
    });
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Anvil Systems Build',
            text: 'Check out my custom PC build!',
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Build link copied to clipboard!');
        });
    }
}

// Load build from URL
function loadBuildFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.toString()) {
        // Load components from URL parameters
        // This is a simplified version - in production, you'd want more robust loading
    }
}

// Add build to cart
function addBuildToCart() {
    // Check if all required components are selected
    const requiredCategories = ['cpu', 'gpu', 'ram', 'storage', 'cooling', 'case', 'psu', 'motherboard'];
    const missingComponents = requiredCategories.filter(cat => !selectedComponents[cat]);
    
    if (missingComponents.length > 0) {
        alert('Please select all required components before adding to cart.');
        return;
    }
    
    const totalPrice = calculateTotalPrice();
    
    const cartItem = {
        id: 'custom-build-' + Date.now(),
        type: 'system',
        name: 'Custom Build',
        specs: selectedComponents,
        price: totalPrice,
        quantity: 1,
        customizations: selectedComponents
    };
    
    if (typeof window.addToCart === 'function') {
        window.addToCart(cartItem);
    } else if (typeof addToCart === 'function') {
        addToCart(cartItem);
    } else {
        console.error('Cart functions not loaded');
        alert('Error: Cart functionality not available. Please refresh the page.');
        return;
    }
    
    alert('Build added to cart!');
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
    
    // Optionally redirect to cart
    // window.location.href = 'cart.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Note: Next/Prev button handlers are set up in updateNavigation()
    // which is called from renderStep() after data loads
    
    const saveBuildBtn = document.getElementById('save-build');
    if (saveBuildBtn) {
        saveBuildBtn.addEventListener('click', saveBuild);
    }
    
    const shareBuildLinkBtn = document.getElementById('share-build-link');
    if (shareBuildLinkBtn) {
        shareBuildLinkBtn.addEventListener('click', shareBuildLink);
    }
});
