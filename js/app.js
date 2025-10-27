// Main Application Logic
class HotelManagementSystem {
    constructor() {
        this.currentSection = 'dashboard';
        this.cart = JSON.parse(localStorage.getItem('hotelCart')) || [];
        this.orders = JSON.parse(localStorage.getItem('hotelOrders')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartCount();
        this.loadMenu();
        this.loadOrders();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.showSection(target);
            });
        });

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                this.filterMenu(category);
            });
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });

        // Service buttons
        document.querySelectorAll('.btn-service').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const service = e.currentTarget.getAttribute('data-service');
                this.requestService(service);
            });
        });
    }

    showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-target="${sectionId}"]`).classList.add('active');

        // Show section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        this.currentSection = sectionId;
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    hideModal(modal) {
        modal.style.display = 'none';
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-count').textContent = `${totalItems} items`;
    }

    addToCart(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            this.cart.push({...item});
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${item.name} added to cart!`);
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        this.showCart();
    }

    updateCartItemQuantity(itemId, change) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(itemId);
                return;
            }
            this.saveCart();
            this.updateCartCount();
            this.showCart();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.showCart();
        this.showNotification('Cart cleared!');
    }

    saveCart() {
        localStorage.setItem('hotelCart', JSON.stringify(this.cart));
    }

    placeOrder() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!');
            return;
        }

        const order = {
            id: 'ORD' + Date.now(),
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending',
            timestamp: new Date().toISOString(),
            type: 'food'
        };

        this.orders.unshift(order);
        localStorage.setItem('hotelOrders', JSON.stringify(this.orders));

        // Update order ID and delivery time in modal
        document.getElementById('order-id').textContent = order.id;
        document.getElementById('delivery-time').textContent = '25-35 minutes';

        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        
        this.hideModal(document.getElementById('cart-modal'));
        this.showModal(document.getElementById('order-modal'));
        
        this.loadOrders();
    }

    requestService(service) {
        const serviceNames = {
            housekeeping: 'Housekeeping Service',
            laundry: 'Laundry Service',
            transportation: 'Transportation Service',
            spa: 'Spa Booking'
        };

        const order = {
            id: 'SRV' + Date.now(),
            service: service,
            name: serviceNames[service],
            status: 'pending',
            timestamp: new Date().toISOString(),
            type: 'service'
        };

        this.orders.unshift(order);
        localStorage.setItem('hotelOrders', JSON.stringify(this.orders));
        
        this.showNotification(`${serviceNames[service]} requested!`);
        this.loadOrders();
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for HTML onclick attributes
function showSection(sectionId) {
    hotelSystem.showSection(sectionId);
}

function showOrders() {
    hotelSystem.showSection('orders');
}

function showCart() {
    hotelSystem.showModal(document.getElementById('cart-modal'));
    hotelSystem.showCart();
}

function clearCart() {
    hotelSystem.clearCart();
}

function placeOrder() {
    hotelSystem.placeOrder();
}

function closeOrderModal() {
    hotelSystem.hideModal(document.getElementById('order-modal'));
}

// Initialize the system when DOM is loaded
let hotelSystem;
document.addEventListener('DOMContentLoaded', () => {
    hotelSystem = new HotelManagementSystem();
});