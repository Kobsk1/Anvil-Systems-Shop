// Systems Page - Filtering and Sorting
let allSystems = [];
let filteredSystems = [];

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
        'mini': ['mini']
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
    
    if (filteredSystems.length === 0) {
        document.getElementById('no-results').style.display = 'block';
        grid.innerHTML = '';
        return;
    }
    
    document.getElementById('no-results').style.display = 'none';
    
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
    const priceMin = parseInt(document.getElementById('price-min').value);
    const priceMax = parseInt(document.getElementById('price-max').value);
    const useCaseCheckboxes = document.querySelectorAll('input[name="useCase"]:checked');
    const selectedUseCases = Array.from(useCaseCheckboxes).map(cb => cb.value);
    const performanceTier = document.getElementById('performance-tier').value;
    
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
    const sortValue = document.getElementById('sort-select').value;
    
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
    countElement.textContent = `${count} system${count !== 1 ? 's' : ''} found`;
}

// Update price display
function updatePriceDisplay() {
    const priceMin = document.getElementById('price-min').value;
    const priceMax = document.getElementById('price-max').value;
    document.getElementById('price-min-display').textContent = parseInt(priceMin).toLocaleString();
    document.getElementById('price-max-display').textContent = parseInt(priceMax).toLocaleString();
}

// Clear all filters
function clearFilters() {
    document.getElementById('price-min').value = 0;
    document.getElementById('price-max').value = 5000;
    document.querySelectorAll('input[name="useCase"]').forEach(cb => cb.checked = true);
    document.getElementById('performance-tier').value = '';
    categoryFilter = null;
    updatePriceDisplay();
    applyFilters();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSystems();
    
    // Filter event listeners
    document.getElementById('price-min').addEventListener('input', () => {
        updatePriceDisplay();
        applyFilters();
    });
    
    document.getElementById('price-max').addEventListener('input', () => {
        updatePriceDisplay();
        applyFilters();
    });
    
    document.querySelectorAll('input[name="useCase"]').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });
    
    document.getElementById('performance-tier').addEventListener('change', applyFilters);
    
    // Sort event listener
    document.getElementById('sort-select').addEventListener('change', () => {
        applySort();
        renderSystems();
    });
    
    // Clear filters button
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // Initialize price display
    updatePriceDisplay();
});
