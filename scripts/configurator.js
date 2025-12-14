// PC Configurator - Step-by-step builder
let currentStep = 0;
let selectedComponents = {};
let componentsData = null;
let systemsData = null;
const steps = [
    { id: 'base', name: 'Base System', category: null },
    { id: 'cpu', name: 'CPU', category: 'cpu' },
    { id: 'gpu', name: 'GPU', category: 'gpu' },
    { id: 'ram', name: 'RAM', category: 'ram' },
    { id: 'storage', name: 'Storage', category: 'storage' },
    { id: 'cooling', name: 'Cooling', category: 'cooling' },
    { id: 'case', name: 'Case', category: 'case' },
    { id: 'psu', name: 'Power Supply', category: 'psu' }
];

// Load data
async function loadData() {
    try {
        const [componentsRes, systemsRes] = await Promise.all([
            fetch('scripts/data/components.json'),
            fetch('scripts/data/systems.json')
        ]);
        componentsData = await componentsRes.json();
        systemsData = await systemsRes.json();
        
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
    
    updateProgress();
    updateNavigation();
    
    if (step.id === 'base') {
        renderBaseStep(stepContent);
    } else {
        renderComponentStep(stepContent, step);
    }
}

// Render base system selection step
function renderBaseStep(container) {
    container.innerHTML = `
        <h2 class="step-title">Choose Your Starting Point</h2>
        <p class="step-description">Start with a pre-built system or build from scratch</p>
        <div class="component-options">
            <div class="component-option" data-base="scratch">
                <div class="option-name">Start from Scratch</div>
                <div class="option-specs">Build your PC completely custom from individual components</div>
                <div class="option-price">$0</div>
            </div>
            ${systemsData.systems.map(system => `
                <div class="component-option" data-base="${system.id}">
                    <div class="option-name">${system.name}</div>
                    <div class="option-specs">${system.description}</div>
                    <div class="option-price">$${system.basePrice.toLocaleString()}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add event listeners
    container.querySelectorAll('.component-option').forEach(option => {
        option.addEventListener('click', () => {
            container.querySelectorAll('.component-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            const baseId = option.dataset.base;
            if (baseId === 'scratch') {
                selectedComponents = {};
            } else {
                const system = systemsData.systems.find(s => s.id === baseId);
                if (system) {
                    selectedComponents = {
                        cpu: system.specs.cpu,
                        gpu: system.specs.gpu,
                        ram: system.specs.ram,
                        storage: system.specs.storage,
                        cooling: system.specs.cooling,
                        case: system.specs.case,
                        psu: system.specs.psu,
                        motherboard: system.specs.motherboard
                    };
                }
            }
            updateSummary();
        });
    });
    
    // Mark selected if exists
    if (selectedComponents.base) {
        const selected = container.querySelector(`[data-base="${selectedComponents.base}"]`);
        if (selected) selected.classList.add('selected');
    }
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
    
    return text.join(' • ') || 'See details';
}

// Update progress indicator
function updateProgress() {
    const progress = ((currentStep + 1) / steps.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
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
    
    prevBtn.style.display = currentStep > 0 ? 'flex' : 'none';
    
    if (currentStep === steps.length - 1) {
        nextBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        nextBtn.onclick = addBuildToCart;
    } else {
        nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
        nextBtn.onclick = nextStep;
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
    const totalPrice = calculateTotalPrice();
    
    let html = '';
    let hasItems = false;
    
    Object.entries(selectedComponents).forEach(([category, component]) => {
        if (category === 'base') return;
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
    document.getElementById('build-total-price').textContent = `$${totalPrice.toLocaleString()}`;
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
    
    if (typeof addToCart === 'function') {
        addToCart(cartItem);
        alert('Build added to cart!');
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.getElementById('prev-btn').addEventListener('click', previousStep);
    document.getElementById('save-build').addEventListener('click', saveBuild);
    document.getElementById('share-build-link').addEventListener('click', shareBuildLink);
});
