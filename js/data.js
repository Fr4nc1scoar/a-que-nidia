// --- DATOS DEL MENÚ (A QUE NIDIA) ---

const flavors = [
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
    { id: 'chinotto', name: 'Chinotto' }
];

const menuData = [
    {
        id: 'promo_combo',
        categoryId: 'promos',
        title: 'Combo 2+1 Refresco',
        description: '2 empanadas clásicas (sabor a elegir) + 1 Vaso de Refresco.',
        price: 2.00,
        emoji: '🔥',
        image: 'img/combo.jpg',
        requiresCustomization: 'combo'
    },
    {
        id: 'sencilla',
        categoryId: 'sencillas',
        title: 'Empanada Sencilla',
        description: 'Deliciosa empanada frita con 1 relleno a tu elección.',
        price: 1.00,
        emoji: '🥟',
        image: 'img/sencilla.jpg',
        requiresCustomization: 'sencilla'
    },
    {
        id: 'mixta',
        categoryId: 'mixtas',
        title: 'Empanada Mixta',
        description: 'Combina tus antojos con 2 rellenos a tu elección.',
        price: 1.50,
        emoji: '🥟',
        image: 'img/mixta.jpg',
        requiresCustomization: 'mixta'
    },
    {
        id: 'refresco',
        categoryId: 'bebidas',
        title: 'Refresco Individual',
        description: 'Lata o vaso de refresco bien frío.',
        price: 1.00,
        emoji: '🥤',
        image: 'img/refresco.jpg',
        requiresCustomization: null
    },
    {
        id: 'malta',
        categoryId: 'bebidas',
        title: 'Malta Fría',
        description: 'Malta clásica fría.',
        price: 1.00,
        emoji: '🧃',
        image: 'img/malta.jpg',
        requiresCustomization: null
    }
];
