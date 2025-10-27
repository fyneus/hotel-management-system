// Inventory Management
class InventoryManager {
    constructor(frontDesk) {
        this.frontDesk = frontDesk;
    }

    showUpdateStockModal(itemId) {
        const item = this.frontDesk.inventory.find(i => i.id === itemId);
        if (item) {
            // Create and show update stock modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Update Stock - ${item.name}</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="update-stock-form">
                            <div class="form-group">
                                <label for="stock-change">Stock Change</label>
                                <input type="number" id="stock-change" name="stock-change" 
                                       placeholder="Positive to add, negative to remove" required>
                            </div>
                            <div class="form-group">
                                <label for="reason">Reason</label>
                                <select id="reason" name="reason" required>
                                    <option value="">Select Reason</option>
                                    <option value="delivery">New Delivery</option>
                                    <option value="usage">Daily Usage</option>
                                    <option value="waste">Waste/Spoilage</option>
                                    <option value="adjustment">Stock Adjustment</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="notes">Notes</label>
                                <textarea id="notes" name="notes" rows="3" placeholder="Additional notes..."></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                                <button type="submit" class="btn-primary">Update Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.style.display = 'block';

            // Add event listeners
            modal.querySelector('.close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

            modal.querySelector('form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateStock(itemId, modal);
            });
        }
    }

    updateStock(itemId, modal) {
        const form = modal.querySelector('form');
        const formData = new FormData(form);
        const change = parseInt(formData.get('stock-change'));
        const reason = formData.get('reason');
        const notes = formData.get('notes');

        const item = this.frontDesk.inventory.find(i => i.id === itemId);
        if (item) {
            item.currentStock += change;
            
            if (item.currentStock < 0) item.currentStock = 0;
            if (item.currentStock > item.maxStock) item.currentStock = item.maxStock;

            localStorage.setItem('hotelInventory', JSON.stringify(this.frontDesk.inventory));
            
            // Add stock history record
            this.addStockHistory(itemId, change, reason, notes);
            
            modal.remove();
            this.frontDesk.loadInventory();
            this.frontDesk.showNotification('Stock updated successfully!', 'success');
        }
    }

    addStockHistory(itemId, change, reason, notes) {
        const history = JSON.parse(localStorage.getItem('stockHistory')) || [];
        history.unshift({
            itemId,
            change,
            reason,
            notes,
            timestamp: new Date().toISOString(),
            user: this.frontDesk.currentUser
        });
        localStorage.setItem('stockHistory', JSON.stringify(history));
    }

    generatePurchaseOrders() {
        const lowStockItems = this.frontDesk.inventory.filter(item => 
            item.currentStock < item.minStock
        );

        if (lowStockItems.length === 0) {
            this.frontDesk.showNotification('No purchase orders needed at this time.', 'info');
            return;
        }

        const poNumber = 'PO' + Date.now();
        const purchaseOrder = {
            id: poNumber,
            items: lowStockItems.map(item => ({
                itemId: item.id,
                name: item.name,
                currentStock: item.currentStock,
                minStock: item.minStock,
                orderQuantity: item.minStock * 2 - item.currentStock,
                unit: item.unit
            })),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        // Save purchase order
        const purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
        purchaseOrders.unshift(purchaseOrder);
        localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));

        this.frontDesk.showNotification(`Purchase order ${poNumber} generated with ${lowStockItems.length} items.`, 'success');
    }
}