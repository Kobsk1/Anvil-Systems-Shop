// Shopping Cart System - LocalStorage-based
// Cart data structure:
// {
//   items: [
//     {
//       id: "valkyrie-base",
//       type: "system", // or "component"
//       name: "Ember Inferno",
//       specs: {...},
//       price: 2199,
//       quantity: 1,
//       customizations: {...}
//     }
//   ],
//   subtotal: 2199,
//   tax: 0,
//   shipping: 0,
//   total: 2199
// }

const CART_STORAGE_KEY = 'anvil_cart';
const TAX_RATE = 0.08; // 8% tax
const SHIPPING_THRESHOLD = 2000; // Free shipping over $2000
const SHIPPING_COST = 50; // Standard shipping cost

// Get cart from LocalStorage
function getCart() {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (cartData) {
        return JSON.parse(cartData);
    }
    return {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
    };
}

// Save cart to LocalStorage
function saveCart(cart) {
    calculateCartTotals(cart);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
    return cart;
}

// Calculate cart totals
function calculateCartTotals(cart) {
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.tax = cart.subtotal * TAX_RATE;
    cart.shipping = cart.subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    cart.total = cart.subtotal + cart.tax + cart.shipping;
    return cart;
}

// Add item to cart
function addToCart(item) {
    const cart = getCart();
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
        cartItem => cartItem.id === item.id && 
        JSON.stringify(cartItem.customizations || {}) === JSON.stringify(item.customizations || {})
    );
    
    if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += item.quantity || 1;
    } else {
        // Add new item
        cart.items.push({
            id: item.id,
            type: item.type || 'component',
            name: item.name,
            specs: item.specs || {},
            price: item.price,
            quantity: item.quantity || 1,
            customizations: item.customizations || {},
            image: item.image || null
        });
    }
    
    saveCart(cart);
    return cart;
}

// Remove item from cart
function removeFromCart(itemId, customizations = {}) {
    const cart = getCart();
    cart.items = cart.items.filter(
        item => !(item.id === itemId && 
        JSON.stringify(item.customizations || {}) === JSON.stringify(customizations))
    );
    saveCart(cart);
    return cart;
}

// Update item quantity in cart
function updateQuantity(itemId, quantity, customizations = {}) {
    const cart = getCart();
    const item = cart.items.find(
        item => item.id === itemId && 
        JSON.stringify(item.customizations || {}) === JSON.stringify(customizations)
    );
    
    if (item) {
        if (quantity <= 0) {
            return removeFromCart(itemId, customizations);
        }
        item.quantity = quantity;
        saveCart(cart);
    }
    return cart;
}

// Clear entire cart
function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartBadge();
    return getCart();
}

// Get cart item count
function getCartCount() {
    const cart = getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

// Update cart badge in navigation
function updateCartBadge() {
    const count = getCartCount();
    const cartLink = document.querySelector('.cart-link');
    
    if (!cartLink) return;
    
    let badge = cartLink.querySelector('.cart-badge');
    
    if (count > 0) {
        if (!badge) {
            // Create badge if it doesn't exist
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            cartLink.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = 'flex';
    } else {
        // Hide badge if count is 0
        if (badge) {
            badge.style.display = 'none';
        }
    }
}

// Save item for later (move to saved items)
function saveForLater(itemId, customizations = {}) {
    const cart = getCart();
    const itemIndex = cart.items.findIndex(
        item => item.id === itemId && 
        JSON.stringify(item.customizations || {}) === JSON.stringify(customizations)
    );
    
    if (itemIndex !== -1) {
        const item = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);
        saveCart(cart);
        
        // Save to saved items
        const savedItems = JSON.parse(localStorage.getItem('anvil_saved_items') || '[]');
        savedItems.push(item);
        localStorage.setItem('anvil_saved_items', JSON.stringify(savedItems));
        
        return item;
    }
    return null;
}

// Get saved items
function getSavedItems() {
    return JSON.parse(localStorage.getItem('anvil_saved_items') || '[]');
}

// Move saved item back to cart
function moveToCart(savedItem) {
    addToCart(savedItem);
    
    // Remove from saved items
    const savedItems = getSavedItems();
    const filtered = savedItems.filter(
        item => !(item.id === savedItem.id && 
        JSON.stringify(item.customizations || {}) === JSON.stringify(savedItem.customizations || {}))
    );
    localStorage.setItem('anvil_saved_items', JSON.stringify(filtered));
}

// Initialize cart badge on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCartBadge);
} else {
    updateCartBadge();
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCart,
        saveCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        updateCartBadge,
        saveForLater,
        getSavedItems,
        moveToCart
    };
}
