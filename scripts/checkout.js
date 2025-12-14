// Checkout Page
let currentCheckoutStep = 1;
let shippingData = {};
let paymentData = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (typeof getCart !== 'function') {
        console.error('Cart functions not loaded');
        alert('Error: Cart functionality not available. Please refresh the page.');
        return;
    }
    
    const cart = getCart();
    
    if (cart.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    renderCheckoutItems();
    updateCheckoutSummary();
    setupFormValidation();
    updateCheckoutSteps();
    
    const nextBtn = document.getElementById('next-step-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', nextStep);
    }
    
    const prevBtn = document.getElementById('prev-step-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', previousStep);
    }
    
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
});

// Render checkout items
function renderCheckoutItems() {
    if (typeof getCart !== 'function') {
        console.error('Cart functions not loaded');
        return;
    }
    
    const cart = getCart();
    const container = document.getElementById('checkout-items');
    if (!container) return;
    
    container.innerHTML = cart.items.map(item => `
        <div class="checkout-item">
            <div class="checkout-item-name">${item.name}</div>
            <div class="checkout-item-details">
                <span>Qty: ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        </div>
    `).join('');
}

// Update checkout summary
function updateCheckoutSummary() {
    if (typeof getCart !== 'function') {
        console.error('Cart functions not loaded');
        return;
    }
    
    const cart = getCart();
    const subtotalEl = document.getElementById('checkout-subtotal');
    const taxEl = document.getElementById('checkout-tax');
    const shippingEl = document.getElementById('checkout-shipping');
    const totalEl = document.getElementById('checkout-total');
    
    if (subtotalEl) subtotalEl.textContent = `$${cart.subtotal.toLocaleString()}`;
    if (taxEl) taxEl.textContent = `$${cart.tax.toLocaleString()}`;
    if (shippingEl) shippingEl.textContent = cart.shipping > 0 ? `$${cart.shipping.toLocaleString()}` : 'FREE';
    if (totalEl) totalEl.textContent = `$${cart.total.toLocaleString()}`;
}

// Setup form validation
function setupFormValidation() {
    // Card number formatting
    const cardNumberInput = document.querySelector('input[name="cardNumber"]');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            value = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = value;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.querySelector('input[name="expiry"]');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cvvInput = document.querySelector('input[name="cvv"]');
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // ZIP code formatting
    const zipInput = document.querySelector('input[name="zip"]');
    if (zipInput) {
        zipInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 5);
        });
    }
}

// Next step
function nextStep() {
    if (currentCheckoutStep === 1) {
        if (validateShippingForm()) {
            currentCheckoutStep = 2;
            updateCheckoutSteps();
        }
    } else if (currentCheckoutStep === 2) {
        if (validatePaymentForm()) {
            currentCheckoutStep = 3;
            updateCheckoutSteps();
            renderReview();
        }
    }
}

// Previous step
function previousStep() {
    if (currentCheckoutStep > 1) {
        currentCheckoutStep--;
        updateCheckoutSteps();
    }
}

// Update checkout steps UI
function updateCheckoutSteps() {
    // Update step indicators
    document.querySelectorAll('.checkout-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < currentCheckoutStep) {
            step.classList.add('completed');
        } else if (index + 1 === currentCheckoutStep) {
            step.classList.add('active');
        }
    });
    
    // Show/hide step content
    document.querySelectorAll('.checkout-step-content').forEach((content, index) => {
        if (index + 1 === currentCheckoutStep) {
            content.classList.add('active');
            content.style.display = 'block';
        } else {
            content.classList.remove('active');
            content.style.display = 'none';
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    if (prevBtn) {
        prevBtn.style.display = currentCheckoutStep > 1 ? 'flex' : 'none';
    }
    if (nextBtn) {
        nextBtn.style.display = currentCheckoutStep < 3 ? 'flex' : 'none';
    }
    if (placeOrderBtn) {
        placeOrderBtn.style.display = currentCheckoutStep === 3 ? 'flex' : 'none';
    }
}

// Validate shipping form
function validateShippingForm() {
    const form = document.getElementById('shipping-form');
    if (!form) return false;
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    const formData = new FormData(form);
    shippingData = Object.fromEntries(formData);
    return true;
}

// Validate payment form
function validatePaymentForm() {
    const form = document.getElementById('payment-form');
    if (!form) return false;
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    const formData = new FormData(form);
    paymentData = Object.fromEntries(formData);
    
    // Basic card number validation (demo)
    const cardNumber = (paymentData.cardNumber || '').replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        alert('Please enter a valid card number');
        return false;
    }
    
    return true;
}

// Render review step
function renderReview() {
    if (typeof getCart !== 'function') {
        console.error('Cart functions not loaded');
        return;
    }
    
    const cart = getCart();
    const container = document.getElementById('review-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="review-section">
            <h3>Shipping Information</h3>
            <div class="review-info">
                <p><strong>${shippingData.name}</strong></p>
                <p>${shippingData.address}</p>
                <p>${shippingData.city}, ${shippingData.state} ${shippingData.zip}</p>
                <p>${shippingData.email}</p>
                <p>${shippingData.phone}</p>
            </div>
        </div>
        
        <div class="review-section">
            <h3>Payment Method</h3>
            <div class="review-info">
                <p>Card ending in ${paymentData.cardNumber.slice(-4)}</p>
                <p>Expires: ${paymentData.expiry}</p>
                <p>Name: ${paymentData.cardName}</p>
            </div>
        </div>
        
        <div class="review-section">
            <h3>Order Items</h3>
            <div class="review-items">
                ${cart.items.map(item => `
                    <div class="review-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Place order
function placeOrder() {
    if (typeof getCart !== 'function' || typeof clearCart !== 'function') {
        console.error('Cart functions not loaded');
        alert('Error: Cart functionality not available. Please refresh the page.');
        return;
    }
    
    const cart = getCart();
    
    if (cart.items.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'cart.html';
        return;
    }
    
    // Create order
    const order = {
        id: 'ORD-' + Date.now(),
        items: cart.items,
        shipping: shippingData,
        payment: {
            method: 'card',
            last4: (paymentData.cardNumber || '').slice(-4)
        },
        totals: {
            subtotal: cart.subtotal,
            tax: cart.tax,
            shipping: cart.shipping,
            total: cart.total
        },
        date: new Date().toISOString(),
        status: 'processing'
    };
    
    // Save order to localStorage (demo)
    const orders = JSON.parse(localStorage.getItem('anvil_orders') || '[]');
    orders.push(order);
    localStorage.setItem('anvil_orders', JSON.stringify(orders));
    
    // Clear cart
    clearCart();
    
    // Redirect to confirmation
    window.location.href = `status.html?order=${order.id}`;
}
