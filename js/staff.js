// Staff Management and Department-specific Logic
class StaffManager {
    constructor(frontDesk) {
        this.frontDesk = frontDesk;
    }

    getDepartmentPermissions(department) {
        const permissions = {
            'front-desk': {
                canViewOrders: true,
                canUpdateOrders: true,
                canViewInventory: true,
                canUpdateInventory: true,
                canManageRooms: true,
                canManageGuests: true,
                canViewReports: true
            },
            'kitchen': {
                canViewOrders: true,
                canUpdateOrders: true,
                canViewInventory: true,
                canUpdateInventory: false,
                canManageRooms: false,
                canManageGuests: false,
                canViewReports: false
            },
            'housekeeping': {
                canViewOrders: false,
                canUpdateOrders: false,
                canViewInventory: true,
                canUpdateInventory: false,
                canManageRooms: true,
                canManageGuests: false,
                canViewReports: false
            },
            'management': {
                canViewOrders: true,
                canUpdateOrders: true,
                canViewInventory: true,
                canUpdateInventory: true,
                canManageRooms: true,
                canManageGuests: true,
                canViewReports: true
            },
            'inventory': {
                canViewOrders: false,
                canUpdateOrders: false,
                canViewInventory: true,
                canUpdateInventory: true,
                canManageRooms: false,
                canManageGuests: false,
                canViewReports: true
            }
        };

        return permissions[department] || permissions['front-desk'];
    }

    setupUIForDepartment() {
        const permissions = this.getDepartmentPermissions(this.frontDesk.currentDepartment);
        
        // Show/hide UI elements based on permissions
        this.toggleElement('orders-tab', permissions.canViewOrders);
        this.toggleElement('inventory-tab', permissions.canViewInventory);
        this.toggleElement('rooms-tab', permissions.canManageRooms);
        this.toggleElement('guests-tab', permissions.canManageGuests);
        this.toggleElement('reports-tab', permissions.canViewReports);
    }

    toggleElement(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'flex' : 'none';
        }
    }
}