// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if(this.getAttribute('href') === '#') return;
        
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add active class to nav links on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if(scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add hover effect to build cards
document.querySelectorAll('.build-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const lavaColor = getComputedStyle(document.documentElement).getPropertyValue('--color-lava');
        this.style.boxShadow = `0 15px 30px ${lavaColor}30`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
    });
});

// Load images for build cards on homepage
function loadPlaceholderImages() {
    // Images are now loaded directly in HTML, but we can add fallback handling here if needed
    const buildImages = document.querySelectorAll('.build-image:not(:has(img))');
    
    buildImages.forEach((img) => {
        // Only add placeholder if no image is present
        if (!img.querySelector('img')) {
            img.innerHTML = `
                <div class="placeholder-content">
                    <h3 style="color: #ff4500; margin-bottom: 10px;">PC Build</h3>
                    <p style="color: #666; font-size: 0.8rem;">[Image Loading...]</p>
                </div>
            `;
        }
    });
}

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPage || (currentPage === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadPlaceholderImages();
    
    // Add current year to footer
    const yearSpan = document.querySelector('#current-year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Set active navigation link
    setActiveNavLink();
    
    // Initialize cart badge if cart.js is loaded
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
});

// Simple form submission handling (for future forms)
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your interest! This is a prototype form.');
    });
});