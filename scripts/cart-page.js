// Cart Page
function renderCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    
    if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = '';
        cartEmpty.style.display = 'block';
        document.getElementById('checkout-btn').style.display = 'none';
        updateSummary(cart);
        return;
    }
    
    cartEmpty.style.display = 'none';
    document.getElementById('checkout-btn').style.display = 'block';
    
    cartItemsContainer.innerHTML = cart.items.map((item, index) => {
        const imagePath = item.image || (item.type === 'system' ? `assets/Horizon_Hero_1250x.webp` : null);
        const imageHtml = imagePath 
            ? `<img src="${imagePath}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'placeholder-content\\' style=\\'padding: 1rem; text-align: center;\\'><i class=\\'fas fa-${item.type === 'system' ? 'desktop' : 'microchip'}\\' style=\\'font-size: 2rem; color: #ff4500; opacity: 0.3;\\'></i></div>';">`
            : `<div class="placeholder-content" style="padding: 1rem; text-align: center;"><i class="fas fa-${item.type === 'system' ? 'desktop' : 'microchip'}" style="font-size: 2rem; color: #ff4500; opacity: 0.3;"></i></div>`;
        
        return `
        <div class="cart-item">
            <div class="cart-item-image">
                ${imageHtml}
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-type">${item.type === 'system' ? 'Pre-built System' : 'Component'}</p>
                ${item.specs && Object.keys(item.specs).length > 0 ? `
                    <div class="cart-item-specs">
                        ${Object.entries(item.specs).slice(0, 3).map(([key, value]) => {
                            if (typeof value === 'object' && value.name) {
                                return `<span>${value.name}</span>`;
                            }
                            return '';
                        }).filter(s => s).join(' • ')}
                    </div>
                ` : ''}
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateItemQuantity(${index}, -1)">-</button>
                <input type="number" value="${item.quantity}" min="1" max="10" 
                       onchange="updateItemQuantity(${index}, 0, this.value)">
                <button class="quantity-btn" onclick="updateItemQuantity(${index}, 1)">+</button>
            </div>
            <div class="cart-item-price">
                <span class="item-total">$${(item.price * item.quantity).toLocaleString()}</span>
                <span class="item-unit">$${item.price.toLocaleString()} each</span>
            </div>
            <button class="cart-item-remove" onclick="removeCartItem(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        `;
    }).join('');
    
    updateSummary(cart);
}

function updateItemQuantity(index, change, value) {
    const cart = getCart();
    if (cart.items[index]) {
        if (value !== undefined) {
            cart.items[index].quantity = Math.max(1, Math.min(10, parseInt(value) || 1));
        } else {
            cart.items[index].quantity = Math.max(1, Math.min(10, cart.items[index].quantity + change));
        }
        saveCart(cart);
        renderCart();
        updateCartBadge();
    }
}

function removeCartItem(index) {
    const cart = getCart();
    cart.items.splice(index, 1);
    saveCart(cart);
    renderCart();
    updateCartBadge();
}

function updateSummary(cart) {
    document.getElementById('cart-subtotal').textContent = `$${cart.subtotal.toLocaleString()}`;
    document.getElementById('cart-tax').textContent = `$${cart.tax.toLocaleString()}`;
    document.getElementById('cart-shipping').textContent = cart.shipping > 0 ? `$${cart.shipping.toLocaleString()}` : 'FREE';
    document.getElementById('cart-total').textContent = `$${cart.total.toLocaleString()}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateCartBadge();
});
