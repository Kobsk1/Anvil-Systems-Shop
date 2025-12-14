// Components Page
let allComponents = {};
let filteredComponents = [];
let currentCategory = 'all';
let componentsData = null;

// Load components data
async function loadComponents() {
    try {
        const response = await fetch('scripts/data/components.json');
        componentsData = await response.json();
        allComponents = componentsData.components;
        
        // Initialize with all components
        updateFilteredComponents();
        renderComponents();
        populateBrandFilters();
        updateResultsCount();
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Update filtered components based on current filters
function updateFilteredComponents() {
    let components = [];
    
    // Get components from current category or all
    if (currentCategory === 'all') {
        Object.values(allComponents).forEach(categoryComponents => {
            components = components.concat(categoryComponents);
        });
    } else if (allComponents[currentCategory]) {
        components = [...allComponents[currentCategory]];
    }
    
    // Apply filters
    const priceMin = parseInt(document.getElementById('comp-price-min').value);
    const priceMax = parseInt(document.getElementById('comp-price-max').value);
    const selectedBrands = Array.from(document.querySelectorAll('#brand-filters input:checked')).map(cb => cb.value);
    const anvilCertifiedOnly = document.getElementById('anvil-certified-only').checked;
    
    filteredComponents = components.filter(component => {
        // Price filter
        if (component.price < priceMin || component.price > priceMax) {
            return false;
        }
        
        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(component.brand)) {
            return false;
        }
        
        // Anvil Certified filter
        if (anvilCertifiedOnly && !component.anvilCertified) {
            return false;
        }
        
        return true;
    });
    
    // Apply sorting
    applySort();
}

// Apply sorting
function applySort() {
    const sortValue = document.getElementById('comp-sort-select').value;
    
    filteredComponents.sort((a, b) => {
        switch (sortValue) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'brand':
                return a.brand.localeCompare(b.brand);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });
}

// Render components grid
function renderComponents() {
    const grid = document.getElementById('components-grid');
    
    if (filteredComponents.length === 0) {
        document.getElementById('comp-no-results').style.display = 'block';
        grid.innerHTML = '';
        return;
    }
    
    document.getElementById('comp-no-results').style.display = 'none';
    
    grid.innerHTML = filteredComponents.map(component => {
        const specs = formatSpecs(component);
        return `
            <div class="component-card">
                ${component.anvilCertified ? '<span class="anvil-badge"><i class="fas fa-certificate"></i> Anvil Certified</span>' : ''}
                <div class="component-image">
                    <div class="placeholder-content">
                        <i class="fas fa-${getCategoryIcon(component)}" style="font-size: 3rem; color: #ff4500; opacity: 0.3;"></i>
                        <p style="color: #666; font-size: 0.8rem; margin-top: 1rem;">[Component Image]</p>
                    </div>
                </div>
                <div class="component-info">
                    <div class="component-brand">${component.brand}</div>
                    <h3 class="component-name">${component.name}</h3>
                    <div class="component-specs">${specs}</div>
                    <div class="component-price-row">
                        <span class="component-price">$${component.price.toLocaleString()}</span>
                        <button class="btn-build btn-quick-add" data-component-id="${component.id}" data-category="${getComponentCategory(component)}">
                            <i class="fas fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners for quick-add buttons
    document.querySelectorAll('.btn-quick-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const componentId = e.target.closest('.btn-quick-add').dataset.componentId;
            const category = e.target.closest('.btn-quick-add').dataset.category;
            addComponentToCart(componentId, category);
        });
    });
}

// Get component category
function getComponentCategory(component) {
    for (const [category, components] of Object.entries(allComponents)) {
        if (components.find(c => c.id === component.id)) {
            return category;
        }
    }
    return 'unknown';
}

// Get category icon
function getCategoryIcon(component) {
    const category = getComponentCategory(component);
    const icons = {
        'cpu': 'microchip',
        'gpu': 'fan',
        'ram': 'memory',
        'storage': 'hdd',
        'cooling': 'snowflake',
        'case': 'cube',
        'psu': 'bolt',
        'motherboard': 'microchip'
    };
    return icons[category] || 'box';
}

// Format component specs for display
function formatSpecs(component) {
    const specs = component.specs;
    let html = '<ul class="component-specs-list">';
    
    if (specs.cores) {
        html += `<li>${specs.cores} Cores / ${specs.threads} Threads</li>`;
    }
    if (specs.vram) {
        html += `<li>${specs.vram}</li>`;
    }
    if (specs.capacity) {
        html += `<li>${specs.capacity}</li>`;
    }
    if (specs.wattage) {
        html += `<li>${specs.wattage}W</li>`;
    }
    if (specs.type) {
        html += `<li>${specs.type}</li>`;
    }
    
    html += '</ul>';
    return html;
}

// Populate brand filters
function populateBrandFilters() {
    const brands = new Set();
    Object.values(allComponents).forEach(components => {
        components.forEach(comp => brands.add(comp.brand));
    });
    
    const brandFilters = document.getElementById('brand-filters');
    brandFilters.innerHTML = Array.from(brands).sort().map(brand => `
        <label class="checkbox-label">
            <input type="checkbox" name="brand" value="${brand}" checked>
            <span>${brand}</span>
        </label>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('#brand-filters input').forEach(cb => {
        cb.addEventListener('change', () => {
            updateFilteredComponents();
            renderComponents();
            updateResultsCount();
        });
    });
}

// Add component to cart
function addComponentToCart(componentId, category) {
    const component = allComponents[category]?.find(c => c.id === componentId);
    if (!component) return;
    
    const cartItem = {
        id: component.id,
        type: 'component',
        name: component.name,
        specs: component.specs,
        price: component.price,
        quantity: 1,
        brand: component.brand,
        category: category
    };
    
    if (typeof addToCart === 'function') {
        addToCart(cartItem);
        
        // Show feedback
        const btn = document.querySelector(`[data-component-id="${componentId}"]`);
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Added!';
        btn.style.background = '#4caf50';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 1500);
        
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
    }
}

// Update results count
function updateResultsCount() {
    const count = filteredComponents.length;
    document.getElementById('comp-results-count').textContent = `${count} component${count !== 1 ? 's' : ''} found`;
}

// Update price display
function updatePriceDisplay() {
    const priceMin = document.getElementById('comp-price-min').value;
    const priceMax = document.getElementById('comp-price-max').value;
    document.getElementById('comp-price-min-display').textContent = parseInt(priceMin).toLocaleString();
    document.getElementById('comp-price-max-display').textContent = parseInt(priceMax).toLocaleString();
}

// Clear filters
function clearFilters() {
    document.getElementById('comp-price-min').value = 0;
    document.getElementById('comp-price-max').value = 2000;
    document.querySelectorAll('#brand-filters input').forEach(cb => cb.checked = true);
    document.getElementById('anvil-certified-only').checked = false;
    updatePriceDisplay();
    updateFilteredComponents();
    renderComponents();
    updateResultsCount();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
    
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            updateFilteredComponents();
            renderComponents();
            updateResultsCount();
        });
    });
    
    // Price filters
    document.getElementById('comp-price-min').addEventListener('input', () => {
        updatePriceDisplay();
        updateFilteredComponents();
        renderComponents();
        updateResultsCount();
    });
    
    document.getElementById('comp-price-max').addEventListener('input', () => {
        updatePriceDisplay();
        updateFilteredComponents();
        renderComponents();
        updateResultsCount();
    });
    
    // Anvil Certified filter
    document.getElementById('anvil-certified-only').addEventListener('change', () => {
        updateFilteredComponents();
        renderComponents();
        updateResultsCount();
    });
    
    // Sort
    document.getElementById('comp-sort-select').addEventListener('change', () => {
        applySort();
        renderComponents();
    });
    
    // Clear filters
    document.getElementById('clear-comp-filters').addEventListener('click', clearFilters);
    
    // Initialize price display
    updatePriceDisplay();
});
