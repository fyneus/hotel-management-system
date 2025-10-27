// Orders Management
class OrdersManager {
    constructor(hotelSystem) {
        this.hotelSystem = hotelSystem;
    }

    loadOrders() {
        const ordersList = document.getElementById('orders-list');
        
        if (this.hotelSystem.orders.length === 0) {
            ordersList.innerHTML = '<p style="text-align: center; color: #ccc; padding: 2rem;">No orders yet</p>';
            return;
        }

        ordersList.innerHTML = this.hotelSystem.orders.map(order => {
            if (order.type === 'food') {
                return this.renderFoodOrder(order);
            } else {
                return this.renderServiceOrder(order);
            }
        }).join('');
    }

    renderFoodOrder(order) {
        const itemsList = order.items.map(item => 
            `${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toFixed(2)}`
        ).join('<br>');

        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">${order.id}</div>
                    <div class="order-status status-${order.status}">${this.getStatusText(order.status)}</div>
                </div>
                <div class="order-items">
                    ${itemsList}
                </div>
                <div class="order-total">
                    Total: $${order.total.toFixed(2)}
                </div>
                <div class="order-time">
                    ${new Date(order.timestamp).toLocaleString()}
                </div>
            </div>
        `;
    }

    renderServiceOrder(order) {
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">${order.id}</div>
                    <div class="order-status status-${order.status}">${this.getStatusText(order.status)}</div>
                </div>
                <div class="order-items">
                    <strong>${order.name}</strong>
                </div>
                <div class="order-time">
                    ${new Date(order.timestamp).toLocaleString()}
                </div>
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pending',
            'preparing': 'Preparing',
            'delivered': 'Delivered'
        };
        return statusMap[status] || status;
    }
}

let ordersManager;
document.addEventListener('DOMContentLoaded', () => {
    ordersManager = new OrdersManager(hotelSystem);
    
    // Add loadOrders method to hotelSystem
    hotelSystem.loadOrders = () => ordersManager.loadOrders();
});