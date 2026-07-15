// --- DOM Elements ---
const productsGrid = document.getElementById('products-grid');
const tabBtns = document.querySelectorAll('.tab-btn');
const categoryNote = document.getElementById('category-note');

const cartOverlay = document.getElementById('cart-overlay');
const floatingCart = document.getElementById('floating-cart');
const closeCartBtn = document.getElementById('close-cart');
const cartBadge = document.getElementById('cart-badge');
const cartTotalPreview = document.getElementById('cart-total-preview');
const cartItemsContainer = document.getElementById('cart-items');
const cartEmptyMsg = document.getElementById('cart-empty-msg');
const cartSummary = document.getElementById('cart-summary');
const cartTotalDisplay = document.getElementById('cart-total');

const btnCheckout = document.getElementById('btn-checkout');
const toast = document.getElementById('toast');

// Customizer Modal Elements
const customizerOverlay = document.getElementById('customizer-overlay');
const customizerTitle = document.getElementById('customizer-title');
const customizerSubtitle = document.getElementById('customizer-subtitle');
const flavorsList = document.getElementById('flavors-list');
const closeCustomizerBtn = document.getElementById('close-customizer');
const confirmFlavorBtn = document.getElementById('btn-confirm-flavor');

// --- State ---
let currentCategory = 'promos';
let cart = {}; // key: unique string, value: { product, quantity, customizations }
let productToCustomize = null;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from LocalStorage
    const savedCart = localStorage.getItem('aquenidia_cart_v2');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartUI();
        } catch (e) {
            cart = {};
        }
    }
    renderMenu(currentCategory);
    setupEvents();
});

// --- Menu Rendering ---
function renderMenu(category) {
    productsGrid.innerHTML = '';
    
    // Define categories
    const categories = [
        { id: 'promos', title: '🔥 Combos y Promociones' },
        { id: 'sencillas', title: '<img src="img/empanada-icon-transparent.png" class="empanada-icon" alt="empanada"> Empanadas Sencillas' },
        { id: 'mixtas', title: '<img src="img/empanada-icon-transparent.png" class="empanada-icon" alt="empanada"> Empanadas Mixtas' },
        { id: 'bebidas', title: '🥤 Bebidas Refrescantes' }
    ];

    categories.forEach(cat => {
        const filtered = menuData.filter(p => p.categoryId === cat.id);
        if (filtered.length === 0) return;

        // Create Category Header
        const header = document.createElement('h3');
        header.className = 'category-header';
        header.innerHTML = cat.title;
        productsGrid.appendChild(header);

        // Optional category note for empanadas
        if (cat.id === 'sencillas' || cat.id === 'mixtas') {
            const note = document.createElement('div');
            note.className = 'category-note-inline';
            note.innerHTML = `✨ <strong>Personaliza el sabor de tus empanadas al agregarlas.</strong>`;
            productsGrid.appendChild(note);
        }

        filtered.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card fade-in';
            card.style.animationDelay = `${index * 0.1}s`;
            const imageSrc = product.image ? product.image : 'img/sencilla.jpg';
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${imageSrc}" alt="${product.title}" class="product-image">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-bottom">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        <button class="add-btn pulse-btn" onclick="handleAddClick('${product.id}')">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    });
}

// --- Event Listeners Setup ---
function setupEvents() {
    // Tab listeners removed since tabs are removed

    // Cart Modal Toggles
    floatingCart.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', (e) => {
        if(e.target === cartOverlay) closeCart();
    });

    // Customizer Modal Toggles
    closeCustomizerBtn.addEventListener('click', closeCustomizer);
    customizerOverlay.addEventListener('click', (e) => {
        if(e.target === customizerOverlay) closeCustomizer();
    });

    // Customizer Confirm
    confirmFlavorBtn.addEventListener('click', addToCartWithCustomization);

    // Delivery Type Toggle (Show/Hide address)
    const deliveryRadios = document.querySelectorAll('input[name="delivery_type"]');
    const addressGroup = document.getElementById('address_group');
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'delivery') {
                addressGroup.style.display = 'flex';
            } else {
                addressGroup.style.display = 'none';
            }
        });
    });

    // Checkout
    btnCheckout.addEventListener('click', processCheckout);
}

// --- Cart Actions ---
window.handleAddClick = (productId) => {
    const product = menuData.find(p => p.id === productId);
    if (!product) return;

    if (product.requiresCustomization) {
        openCustomizer(product);
    } else {
        addToCart(product, null);
    }
};

// --- Customizer Logic ---
function openCustomizer(product) {
    productToCustomize = product;
    flavorsList.innerHTML = '';
    confirmFlavorBtn.disabled = true;

    customizerTitle.innerText = `Personalizar ${product.title}`;

    if (product.requiresCustomization === 'sencilla') {
        customizerSubtitle.innerText = 'Selecciona 1 sabor para tu empanada.';
        flavors.forEach(flavor => {
            flavorsList.innerHTML += `
                <label class="flavor-option">
                    <input type="radio" name="sencilla_flavor" value="${flavor.name}" onchange="validateCustomizer()">
                    <span>${flavor.name}</span>
                </label>
            `;
        });
    } else if (product.requiresCustomization === 'mixta') {
        customizerSubtitle.innerText = 'Selecciona EXACTAMENTE 2 sabores.';
        flavors.forEach(flavor => {
            flavorsList.innerHTML += `
                <label class="flavor-option">
                    <input type="checkbox" name="mixta_flavor" value="${flavor.name}" onchange="validateCustomizer()">
                    <span>${flavor.name}</span>
                </label>
            `;
        });
    } else if (product.requiresCustomization === 'combo') {
        customizerSubtitle.innerText = 'Configura tu combo.';
        
        flavorsList.innerHTML += `<div style="font-weight:600; font-size:0.9rem; margin: 10px 0 5px; color: var(--primary);">Empanada 1</div>`;
        flavors.forEach(flavor => {
            flavorsList.innerHTML += `
                <label class="flavor-option" style="padding: 6px 15px;">
                    <input type="radio" name="combo_e1" value="${flavor.name}" onchange="validateCustomizer()">
                    <span style="font-size:0.9rem;">${flavor.name}</span>
                </label>
            `;
        });

        flavorsList.innerHTML += `<div style="font-weight:600; font-size:0.9rem; margin: 10px 0 5px; color: var(--primary);">Empanada 2</div>`;
        flavors.forEach(flavor => {
            flavorsList.innerHTML += `
                <label class="flavor-option" style="padding: 6px 15px;">
                    <input type="radio" name="combo_e2" value="${flavor.name}" onchange="validateCustomizer()">
                    <span style="font-size:0.9rem;">${flavor.name}</span>
                </label>
            `;
        });

        flavorsList.innerHTML += `<div style="font-weight:600; font-size:0.9rem; margin: 10px 0 5px; color: var(--primary);">Bebida</div>`;
        beverages.forEach(bev => {
            flavorsList.innerHTML += `
                <label class="flavor-option" style="padding: 6px 15px;">
                    <input type="radio" name="combo_bev" value="${bev.name}" onchange="validateCustomizer()">
                    <span style="font-size:0.9rem;">${bev.name}</span>
                </label>
            `;
        });
    }

    customizerOverlay.classList.add('active');
}

window.validateCustomizer = () => {
    if (!productToCustomize) return;

    if (productToCustomize.requiresCustomization === 'sencilla') {
        const selected = document.querySelector('input[name="sencilla_flavor"]:checked');
        confirmFlavorBtn.disabled = !selected;
    } else if (productToCustomize.requiresCustomization === 'mixta') {
        const checked = document.querySelectorAll('input[name="mixta_flavor"]:checked');
        confirmFlavorBtn.disabled = checked.length !== 2;
        
        // Disable unchecked if 2 are selected
        const allBoxes = document.querySelectorAll('input[name="mixta_flavor"]');
        allBoxes.forEach(box => {
            if (checked.length === 2 && !box.checked) {
                box.disabled = true;
                box.parentElement.style.opacity = '0.5';
            } else {
                box.disabled = false;
                box.parentElement.style.opacity = '1';
            }
        });
    } else if (productToCustomize.requiresCustomization === 'combo') {
        const e1 = document.querySelector('input[name="combo_e1"]:checked');
        const e2 = document.querySelector('input[name="combo_e2"]:checked');
        const bev = document.querySelector('input[name="combo_bev"]:checked');
        confirmFlavorBtn.disabled = !(e1 && e2 && bev);
    }
};

function addToCartWithCustomization() {
    if (!productToCustomize) return;

    let customizations = null;

    if (productToCustomize.requiresCustomization === 'sencilla') {
        const flavor = document.querySelector('input[name="sencilla_flavor"]:checked').value;
        customizations = { text: flavor, keyStr: flavor };
    } else if (productToCustomize.requiresCustomization === 'mixta') {
        const boxes = document.querySelectorAll('input[name="mixta_flavor"]:checked');
        const flavors = Array.from(boxes).map(b => b.value).sort();
        customizations = { text: flavors.join(' + '), keyStr: flavors.join('_') };
    } else if (productToCustomize.requiresCustomization === 'combo') {
        const e1 = document.querySelector('input[name="combo_e1"]:checked').value;
        const e2 = document.querySelector('input[name="combo_e2"]:checked').value;
        const bev = document.querySelector('input[name="combo_bev"]:checked').value;
        const text = `E1: ${e1} | E2: ${e2} | 🥤 ${bev}`;
        customizations = { text, keyStr: `${e1}_${e2}_${bev}` };
    }

    addToCart(productToCustomize, customizations);
    closeCustomizer();
}

function closeCustomizer() {
    customizerOverlay.classList.remove('active');
    productToCustomize = null;
}

// --- Cart Logic ---
function addToCart(product, customizations) {
    const customKeySuffix = customizations ? `-${customizations.keyStr.replace(/\s+/g, '')}` : '';
    const uniqueKey = `${product.id}${customKeySuffix}`;

    if (cart[uniqueKey]) {
        cart[uniqueKey].quantity += 1;
    } else {
        cart[uniqueKey] = {
            product: product,
            quantity: 1,
            customizations: customizations ? customizations.text : null
        };
    }

    updateCartUI();
    showToast();
}

window.changeQty = (key, change) => {
    if (!cart[key]) return;
    cart[key].quantity += change;
    if (cart[key].quantity <= 0) {
        delete cart[key];
    }
    updateCartUI();
};

function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;
    cartItemsContainer.innerHTML = '';

    const keys = Object.keys(cart);
    
    if (keys.length === 0) {
        cartEmptyMsg.style.display = 'block';
        cartSummary.style.display = 'none';
        document.getElementById('checkout-section').style.display = 'none';
        floatingCart.classList.remove('visible');
    } else {
        cartEmptyMsg.style.display = 'none';
        cartSummary.style.display = 'flex';
        document.getElementById('checkout-section').style.display = 'block';
        floatingCart.classList.add('visible');

        keys.forEach(key => {
            const item = cart[key];
            totalItems += item.quantity;
            const itemTotal = item.quantity * item.product.price;
            totalPrice += itemTotal;

            const notesHtml = item.customizations 
                ? `<div class="cart-item-notes">${item.customizations}</div>` 
                : '';

            const imageSrc = item.product.image ? item.product.image : 'img/sencilla.jpg';
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-image-wrap">
                    <img src="${imageSrc}" alt="${item.product.title}" class="cart-item-image">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.product.title}</div>
                    ${notesHtml}
                    <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn ${item.quantity === 1 ? 'trash' : ''}" onclick="changeQty('${key}', -1)">
                        <i class="fa-solid ${item.quantity === 1 ? 'fa-trash-can' : 'fa-minus'}"></i>
                    </button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQty('${key}', 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(el);
        });
    }

    cartBadge.innerText = totalItems;
    cartTotalPreview.innerText = `$${totalPrice.toFixed(2)}`;
    cartTotalDisplay.innerText = `$${totalPrice.toFixed(2)}`;

    localStorage.setItem('aquenidia_cart_v2', JSON.stringify(cart));
}

function openCart() {
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent bg scrolling
}

function closeCart() {
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// --- WhatsApp Checkout ---
function processCheckout() {
    const isDelivery = document.getElementById('type-delivery').checked;
    const name = document.getElementById('customer_name').value.trim();
    const address = document.getElementById('customer_address') ? document.getElementById('customer_address').value.trim() : '';
    const payment = document.getElementById('payment_method').value;

    if (!name) {
        alert('Por favor, ingresa tu Nombre y Apellido.');
        return;
    }
    if (isDelivery && !address) {
        alert('Por favor, ingresa tu dirección de entrega.');
        return;
    }
    if (!payment) {
        alert('Por favor, selecciona un método de pago.');
        return;
    }

    let text = `🌟 *NUEVO PEDIDO - A QUE NIDIA* 🌟\n\n`;
    text += `👤 *Cliente:* ${name}\n`;
    text += `🚚 *Tipo:* ${isDelivery ? 'Delivery' : 'Pick Up'}\n`;
    if (isDelivery) text += `📍 *Dirección:* ${address}\n`;
    text += `💳 *Pago:* ${payment}\n\n`;
    text += `🛒 *DETALLE DEL PEDIDO:*\n`;
    text += `---------------------------\n`;

    let total = 0;
    Object.values(cart).forEach(item => {
        const itemTotal = item.quantity * item.product.price;
        total += itemTotal;
        text += `▪️ ${item.quantity}x ${item.product.title} ($${itemTotal.toFixed(2)})`;
        if (item.customizations) {
            text += `\n   ↳ 🥟 _${item.customizations}_`;
        }
        text += `\n`;
    });

    text += `---------------------------\n`;
    text += `💰 *TOTAL A PAGAR: $${total.toFixed(2)}*`;
    if (isDelivery) {
        text += `\n🛵 _(El costo de delivery se confirma por aquí)_`;
    }

    const phone = "584148342756";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    
    // Clear cart and redirect
    cart = {};
    updateCartUI();
    closeCart();
    window.open(url, '_blank');
}
