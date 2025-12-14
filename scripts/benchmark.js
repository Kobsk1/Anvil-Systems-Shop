// Performance Benchmark Tool
let componentsData = null;
let performanceData = null;
let build1 = {};
let build2 = {};

// Load data
async function loadData() {
    try {
        const [componentsRes, perfRes] = await Promise.all([
            fetch('scripts/data/components.json'),
            fetch('scripts/data/performance.json')
        ]);
        componentsData = await componentsRes.json();
        performanceData = await perfRes.json();
        
        populateSelectors();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Populate component selectors
function populateSelectors() {
    const categories = ['cpu', 'gpu', 'ram', 'storage'];
    
    categories.forEach(category => {
        const components = componentsData.components[category] || [];
        const selectors = document.querySelectorAll(`select[data-category="${category}"]`);
        
        selectors.forEach(select => {
            components.forEach(component => {
                const option = document.createElement('option');
                option.value = component.id;
                option.textContent = `${component.name} - $${component.price.toLocaleString()}`;
                select.appendChild(option);
            });
        });
    });
    
    // Add event listeners
    document.querySelectorAll('.component-select').forEach(select => {
        select.addEventListener('change', () => {
            const build = select.dataset.build;
            const category = select.dataset.category;
            const componentId = select.value;
            
            if (build === 'build1') {
                if (componentId) {
                    const component = componentsData.components[category].find(c => c.id === componentId);
                    build1[category] = component;
                } else {
                    delete build1[category];
                }
            } else {
                if (componentId) {
                    const component = componentsData.components[category].find(c => c.id === componentId);
                    build2[category] = component;
                } else {
                    delete build2[category];
                }
            }
            
            calculatePerformance();
        });
    });
}

// Calculate performance
function calculatePerformance() {
    const hasBuild1 = Object.keys(build1).length > 0;
    const hasBuild2 = Object.keys(build2).length > 0;
    
    if (!hasBuild1 && !hasBuild2) {
        document.getElementById('benchmark-results').style.display = 'none';
        return;
    }
    
    document.getElementById('benchmark-results').style.display = 'block';
    
    if (hasBuild1) {
        calculateBuildPerformance('build1', build1);
    }
    
    if (hasBuild2) {
        calculateBuildPerformance('build2', build2);
        document.getElementById('build2-score').style.display = 'block';
        document.getElementById('build2-cinebench-item').style.display = 'flex';
        document.getElementById('build2-3dmark-item').style.display = 'flex';
        document.getElementById('fps-build2-header').style.display = 'table-cell';
    } else {
        document.getElementById('build2-score').style.display = 'none';
        document.getElementById('build2-cinebench-item').style.display = 'none';
        document.getElementById('build2-3dmark-item').style.display = 'none';
        document.getElementById('fps-build2-header').style.display = 'none';
    }
    
    calculateFPS();
}

// Calculate performance for a single build
function calculateBuildPerformance(buildId, build) {
    const calc = performanceData.calculation;
    let totalScore = 0;
    let cpuScore = 0;
    let gpuScore = 0;
    let ramScore = 0;
    let storageScore = 0;
    
    // Get component scores
    if (build.cpu) {
        const cpu = performanceData.components.cpus.find(c => c.id === build.cpu.id);
        if (cpu) {
            cpuScore = cpu.score * calc.cpuWeight;
            totalScore += cpuScore;
        }
    }
    
    if (build.gpu) {
        const gpu = performanceData.components.gpus.find(g => g.id === build.gpu.id);
        if (gpu) {
            gpuScore = gpu.score * calc.gpuWeight;
            totalScore += gpuScore;
        }
    }
    
    if (build.ram) {
        const ram = performanceData.components.ram.find(r => r.id === build.ram.id);
        if (ram) {
            ramScore = ram.score * calc.ramWeight;
            totalScore += ramScore;
        }
    }
    
    if (build.storage) {
        const storage = performanceData.components.storage.find(s => s.id === build.storage.id);
        if (storage) {
            storageScore = storage.score * calc.storageWeight;
            totalScore += storageScore;
        }
    }
    
    // Update UI
    document.getElementById(`${buildId}-score-value`).textContent = Math.round(totalScore).toLocaleString();
    
    // Calculate percentage for progress bar (max score ~15000)
    const maxScore = 15000;
    const percentage = Math.min((totalScore / maxScore) * 100, 100);
    document.getElementById(`${buildId}-fill`).style.width = `${percentage}%`;
    
    // Determine tier
    const tier = getPerformanceTier(totalScore);
    document.getElementById(`${buildId}-tier`).textContent = tier.label;
    document.getElementById(`${buildId}-fill`).style.background = `linear-gradient(90deg, ${tier.color}, ${tier.color})`;
    
    // Update benchmark scores
    if (build.cpu) {
        const cpu = performanceData.components.cpus.find(c => c.id === build.cpu.id);
        if (cpu) {
            document.getElementById(`${buildId}-cinebench`).textContent = cpu.cinebench.toLocaleString();
        }
    }
    
    if (build.gpu) {
        const gpu = performanceData.components.gpus.find(g => g.id === build.gpu.id);
        if (gpu) {
            document.getElementById(`${buildId}-3dmark`).textContent = gpu.threeDMark.toLocaleString();
        }
    }
}

// Get performance tier
function getPerformanceTier(score) {
    const tiers = performanceData.performanceMap;
    
    if (score >= tiers.extreme.min) {
        return tiers.extreme;
    } else if (score >= tiers.high.min) {
        return tiers.high;
    } else if (score >= tiers.mid.min) {
        return tiers.mid;
    } else {
        return tiers.entry;
    }
}

// Calculate FPS estimates
function calculateFPS() {
    const tbody = document.getElementById('fps-tbody');
    const games = performanceData.fpsEstimates;
    
    let html = '';
    
    Object.entries(games).forEach(([gameId, game]) => {
        const resolutions = ['1080p', '1440p', '4k'];
        
        resolutions.forEach(resolution => {
            const build1FPS = calculateGameFPS(build1, gameId, resolution);
            const build2FPS = build2 && Object.keys(build2).length > 0 ? calculateGameFPS(build2, gameId, resolution) : null;
            
            html += `
                <tr>
                    <td>${game.name}</td>
                    <td>${resolution}</td>
                    <td>${build1FPS !== null ? build1FPS + ' FPS' : '-'}</td>
                    ${build2FPS !== null ? `<td>${build2FPS} FPS</td>` : '<td>-</td>'}
                </tr>
            `;
        });
    });
    
    tbody.innerHTML = html;
}

// Calculate FPS for a specific game and resolution
function calculateGameFPS(build, gameId, resolution) {
    if (!build.cpu || !build.gpu) return null;
    
    const cpu = performanceData.components.cpus.find(c => c.id === build.cpu.id);
    const gpu = performanceData.components.gpus.find(g => g.id === build.gpu.id);
    
    if (!cpu || !gpu) return null;
    
    const totalScore = cpu.score + gpu.score;
    const game = performanceData.fpsEstimates[gameId];
    const multiplier = game[resolution] || 0.5;
    
    // Base FPS calculation (simplified)
    const baseFPS = (totalScore / 100) * multiplier;
    return Math.round(baseFPS);
}

// Tab switching
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.querySelectorAll('.benchmark-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.benchmark-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.benchmark-build').forEach(b => b.classList.remove('active'));
            
            tab.classList.add('active');
            const buildId = tab.dataset.build;
            document.getElementById(`${buildId}-panel`).classList.add('active');
            document.getElementById(`${buildId}-panel`).style.display = 'block';
        });
    });
});
