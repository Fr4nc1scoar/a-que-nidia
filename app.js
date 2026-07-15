/* ==========================================
   A QUE NIDIA - EMPANADAS TRADICIONALES
   Lógica del Negocio (app.js)
   ========================================== */

// --- DATOS DEL MENÚ ---
const fillings = [
    { id: 'queso', name: 'Queso' },
    { id: 'pollo', name: 'Pollo' },
    { id: 'molida', name: 'Carne Molida' },
    { id: 'mechada', name: 'Carne Mechada' },
    { id: 'cazon', name: 'Cazón' },
    { id: 'caraotas', name: 'Caraotas' },
    { id: 'pepitona', name: 'Pepitona' }
];

const beverages = [
    { id: 'coca-cola', name: 'Coca-Cola' },
    { id: 'pepsi', name: 'Pepsi' },
    { id: 'chinotto', name: 'Chinotto' },
    { id: 'malta', name: 'Malta' },
    { id: 'agua', name: 'Agua Mineral' }
];

const menuProducts = [
    {
        id: 'sencilla',
        name: 'Empanada Sencilla',
        desc: 'Nuestra deliciosa empanada frita rellena con 1 sabor a tu elección.',
        price: 1.00,
        badge: 'Popular',
        isCustomizable: true
    },
    {
        id: 'mixta',
        name: 'Empanada Mixta',
        desc: '¡Combina tus antojos! Empanada frita rellena con 2 sabores a tu elección.',
        price: 1.50,
        badge: 'La Favorita',
        isCustomizable: true
    },
    {
        id: 'combo',
        name: 'Combo 2+1 Refresco',
        desc: 'La combinación perfecta: 2 empanadas sencillas (con el relleno que quieras cada una) + 1 refresco bien frío.',
        price: 2.00,
        badge: 'Super Ahorro',
        isCustomizable: true
    },
    {
        id: 'refresco_ind',
        name: 'Refresco Individual',
        desc: 'Lata de refresco frío (Coca-Cola, Pepsi, Chinotto).',
        price: 1.00,
        badge: 'Bebidas',
        isCustomizable: false
    },
    {
        id: 'malta_ind',
        name: 'Malta Fría',
        desc: 'Malta bien fría para acompañar tus empanadas.',
        price: 1.00,
        badge: 'Bebidas',
        isCustomizable: false
    },
    {
        id: 'agua_ind',
        name: 'Agua Mineral',
        desc: 'Botella de agua mineral de 500ml.',
        price: 1.00,
        badge: 'Bebidas',
        isCustomizable: false
    }
];

// --- ESTADO DE LA APLICACIÓN ---
let cart = {}; // { 'unique_key': { product, quantity, customizations } }
let currentProductToCustomize = null;

// --- ELEMENTOS DEL DOM ---
const productsContainer = document.getElementById('products-container');

// Modales
const customizerOverlay = document.getElementById('customizer-modal-overlay');
const customizerTitle = document.getElementById('customizer-product-title');
const customizerBody = document.getElementById('customizer-modal-body');
const confirmCustomizationBtn = document.getElementById('btn-confirm-customization');
const closeCustomizerBtn = document.getElementById('btn-close-customizer');

// Carrito
const cartOverlay = document.getElementById('cart-drawer-overlay');
const floatingCartTrigger = document.getElementById('floating-cart-trigger');
const floatingCartBadge = document.getElementById('floating-cart-badge-count');
const floatingCartTotal = document.getElementById('floating-cart-total-price');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartEmptyState = document.getElementById('cart-empty-state');
const cartSummarySection = document.getElementById('cart-summary-section');
const cartSummaryTotal = document.getElementById('cart-summary-total-price');
const cartFooterSection = document.getElementById('cart-footer-section');
const closeCartBtn = document.getElementById('btn-close-cart');
const submitOrderBtn = document.getElementById('btn-submit-order');

// Formulario de Checkout
const customerNameInput = document.getElementById('input-customer-name');
const deliveryTypeRadios = document.querySelectorAll('input[name="delivery_type_radio"]');
const addressGroup = document.getElementById('form-group-address');
const customerAddressInput = document.getElementById('input-customer-address');
const paymentMethodSelect = document.getElementById('select-payment-method');
const orderNotesInput = document.getElementById('input-order-notes');

// Notificaciones
const toastNotification = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');

// Compartir e Instagram
const shareProfileBtn = document.getElementById('btn-share-profile');
const instagramBtn = document.getElementById('btn-instagram');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos de LocalStorage si existen
    const savedCart = localStorage.getItem('aquenidia_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartUI();
        } catch (e) {
            console.error('Error al cargar carrito guardado:', e);
            cart = {};
        }
    }

    renderMenu();
    setupEventListeners();
});

// --- RENDERIZADO DEL MENÚ ---
function renderMenu() {
    productsContainer.innerHTML = '';

    menuProducts.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.id = `product-card-${product.id}`;

        const badgeHTML = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
        const btnLabel = product.isCustomizable ? 'Personalizar' : 'Agregar';
        const btnIcon = product.isCustomizable ? 'fa-sliders' : 'fa-plus';

        card.innerHTML = `
            ${badgeHTML}
            <div class="product-info-wrap">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.desc}</p>
            </div>
            <div class="product-footer">
                <div class="product-price-label">
                    <span>$</span>${product.price.toFixed(2)}
                </div>
                <button class="order-btn" id="btn-add-${product.id}" onclick="handleProductAction('${product.id}')">
                    <i class="fa-solid ${btnIcon}"></i> ${btnLabel}
                </button>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

// --- CONFIGURACIÓN DE EVENT LISTENERS ---
function setupEventListeners() {
    // Cerrar Customizer
    closeCustomizerBtn.addEventListener('click', closeCustomizer);
    customizerOverlay.addEventListener('click', (e) => {
        if (e.target === customizerOverlay) closeCustomizer();
    });

    // Confirmar Personalización
    confirmCustomizationBtn.addEventListener('click', addCustomizedToCart);

    // Abrir/Cerrar Carrito
    floatingCartTrigger.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) closeCart();
    });

    // Control de tipo de entrega
    deliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'delivery') {
                addressGroup.style.display = 'block';
                customerAddressInput.setAttribute('required', 'true');
            } else {
                addressGroup.style.display = 'none';
                customerAddressInput.removeAttribute('required');
            }
        });
    });

    // Enviar Pedido
    submitOrderBtn.addEventListener('click', processCheckout);

    // Compartir Perfil
    if (shareProfileBtn) {
        shareProfileBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'A que Nidia | Empanadas Tradicionales',
                        text: '¡Las mejores empanadas tradicionales! Arma tu combo y pide por WhatsApp aquí:',
                        url: window.location.href,
                    });
                } catch (err) {
                    console.log('Error al compartir:', err);
                }
            } else {
                // Fallback copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                showToast('¡Enlace de la app copiado al portapapeles! 📋');
            }
        });
    }

    // Instagram Placeholder Click
    if (instagramBtn) {
        instagramBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('📸 ¡Próximamente! Estamos preparando nuestro perfil de Instagram para compartir contigo nuestro delicioso día a día. Por ahora, ¡puedes pedir tus empanadas por WhatsApp!');
        });
    }
}

// --- MANEJO DE ACCIONES DE PRODUCTO ---
function handleProductAction(productId) {
    const product = menuProducts.find(p => p.id === productId);
    if (!product) return;

    if (product.isCustomizable) {
        openCustomizer(product);
    } else {
        // Simple item, add directly
        addToCartSimple(product);
    }
}

// --- LÓGICA DE PERSONALIZADOR ---
function openCustomizer(product) {
    currentProductToCustomize = product;
    customizerTitle.innerText = `Personalizar ${product.name}`;
    customizerBody.innerHTML = '';
    confirmCustomizationBtn.disabled = true;

    if (product.id === 'sencilla') {
        renderSencillaCustomizer();
    } else if (product.id === 'mixta') {
        renderMixtaCustomizer();
    } else if (product.id === 'combo') {
        renderComboCustomizer();
    }

    customizerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCustomizer() {
    customizerOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentProductToCustomize = null;
}

// Renderizar opciones para empanada Sencilla (1 relleno)
function renderSencillaCustomizer() {
    let html = `
        <div class="selection-instruction">
            <i class="fa-solid fa-circle-info"></i> Selecciona exactamente 1 relleno
        </div>
        <h4 class="custom-section-title">Rellenos Disponibles</h4>
        <div class="options-list">
    `;

    fillings.forEach(filling => {
        html += `
            <div>
                <input type="radio" id="f-${filling.id}" name="sencilla_filling" value="${filling.name}" class="option-input" onchange="validateSencillaSelection()">
                <label for="f-${filling.id}" class="option-label">
                    <span>${filling.name}</span>
                    <span class="custom-control"></span>
                </label>
            </div>
        `;
    });

    html += `</div>`;
    customizerBody.innerHTML = html;
}

function validateSencillaSelection() {
    const checked = document.querySelector('input[name="sencilla_filling"]:checked');
    confirmCustomizationBtn.disabled = !checked;
}

// Renderizar opciones para empanada Mixta (exactamente 2 rellenos)
function renderMixtaCustomizer() {
    let html = `
        <div class="selection-instruction" id="mixta-instruction">
            <i class="fa-solid fa-circle-info"></i> Selecciona exactamente 2 rellenos (0 de 2 seleccionados)
        </div>
        <h4 class="custom-section-title">Rellenos Disponibles</h4>
        <div class="options-list">
    `;

    fillings.forEach(filling => {
        html += `
            <div>
                <input type="checkbox" id="f-${filling.id}" name="mixta_fillings" value="${filling.name}" class="option-input" onchange="validateMixtaSelection()">
                <label for="f-${filling.id}" class="option-label">
                    <span>${filling.name}</span>
                    <span class="custom-control"></span>
                </label>
            </div>
        `;
    });

    html += `</div>`;
    customizerBody.innerHTML = html;
}

function validateMixtaSelection() {
    const checkedBoxes = document.querySelectorAll('input[name="mixta_fillings"]:checked');
    const checkedCount = checkedBoxes.length;
    
    const instruction = document.getElementById('mixta-instruction');
    if (instruction) {
        instruction.innerHTML = `<i class="fa-solid fa-circle-info"></i> Selecciona exactamente 2 rellenos (${checkedCount} de 2 seleccionados)`;
    }

    // Habilitar botón de agregar únicamente si hay exactamente 2 opciones seleccionadas
    if (checkedCount === 2) {
        confirmCustomizationBtn.disabled = false;
        // Opcional: deshabilitar los otros checkboxes no marcados para evitar triple selección
        document.querySelectorAll('input[name="mixta_fillings"]:not(:checked)').forEach(cb => {
            cb.disabled = true;
        });
    } else {
        confirmCustomizationBtn.disabled = true;
        document.querySelectorAll('input[name="mixta_fillings"]').forEach(cb => {
            cb.disabled = false;
        });
    }
}

// Renderizar opciones para Combo (2 empanadas de 1 relleno + 1 refresco)
function renderComboCustomizer() {
    let html = `
        <div class="selection-instruction" id="combo-instruction">
            <i class="fa-solid fa-circle-info"></i> Por favor, configura tu combo para agregar al pedido.
        </div>

        <!-- Empanada 1 -->
        <h4 class="custom-section-title">Relleno Empanada 1 *</h4>
        <div class="options-list" style="margin-bottom: 1.8rem;">
    `;

    fillings.forEach(filling => {
        html += `
            <div>
                <input type="radio" id="c1-${filling.id}" name="combo_e1_filling" value="${filling.name}" class="option-input" onchange="validateComboSelection()">
                <label for="c1-${filling.id}" class="option-label">
                    <span>${filling.name}</span>
                    <span class="custom-control"></span>
                </label>
            </div>
        `;
    });

    html += `
        </div>

        <!-- Empanada 2 -->
        <h4 class="custom-section-title">Relleno Empanada 2 *</h4>
        <div class="options-list" style="margin-bottom: 1.8rem;">
    `;

    fillings.forEach(filling => {
        html += `
            <div>
                <input type="radio" id="c2-${filling.id}" name="combo_e2_filling" value="${filling.name}" class="option-input" onchange="validateComboSelection()">
                <label for="c2-${filling.id}" class="option-label">
                    <span>${filling.name}</span>
                    <span class="custom-control"></span>
                </label>
            </div>
        `;
    });

    html += `
        </div>

        <!-- Bebida -->
        <h4 class="custom-section-title">Bebida del Combo *</h4>
        <div class="options-list">
    `;

    beverages.forEach(beverage => {
        html += `
            <div>
                <input type="radio" id="cb-${beverage.id}" name="combo_beverage" value="${beverage.name}" class="option-input" onchange="validateComboSelection()">
                <label for="cb-${beverage.id}" class="option-label">
                    <span>${beverage.name}</span>
                    <span class="custom-control"></span>
                </label>
            </div>
        `;
    });

    html += `</div>`;
    customizerBody.innerHTML = html;
}

function validateComboSelection() {
    const e1Checked = document.querySelector('input[name="combo_e1_filling"]:checked');
    const e2Checked = document.querySelector('input[name="combo_e2_filling"]:checked');
    const bevChecked = document.querySelector('input[name="combo_beverage"]:checked');

    const instruction = document.getElementById('combo-instruction');

    if (e1Checked && e2Checked && bevChecked) {
        confirmCustomizationBtn.disabled = false;
        if (instruction) {
            instruction.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--secondary-green)"></i> ¡Combo completo y listo para agregar!`;
            instruction.style.background = 'var(--secondary-green-light)';
            instruction.style.borderColor = 'var(--secondary-green)';
            instruction.style.color = 'var(--secondary-green-hover)';
        }
    } else {
        confirmCustomizationBtn.disabled = true;
        if (instruction) {
            instruction.innerHTML = `<i class="fa-solid fa-circle-info"></i> Elige relleno para ambas empanadas y la bebida.`;
            instruction.style.background = 'var(--primary-pink-light)';
            instruction.style.borderColor = 'var(--primary-pink)';
            instruction.style.color = 'var(--primary-pink-hover)';
        }
    }
}

// --- OPERACIONES DEL CARRITO ---

// Agregar producto simple directo
function addToCartSimple(product) {
    const uniqueKey = product.id; // Clave única es el ID para productos simples

    if (cart[uniqueKey]) {
        cart[uniqueKey].quantity += 1;
    } else {
        cart[uniqueKey] = {
            product: product,
            quantity: 1,
            customizations: null
        };
    }

    updateCartUI();
    showToast(`¡${product.name} agregada con éxito!`);
}

// Agregar producto personalizado desde el modal
function addCustomizedToCart() {
    if (!currentProductToCustomize) return;

    let customizations = {};
    let customKeySuffix = '';

    if (currentProductToCustomize.id === 'sencilla') {
        const selectedFilling = document.querySelector('input[name="sencilla_filling"]:checked').value;
        customizations.fillings = [selectedFilling];
        customKeySuffix = `-${selectedFilling.toLowerCase().replace(/\s+/g, '_')}`;
    } 
    else if (currentProductToCustomize.id === 'mixta') {
        const selectedFillings = [];
        document.querySelectorAll('input[name="mixta_fillings"]:checked').forEach(cb => {
            selectedFillings.push(cb.value);
        });
        // Ordenar para garantizar consistencia en la clave única
        selectedFillings.sort();
        customizations.fillings = selectedFillings;
        customKeySuffix = `-${selectedFillings.join('_').toLowerCase().replace(/\s+/g, '_')}`;
    } 
    else if (currentProductToCustomize.id === 'combo') {
        const e1 = document.querySelector('input[name="combo_e1_filling"]:checked').value;
        const e2 = document.querySelector('input[name="combo_e2_filling"]:checked').value;
        const bev = document.querySelector('input[name="combo_beverage"]:checked').value;

        customizations.combo = {
            empanada1: e1,
            empanada2: e2,
            beverage: bev
        };
        
        const cleanStr = (str) => str.toLowerCase().replace(/\s+/g, '_');
        customKeySuffix = `-${cleanStr(e1)}-${cleanStr(e2)}-${cleanStr(bev)}`;
    }

    const uniqueKey = `${currentProductToCustomize.id}${customKeySuffix}`;

    if (cart[uniqueKey]) {
        cart[uniqueKey].quantity += 1;
    } else {
        cart[uniqueKey] = {
            product: currentProductToCustomize,
            quantity: 1,
            customizations: customizations
        };
    }

    updateCartUI();
    closeCustomizer();
    showToast(`¡${currentProductToCustomize.name} agregada al carrito! 🛒`);
}

// Modificar cantidades desde el carrito
function changeQty(key, change) {
    if (!cart[key]) return;

    cart[key].quantity += change;

    if (cart[key].quantity <= 0) {
        delete cart[key];
        showToast('Producto eliminado del carrito');
    }

    updateCartUI();
}

// Actualizar Interfaz del Carrito y Guardar
function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;

    // Calcular totales
    Object.keys(cart).forEach(key => {
        totalItems += cart[key].quantity;
        totalPrice += cart[key].product.price * cart[key].quantity;
    });

    // Guardar en localStorage para persistencia
    localStorage.setItem('aquenidia_cart', JSON.stringify(cart));

    // Control del botón flotante del carrito
    if (totalItems > 0) {
        floatingCartTrigger.classList.add('visible');
        floatingCartBadge.innerText = totalItems;
        floatingCartTotal.innerText = `$${totalPrice.toFixed(2)}`;
    } else {
        floatingCartTrigger.classList.remove('visible');
        closeCart();
    }

    // Actualizar Drawer del Carrito si está abierto
    if (cartOverlay.classList.contains('active')) {
        renderCartDrawerContent();
    }
}

// Abrir Carrito
function openCart() {
    renderCartDrawerContent();
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar Carrito
function closeCart() {
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Renderizar contenido del carrito de compras
function renderCartDrawerContent() {
    cartItemsContainer.innerHTML = '';
    
    const cartKeys = Object.keys(cart);
    
    if (cartKeys.length === 0) {
        // Carrito Vacío
        cartEmptyState.style.display = 'flex';
        cartSummarySection.style.display = 'none';
        cartFooterSection.style.display = 'none';
        return;
    }

    // Carrito con ítems
    cartEmptyState.style.display = 'none';
    cartSummarySection.style.display = 'block';
    cartFooterSection.style.display = 'block';

    let totalPrice = 0;

    cartKeys.forEach(key => {
        const item = cart[key];
        const itemTotal = item.product.price * item.quantity;
        totalPrice += itemTotal;

        // Formatear descripción de personalización
        let descHTML = '';
        if (item.customizations) {
            if (item.product.id === 'sencilla') {
                descHTML = `<span class="cart-item-custom-desc">Sabor: ${item.customizations.fillings[0]}</span>`;
            } else if (item.product.id === 'mixta') {
                descHTML = `<span class="cart-item-custom-desc">Sabores: ${item.customizations.fillings.join(' + ')}</span>`;
            } else if (item.product.id === 'combo') {
                const c = item.customizations.combo;
                descHTML = `
                    <span class="cart-item-custom-desc" style="display:block; margin-bottom: 2px;">Emp. 1: ${c.empanada1}</span>
                    <span class="cart-item-custom-desc" style="display:block; margin-bottom: 2px;">Emp. 2: ${c.empanada2}</span>
                    <span class="cart-item-custom-desc" style="display:block; font-size:0.75rem; background: var(--secondary-green-light); color: var(--secondary-green-hover);">🥤 Bebida: ${c.beverage}</span>
                `;
            }
        } else {
            descHTML = `<span class="cart-item-custom-desc" style="background:#ECEFF1; color:#546E7A;"><i class="fa-solid fa-bottle-water"></i> Bebida Individual</span>`;
        }

        const card = document.createElement('div');
        card.className = 'cart-item-card';
        card.innerHTML = `
            <div class="cart-item-details">
                <div class="cart-item-title-row">${item.product.name}</div>
                <div style="margin-top: 4px; margin-bottom: 4px;">${descHTML}</div>
                <div class="cart-item-price-calc">${item.quantity} x $${item.product.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-right">
                <div class="cart-item-total-price">$${itemTotal.toFixed(2)}</div>
                <div class="cart-item-actions-row">
                    <button class="cart-qty-btn" onclick="changeQty('${key}', -1)"><i class="fa-solid fa-minus"></i></button>
                    <span class="cart-qty-val">${item.quantity}</span>
                    <button class="cart-qty-btn" onclick="changeQty('${key}', 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(card);
    });

    cartSummaryTotal.innerText = `$${totalPrice.toFixed(2)}`;
}

// --- PROCESAMIENTO DEL PEDIDO Y WHATSAPP ---
function processCheckout() {
    const name = customerNameInput.value.trim();
    const deliveryType = document.querySelector('input[name="delivery_type_radio"]:checked').value;
    const address = customerAddressInput.value.trim();
    const payment = paymentMethodSelect.value;
    const notes = orderNotesInput.value.trim();

    // Validaciones
    if (!name) {
        alert('⚠️ Por favor, ingresa tu Nombre y Apellido para el pedido.');
        customerNameInput.focus();
        return;
    }
    if (deliveryType === 'delivery' && !address) {
        alert('🛵 Elegiste Delivery, por favor ingresa tu dirección de entrega.');
        customerAddressInput.focus();
        return;
    }
    if (!payment) {
        alert('💳 Por favor, selecciona tu Método de Pago.');
        paymentMethodSelect.focus();
        return;
    }

    // Compilar el mensaje para WhatsApp
    let orderText = `*⚡ NUEVO PEDIDO - A QUE NIDIA ⚡*\n\n`;
    orderText += `*Cliente:* ${name}\n`;
    orderText += `*Tipo de Entrega:* ${deliveryType === 'delivery' ? '🛵 Delivery' : '🏃‍♂️ Retiro en Local'}\n`;
    if (deliveryType === 'delivery') {
        orderText += `*Dirección:* ${address}\n`;
    }
    orderText += `*Método de Pago:* ${payment}\n\n`;
    
    orderText += `*🛍️ DETALLE DEL PEDIDO:*\n`;
    
    let total = 0;
    
    Object.keys(cart).forEach((key, index) => {
        const item = cart[key];
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;

        orderText += `\n*${index + 1}) ${item.quantity}x ${item.product.name}* - $${itemTotal.toFixed(2)}\n`;

        if (item.customizations) {
            if (item.product.id === 'sencilla') {
                orderText += `   🔹 Sabor: ${item.customizations.fillings[0]}\n`;
            } else if (item.product.id === 'mixta') {
                orderText += `   🔹 Sabores: ${item.customizations.fillings.join(' + ')}\n`;
            } else if (item.product.id === 'combo') {
                const c = item.customizations.combo;
                orderText += `   🔸 Empanada 1: ${c.empanada1}\n`;
                orderText += `   🔸 Empanada 2: ${c.empanada2}\n`;
                orderText += `   🥤 Bebida: ${c.beverage}\n`;
            }
        }
    });

    orderText += `\n*💵 TOTAL A PAGAR: $${total.toFixed(2)}*\n`;

    if (deliveryType === 'delivery') {
        orderText += `_(Nota: El costo de delivery se calcula según tu ubicación)_\n`;
    }

    if (notes) {
        orderText += `\n*📝 Notas Adicionales:* ${notes}\n`;
    }

    orderText += `\n¡Quedo atento/a para coordinar los detalles de pago! Muchas gracias.`;

    // Número de teléfono de A que Nidia (+58 414-8342756)
    const phoneNumber = "584148342756";
    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;

    // Limpiar carrito tras realizar el pedido para evitar duplicados
    cart = {};
    updateCartUI();
    closeCart();

    // Abrir WhatsApp en pestaña nueva
    window.open(whatsappUrl, '_blank');
}

// --- UTILERÍA: MOSTRAR TOAST ---
function showToast(message) {
    toastMessage.innerText = message;
    toastNotification.classList.add('show');
    
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 2500);
}
