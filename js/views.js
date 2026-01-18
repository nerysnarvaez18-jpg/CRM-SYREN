/**
 * Flame & Feast POS - Views
 * Handles HTML string generation for different application states.
 */
// import { store } from './store.js'; // Removed for global scope access
const store = window.store;

window.views = {
    renderLogin() {
        // Access global store
        const store = window.store;
        return `
            <div class="flex flex-col items-center justify-center w-full h-full bg-gray-950 pattern-grid">
                <div class="glass-panel p-8 rounded-2xl flex flex-col items-center w-96 max-w-full m-4">
                    <div class="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-900/50">
                        <i data-lucide="flame" class="w-8 h-8 text-white"></i>
                    </div>
                    <h1 class="text-3xl font-bold mb-2">Flame & Feast</h1>
                    <p class="text-gray-400 mb-8">Sistema de Punto de Venta</p>
                    
                    <div class="w-full space-y-4">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Seleccionar Usuario</h3>
                        <div class="grid gap-3">
                            ${store.state.users.map(u => `
                                <button onclick="window.posApp.requestPin('${u.pin}', '${u.name}')" 
                                    class="user-btn bg-gray-800 hover:bg-gray-700 p-4 rounded-xl flex items-center gap-4 transition-all w-full text-left group">
                                    <div class="w-10 h-10 rounded-full bg-gray-700 group-hover:bg-orange-600 text-white flex items-center justify-center font-bold transition-colors">
                                        ${u.name.charAt(0)}
                                    </div>
                                    <span class="font-medium text-lg">${u.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderPOS() {
        const products = store.state.products;
        const cart = store.cart;

        return `
            <!-- Cart Panel (Fixed Width) -->
            <section class="min-w-[350px] w-1/3 max-w-[450px] h-full p-4 flex flex-col z-10">
                <div class="glass-panel rounded-3xl h-full flex flex-col p-5 relative overflow-hidden">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-500">
                                <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                             </div>
                             <div>
                                <h2 class="text-lg font-bold leading-none">Orden Actual</h2>
                                <span class="text-xs text-gray-400">Ticket #${(store.state.lastTicketNumber || 0) + 1}</span>
                             </div>
                        </div>
                        <button onclick="window.posApp.clearCart()" class="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-500 text-gray-400 transition-colors" title="Limpiar Carrito">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <!-- Cart Items -->
                    <div class="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                        ${cart.length === 0 ? `
                            <div class="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 space-y-4">
                                <i data-lucide="shopping-bag" class="w-20 h-20 stroke-1"></i>
                                <p class="text-sm">Selecciona productos del menú</p>
                            </div>
                        ` : cart.map(item => `
                            <div class="relative flex items-start gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60 transition-colors group animate-fade-in-right">
                                <img src="${item.product.image}" class="w-16 h-16 rounded-lg object-cover bg-gray-800" />
                                <div class="flex-1 min-w-0 py-1">
                                    <div class="flex justify-between items-start">
                                        <h4 class="font-bold text-gray-200 truncate pr-2">${item.product.name}</h4>
                                        <span class="font-bold text-orange-400">$${item.product.price}</span>
                                    </div>
                                    ${item.notes ? `
                                        <div class="mt-1 flex items-start gap-1">
                                            <i data-lucide="file-edit" class="w-3 h-3 text-gray-500 mt-0.5"></i>
                                            <p class="text-xs text-gray-400 italic leading-snug">"${item.notes}"</p>
                                        </div>
                                    ` : ''}
                                    <div class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onclick="window.posApp.removeFromCart(${item.id})" class="bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform">
                                            <i data-lucide="x" class="w-3 h-3"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Footer Total -->
                    <div class="mt-4 pt-4 border-t border-white/5 bg-gray-900/30 -mx-5 px-5 pb-0">
                       <div class="flex justify-between items-end mb-4">
                            <span class="text-gray-400 text-sm font-medium uppercase tracking-wider">Total a Pagar</span>
                            <span class="text-4xl font-bold text-white tracking-tight">$${store.getCartTotal().toFixed(2)}</span>
                       </div>
                       
                       <button onclick="window.posApp.checkout()" 
                            class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-lg shadow-lg shadow-orange-900/50 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            ${cart.length === 0 ? 'disabled' : ''}>
                            <i data-lucide="credit-card" class="w-5 h-5"></i>
                            <span>COBRAR E IMPRIMIR</span>
                       </button>
                    </div>
                </div>
            </section>

            <!-- Product Grid -->
            <section class="flex-1 h-full p-4 pl-0 overflow-y-auto custom-scrollbar">
                <!-- Categories Header -->
                <div class="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-sm pb-4 pt-2 mb-4 border-b border-gray-800 flex items-center justify-between">
                    <div>
                         <h2 class="text-2xl font-bold text-white">Menú Principal</h2>
                         <p class="text-gray-400 text-sm">Mostrando todos los productos</p>
                    </div>
                    <div class="flex gap-2">
                        <!-- Filters could go here -->
                        <div class="bg-gray-800 rounded-lg p-1 flex flex-wrap gap-1">
                            <button onclick="window.posApp.filterCategory('all')" class="px-4 py-1.5 rounded-md ${!window.posApp.activeCategory || window.posApp.activeCategory === 'all' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700'} text-sm font-medium transition-all">Todos</button>
                            ${store.state.categories.map(c => `
                                <button onclick="window.posApp.filterCategory('${c.id}')" class="px-4 py-1.5 rounded-md ${window.posApp.activeCategory === c.id ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700'} text-sm font-medium transition-all">${c.name}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Grid -->
                <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    ${products.filter(p => !window.posApp.activeCategory || window.posApp.activeCategory === 'all' || p.category === window.posApp.activeCategory).map(p => {
            const maxStock = store.calculateMaxStock(p);
            const isOutOfStock = maxStock <= 0;
            const isLowStock = maxStock < 5 && maxStock > 0;

            return `
                        <div onclick="${!isOutOfStock ? `window.posApp.openProductModal('${p.id}')` : ''}" 
                             class="card bg-gray-900/60 border border-gray-800 hover:border-orange-500/50 rounded-2xl p-3 flex flex-col gap-3 transition-all group relative overflow-hidden cursor-pointer ${isOutOfStock ? 'opacity-50 grayscale pointer-events-none' : ''}">
                            
                            <div class="aspect-[4/3] rounded-xl overflow-hidden relative shadow-inner">
                                <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                                ${isOutOfStock ? `
                                    <div class="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                                        <span class="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">AGOTADO</span>
                                    </div>
                                ` : ''}
                                ${isLowStock ? `
                                    <div class="absolute top-2 right-2">
                                        <span class="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-pulse">POCAS UNIDADES</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="flex-1 flex flex-col">
                                <h3 class="font-bold text-gray-100 text-lg leading-tight mb-1 group-hover:text-orange-400 transition-colors">${p.name}</h3>
                                <p class="text-sm text-gray-500 line-clamp-2 mb-3">Toca para personalizar</p>
                                
                                <div class="mt-auto flex justify-between items-center">
                                    <span class="text-xl font-bold text-white">$${p.price}</span>
                                    <div class="w-8 h-8 rounded-full bg-gray-800 group-hover:bg-orange-600 flex items-center justify-center text-white transition-colors shadow">
                                        <i data-lucide="plus" class="w-5 h-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </section>
        `;
    },

    renderAdmin() {
        const inventory = window.store.state.inventory;
        const products = window.store.state.products;
        const sales = window.store.state.sales;
        const activeTab = window.posApp.adminTab || 'dashboard'; // Use global state for tab

        // Navigation Tabs
        const renderTabs = () => `
            <div class="flex gap-4 mb-8 border-b border-gray-800 pb-1">
                <button onclick="window.posApp.setAdminTab('dashboard')" class="${activeTab === 'dashboard' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'} pb-3 px-2 font-medium transition-colors">Dashboard</button>
                <button onclick="window.posApp.setAdminTab('products')" class="${activeTab === 'products' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'} pb-3 px-2 font-medium transition-colors">Productos</button>
                <button onclick="window.posApp.setAdminTab('inventory')" class="${activeTab === 'inventory' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'} pb-3 px-2 font-medium transition-colors">Inventario</button>
                <button onclick="window.posApp.setAdminTab('settings')" class="${activeTab === 'settings' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'} pb-3 px-2 font-medium transition-colors">Configuración</button>
                ${store.currentUser.id === 0 ? `
                    <button onclick="window.posApp.setAdminTab('users')" class="${activeTab === 'users' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'} pb-3 px-2 font-medium transition-colors">Usuarios</button>
                ` : ''}
            </div>
        `;

        let content = '';

        if (activeTab === 'dashboard') {
            const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
            content = `
                <!-- Stats Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div class="p-3 bg-green-500/20 text-green-500 rounded-xl"><i data-lucide="dollar-sign" class="w-8 h-8"></i></div>
                        <div><p class="text-gray-400 text-sm font-medium">Ventas Totales</p><h3 class="text-2xl font-bold text-white">$${totalSales.toFixed(2)}</h3></div>
                    </div>
                     <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div class="p-3 bg-blue-500/20 text-blue-500 rounded-xl">
                            <i data-lucide="shopping-bag" class="w-8 h-8"></i>
                        </div>
                        <div>
                            <p class="text-gray-400 text-sm font-medium">Transacciones</p>
                            <h3 class="text-2xl font-bold text-white">${sales.length}</h3>
                        </div>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
                         <div class="p-3 bg-orange-500/20 text-orange-500 rounded-xl">
                            <i data-lucide="alert-triangle" class="w-8 h-8"></i>
                        </div>
                        <div>
                            <p class="text-gray-400 text-sm font-medium">Alertas Stock</p>
                            <h3 class="text-2xl font-bold text-white">
                                ${inventory.filter(i => i.quantity < i.alert).length}
                            </h3>
                        </div>
                    </div>
                </div>
                <!-- Sales History -->
                <div class="glass-panel rounded-2xl overflow-hidden">
                    <div class="p-6 border-b border-gray-800"><h2 class="text-xl font-bold text-white">Últimas Ventas</h2></div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm text-gray-400">
                            <thead class="bg-gray-900/50 uppercase font-semibold text-gray-500">
                                <tr>
                                    <th class="px-6 py-4">Ticket ID</th>
                                    <th class="px-6 py-4">Hora</th>
                                    <th class="px-6 py-4">Empleado</th>
                                    <th class="px-6 py-4">Items</th>
                                    <th class="px-6 py-4">Estado</th>
                                    <th class="px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-800">
                                ${sales.slice(-10).reverse().map(s => `
                                    <tr class="hover:bg-gray-800/30">
                                        <td class="px-6 py-4 font-mono text-xs">#${s.ticketNumber || 'N/A'}</td>
                                        <td class="px-6 py-4">${new Date(s.date).toLocaleTimeString()}</td>
                                        <td class="px-6 py-4 text-white">${s.employee}</td>
                                        <td class="px-6 py-4">${s.items.length} items</td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-2">
                                                <span class="px-2 py-1 rounded-lg text-xs font-bold ${s.status === 'Entregado' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}">
                                                    ${s.status || 'Abierta'}
                                                </span>
                                                <button onclick="window.posApp.updateOrderStatus(${s.id}, '${s.status === 'Entregado' ? 'Abierta' : 'Entregado'}')" 
                                                    class="p-1 hover:bg-gray-700 rounded transition-colors" 
                                                    title="${s.status === 'Entregado' ? 'Marcar como Abierta' : 'Marcar como Entregado'}">
                                                    <i data-lucide="${s.status === 'Entregado' ? 'refresh-ccw' : 'check-circle'}" class="w-4 h-4"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-right font-bold text-white">$${s.total.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (activeTab === 'inventory') {
            content = `
                <div class="glass-panel rounded-2xl overflow-hidden mb-10">
                    <div class="p-6 border-b border-gray-800"><h2 class="text-xl font-bold text-white">Inventario (Ingredientes)</h2></div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm text-gray-400">
                             <thead class="bg-gray-900/50 uppercase font-semibold text-gray-500">
                                <tr>
                                    <th class="px-6 py-4">Ingrediente</th>
                                    <th class="px-6 py-4">Unidad</th>
                                    <th class="px-6 py-4">Cantidad Actual</th>
                                    <th class="px-6 py-4">Estado</th>
                                    <th class="px-6 py-4 text-right">Acciones</th>
                                </tr>
                             </thead>
                             <tbody class="divide-y divide-gray-800">
                                ${inventory.map(item => {
                const isLow = item.quantity <= item.alert;
                return `
                                    <tr class="hover:bg-gray-800/30 transition-colors">
                                        <td class="px-6 py-4 font-medium text-white">${item.name}</td>
                                        <td class="px-6 py-4">${item.unit}</td>
                                        <td class="px-6 py-4">
                                            <span class="font-mono text-lg ${isLow ? 'text-red-500 font-bold' : 'text-white'}">
                                                ${item.quantity}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            ${isLow
                        ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                                                 <div class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Crítico
                                                               </span>`
                        : `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">OK</span>`
                    }
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            ${store.currentUser.id === 2 ? `
                                                <button onclick="window.posApp.openAdjustmentModal('${item.id}')" class="text-orange-500 hover:text-white hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-orange-500/30">
                                                    <i data-lucide="settings-2" class="w-3 h-3 inline mr-1"></i>Ajustar
                                                </button>
                                            ` : `
                                                <span class="text-gray-600 text-xs italic"><i data-lucide="lock" class="w-3 h-3 inline"></i> Solo Gerente</span>
                                            `}
                                        </td>
                                    </tr>`;
            }).join('')}
                             </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (activeTab === 'settings') {
            const settings = window.store.state.settings;
            const categories = window.store.state.categories;
            content = `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                    <!-- Invoice Settings -->
                    <div class="glass-panel p-6 rounded-2xl">
                        <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                             <i data-lucide="receipt" class="w-5 h-5 text-orange-500"></i> Factura / Ticket
                        </h2>
                        <form onsubmit="window.posApp.saveSettings(event)" class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Encabezado</label>
                                <textarea name="header" rows="4" class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm focus:border-orange-500 outline-none">${settings.invoice?.header || ''}</textarea>
                                <p class="text-xs text-gray-500 mt-1">Texto que aparece al inicio del ticket.</p>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Pie de Página</label>
                                <textarea name="footer" rows="3" class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm focus:border-orange-500 outline-none">${settings.invoice?.footer || ''}</textarea>
                                <p class="text-xs text-gray-500 mt-1">Texto que aparece al final del ticket.</p>
                            </div>
                            <button type="submit" class="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-orange-900/20">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>

                    <!-- Category Management -->
                    <div class="glass-panel p-6 rounded-2xl">
                        <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                             <i data-lucide="layout-list" class="w-5 h-5 text-orange-500"></i> Categorías
                        </h2>
                         <div class="space-y-4 mb-6">
                            ${categories.map(c => `
                                <div class="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                                    <span class="text-white font-medium">${c.name}</span>
                                    <button onclick="window.posApp.deleteCategory('${c.id}')" class="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-colors" title="Eliminar">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="flex gap-2">
                            <input type="text" id="new-category-input" placeholder="Nueva categoría..." class="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none">
                            <button onclick="window.posApp.addCategory()" class="bg-gray-800 hover:bg-gray-700 text-white px-4 rounded-lg font-bold border border-gray-700">
                                <i data-lucide="plus" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Backup & Recovery -->
                    ${store.currentUser.id === 3 || store.currentUser.id === 0 ? `
                        <div class="glass-panel p-6 rounded-2xl border-2 border-orange-500/30">
                            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <i data-lucide="shield-check" class="w-5 h-5 text-orange-500"></i> Respaldo y Recuperación
                            </h2>
                            <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
                                <div class="flex items-start gap-3">
                                    <i data-lucide="alert-circle" class="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0"></i>
                                    <div>
                                        <p class="text-sm text-orange-200 font-medium mb-1">Protección de Datos</p>
                                        <p class="text-xs text-orange-300/80 leading-relaxed">
                                            Exporta tus datos antes de hacer cambios técnicos al código. 
                                            Guarda el archivo en un lugar seguro para poder restaurar si es necesario.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="space-y-3">
                                <button onclick="window.posApp.exportBackup()" class="w-full bg-green-600 hover:bg-green-500 text-white px-6 py-4 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-3 group">
                                    <i data-lucide="download" class="w-5 h-5 group-hover:animate-bounce"></i>
                                    <div class="text-left">
                                        <div class="text-base">Descargar Respaldo</div>
                                        <div class="text-xs font-normal opacity-80">Exportar todos los datos a archivo JSON</div>
                                    </div>
                                </button>
                                
                                <div class="relative">
                                    <input type="file" id="import-file-input" accept=".json" class="hidden" onchange="window.posApp.importBackup(this)">
                                    <button onclick="document.getElementById('import-file-input').click()" class="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3 group">
                                        <i data-lucide="upload" class="w-5 h-5 group-hover:animate-bounce"></i>
                                        <div class="text-left">
                                            <div class="text-base">Restaurar Respaldo</div>
                                            <div class="text-xs font-normal opacity-80">Importar datos desde archivo JSON</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div class="mt-6 pt-6 border-t border-gray-800">
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-gray-500">Entorno Actual:</span>
                                    <span class="px-3 py-1 rounded-full font-bold ${store.isProduction ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}">
                                        ${store.isProduction ? '🌐 PRODUCCIÓN (ID: 1)' : '💻 DESARROLLO (ID: 99)'}
                                    </span>
                                </div>
                                <p class="text-xs text-gray-500 mt-2">
                                    ${store.isProduction
                        ? 'Estás en la versión de internet. Los datos son reales del negocio.'
                        : 'Estás en tu PC local. Puedes probar sin afectar los datos reales.'}
                                </p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (activeTab === 'products') {
            content = `
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-white">Gestión de Productos</h2>
                    <button onclick="window.posApp.openProductEditor()" class="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                        <i data-lucide="plus" class="w-4 h-4"></i> Nuevo Producto
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${products.map(p => `
                        <div class="glass-panel p-4 rounded-xl flex gap-4 group relative">
                            <img src="${p.image}" class="w-20 h-20 rounded-lg object-cover bg-gray-800">
                            <div class="flex-1">
                                <h3 class="font-bold text-white mb-1">${p.name}</h3>
                                <p class="text-orange-500 font-bold">$${p.price}</p>
                            </div>
                            <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="window.posApp.openProductEditor('${p.id}')" class="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white" title="Editar">
                                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                                </button>
                                ${store.currentUser.id === 2 ? `
                                    <button onclick="window.posApp.deleteProduct('${p.id}')" class="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Eliminar">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (activeTab === 'users' && store.currentUser.id === 0) {
            content = `
                <div class="glass-panel rounded-2xl overflow-hidden">
                    <div class="p-6 border-b border-gray-800"><h2 class="text-xl font-bold text-white">Gestión de Usuarios</h2></div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm text-gray-400">
                            <thead class="bg-gray-900/50 uppercase font-semibold text-gray-500">
                                <tr>
                                    <th class="px-6 py-4">ID</th>
                                    <th class="px-6 py-4">Nombre</th>
                                    <th class="px-6 py-4">PIN Actual</th>
                                    <th class="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-800">
                                ${store.state.users.map(u => `
                                    <tr class="hover:bg-gray-800/30">
                                        <td class="px-6 py-4 font-mono text-xs">${u.id}</td>
                                        <td class="px-6 py-4 text-white">${u.name}</td>
                                        <td class="px-6 py-4 font-mono">${u.pin}</td>
                                        <td class="px-6 py-4 text-right">
                                            <button onclick="window.posApp.changeUserPin(${u.id}, '${u.name}')" class="text-orange-500 hover:text-white hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-orange-500/30">
                                                Cambiar PIN
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        return `
            <div class="flex-1 h-full p-8 overflow-y-auto bg-gray-950">
                <header class="mb-6">
                    <h1 class="text-3xl font-bold text-white">Panel de Administración</h1>
                </header>
                ${renderTabs()}
                ${content}
            </div>
        `;
    },

    renderProductEditorModal(product = null) {
        const isEdit = !!product;
        const p = product || { id: '', name: '', price: '', image: '', category: 'burgers' };

        return `
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" id="editor-modal">
                <div class="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                    <h2 class="text-2xl font-bold text-white mb-6">${isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    
                    <form onsubmit="window.posApp.saveProduct(event, '${p.id}')" class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Nombre</label>
                            <input type="text" name="name" value="${p.name}" required class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Precio</label>
                                <input type="number" step="0.01" name="price" value="${p.price}" required class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Categoría</label>
                                <select name="category" class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none">
                                    ${store.state.categories.map(c => `
                                        <option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${c.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Imagen URL</label>
                            <div class="flex gap-2">
                                <input type="url" name="image" id="img-url-input" value="${p.image}" placeholder="https://..." class="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-orange-500 outline-none">
                                <label class="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg border border-gray-700">
                                    <i data-lucide="upload" class="w-5 h-5"></i>
                                    <input type="file" class="hidden" accept="image/*" onchange="window.posApp.handleImageUpload(this)">
                                </label>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Pega una URL o sube una imagen (se guardará en el navegador)</p>
                        </div>

                        <div class="flex justify-between mt-8">
                            <div>
                                ${isEdit && store.currentUser.id === 2 ? `
                                    <button type="button" onclick="window.posApp.deleteProduct('${p.id}')" class="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold border border-red-500/20 transition-colors">
                                        <i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i> Eliminar
                                    </button>
                                ` : ''}
                            </div>
                            <div class="flex gap-3">
                                <button type="button" onclick="document.getElementById('editor-modal').remove()" class="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                                <button type="submit" class="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold shadow-lg shadow-orange-900/20">Guardar</button>
                            </div>
                        </div>
                        
                        ${/* Ingredients Section - Manager Only */ ''}
                        ${store.currentUser.id === 2 ? `
                            <div class="border-t border-gray-800 pt-6 mt-6">
                                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                                    <i data-lucide="chef-hat" class="w-4 h-4 text-orange-500"></i> Receta (Ingredientes)
                                </h3>
                                <p class="text-xs text-gray-500 mb-4">Define los ingredientes que se consumen del inventario al vender este producto.</p>
                                
                                <div class="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar" id="recipe-list">
                                     ${(p.recipe || []).map(ing => {
            const invItem = store.state.inventory.find(i => i.id === ing.id);
            return `
                                            <div class="flex gap-2 items-center bg-gray-800/50 p-2 rounded-lg border border-gray-700/50">
                                                <div class="flex-1 min-w-0">
                                                    <span class="text-gray-300 text-sm font-medium block truncate">${invItem ? invItem.name : ing.id}</span>
                                                    <span class="text-xs text-gray-500">Id: ${ing.id}</span>
                                                </div>
                                                <input type="number" step="0.001" name="recipe_qty_${ing.id}" value="${ing.qty}" class="w-20 bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-sm focus:border-orange-500 outline-none text-right">
                                                <span class="text-gray-500 text-xs w-8">${invItem ? invItem.unit : ''}</span>
                                                <input type="hidden" name="recipe_id[]" value="${ing.id}">
                                                <button type="button" onclick="this.closest('.flex').remove()" class="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Quitar Ingrediente">
                                                    <i data-lucide="trash" class="w-4 h-4"></i>
                                                </button>
                                             </div>
                                         `;
        }).join('')}
                                </div>

                                <div class="flex gap-2 bg-gray-900 p-2 rounded-lg border border-gray-800">
                                    <select id="new-ing-select" class="flex-1 bg-gray-800 border-none rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-orange-500 outline-none cursor-pointer hover:bg-gray-700 transition-colors">
                                        <option value="" disabled selected>-- Seleccionar Ingrediente --</option>
                                        ${store.state.inventory.map(i => `<option value="${i.id}">${i.name} (${i.unit})</option>`).join('')}
                                    </select>
                                    <button type="button" onclick="window.posApp.addIngredientRow()" class="bg-orange-600 hover:bg-orange-500 text-white px-4 rounded-lg font-bold shadow-lg transition-colors flex items-center justify-center">
                                        <i data-lucide="plus" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </form>
                </div>
            </div>
        `;
    },

    renderPinModal(targetPin, userName) {
        return `
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md" id="pin-modal">
                <div class="glass-panel w-80 rounded-2xl p-6 shadow-2xl flex flex-col items-center animate-in zoom-in-95">
                    <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-orange-500">
                        <i data-lucide="lock" class="w-6 h-6"></i>
                    </div>
                    <h2 class="text-xl font-bold text-white mb-1">Ingrese PIN</h2>
                    <p class="text-gray-400 text-sm mb-6">Para ${userName}</p>
                    
                    <div class="flex gap-2 justify-center mb-6">
                        <div id="pin-dot-1" class="w-3 h-3 rounded-full bg-gray-700 transition-colors"></div>
                        <div id="pin-dot-2" class="w-3 h-3 rounded-full bg-gray-700 transition-colors"></div>
                        <div id="pin-dot-3" class="w-3 h-3 rounded-full bg-gray-700 transition-colors"></div>
                        <div id="pin-dot-4" class="w-3 h-3 rounded-full bg-gray-700 transition-colors"></div>
                    </div>

                    <div class="grid grid-cols-3 gap-3 w-full mb-4">
                        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `
                            <button onclick="window.posApp.enterPinDigit('${n}', '${targetPin}')" class="h-14 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xl font-bold transition-colors">${n}</button>
                        `).join('')}
                         <button onclick="document.getElementById('pin-modal').remove(); window.posApp.currentPinInput=''" class="h-14 rounded-xl bg-gray-800 hover:bg-red-900/30 text-red-500 flex items-center justify-center transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                         <button onclick="window.posApp.enterPinDigit('0', '${targetPin}')" class="h-14 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xl font-bold transition-colors">0</button>
                         <button onclick="window.posApp.backspacePin()" class="h-14 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors"><i data-lucide="delete" class="w-5 h-5"></i></button>
                    </div>
                </div>
            </div>
        `;
    },

    renderProductModal(productId) {
        const product = store.state.products.find(p => p.id === productId);
        if (!product) return '';

        return `
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" id="product-modal">
                <div class="glass-panel w-full max-w-md rounded-3xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                    <div class="relative h-48">
                        <img src="${product.image}" class="w-full h-full object-cover">
                        <button onclick="window.posApp.closeModal()" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white backdrop-blur-md transition-colors">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-2">
                            <h2 class="text-2xl font-bold text-white">${product.name}</h2>
                            <span class="text-2xl font-bold text-orange-500">$${product.price}</span>
                        </div>
                        <p class="text-gray-400 text-sm mb-6">Personaliza tu orden a continuación.</p>

                        ${product.recipe && product.recipe.length > 0 ? `
                            <div class="mb-6 bg-gray-800/30 rounded-xl p-3">
                                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ingredientes</h4>
                                <div class="flex flex-wrap gap-2">
                                    ${product.recipe.map(ing => {
            const invItem = store.state.inventory.find(i => i.id === ing.id);
            if (!invItem) return '';
            return `<span class="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded-md border border-gray-700/50">${invItem.name}</span>`;
        }).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div class="space-y-4 mb-8">
                            <label class="block text-sm font-medium text-gray-300">Notas especiales</label>
                            <textarea id="modal-notes" class="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-600" rows="3" placeholder="Ej: Sin cebolla, extra salsa..."></textarea>
                        </div>

                        <button onclick="window.posApp.addToCartFromModal('${product.id}')" class="w-full py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg shadow-lg shadow-orange-900/20 transition-all flex items-center justify-center gap-2">
                            Agregar a la Orden
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderAdjustmentModal(itemId) {
        const item = store.state.inventory.find(i => i.id === itemId);
        if (!item) return '';

        return `
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" id="adjustment-modal">
                <div class="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 border border-orange-500/20">
                    <div class="flex items-center gap-3 mb-6 border-b border-gray-800/50 pb-4">
                        <div class="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                            <i data-lucide="clipboard-edit" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-white">Ajustar Inventario</h2>
                            <p class="text-gray-400 text-sm">${item.name}</p>
                        </div>
                    </div>
                    
                    <form onsubmit="window.posApp.handleAdjustment(event, '${item.id}')" class="space-y-4">
                        <div class="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 mb-4">
                            <label class="block text-xs uppercase tracking-wider text-gray-500 mb-1">Cantidad Actual</label>
                            <div class="text-2xl font-mono font-bold text-white">${item.quantity} <span class="text-sm text-gray-400 font-sans font-normal">${item.unit}</span></div>
                        </div>

                        <div>
                            <label class="block text-sm text-gray-300 mb-1 font-medium">Nueva Cantidad Total</label>
                            <input type="number" step="0.001" name="quantity" value="${item.quantity}" required class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none font-mono text-lg">
                            <p class="text-xs text-gray-500 mt-1">Ingrese el valor real contado en físico.</p>
                        </div>

                        <div>
                            <label class="block text-sm text-gray-300 mb-1 font-medium">Motivo del Ajuste (Obligatorio)</label>
                            <textarea name="note" required rows="3" placeholder="Ej: Error en conteo, Desperdicio, Merma..." class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none placeholder:text-gray-600"></textarea>
                        </div>

                        <div class="flex gap-3 mt-6 pt-4 border-t border-gray-800/50">
                            <button type="button" onclick="document.getElementById('adjustment-modal').remove()" class="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" class="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-900/20 transition-colors">
                                Guardar Ajuste
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
};
