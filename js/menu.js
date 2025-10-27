// Menu Management
class MenuManager {
    constructor(hotelSystem) {
        this.hotelSystem = hotelSystem;
        this.menuItems = [];
        this.currentCategory = 'all';
        this.loadMenuData();
    }

    async loadMenuData() {
        // In a real app, this would be an API call
        this.menuItems = [
            {
                id: 1,
                name: "Classic Burger",
                description: "Juicy beef patty with fresh vegetables and special sauce",
                price: 16.99,
                category: "main-course",
                image: "burger.jpg",
                available: true
            },
            {
                id: 2,
                name: "Caesar Salad",
                description: "Fresh romaine lettuce with Caesar dressing and croutons",
                price: 12.99,
                category: "appetizers",
                image: "caesar-salad.jpg",
                available: true
            },
            {
                id: 3,
                name: "Chocolate Lava Cake",
                description: "Warm chocolate cake with molten center and vanilla ice cream",
                price: 8.99,
                category: "desserts",
                image: "lava-cake.jpg",
                available: true
            },
            {
                id: 4,
                name: "Fresh Orange Juice",
                description: "Freshly squeezed orange juice",
                price: 5.99,
                category: "beverages",
                image: "orange-juice.jpg",
                available: true
            },
            {
                id: 5,
                name: "Grilled Salmon",
                description: "Atlantic salmon with lemon butter sauce and vegetables",
                price: 24.99,
                category: "main-course",
                image: "salmon.jpg",
                available: true
            },
            {
                id: 6,
                name: "Mozzarella Sticks",
                description: "Breaded mozzarella cheese sticks with marinara sauce",
                price: 9.99,
                category: "appetizers",
                image: "mozzarella-sticks.jpg",
                available: true
            }
        ];
        
        this.renderMenu();
    }

    renderMenu() {
        const menuGrid = document.getElementById('menu-grid');
        const filteredItems = this.currentCategory === 'all' 
            ? this.menuItems 
            : this.menuItems.filter(item => item.category === this.currentCategory);

        menuGrid.innerHTML = filteredItems.map(item => `
            <div class="menu-item">
                <div class="menu-item-image">
                    <i class="fas fa-utensils fa-3x"></i>
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <div class="menu-item-name">${item.name}</div>
                        <div class="menu-item-price">$${item.price}</div>
                    </div>
                    <div class="menu-item-description">${item.description}</div>
                    <div class="menu-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="menuManager.decreaseQuantity(${item.id})">-</button>
                            <span class="quantity-display" id="quantity-${item.id}">1</span>
                            <button class="quantity-btn plus" onclick="menuManager.increaseQuantity(${item.id})">+</button>
                        </div>
                        <button class="btn-add-to-cart" onclick="menuManager.addToCart(${item.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterMenu(category) {
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        this.renderMenu();
    }

    increaseQuantity(itemId) {
        const quantityElement = document.getElementById(`quantity-${itemId}`);
        let quantity = parseInt(quantityElement.textContent);
        quantityElement.textContent = quantity + 1;
    }

    decreaseQuantity(itemId) {
        const quantityElement = document.getElementById(`quantity-${itemId}`);
        let quantity = parseInt(quantityElement.textContent);
        if (quantity > 1) {
            quantityElement.textContent = quantity - 1;
        }
    }

    addToCart(itemId) {
        const item = this.menuItems.find(menuItem => menuItem.id === itemId);
        const quantity = parseInt(document.getElementById(`quantity-${itemId}`).textContent);
        
        if (item) {
            this.hotelSystem.addToCart({
                ...item,
                quantity: quantity
            });
            
            // Reset quantity
            document.getElementById(`quantity-${itemId}`).textContent = '1';
        }
    }

    showCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (this.hotelSystem.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #ccc;">Your cart is empty</p>';
            cartTotal.textContent = '0.00';
            return;
        }

        cartItems.innerHTML = this.hotelSystem.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price} x ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="hotelSystem.updateCartItemQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="hotelSystem.updateCartItemQuantity(${item.id}, 1)">+</button>
                    <button class="quantity-btn" onclick="hotelSystem.removeFromCart(${item.id})" style="background: #f44336;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const total = this.hotelSystem.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }
}

let menuManager;
document.addEventListener('DOMContentLoaded', () => {
    menuManager = new MenuManager(hotelSystem);
    
    // Add showCart method to hotelSystem
    hotelSystem.showCart = () => menuManager.showCart();
});