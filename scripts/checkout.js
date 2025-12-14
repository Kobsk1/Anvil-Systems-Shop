// Checkout Page
let currentCheckoutStep = 1;
let shippingData = {};
let paymentData = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const cart = getCart();
    
    if (cart.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    renderCheckoutItems();
    updateCheckoutSummary();
    setupFormValidation();
    
    document.getElementById('next-step-btn').addEventListener('click', nextStep);
    document.getElementById('prev-step-btn').addEventListener('click', previousStep);
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
});

// Render checkout items
function renderCheckoutItems() {
    const cart = getCart();
    const container = document.getElementById('checkout-items');
    
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
    const cart = getCart();
    document.getElementById('checkout-subtotal').textContent = `$${cart.subtotal.toLocaleString()}`;
    document.getElementById('checkout-tax').textContent = `$${cart.tax.toLocaleString()}`;
    document.getElementById('checkout-shipping').textContent = cart.shipping > 0 ? `$${cart.shipping.toLocaleString()}` : 'FREE';
    document.getElementById('checkout-total').textContent = `$${cart.total.toLocaleString()}`;
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
    document.getElementById('prev-step-btn').style.display = currentCheckoutStep > 1 ? 'flex' : 'none';
    document.getElementById('next-step-btn').style.display = currentCheckoutStep < 3 ? 'flex' : 'none';
    document.getElementById('place-order-btn').style.display = currentCheckoutStep === 3 ? 'flex' : 'none';
}

// Validate shipping form
function validateShippingForm() {
    const form = document.getElementById('shipping-form');
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
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    const formData = new FormData(form);
    paymentData = Object.fromEntries(formData);
    
    // Basic card number validation (demo)
    const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        alert('Please enter a valid card number');
        return false;
    }
    
    return true;
}

// Render review step
function renderReview() {
    const cart = getCart();
    const container = document.getElementById('review-content');
    
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
    const cart = getCart();
    
    // Create order
    const order = {
        id: 'ORD-' + Date.now(),
        items: cart.items,
        shipping: shippingData,
        payment: {
            method: 'card',
            last4: paymentData.cardNumber.slice(-4)
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
