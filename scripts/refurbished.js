// Refurbished/Outlet Systems Page
async function loadRefurbished() {
    try {
        const response = await fetch('scripts/data/systems.json');
        const data = await response.json();
        const refurbished = data.systems.map(system => ({
            ...system,
            tag: 'REFURB',
            basePrice: Math.round(system.basePrice * 0.75)
        }));
        
        const grid = document.getElementById('refurbished-grid');
        grid.innerHTML = refurbished.map(system => `
            <div class="build-card">
                <div class="build-image" id="refurb-${system.id}">
                    <img src="assets/refurbished/Voy_Red_Hero_1250x.webp" alt="${system.name} - Refurbished" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'placeholder-content\\'><h3 style=\\'color: #ff4500;\\'>${system.name}</h3><p style=\\'color: #666;\\'>[Refurbished]</p></div><div class=\\'build-overlay\\'><span class=\\'build-tag\\'>REFURB</span></div>';">
                    <div class="build-overlay">
                        <span class="build-tag">REFURB</span>
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
        
        document.getElementById('results-count').textContent = `${refurbished.length} systems found`;
    } catch (error) {
        console.error('Error loading refurbished systems:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadRefurbished);
