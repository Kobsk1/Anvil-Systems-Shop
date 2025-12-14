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

// Simple image placeholder replacement (you would replace with actual images)
function loadPlaceholderImages() {
    // This is where you would load actual images
    // For now, we'll just add some text placeholders
    const buildImages = document.querySelectorAll('.build-image');
    
    buildImages.forEach((img, index) => {
        const names = ['VALKYRIE', 'TITAN FORGE', 'EMBER'];
        const desc = ['1440p Gaming', '4K/VR Creation', '1080p Performance'];
        
        img.innerHTML = `
            <div class="placeholder-content">
                <h3 style="color: #ff4500; margin-bottom: 10px;">${names[index]}</h3>
                <p style="color: #ccc;">${desc[index]} PC</p>
                <p style="color: #666; font-size: 0.8rem; margin-top: 10px;">[PC Image Placeholder]</p>
            </div>
        `;
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
});

// Simple form submission handling (for future forms)
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your interest! This is a prototype form.');
    });
});