// Front Desk Dashboard Logic
class FrontDeskDashboard {
    constructor() {
        this.currentUser = null;
        this.currentDepartment = null;
        this.orders = JSON.parse(localStorage.getItem('hotelOrders')) || [];
        this.inventory = JSON.parse(localStorage.getItem('hotelInventory')) || this.getDefaultInventory();
        this.rooms = JSON.parse(localStorage.getItem('hotelRooms')) || this.getDefaultRooms();
        this.guests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
        this.notifications = JSON.parse(localStorage.getItem('hotelNotifications')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Navigation
        document.querySelectorAll('.dashboard-nav .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                this.showTab(tab);
            });
        });

        // Order filter
        document.getElementById('order-filter').addEventListener('change', () => {
            this.loadOrders();
        });

        document.getElementById('order-type-filter').addEventListener('change', () => {
            this.loadOrders();
        });

        // Notification button
        document.getElementById('notification-btn').addEventListener('click', () => {
            this.toggleNotificationPanel();
        });

        // Modals
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Add item form
        document.getElementById('add-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addInventoryItem();
        });
    }

    checkLoginStatus() {
        const savedUser = localStorage.getItem('currentUser');
        const savedDept = localStorage.getItem('currentDepartment');
        
        if (savedUser && savedDept) {
            this.currentUser = savedUser;
            this.currentDepartment = savedDept;
            this.showDashboard();
        }
    }

    handleLogin() {
        const department = document.getElementById('department').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Demo authentication - In real app, this would be API call
        const validLogins = {
            'frontdesk': { password: '123', department: 'front-desk' },
            'kitchen': { password: '123', department: 'kitchen' },
            'admin': { password: '123', department: 'management' }
        };

        if (validLogins[username] && validLogins[username].password === password) {
            this.currentUser = username;
            this.currentDepartment = validLogins[username].department;
            
            localStorage.setItem('currentUser', this.currentUser);
            localStorage.setItem('currentDepartment', this.currentDepartment);
            
            this.showDashboard();
            this.showNotification('Login successful!', 'success');
        } else {
            this.showNotification('Invalid credentials!', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.currentDepartment = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentDepartment');
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        this.updateUserInfo();
        this.loadOverview();
        this.loadNotifications();
        
        // Show/hide tabs based on department
        this.setupDepartmentAccess();
    }

    setupDepartmentAccess() {
        const reportsTab = document.getElementById('reports-tab');
        
        // Hide reports tab from kitchen staff
        if (this.currentDepartment === 'kitchen') {
            reportsTab.style.display = 'none';
        } else {
            reportsTab.style.display = 'flex';
        }
    }

    updateUserInfo() {
        document.getElementById('current-user').textContent = `Welcome, ${this.currentUser}`;
        document.getElementById('current-department').textContent = 
            this.currentDepartment.charAt(0).toUpperCase() + this.currentDepartment.slice(1);
    }

    showTab(tabName) {
        // Update navigation
        document.querySelectorAll('.dashboard-nav .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load tab-specific data
        switch(tabName) {
            case 'overview':
                this.loadOverview();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'inventory':
                this.loadInventory();
                break;
            case 'rooms':
                this.loadRooms();
                break;
            case 'guests':
                this.loadGuests();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    loadOverview() {
        this.updateStats();
        this.loadRecentOrders();
        this.loadRoomStatus();
        this.loadLowStockAlerts();
        this.loadServiceRequests();
    }

    updateStats() {
        const pendingOrders = this.orders.filter(order => 
            order.status === 'pending' && order.type === 'food'
        ).length;

        const occupiedRooms = this.rooms.filter(room => 
            room.status === 'occupied'
        ).length;

        const lowStockItems = this.inventory.filter(item => 
            item.currentStock < item.minStock
        ).length;

        const serviceRequests = this.orders.filter(order => 
            order.type === 'service' && order.status === 'pending'
        ).length;

        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('occupied-rooms').textContent = occupiedRooms;
        document.getElementById('low-stock-items').textContent = lowStockItems;
        document.getElementById('service-requests').textContent = serviceRequests;

        // Update badges
        document.getElementById('orders-badge').textContent = pendingOrders;
        document.getElementById('inventory-badge').textContent = lowStockItems;
    }

    loadRecentOrders() {
        const recentOrders = this.orders.slice(0, 5);
        const container = document.getElementById('recent-orders-list');

        if (recentOrders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No recent orders</p>';
            return;
        }

        container.innerHTML = recentOrders.map(order => `
            <div class="recent-order-item">
                <div class="order-header">
                    <strong>${order.id}</strong>
                    <span class="status status-${order.status}">${order.status}</span>
                </div>
                <div class="order-details">
                    ${order.type === 'food' ? 
                        `${order.items.length} items - $${order.total.toFixed(2)}` : 
                        order.name
                    }
                </div>
                <div class="order-time">
                    ${new Date(order.timestamp).toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    loadRoomStatus() {
        const container = document.getElementById('room-status-grid');
        container.innerHTML = this.rooms.map(room => `
            <div class="room-status-item room-${room.status}">
                ${room.number}
            </div>
        `).join('');
    }

    loadLowStockAlerts() {
        const lowStockItems = this.inventory.filter(item => item.currentStock < item.minStock);
        const container = document.getElementById('low-stock-list');

        if (lowStockItems.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No low stock items</p>';
            return;
        }

        container.innerHTML = lowStockItems.slice(0, 5).map(item => `
            <div class="low-stock-item">
                <strong>${item.name}</strong>
                <div class="stock-info">
                    ${item.currentStock} ${item.unit} remaining
                </div>
            </div>
        `).join('');
    }

    loadServiceRequests() {
        const serviceRequests = this.orders.filter(order => 
            order.type === 'service' && order.status === 'pending'
        );
        const container = document.getElementById('service-requests-list');

        if (serviceRequests.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No service requests</p>';
            return;
        }

        container.innerHTML = serviceRequests.slice(0, 5).map(order => `
            <div class="service-request-item">
                <strong>${order.name}</strong>
                <div class="request-time">
                    ${new Date(order.timestamp).toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    loadOrders() {
        const statusFilter = document.getElementById('order-filter').value;
        const typeFilter = document.getElementById('order-type-filter').value;
        
        let filteredOrders = this.orders;

        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }

        if (typeFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.type === typeFilter);
        }

        const container = document.getElementById('orders-management');
        
        if (filteredOrders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No orders found</p>';
            return;
        }

        container.innerHTML = filteredOrders.map(order => `
            <div class="order-management-card">
                <div class="order-info">
                    <div class="order-id">${order.id}</div>
                    <div class="order-items">
                        ${order.type === 'food' ? 
                            order.items.map(item => `${item.name} (${item.quantity}x)`).join(', ') :
                            order.name
                        }
                    </div>
                    <div class="order-meta">
                        Room ${order.roomId || 'N/A'} • 
                        ${new Date(order.timestamp).toLocaleString()} • 
                        ${order.type === 'food' ? `$${order.total.toFixed(2)}` : 'Service'}
                    </div>
                </div>
                <div class="order-actions">
                    ${this.getOrderActions(order)}
                </div>
            </div>
        `).join('');
    }

    getOrderActions(order) {
        if (order.type === 'food') {
            switch(order.status) {
                case 'pending':
                    return `<button class="btn-action btn-prepare" onclick="frontDesk.updateOrderStatus('${order.id}', 'preparing')">Prepare</button>`;
                case 'preparing':
                    return `<button class="btn-action btn-ready" onclick="frontDesk.updateOrderStatus('${order.id}', 'ready')">Ready</button>`;
                case 'ready':
                    return `<button class="btn-action btn-deliver" onclick="frontDesk.updateOrderStatus('${order.id}', 'delivered')">Deliver</button>`;
                default:
                    return `<button class="btn-action btn-details" onclick="frontDesk.showOrderDetails('${order.id}')">Details</button>`;
            }
        } else {
            if (order.status === 'pending') {
                return `<button class="btn-action btn-prepare" onclick="frontDesk.updateOrderStatus('${order.id}', 'processing')">Process</button>`;
            } else {
                return `<button class="btn-action btn-details" onclick="frontDesk.showOrderDetails('${order.id}')">Details</button>`;
            }
        }
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            localStorage.setItem('hotelOrders', JSON.stringify(this.orders));
            
            this.addNotification(
                'Order Updated',
                `Order ${orderId} status changed to ${newStatus}`,
                'info'
            );

            this.loadOrders();
            this.loadOverview();
            this.showNotification('Order status updated!', 'success');
        }
    }

    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            const modal = document.getElementById('order-modal');
            const content = document.getElementById('order-details');
            
            content.innerHTML = `
                <div class="order-detail-header">
                    <h4>${order.id}</h4>
                    <span class="status status-${order.status}">${order.status}</span>
                </div>
                <div class="order-detail-info">
                    <p><strong>Type:</strong> ${order.type}</p>
                    <p><strong>Room:</strong> ${order.roomId || 'N/A'}</p>
                    <p><strong>Time:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
                    ${order.type === 'food' ? `
                        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    ` : ''}
                </div>
                ${order.type === 'food' ? `
                    <div class="order-items-detail">
                        <h5>Items:</h5>
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <span>${item.name}</span>
                                <span>${item.quantity}x $${item.price}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="service-detail">
                        <h5>Service:</h5>
                        <p>${order.name}</p>
                    </div>
                `}
            `;
            
            modal.style.display = 'block';
        }
    }

    loadInventory() {
        const container = document.getElementById('inventory-grid');
        
        if (this.inventory.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No inventory items</p>';
            return;
        }

        container.innerHTML = this.inventory.map(item => {
            const stockPercentage = (item.currentStock / item.maxStock) * 100;
            let stockClass = '';
            if (stockPercentage < 10) stockClass = 'critical';
            else if (stockPercentage < 30) stockClass = 'low';

            return `
                <div class="inventory-card ${stockClass}">
                    <div class="inventory-header">
                        <div>
                            <div class="inventory-name">${item.name}</div>
                            <div class="inventory-category">${item.category}</div>
                        </div>
                        <div class="stock-level">
                            <div class="stock-amount">${item.currentStock}</div>
                            <div class="stock-unit">${item.unit}</div>
                        </div>
                    </div>
                    <div class="stock-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${stockClass}" style="width: ${stockPercentage}%"></div>
                        </div>
                    </div>
                    <div class="inventory-meta">
                        <div>Min: ${item.minStock} ${item.unit}</div>
                        <div>Max: ${item.maxStock} ${item.unit}</div>
                    </div>
                    <div class="inventory-actions">
                        <button class="btn-update" onclick="frontDesk.showUpdateStockModal('${item.id}')">
                            Update Stock
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    addInventoryItem() {
        const form = document.getElementById('add-item-form');
        const formData = new FormData(form);
        
        const newItem = {
            id: 'INV' + Date.now(),
            name: formData.get('item-name'),
            category: formData.get('item-category'),
            currentStock: parseInt(formData.get('current-stock')),
            minStock: parseInt(formData.get('min-stock')),
            maxStock: parseInt(formData.get('current-stock')) * 3, // Default max stock
            unit: formData.get('unit')
        };

        this.inventory.push(newItem);
        localStorage.setItem('hotelInventory', JSON.stringify(this.inventory));
        
        this.closeModal(document.getElementById('add-item-modal'));
        form.reset();
        this.loadInventory();
        this.showNotification('Inventory item added!', 'success');
    }

    loadRooms() {
        // Implementation for room management
    }

    loadGuests() {
        // Implementation for guest management
    }

    loadReports() {
        // Implementation for reports
    }

    loadNotifications() {
        const container = document.getElementById('notification-list');
        const countElement = document.getElementById('notification-count');
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        countElement.textContent = unreadCount;

        if (this.notifications.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No notifications</p>';
            return;
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 onclick="frontDesk.markNotificationRead('${notification.id}')">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${new Date(notification.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }

    addNotification(title, message, type = 'info') {
        const notification = {
            id: 'NOT' + Date.now(),
            title,
            message,
            type,
            read: false,
            timestamp: new Date().toISOString()
        };

        this.notifications.unshift(notification);
        localStorage.setItem('hotelNotifications', JSON.stringify(this.notifications));
        this.loadNotifications();
    }

    markNotificationRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem('hotelNotifications', JSON.stringify(this.notifications));
            this.loadNotifications();
        }
    }

    clearNotifications() {
        this.notifications = [];
        localStorage.setItem('hotelNotifications', JSON.stringify(this.notifications));
        this.loadNotifications();
        this.toggleNotificationPanel();
    }

    toggleNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        panel.classList.toggle('hidden');
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal(modal) {
        modal.style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Simple notification implementation
        alert(message);
    }

    getDefaultInventory() {
        return [
            {
                id: 'INV1',
                name: 'Ground Beef',
                category: 'food',
                currentStock: 25,
                minStock: 20,
                maxStock: 100,
                unit: 'kg'
            },
            {
                id: 'INV2',
                name: 'Lettuce',
                category: 'food',
                currentStock: 8,
                minStock: 10,
                maxStock: 50,
                unit: 'kg'
            },
            {
                id: 'INV3',
                name: 'Orange Juice',
                category: 'beverage',
                currentStock: 15,
                minStock: 20,
                maxStock: 100,
                unit: 'liters'
            }
        ];
    }

    getDefaultRooms() {
        return [
            { number: '101', status: 'occupied', type: 'standard' },
            { number: '102', status: 'vacant', type: 'standard' },
            { number: '103', status: 'cleaning', type: 'deluxe' },
            { number: '201', status: 'occupied', type: 'deluxe' },
            { number: '202', status: 'maintenance', type: 'standard' },
            { number: '203', status: 'vacant', type: 'suite' }
        ];
    }
}

// Global functions for HTML onclick attributes
function showTab(tabName) {
    frontDesk.showTab(tabName);
}

function logout() {
    frontDesk.logout();
}

function showAddItemModal() {
    frontDesk.showModal('add-item-modal');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    frontDesk.closeModal(modal);
}

function clearNotifications() {
    frontDesk.clearNotifications();
}

// Initialize the dashboard
let frontDesk;
document.addEventListener('DOMContentLoaded', () => {
    frontDesk = new FrontDeskDashboard();
});