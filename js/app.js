/**
 * Flame & Feast POS - App Controller
 * Orchestrates the Store, Views, and DOM updates.
 */
// Imports removed for global script usage
// Imports removed for global script usage
const store = window.store;
const views = window.views;

// DOM Elements
const appDiv = document.getElementById('app');

// State
let activeView = 'pos'; // 'pos' | 'admin' 
window.posApp.adminTab = 'dashboard';
window.posApp.currentPinInput = '';

// --- Initialization ---
function init() {
    // Setup Global Scope for HTML onclick handlers
    window.posApp = {
        login: (pin) => store.login(pin),
        logout: () => store.logout(),
        addToCart: (product) => store.addToCart(product),
        removeFromCart: (id) => store.removeFromCart(id),
        clearCart: () => store.clearCart(),
        checkout: handleCheckout,
        openProductModal: openProductModal,
        closeModal: closeProductModal,
        addToCartFromModal: addToCartFromModal,
        setView: setView,
        setAdminTab: setAdminTab, // New
        addStock: handleAddStock,
        openAdjustmentModal: openAdjustmentModal,
        handleAdjustment: handleAdjustment,
        // PIN Logic
        requestPin: requestPin,
        enterPinDigit: enterPinDigit,
        backspacePin: backspacePin,
        // Product Management
        openProductEditor: openProductEditor,
        handleImageUpload: handleImageUpload,
        saveProduct: saveProduct,
        deleteProduct: handleDeleteProduct,

        // Settings & Categories
        saveSettings: saveSettings,
        addCategory: handleAddCategory,
        deleteCategory: handleDeleteCategory,
        filterCategory: filterCategory,

        // Recipe
        addIngredientRow: addIngredientRow,

        // Master User Actions
        changeUserPin: changeUserPin,

        // State
        adminTab: 'dashboard',
        activeCategory: 'all',
        currentPinInput: ''
    };

    // Sub to store changes
    store.subscribe((currentStore) => {
        render(currentStore);
    });
}

// --- Rendering Loop ---
function render(s) {
    // Re-init icons after any DOM change (debounced slightly)
    requestAnimationFrame(() => {
        if (window.lucide) window.lucide.createIcons();
    });

    // 1. Check Login
    if (!s.currentUser) {
        appDiv.innerHTML = views.renderLogin();
        // bindLoginEvents(); // Moved to inline onclicks in view
        return;
    }

    // 2. Main Layout
    appDiv.innerHTML = `
        <div class="flex h-full w-full bg-gray-950 text-white">
             <!-- Navigation Sidebar -->
             <aside class="w-20 flex flex-col items-center py-6 bg-gray-900 border-r border-gray-800 z-30 shadow-xl">
                <div class="mb-8 p-2 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-lg shadow-orange-900/50">
                    <i data-lucide="flame" class="w-8 h-8 text-white"></i>
                </div>
                
                <nav class="flex-1 flex flex-col gap-6 w-full items-center">
                    <button onclick="window.posApp.setView('pos')" 
                        class="p-3 rounded-2xl transition-all duration-300 group ${activeView === 'pos' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40 translate-x-1' : 'hover:bg-gray-800 text-gray-500 hover:text-gray-300'}">
                        <i data-lucide="layout-grid" class="w-6 h-6"></i>
                    </button>
                    <button onclick="window.posApp.setView('admin')" 
                        class="p-3 rounded-2xl transition-all duration-300 group ${activeView === 'admin' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40 translate-x-1' : 'hover:bg-gray-800 text-gray-500 hover:text-gray-300'}">
                        <i data-lucide="package" class="w-6 h-6"></i>
                    </button>
                </nav>

                <div class="flex flex-col gap-4 items-center mb-4">
                     <div class="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-300 cursor-help" title="${s.currentUser.name}">
                        ${s.currentUser.name.charAt(0)}
                     </div>
                    <button onclick="window.posApp.logout()" class="p-3 rounded-2xl hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition-colors">
                        <i data-lucide="log-out" class="w-6 h-6"></i>
                    </button>
                </div>
             </aside>

             <!-- Main Content Area -->
             <main id="main-content" class="flex-1 flex overflow-hidden relative bg-black/20">
                ${activeView === 'pos' ? views.renderPOS() : views.renderAdmin()}
             </main>
        </div>
        
        <!-- Modal Container (Empty by default) -->
        <div id="modal-container"></div>

        <!-- Print Area (Hidden) -->
        <div id="receipt-print-area" class="hidden"></div>
    `;
}

// --- Event Handlers & Logic ---

function bindLoginEvents() {
    // Moved to inline onclicks in view
}

function setView(viewName) {
    activeView = viewName;
    store.notify(); // Re-render
}

function setAdminTab(tab) {
    window.posApp.adminTab = tab;
    store.notify();
}

// PIN Logic
function requestPin(correctPin, userName) {
    window.posApp.currentPinInput = '';
    const modal = views.renderPinModal(correctPin, userName);
    document.getElementById('modal-container').innerHTML = modal;
    requestAnimationFrame(() => window.lucide.createIcons());
}

function enterPinDigit(digit, correctPin) {
    window.posApp.currentPinInput += digit;
    updatePinDots();

    // Auto check if length matches 4
    if (window.posApp.currentPinInput.length === 4) {
        setTimeout(() => {
            if (window.posApp.currentPinInput === correctPin) {
                store.login(correctPin);
                document.getElementById('modal-container').innerHTML = ''; // Close modal
            } else {
                alert('PIN Incorrecto');
                window.posApp.currentPinInput = '';
                updatePinDots();
            }
        }, 300);
    }
}

function backspacePin() {
    window.posApp.currentPinInput = window.posApp.currentPinInput.slice(0, -1);
    updatePinDots();
}

function updatePinDots() {
    const len = window.posApp.currentPinInput.length;
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(`pin-dot-${i}`);
        if (dot) dot.classList.toggle('bg-orange-500', i <= len);
        if (dot) dot.classList.toggle('bg-gray-700', i > len);
    }
}

// Product Manager Logic
function openProductEditor(productId = null) {
    const product = productId ? store.state.products.find(p => p.id === productId) : null;
    const modal = views.renderProductEditorModal(product);
    document.getElementById('modal-container').innerHTML = modal;
    requestAnimationFrame(() => window.lucide.createIcons());
}

function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('img-url-input').value = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveProduct(event, id) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const recipe = [];
    const recipeIds = formData.getAll('recipe_id[]');
    recipeIds.forEach(rId => {
        const qty = formData.get(`recipe_qty_${rId}`);
        if (qty) {
            recipe.push({ id: rId, qty: parseFloat(qty) });
        }
    });

    const product = {
        id: id && id !== 'undefined' ? id : 'p_' + Date.now(),
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        image: formData.get('image') || 'https://via.placeholder.com/150',
        recipe: recipe
    };

    if (id && id !== 'undefined') {
        store.updateProduct(product);
    } else {
        store.addProduct(product);
    }

    document.getElementById('editor-modal').remove();
    // alert('Producto guardado'); // Removed alert for smoother flow
}

function handleDeleteProduct(id) {
    if (confirm('¿Está seguro de eliminar este producto?\nEsta acción no se puede deshacer.')) {
        store.deleteProduct(id);
        const modal = document.getElementById('editor-modal');
        if (modal) modal.remove();
        store.notify(); // Explicitly notify to refresh the view immediately
    }
}

function addIngredientRow() {
    const select = document.getElementById('new-ing-select');
    const ingId = select.value;

    if (!ingId) {
        alert('Por favor selecciona un ingrediente primero.');
        return;
    }

    // split name (unit)
    const ingText = select.options[select.selectedIndex].text;

    // Check duplication in UI to avoid confusion
    const existing = document.querySelector(`input[name="recipe_id[]"][value="${ingId}"]`);
    if (existing) {
        alert('Este ingrediente ya está en la lista');
        return;
    }

    const div = document.createElement('div');
    div.className = 'flex gap-2 items-center bg-gray-800/50 p-2 rounded-lg border border-gray-700/50 animate-in fade-in slide-in-from-bottom-2';
    div.innerHTML = `
        <div class="flex-1 min-w-0">
             <span class="text-gray-300 text-sm font-medium block truncate">${ingText}</span>
        </div>
        <input type="number" step="0.001" name="recipe_qty_${ingId}" value="1" class="w-20 bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-sm focus:border-orange-500 outline-none text-right">
        <span class="text-gray-500 text-xs w-8"></span>
        <input type="hidden" name="recipe_id[]" value="${ingId}">
        <button type="button" onclick="this.closest('.flex').remove()" class="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Quitar Ingrediente"><i data-lucide="trash" class="w-4 h-4"></i></button>
    `;
    document.getElementById('recipe-list').appendChild(div);
    requestAnimationFrame(() => window.lucide.createIcons());

    // Reset select
    select.value = "";
}

// --- Settings & Categories Logic ---
function saveSettings(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    store.updateSettings({
        invoice: {
            header: formData.get('header'),
            footer: formData.get('footer')
        }
    });
    alert('Configuración guardada');
}

function handleAddCategory() {
    const name = document.getElementById('new-category-input').value;
    if (name && name.trim() !== '') {
        if (store.addCategory(name.trim())) {
            document.getElementById('new-category-input').value = '';
        } else {
            alert('Categoría ya existe');
        }
    }
}

function handleDeleteCategory(id) {
    if (confirm('¿Seguro que desea eliminar esta categoría?')) {
        store.deleteCategory(id);
    }
}

function filterCategory(catId) {
    window.posApp.activeCategory = catId;
    store.notify();
}

// Modal Logic
function openProductModal(productId) {
    const modalHtml = views.renderProductModal(productId);
    document.getElementById('modal-container').innerHTML = modalHtml;
    requestAnimationFrame(() => window.lucide.createIcons());
}

function closeProductModal() {
    document.getElementById('modal-container').innerHTML = '';
}

function addToCartFromModal(productId) {
    const notes = document.getElementById('modal-notes').value;
    const product = store.state.products.find(p => p.id === productId);

    if (store.addToCart(product, notes)) {
        closeProductModal();
    }
}

function handleAddStock(ingId) {
    // Deprecated - Replaced by Adjustment Modal
    const qty = prompt("Ingrese cantidad a agregar (número):", "10");
    if (qty && !isNaN(qty)) {
        const current = store.state.inventory.find(i => i.id === ingId);
        if (current) {
            const newTotal = current.quantity + parseFloat(qty);
            store.updateInventory(ingId, newTotal);
        }
    }
}

function openAdjustmentModal(itemId) {
    const modalHtml = views.renderAdjustmentModal(itemId);
    document.getElementById('modal-container').innerHTML = modalHtml;
    requestAnimationFrame(() => window.lucide.createIcons());
}

function handleAdjustment(event, itemId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newQuantity = parseFloat(formData.get('quantity'));
    const note = formData.get('note');

    if (store.adjustInventory(itemId, newQuantity, note, store.currentUser)) {
        document.getElementById('adjustment-modal').remove();
        // store.notify(); // Store already notifies on save
    }
}

// Master User PIN Logic
function changeUserPin(userId, userName) {
    const newPin = prompt(`Ingrese el nuevo PIN para ${userName}:`);
    if (newPin) {
        if (newPin.length !== 4 || isNaN(newPin)) {
            alert('El PIN debe ser de 4 dígitos numéricos.');
            return;
        }
        if (store.updateUserPin(userId, newPin)) {
            alert(`PIN de ${userName} actualizado correctamente.`);
        } else {
            alert('Error al actualizar el PIN. Permiso denegado.');
        }
    }
}

// Printing Logic
function handleCheckout() {
    if (store.cart.length === 0) return;

    if (confirm('¿Confirmar venta e imprimir ticket?')) {
        const sale = store.checkout();
        if (sale) {
            printTicket(sale);
        }
    }
}

function printTicket(sale) {
    const printArea = document.getElementById('receipt-print-area');
    const date = new Date(sale.date).toLocaleString('es-ES');

    // Explicitly unhide for a moment (redundant with CSS fix but safe)
    printArea.classList.remove('hidden');
    printArea.style.display = 'block';

    printArea.innerHTML = `
        <div style="width: 58mm; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.2;">
            <div style="text-align: center; margin-bottom: 10px; white-space: pre-wrap;">
                <h2 style="margin: 0; font-size: 16px; font-weight: bold;">${store.state.settings.storeName}</h2>
                <div style="margin: 2px 0;">${store.state.settings.invoice?.header || 'Fast Food'}</div>
            </div>
            
            <div style="margin-bottom: 5px; text-align: center; border-top: 1px dashed black; border-bottom: 1px dashed black; padding: 5px 0;">
                <span style="font-size: 20px; font-weight: bold;">TICKET #${sale.ticketNumber || '0'}</span>
            </div>

            <div style="margin-bottom: 5px;">
                ORDER ID: #${sale.id.toString().slice(-4)}<br>
                FECHA: ${date}<br>
                CAJERO: ${sale.employee}
            </div>
            
            <div style="margin-bottom: 10px; border-bottom: 1px dashed black; padding-bottom: 5px;">
                ${sale.items.map(item => `
                    <div style="display: flex; justify-content: space-between;">
                        <span>${item.product.name}</span>
                        <span>$${item.product.price.toFixed(2)}</span>
                    </div>
                    ${item.notes ? `<div style="font-size: 10px; font-style: italic; margin-left: 10px;">(${item.notes})</div>` : ''}
                `).join('')}
            </div>
            
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px;">
                <span>TOTAL:</span>
                <span>$${sale.total.toFixed(2)}</span>
            </div>
            
            <div style="text-align: center; margin-top: 20px; white-space: pre-wrap;">
                ${store.state.settings.invoice?.footer || '¡Gracias por su compra!'}
            </div>
        </div>
    `;

    // Trigger Print
    setTimeout(() => {
        window.print();
        // Allow time for print dialog to open before potentially hiding again
        // In this case, we rely on CSS @media print to do the heavy lifting of hiding everything else
        // We can leave this div "visible" in the DOM because its location/z-index might cover screens if not careful.
        // But since it's position absolute 0,0, let's hide it again after a delay.
        // Actually, better to leave it controlled by CSS.
    }, 500);
}

// Start
init();
