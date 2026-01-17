/**
 * Flame & Feast POS - Store
 * Manages all application state and persistence.
 */

const STORAGE_KEY = 'pos_data_v1';

// Initial Seed Data (if empty)
const INITIAL_DATA = {
    users: [
        { id: 0, name: 'Master', pin: '8888' },
        { id: 1, name: 'Cajero Principal', pin: '1234' },
        { id: 2, name: 'Gerente', pin: '0000' }
    ],
    categories: [
        { id: 'burgers', name: 'Hamburguesas' },
        { id: 'sides', name: 'Acompañantes' },
        { id: 'drinks', name: 'Bebidas' }
    ],
    inventory: [
        { id: 'inv_1', name: 'Pan de Hamburguesa', unit: 'unidad', quantity: 100, alert: 20 },
        { id: 'inv_2', name: 'Carne de Res', unit: 'unidad', quantity: 100, alert: 20 },
        { id: 'inv_3', name: 'Queso Cheddar', unit: 'unidad', quantity: 100, alert: 20 },
        { id: 'inv_4', name: 'Papas Congeladas', unit: 'kg', quantity: 50.0, alert: 10.0 }, // kg
        { id: 'inv_5', name: 'Cebolla Morada', unit: 'kg', quantity: 10.0, alert: 2.0 }, // kg
        { id: 'inv_6', name: 'Salsa Especial', unit: 'L', quantity: 5.0, alert: 1.0 },   // Litros
        { id: 'inv_7', name: 'Refresco Cola', unit: 'unidad', quantity: 200, alert: 24 }
    ],
    inventory_movements: [], // Log of all adjustments
    products: [
        {
            id: 'p_1',
            name: 'Classic Burger',
            price: 150.00,
            category: 'burgers',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60',
            recipe: [
                { id: 'inv_1', qty: 1 },
                { id: 'inv_2', qty: 1 },
                { id: 'inv_3', qty: 1 },
                { id: 'inv_5', qty: 0.05 }, // 50g onion
                { id: 'inv_6', qty: 0.02 }  // 20ml sauce
            ]
        },
        {
            id: 'p_2',
            name: 'Papas Fritas',
            price: 80.00,
            category: 'sides',
            image: 'https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?auto=format&fit=crop&w=500&q=60',
            recipe: [
                { id: 'inv_4', qty: 0.25 } // 250g potatoes
            ]
        },
        {
            id: 'p_3',
            name: 'Coca Cola',
            price: 40.00,
            category: 'drinks',
            image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=60',
            recipe: [
                { id: 'inv_7', qty: 1 }
            ]
        }
    ],
    sales: [],
    lastTicketNumber: 0,
    lastTicketDate: null,
    settings: {
        storeName: 'Flame & Feast Fast Food',
        invoice: {
            header: 'FLAME & FEAST\nFast Food Premium\n----------------',
            footer: '¡Gracias por su compra!\nwww.flameandfeast.com'
        }
    }
};

class Store {
    constructor() {
        this.state = this.load();
        this.cart = [];
        this.currentUser = null;
        this.listeners = [];
    }

    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return JSON.parse(JSON.stringify(INITIAL_DATA));
    }

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        this.notify();
    }

    reset() {
        this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.save();
    }

    // --- User Logic ---
    login(pin) {
        const user = this.state.users.find(u => u.pin === pin);
        if (user) {
            this.currentUser = user;
            this.notify();
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        this.cart = [];
        this.notify();
    }

    // --- Cart Logic ---
    addToCart(product, notes = '') {
        // Check stock first
        const maxStock = this.calculateMaxStock(product);

        // Count how many of this product we already have in cart
        const inCartCount = this.cart.filter(item => item.product.id === product.id).length;

        if (inCartCount >= maxStock) {
            alert('¡No hay suficiente stock para agregar este producto!');
            return false;
        }

        this.cart.push({
            id: Date.now() + Math.random(),
            product: product,
            notes: notes
        });
        this.notify();
        return true;
    }

    removeFromCart(cartItemId) {
        this.cart = this.cart.filter(item => item.id !== cartItemId);
        this.notify();
    }

    clearCart() {
        this.cart = [];
        this.notify();
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + item.product.price, 0);
    }

    // --- Sales & Inventory Logic ---
    calculateMaxStock(product) {
        // Find minimum number of items we can make based on inventory
        let min = Infinity;
        if (!product.recipe || product.recipe.length === 0) return 9999;

        product.recipe.forEach(ing => {
            const inventoryItem = this.state.inventory.find(inv => inv.id === ing.id);
            if (!inventoryItem) return;

            const possible = Math.floor(inventoryItem.quantity / ing.qty);
            if (possible < min) min = possible;
        });
        return min;
    }

    getNextTicketNumber() {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = this.state.lastTicketDate;

        if (lastDate !== today) {
            this.state.lastTicketNumber = 1;
            this.state.lastTicketDate = today;
        } else {
            this.state.lastTicketNumber = (this.state.lastTicketNumber || 0) + 1;
        }

        return this.state.lastTicketNumber;
    }

    checkout() {
        if (this.cart.length === 0) return false;

        const ticketNumber = this.getNextTicketNumber();
        const sale = {
            id: Date.now(),
            ticketNumber: ticketNumber,
            date: new Date().toISOString(),
            employee: this.currentUser.name,
            total: this.getCartTotal(),
            items: [...this.cart], // Copy cart
            status: 'Abierta',
        };

        // Deduct inventory
        this.cart.forEach(item => {
            if (item.product.recipe) {
                item.product.recipe.forEach(ing => {
                    const inventoryItem = this.state.inventory.find(inv => inv.id === ing.id);
                    if (inventoryItem) {
                        inventoryItem.quantity = Number((inventoryItem.quantity - ing.qty).toFixed(3));
                    }
                });
            }
        });

        this.state.sales.push(sale);
        this.save(); // Persist changes
        this.clearCart();
        return sale; // Return sale object for printing/receipt
    }

    updateSaleStatus(saleId, newStatus) {
        const sale = this.state.sales.find(s => s.id === saleId);
        if (sale) {
            sale.status = newStatus;
            this.save();
            this.notify();
            return true;
        }
        return false;
    }

    // --- Inventory Management ---
    updateInventory(id, quantity) {
        // Deprecated in favor of adjustInventory for manual edits, but kept for internal logic if needed
        const item = this.state.inventory.find(i => i.id === id);
        if (item) {
            item.quantity = Number(quantity);
            this.save();
        }
    }

    adjustInventory(id, newQuantity, note, user) {
        const item = this.state.inventory.find(i => i.id === id);
        if (item) {
            const oldQuantity = item.quantity;
            const diff = newQuantity - oldQuantity;

            // Log movement
            if (!this.state.inventory_movements) this.state.inventory_movements = [];

            this.state.inventory_movements.push({
                id: Date.now(),
                itemId: id,
                itemName: item.name,
                oldQty: oldQuantity,
                newQty: newQuantity,
                diff: diff,
                note: note,
                user: user.name,
                date: new Date().toISOString()
            });

            // Update
            item.quantity = Number(newQuantity);
            this.save();
            return true;
        }
        return false;
    }

    // --- Product Management ---
    addProduct(product) {
        this.state.products.push(product);
        this.save();
    }

    updateProduct(product) {
        const index = this.state.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            this.state.products[index] = product;
            this.save();
        }
    }

    deleteProduct(id) {
        this.state.products = this.state.products.filter(p => p.id !== id);
        this.save();
    }

    // --- Category Management ---
    addCategory(name) {
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        // Prevent duplicates
        if (!this.state.categories.find(c => c.id === id)) {
            this.state.categories.push({ id, name });
            this.save();
            return true;
        }
        return false;
    }

    deleteCategory(id) {
        // Prevent deleting if products use it? strict vs loose. Loose for now.
        this.state.categories = this.state.categories.filter(c => c.id !== id);
        this.save();
    }

    // --- Settings Management ---
    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save();
    }

    // --- Master Logic ---
    updateUserPin(userId, newPin) {
        // Only Master (id: 0) can change pins
        if (this.currentUser.id !== 0) return false;

        const user = this.state.users.find(u => u.id === userId);
        if (user) {
            user.pin = newPin;
            this.save();
            return true;
        }
        return false;
    }

    // --- Reactivity ---
    subscribe(listener) {
        this.listeners.push(listener);
        // Initial call
        listener(this);
    }

    notify() {
        this.listeners.forEach(listener => listener(this));
    }
}

// Global expose for non-module environment
window.store = new Store();
