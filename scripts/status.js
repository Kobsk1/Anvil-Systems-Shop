// Order Status Page
document.addEventListener('DOMContentLoaded', () => {
    const statusForm = document.getElementById('status-form');
    const orderStatusDiv = document.getElementById('order-status');
    
    // Check for order ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');
    if (orderId) {
        lookupOrder(orderId);
    }
    
    if (statusForm) {
        statusForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(statusForm);
            const orderId = formData.get('orderId');
            if (orderId) {
                lookupOrder(orderId);
            }
        });
    }
});

function lookupOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('anvil_orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    const orderStatusDiv = document.getElementById('order-status');
    if (!orderStatusDiv) return;
    
    if (!order) {
        orderStatusDiv.style.display = 'block';
        orderStatusDiv.innerHTML = `
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Order Not Found</h3>
                <p>No order found with ID: ${orderId}</p>
            </div>
        `;
        return;
    }
    
    const statusSteps = [
        { id: 'processing', label: 'Processing', icon: 'cog' },
        { id: 'building', label: 'Building', icon: 'hammer' },
        { id: 'testing', label: 'Testing', icon: 'flask' },
        { id: 'shipped', label: 'Shipped', icon: 'shipping-fast' },
        { id: 'delivered', label: 'Delivered', icon: 'check-circle' }
    ];
    
    const statusOrder = ['processing', 'building', 'testing', 'shipped', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.status) || 0;
    
    orderStatusDiv.style.display = 'block';
    orderStatusDiv.innerHTML = `
        <div class="order-details">
            <div class="order-header">
                <h2>Order ${order.id}</h2>
                <span class="order-date">Placed: ${new Date(order.date).toLocaleDateString()}</span>
            </div>
            
            <div class="order-timeline">
                ${statusSteps.map((step, index) => {
                    const isActive = index === currentStatusIndex;
                    const isCompleted = index < currentStatusIndex;
                    return `
                        <div class="timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                            <div class="timeline-icon">
                                <i class="fas fa-${step.icon}"></i>
                            </div>
                            <div class="timeline-label">${step.label}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="order-items">
                <h3>Order Items</h3>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${order.totals.subtotal.toLocaleString()}</span>
                </div>
                <div class="total-row">
                    <span>Tax:</span>
                    <span>$${order.totals.tax.toLocaleString()}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span>${order.totals.shipping > 0 ? `$${order.totals.shipping.toLocaleString()}` : 'FREE'}</span>
                </div>
                <div class="total-row total-final">
                    <span>Total:</span>
                    <span>$${order.totals.total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;
}
