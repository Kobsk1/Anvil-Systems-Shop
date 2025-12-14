// Systems Page - Filtering and Sorting
let allSystems = [];
let filteredSystems = [];
let categoryFilter = null;

// Load systems data
async function loadSystems() {
    try {
        const response = await fetch('scripts/data/systems.json');
        const data = await response.json();
        allSystems = data.systems;
        filteredSystems = [...allSystems];
        
        // Check for category filter from URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        if (category) {
            applyCategoryFilter(category);
        }
        
        renderSystems();
        updateResultsCount();
    } catch (error) {
        console.error('Error loading systems:', error);
        document.getElementById('systems-grid').innerHTML = 
            '<p style="color: #ff4500; text-align: center; padding: 2rem;">Error loading systems. Please refresh the page.</p>';
    }
}

// Apply category filter
function applyCategoryFilter(category) {
    categoryFilter = category;
    const categoryMap = {
        'gaming': ['gaming'],
        'workstation': ['creator', 'work'],
        'mini': ['mini'],
        'limited-edition': ['limited-edition']
    };
    
    const useCases = categoryMap[category];
    if (useCases) {
        // Update filter checkboxes
        document.querySelectorAll('input[name="useCase"]').forEach(cb => {
            cb.checked = useCases.includes(cb.value);
        });
        
        // Apply filters to update the view
        applyFilters();
    }
}

// Render systems grid
function renderSystems() {
    const grid = document.getElementById('systems-grid');
    const noResults = document.getElementById('no-results');
    
    if (!grid) return;
    
    if (filteredSystems.length === 0) {
        if (noResults) {
            noResults.style.display = 'block';
        }
        grid.innerHTML = '';
        return;
    }
    
    if (noResults) {
        noResults.style.display = 'none';
    }
    
    grid.innerHTML = filteredSystems.map(system => `
        <div class="build-card">
            <div class="build-image" id="build-${system.id}">
                <img src="${system.image}" alt="${system.name} - ${system.description}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'placeholder-content\\'><h3 style=\\'color: #ff4500;\\'>${system.name}</h3><p style=\\'color: #666;\\'>[Image Placeholder]</p></div><div class=\\'build-overlay\\'><span class=\\'build-tag\\'>${system.tag}</span></div>';">
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
                    <li><i class="fas fa-memory"></i> ${system.specs.ram.name}</li>
                    <li><i class="fas fa-hdd"></i> ${system.specs.storage.name}</li>
                </ul>
                <div class="build-price">
                    <span class="price">$${system.basePrice.toLocaleString()}</span>
                    <a href="system-details.html?id=${system.id}" class="btn-build">View Details <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </div>
    `).join('');
    
}

// Apply filters
function applyFilters() {
    const priceMinEl = document.getElementById('price-min');
    const priceMaxEl = document.getElementById('price-max');
    const performanceTierEl = document.getElementById('performance-tier');
    
    if (!priceMinEl || !priceMaxEl || !performanceTierEl) return;
    
    const priceMin = parseInt(priceMinEl.value || 0);
    const priceMax = parseInt(priceMaxEl.value || 5000);
    const useCaseCheckboxes = document.querySelectorAll('input[name="useCase"]:checked');
    const selectedUseCases = Array.from(useCaseCheckboxes).map(cb => cb.value);
    const performanceTier = performanceTierEl.value;
    
    // Start with all systems (category filter is applied separately in loadSystems)
    filteredSystems = allSystems.filter(system => {
        // Price filter
        if (system.basePrice < priceMin || system.basePrice > priceMax) {
            return false;
        }
        
        // Use case filter
        if (selectedUseCases.length > 0) {
            const hasMatchingUseCase = system.useCase.some(uc => selectedUseCases.includes(uc));
            if (!hasMatchingUseCase) {
                return false;
            }
        }
        
        // Performance tier filter
        if (performanceTier && system.performanceTier !== performanceTier) {
            return false;
        }
        
        return true;
    });
    
    // Apply current sort
    applySort();
    renderSystems();
    updateResultsCount();
}

// Apply sorting
function applySort() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;
    
    const sortValue = sortSelect.value;
    
    filteredSystems.sort((a, b) => {
        switch (sortValue) {
            case 'price-low':
                return a.basePrice - b.basePrice;
            case 'price-high':
                return b.basePrice - a.basePrice;
            case 'performance':
                const tierOrder = { 'entry': 1, 'mid': 2, 'high': 3, 'extreme': 4 };
                return tierOrder[b.performanceTier] - tierOrder[a.performanceTier];
            case 'popularity':
            default:
                return b.popularity - a.popularity;
        }
    });
}

// Update results count
function updateResultsCount() {
    const count = filteredSystems.length;
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = `${count} system${count !== 1 ? 's' : ''} found`;
    }
}

// Update price display
function updatePriceDisplay() {
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const priceMinDisplay = document.getElementById('price-min-display');
    const priceMaxDisplay = document.getElementById('price-max-display');
    
    if (priceMin && priceMax && priceMinDisplay && priceMaxDisplay) {
        priceMinDisplay.textContent = parseInt(priceMin.value || 0).toLocaleString();
        priceMaxDisplay.textContent = parseInt(priceMax.value || 5000).toLocaleString();
    }
}

// Clear all filters
function clearFilters() {
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const performanceTier = document.getElementById('performance-tier');
    
    if (priceMin) priceMin.value = 0;
    if (priceMax) priceMax.value = 5000;
    if (performanceTier) performanceTier.value = '';
    
    document.querySelectorAll('input[name="useCase"]').forEach(cb => cb.checked = true);
    categoryFilter = null;
    updatePriceDisplay();
    applyFilters();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSystems();
    
    // Filter event listeners
    const priceMin = document.getElementById('price-min');
    if (priceMin) {
        priceMin.addEventListener('input', () => {
            updatePriceDisplay();
            applyFilters();
        });
    }
    
    const priceMax = document.getElementById('price-max');
    if (priceMax) {
        priceMax.addEventListener('input', () => {
            updatePriceDisplay();
            applyFilters();
        });
    }
    
    document.querySelectorAll('input[name="useCase"]').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });
    
    const performanceTier = document.getElementById('performance-tier');
    if (performanceTier) {
        performanceTier.addEventListener('change', applyFilters);
    }
    
    // Sort event listener
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            applySort();
            renderSystems();
        });
    }
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Initialize price display
    updatePriceDisplay();
});
