// Sistema de Área de Entrega
class DeliveryAreaSystem {
    constructor() {
        this.neighborhoods = [
            { name: 'Centro', distance: 0 },
            { name: 'Vila Aratimbo', distance: 1 },
            { name: 'Vila Nova', distance: 1 },
            { name: 'Vila Cascata', distance: 1 },
            { name: 'Jardim Portal das Flores', distance: 1.5 },
            { name: 'Jardim Portal das Flores II', distance: 1.5 },
            { name: 'Parque Veneza', distance: 2 },
            { name: 'Parque Pioneiro Wielewik', distance: 2 },
            { name: 'Jardim Paris', distance: 2.5 },
            { name: 'Jardim Santa Alice', distance: 2.5 },
            { name: 'Vila Natal', distance: 3 },
            { name: 'Condomínio Residencial Italian Ville', distance: 3 },
            { name: 'Golden Garden Residence Condomínio', distance: 3 },
            { name: 'Jardim Primavera', distance: 3.5 },
            { name: 'Jardim Aeroporto', distance: 3.5 },
            { name: 'Jardim Caravelle', distance: 4 },
            { name: 'Jardim Bela Vista', distance: 4 },
            { name: 'Jardim Dona Martinha', distance: 4 },
            { name: 'Gleba Arapongas', distance: 4.5 },
            { name: 'Parque Industrial V', distance: 4.5 },
            { name: 'Jardim Caravelle II', distance: 5 },
            { name: 'Conjunto Tropical', distance: 5 },
            { name: 'Jardim Universitário', distance: 5.5 },
            { name: 'Jardim Arapongas', distance: 5.5 },
            { name: 'Jardim Santa Cecília', distance: 6 },
            { name: 'Jardim Dona Pina', distance: 6 },
            { name: 'Vila Triângulo', distance: 6.5 },
            { name: 'Jardim Petrópolis', distance: 6.5 },
            { name: 'Jardim dos Pássaros', distance: 7 },
            { name: 'Jardim Mônaco', distance: 7 },
            { name: 'Jardim Universidade', distance: 7.5 },
            { name: 'Jardim Paraná', distance: 7.5 },
            { name: 'Spazi Condomínio', distance: 8 },
            { name: 'Parque Industrial I', distance: 8.5 },
            { name: 'Campinho', distance: 9 },
            { name: 'Parque Industrial II', distance: 9.5 },
            { name: 'Jardim Bandeirantes', distance: 10 },
            { name: 'Jardim Bononi', distance: 10 },
            { name: 'Jardim Recanto das Flores', distance: 10.5 },
            { name: 'Conjunto Del Condor', distance: 11 },
            { name: 'Conjunto Flamingos', distance: 11 },
            { name: 'Jardim Novo Flamingos', distance: 11.5 },
            { name: 'Jardim San Rafael', distance: 12 },
            { name: 'Jardim San Rafael II', distance: 12.5 },
            { name: 'Vila Coelho', distance: 13 },
            { name: 'Jardim San Rafael III', distance: 13.5 },
            { name: 'Conjunto Flamingos III', distance: 14 },
            { name: 'Conjunto Águias', distance: 14.5 },
            { name: 'Parque Industrial', distance: 15 },
            { name: 'Parque Industrial Araucária', distance: 15 }
        ];
        
        this.selectedNeighborhood = null;
        this.deliveryFee = 4.99;
        this.filteredNeighborhoods = [...this.neighborhoods];
        
        this.init();
    }
    
    init() {
        this.renderNeighborhoods();
        this.bindEvents();
        // REMOVIDO: loadSavedNeighborhood() - Agora sempre mostra a tela inicial
    }
    
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('neighborhoodSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterNeighborhoods(e.target.value);
            });
        }
        
        // Change address button
        const changeAddressBtn = document.getElementById('changeAddressBtn');
        if (changeAddressBtn) {
            changeAddressBtn.addEventListener('click', () => {
                this.showWelcomeScreen();
            });
        }
    }
    
    renderNeighborhoods() {
        const grid = document.getElementById('neighborhoodsGrid');
        if (!grid) return;
        
        grid.innerHTML = this.filteredNeighborhoods.map(neighborhood => `
            <div class="neighborhood-card" data-name="${neighborhood.name}" data-distance="${neighborhood.distance}">
                <div class="neighborhood-info">
                    <h3>${neighborhood.name}</h3>
                    <div class="neighborhood-distance">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>~${neighborhood.distance} km</span>
                    </div>
                    <div class="neighborhood-fee">
                        <i class="fas fa-motorcycle"></i>
                        <span>R$ ${this.calculateDeliveryFee(neighborhood.distance).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
                <button class="choose-location-btn" data-name="${neighborhood.name}" data-distance="${neighborhood.distance}">
                    <i class="fas fa-check"></i>
                    Escolher Localização
                </button>
            </div>
        `).join('');
        
        // Add click events to choose location buttons
        grid.querySelectorAll('.choose-location-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = button.getAttribute('data-name');
                const distance = parseFloat(button.getAttribute('data-distance'));
                this.selectNeighborhoodByData(name, distance);
            });
        });
        
        // Add click events to neighborhood cards (for backward compatibility)
        grid.querySelectorAll('.neighborhood-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Only trigger if the click wasn't on the button
                if (!e.target.closest('.choose-location-btn')) {
                    this.selectNeighborhood(card);
                }
            });
        });
    }
    
    filterNeighborhoods(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term === '') {
            this.filteredNeighborhoods = [...this.neighborhoods];
        } else {
            this.filteredNeighborhoods = this.neighborhoods.filter(neighborhood =>
                neighborhood.name.toLowerCase().includes(term)
            );
        }
        
        this.renderNeighborhoods();
    }
    
    selectNeighborhood(card) {
        // Remove previous selection
        document.querySelectorAll('.neighborhood-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Add selection to clicked card
        card.classList.add('selected');
        
        // Store selected neighborhood
        const name = card.getAttribute('data-name');
        const distance = parseFloat(card.getAttribute('data-distance'));
        
        this.selectedNeighborhood = {
            name: name,
            distance: distance
        };
        
        this.deliveryFee = this.calculateDeliveryFee(distance);
        
        // REMOVIDO: saveNeighborhood() - Não salva mais no localStorage
        
        // Proceed to menu after a short delay
        setTimeout(() => {
            this.proceedToMenu();
        }, 500);
    }
    
    selectNeighborhoodByData(name, distance) {
        this.selectedNeighborhood = {
            name: name,
            distance: distance
        };
        
        this.deliveryFee = this.calculateDeliveryFee(distance);
        
        // REMOVIDO: saveNeighborhood() - Não salva mais no localStorage
        
        // Proceed to menu
        this.proceedToMenu();
    }
    
    calculateDeliveryFee(distance) {
        if (distance <= 5) {
            return 4.99;
        } else if (distance <= 10) {
            return 7.99;
        } else {
            return 15.99;
        }
    }
    
    proceedToMenu() {
        if (!this.selectedNeighborhood) return;
        
        // Hide welcome screen
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (welcomeScreen && mainApp) {
            welcomeScreen.style.display = 'none';
            mainApp.style.display = 'block';
            
            // Update delivery info in header
            this.updateDeliveryInfo();
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    }
    
    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (welcomeScreen && mainApp) {
            mainApp.style.display = 'none';
            welcomeScreen.style.display = 'flex';
            
            // Clear selection
            document.querySelectorAll('.neighborhood-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // Reset search
            const searchInput = document.getElementById('neighborhoodSearch');
            if (searchInput) {
                searchInput.value = '';
                this.filterNeighborhoods('');
            }
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    }
    
    updateDeliveryInfo() {
        // Update delivery fee display
        const deliveryFeeDisplay = document.getElementById('deliveryFeeDisplay');
        if (deliveryFeeDisplay) {
            deliveryFeeDisplay.innerHTML = `<i class="fas fa-motorcycle"></i> Entrega R$ ${this.deliveryFee.toFixed(2).replace('.', ',')}`;
        }
        
        // Update selected neighborhood display
        const neighborhoodName = document.getElementById('neighborhoodName');
        if (neighborhoodName) {
            neighborhoodName.textContent = this.selectedNeighborhood.name;
        }
        
        // Update cart delivery fee
        const deliveryFeeCart = document.getElementById('deliveryFeeCart');
        if (deliveryFeeCart) {
            deliveryFeeCart.textContent = `R$ ${this.deliveryFee.toFixed(2).replace('.', ',')}`;
        }
    }
    
    // REMOVIDO: saveNeighborhood() e loadSavedNeighborhood() - Não usa mais localStorage
    
    getDeliveryFee() {
        return this.deliveryFee;
    }
    
    getSelectedNeighborhood() {
        return this.selectedNeighborhood;
    }
}

// Sistema de Carrinho Atualizado
class Cart {
    constructor() {
        this.items = [];
        this.currentCustomization = null;
        this.currentDrinkSelection = null;
        this.availableAddons = {
            hamburgueres: [
                { name: 'Cheddar Extra', price: 3.50 },
                { name: 'Hambúrguer Artesanal Extra', price: 8.00 },
                { name: 'Onion Rings', price: 4.50 },
                { name: 'Queijo Suíço', price: 4.00 },
                { name: 'Catupiry', price: 3.00 },
                { name: 'Bacon Crocante', price: 5.00 },
                { name: 'Ovo Frito', price: 2.50 },
                { name: 'Abacaxi Grelhado', price: 3.00 }
            ]
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCartDisplay();
        this.loadFromLocalStorage();
        this.updateFloatingCart();
    }

    bindEvents() {
        // Add to cart buttons
        document.querySelectorAll('.add-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const name = e.target.closest('.add-btn').getAttribute('data-name');
                const price = parseFloat(e.target.closest('.add-btn').getAttribute('data-price'));
                const image = e.target.closest('.add-btn').getAttribute('data-image');
                const category = e.target.closest('.add-btn').getAttribute('data-category');
                const hasOptions = e.target.closest('.add-btn').getAttribute('data-has-options');
                
                if (!name || isNaN(price) || !image) {
                    console.error('Invalid product data:', { name, price, image, category });
                    return;
                }
                
                if (hasOptions === 'true') {
                    this.openDrinkSelection(name, price, image, category);
                } else if (category === 'hamburgueres') {
                    this.openCustomization(name, price, image, category);
                } else {
                    this.addItem(name, price, image, [], '');
                    this.showAddedFeedback(e.target.closest('.add-btn'));
                }
            });
        });

        // Floating cart click
        const floatingCart = document.getElementById('floatingCart');
        if (floatingCart) {
            floatingCart.addEventListener('click', () => {
                this.openCart();
            });
        }

        // Drink selection modal events
        const closeDrinkSelection = document.getElementById('closeDrinkSelection');
        if (closeDrinkSelection) {
            closeDrinkSelection.addEventListener('click', () => {
                this.closeDrinkSelection();
            });
        }

        const drinkSelectionModal = document.getElementById('drinkSelectionModal');
        if (drinkSelectionModal) {
            drinkSelectionModal.addEventListener('click', (e) => {
                if (e.target === drinkSelectionModal) {
                    this.closeDrinkSelection();
                }
            });
        }

        // Drink option selection
        document.querySelectorAll('.drink-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const drinkType = e.target.closest('.drink-option').getAttribute('data-drink');
                this.selectDrink(drinkType);
            });
        });

        // Customization modal events
        const closeCustomization = document.getElementById('closeCustomization');
        if (closeCustomization) {
            closeCustomization.addEventListener('click', () => {
                this.closeCustomization();
            });
        }

        const customizationModal = document.getElementById('customizationModal');
        if (customizationModal) {
            customizationModal.addEventListener('click', (e) => {
                if (e.target === customizationModal) {
                    this.closeCustomization();
                }
            });
        }

        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addCustomizedItem();
            });
        }

        // Close cart
        const closeCart = document.getElementById('closeCart');
        if (closeCart) {
            closeCart.addEventListener('click', () => {
                this.closeCart();
            });
        }

        // Cart modal overlay
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    this.closeCart();
                }
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.processOrder();
            });
        }

        // Payment method change
        const paymentMethod = document.getElementById('paymentMethod');
        if (paymentMethod) {
            paymentMethod.addEventListener('change', (e) => {
                const changeGroup = document.getElementById('changeGroup');
                if (changeGroup) {
                    if (e.target.value === 'dinheiro') {
                        changeGroup.style.display = 'block';
                    } else {
                        changeGroup.style.display = 'none';
                        const needChange = document.getElementById('needChange');
                        if (needChange) needChange.checked = false;
                        const changeAmount = document.getElementById('changeAmount');
                        if (changeAmount) changeAmount.style.display = 'none';
                    }
                }
            });
        }

        // Need change checkbox
        const needChange = document.getElementById('needChange');
        if (needChange) {
            needChange.addEventListener('change', (e) => {
                const changeAmount = document.getElementById('changeAmount');
                if (changeAmount) {
                    changeAmount.style.display = e.target.checked ? 'block' : 'none';
                }
            });
        }

        // Form validation
        this.bindFormValidation();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
                this.closeCustomization();
                this.closeDrinkSelection();
            }
        });
    }

    openDrinkSelection(name, price, image, category) {
        this.currentDrinkSelection = {
            name: name,
            price: price,
            image: image,
            category: category
        };

        const modal = document.getElementById('drinkSelectionModal');
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeDrinkSelection() {
        const modal = document.getElementById('drinkSelectionModal');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
        this.currentDrinkSelection = null;
    }

    selectDrink(drinkType) {
        if (!this.currentDrinkSelection) return;

        const fullName = `${this.currentDrinkSelection.name} - ${drinkType}`;
        
        this.addItem(
            fullName,
            this.currentDrinkSelection.price,
            this.currentDrinkSelection.image,
            [],
            ''
        );

        this.closeDrinkSelection();
        this.showSuccessMessage(`${drinkType} adicionado ao carrinho!`);
    }

    openCustomization(name, price, image, category) {
        this.currentCustomization = {
            name: name || 'Produto',
            basePrice: price || 0,
            image: image || '',
            category: category || 'hamburgueres',
            addons: [],
            specialInstructions: ''
        };

        const customizationTitle = document.getElementById('customizationTitle');
        if (customizationTitle) {
            customizationTitle.textContent = `Personalizar ${this.currentCustomization.name}`;
        }
        
        this.renderAddons();
        this.updateCustomizationTotal();
        
        const modal = document.getElementById('customizationModal');
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCustomization() {
        const modal = document.getElementById('customizationModal');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
        this.currentCustomization = null;
        const specialInstructions = document.getElementById('specialInstructions');
        if (specialInstructions) {
            specialInstructions.value = '';
        }
    }

    renderAddons() {
        const container = document.getElementById('addonsContainer');
        if (!container || !this.currentCustomization) return;
        
        const addons = this.availableAddons[this.currentCustomization.category] || [];
        
        container.innerHTML = addons.map(addon => `
            <div class="addon-item">
                <div class="addon-info">
                    <div class="addon-name">${addon.name}</div>
                    <div class="addon-price">+ R$ ${addon.price.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="addon-controls">
                    <button class="addon-btn" onclick="cart.updateAddon('${addon.name}', ${addon.price}, -1)" disabled>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="addon-quantity">0</span>
                    <button class="addon-btn" onclick="cart.updateAddon('${addon.name}', ${addon.price}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateAddon(name, price, change) {
        if (!this.currentCustomization) return;

        const existingAddon = this.currentCustomization.addons.find(addon => addon.name === name);
        
        if (existingAddon) {
            existingAddon.quantity += change;
            if (existingAddon.quantity <= 0) {
                this.currentCustomization.addons = this.currentCustomization.addons.filter(addon => addon.name !== name);
            }
        } else if (change > 0) {
            this.currentCustomization.addons.push({
                name: name,
                price: price,
                quantity: change
            });
        }

        this.updateAddonDisplay(name);
        this.updateCustomizationTotal();
    }

    updateAddonDisplay(addonName) {
        const addonItems = document.querySelectorAll('.addon-item');
        addonItems.forEach(item => {
            const nameElement = item.querySelector('.addon-name');
            if (nameElement && nameElement.textContent === addonName) {
                const quantityElement = item.querySelector('.addon-quantity');
                const minusBtn = item.querySelector('.addon-btn');
                
                const addon = this.currentCustomization.addons.find(a => a.name === addonName);
                const quantity = addon ? addon.quantity : 0;
                
                if (quantityElement) quantityElement.textContent = quantity;
                if (minusBtn) minusBtn.disabled = quantity <= 0;
            }
        });
    }

    updateCustomizationTotal() {
        if (!this.currentCustomization) return;

        const addonsTotal = this.currentCustomization.addons.reduce((sum, addon) => {
            return sum + (addon.price * addon.quantity);
        }, 0);

        const total = this.currentCustomization.basePrice + addonsTotal;
        const customizationTotal = document.getElementById('customizationTotal');
        if (customizationTotal) {
            customizationTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
    }

    addCustomizedItem() {
        if (!this.currentCustomization) return;

        const specialInstructions = document.getElementById('specialInstructions');
        const instructions = specialInstructions ? specialInstructions.value.trim() : '';
        this.currentCustomization.specialInstructions = instructions;

        const addonsTotal = this.currentCustomization.addons.reduce((sum, addon) => {
            return sum + (addon.price * addon.quantity);
        }, 0);

        const finalPrice = this.currentCustomization.basePrice + addonsTotal;

        this.addItem(
            this.currentCustomization.name,
            finalPrice,
            this.currentCustomization.image,
            this.currentCustomization.addons,
            instructions
        );

        this.closeCustomization();
        this.showSuccessMessage('Item personalizado adicionado ao carrinho!');
    }

    addItem(name, price, image, addons = [], specialInstructions = '') {
        if (!name || typeof name !== 'string') {
            console.error('Invalid item name:', name);
            return;
        }
        
        if (isNaN(price) || price <= 0) {
            console.error('Invalid item price:', price);
            return;
        }
        
        if (!image || typeof image !== 'string') {
            console.error('Invalid item image:', image);
            return;
        }

        const itemId = this.generateItemId(name, addons, specialInstructions);
        const existingItem = this.items.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: itemId,
                name: name,
                price: price,
                image: image,
                quantity: 1,
                addons: addons || [],
                specialInstructions: specialInstructions || ''
            });
        }
        
        this.updateCartDisplay();
        this.updateFloatingCart();
        this.saveToLocalStorage();
    }

    generateItemId(name, addons, specialInstructions) {
        const addonsString = (addons || []).map(addon => `${addon.name}:${addon.quantity}`).join(',');
        return `${name}-${addonsString}-${specialInstructions || ''}`.replace(/\s+/g, '-').toLowerCase();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.updateCartDisplay();
        this.updateFloatingCart();
        this.saveToLocalStorage();
    }

    updateQuantity(itemId, quantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.updateCartDisplay();
                this.updateFloatingCart();
                this.saveToLocalStorage();
            }
        }
    }

    updateFloatingCart() {
        const floatingCart = document.getElementById('floatingCart');
        const floatingCartCount = document.getElementById('floatingCartCount');
        const floatingCartTotal = document.getElementById('floatingCartTotal');

        if (!floatingCart || !floatingCartCount || !floatingCartTotal) return;

        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = window.deliverySystem ? window.deliverySystem.getDeliveryFee() : 4.99;
        const totalAmount = totalItems > 0 ? subtotalAmount + deliveryFee : 0;

        floatingCartCount.textContent = totalItems;
        floatingCartTotal.textContent = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;

        if (totalItems > 0) {
            floatingCart.classList.add('visible');
        } else {
            floatingCart.classList.remove('visible');
        }
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartForm = document.getElementById('cartForm');
        const subtotal = document.getElementById('subtotal');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const deliveryFeeCart = document.getElementById('deliveryFeeCart');

        if (!cartItems || !subtotal || !cartTotal) return;

        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = window.deliverySystem ? window.deliverySystem.getDeliveryFee() : 4.99;
        const totalAmount = totalItems > 0 ? subtotalAmount + deliveryFee : 0;

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Seu carrinho está vazio</p>
                    <small>Adicione itens do cardápio</small>
                </div>
            `;
            if (cartForm) cartForm.style.display = 'none';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image || ''}" alt="${item.name || 'Produto'}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyMCIgZmlsbD0iI2ZmZDcwMCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Rm90bzwvdGV4dD4KPC9zdmc+'">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name || 'Produto'}</h4>
                        ${this.renderCartItemCustomizations(item)}
                        <div class="cart-item-price">R$ ${((item.price || 0) * item.quantity).toFixed(2).replace('.', ',')}</div>
                        <div class="cart-item-actions">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="remove-item-btn" onclick="cart.removeItem('${item.id}')">
                                <i class="fas fa-trash"></i> Remover
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            if (cartForm) cartForm.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = !this.isFormValid();
        }

        subtotal.textContent = `R$ ${subtotalAmount.toFixed(2).replace('.', ',')}`;
        cartTotal.textContent = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
        
        if (deliveryFeeCart) {
            deliveryFeeCart.textContent = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
        }
    }

    renderCartItemCustomizations(item) {
        let customizations = '';
        
        if (item.addons && item.addons.length > 0) {
            const addonsText = item.addons.map(addon => `${addon.name} (${addon.quantity}x)`).join(', ');
            customizations += `<div class="cart-item-customizations">+ ${addonsText}</div>`;
        }
        
        if (item.specialInstructions) {
            customizations += `<div class="cart-item-customizations">Obs: ${item.specialInstructions}</div>`;
        }
        
        return customizations;
    }

    openCart() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    isFormValid() {
        const name = document.getElementById('customerName');
        const address = document.getElementById('customerAddress');
        const paymentMethod = document.getElementById('paymentMethod');
        
        return name && address && paymentMethod && 
               name.value.trim() && address.value.trim() && paymentMethod.value && 
               this.items.length > 0;
    }

    bindFormValidation() {
        const inputs = ['customerName', 'customerAddress', 'paymentMethod'];
        
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.validateForm();
                });
                input.addEventListener('change', () => {
                    this.validateForm();
                });
            }
        });
    }

    validateForm() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = !this.isFormValid();
        }
    }

    processOrder() {
        if (!this.isFormValid()) {
            this.showError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const customerName = document.getElementById('customerName').value.trim();
        const customerAddress = document.getElementById('customerAddress').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;
        const needChange = document.getElementById('needChange').checked;
        const changeValue = document.getElementById('changeValue').value;
        const orderNotes = document.getElementById('orderNotes').value.trim();

        // Get delivery info
        const selectedNeighborhood = window.deliverySystem ? window.deliverySystem.getSelectedNeighborhood() : null;
        const deliveryFee = window.deliverySystem ? window.deliverySystem.getDeliveryFee() : 4.99;

        // Generate WhatsApp message
        let message = '🍔 *PEDIDO - SMASH PRIME BURGERS* 🍔\n\n';
        
        message += '📋 *ITENS SOLICITADOS:*\n';
        this.items.forEach((item, index) => {
            message += `${index + 1}. *${item.name || 'Produto'}*\n`;
            message += `   Quantidade: ${item.quantity} unidade(s)\n`;
            message += `   Valor unitário: R$ ${(item.price || 0).toFixed(2).replace('.', ',')}\n`;
            message += `   Subtotal: R$ ${((item.price || 0) * item.quantity).toFixed(2).replace('.', ',')}\n`;
            
            if (item.addons && item.addons.length > 0) {
                message += `   Adicionais: ${item.addons.map(addon => `${addon.name} (${addon.quantity}x)`).join(', ')}\n`;
            }
            
            if (item.specialInstructions) {
                message += `   Observações: ${item.specialInstructions}\n`;
            }
            
            message += '\n';
        });

        const subtotalAmount = this.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
        const totalAmount = subtotalAmount + deliveryFee;

        message += '💰 *TOTAL DA COMPRA:*\n';
        message += `Subtotal dos itens: R$ ${subtotalAmount.toFixed(2).replace('.', ',')}\n`;
        message += `Taxa de entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
        message += `*VALOR TOTAL: R$ ${totalAmount.toFixed(2).replace('.', ',')}*\n\n`;

        message += '📍 *DADOS PARA ENTREGA:*\n';
        message += `Cliente: ${customerName}\n`;
        message += `Endereço: ${customerAddress}\n`;
        if (selectedNeighborhood) {
            message += `Bairro: ${selectedNeighborhood.name}\n`;
        }
        message += '\n';

        message += '💳 *FORMA DE PAGAMENTO:*\n';
        const paymentLabels = {
            'pix': 'PIX',
            'cartao': 'Cartão de crédito/débito (na entrega)',
            'dinheiro': 'Dinheiro'
        };
        message += `Método: ${paymentLabels[paymentMethod]}\n`;

        if (paymentMethod === 'dinheiro' && needChange) {
            message += `Troco para: R$ ${parseFloat(changeValue || 0).toFixed(2).replace('.', ',')}\n`;
        }

        if (orderNotes) {
            message += `\n📝 *OBSERVAÇÕES ADICIONAIS:*\n${orderNotes}\n`;
        }

        message += '\n✅ *Pedido enviado automaticamente pelo site*';

        // WhatsApp number
        const whatsappNumber = '5543920011899';
        
        // Redirect to WhatsApp
        this.redirectToWhatsApp(whatsappNumber, message);
        
        // Show success modal
        this.showSuccessModal();
        
        // Clear cart after delay
        setTimeout(() => {
            this.clearCart();
            this.closeCart();
            this.hideSuccessModal();
        }, 3000);
    }

    redirectToWhatsApp(phoneNumber, message) {
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    clearCart() {
        this.items = [];
        this.updateCartDisplay();
        this.updateFloatingCart();
        this.saveToLocalStorage();
        this.clearForm();
    }

    clearForm() {
        const elements = [
            'customerName', 'customerAddress', 'paymentMethod', 
            'needChange', 'changeValue', 'orderNotes'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = false;
                } else {
                    element.value = '';
                }
            }
        });
        
        const changeGroup = document.getElementById('changeGroup');
        const changeAmount = document.getElementById('changeAmount');
        if (changeGroup) changeGroup.style.display = 'none';
        if (changeAmount) changeAmount.style.display = 'none';
    }

    showAddedFeedback(button) {
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
        button.style.background = 'linear-gradient(135deg, #32d74b, #28a745)';
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.style.background = '';
        }, 1500);
    }

    showSuccessModal() {
        const successModal = document.getElementById('successModal');
        const successMessage = document.getElementById('successMessage');
        if (successModal && successMessage) {
            successMessage.textContent = 'Pedido enviado! Você será redirecionado para o WhatsApp automaticamente.';
            successModal.classList.add('open');
        }
    }

    hideSuccessModal() {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.classList.remove('open');
        }
    }

    showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #32d74b, #28a745);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            border: 2px solid #ffd700;
            z-index: 4000;
            font-weight: 600;
            box-shadow: 0 6px 20px rgba(50, 215, 75, 0.4);
            animation: slideInRight 0.3s ease;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #dc143c, #b91c3c);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            border: 2px solid #ffd700;
            z-index: 4000;
            font-weight: 600;
            box-shadow: 0 6px 20px rgba(220, 20, 60, 0.4);
            animation: slideInRight 0.3s ease;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }, 4000);
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('smashPrimeCart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('smashPrimeCart');
            if (saved) {
                const parsedItems = JSON.parse(saved);
                
                this.items = parsedItems.map(item => ({
                    id: item.id || this.generateItemId(item.name || 'Produto', item.addons || [], item.specialInstructions || ''),
                    name: item.name || 'Produto',
                    price: parseFloat(item.price) || 0,
                    image: item.image || '',
                    quantity: parseInt(item.quantity) || 0,
                    addons: item.addons || [],
                    specialInstructions: item.specialInstructions || ''
                })).filter(item => item.name && item.price > 0 && item.quantity > 0);
                
                this.updateCartDisplay();
                this.updateFloatingCart();
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            localStorage.removeItem('smashPrimeCart');
            this.items = [];
            this.updateCartDisplay();
            this.updateFloatingCart();
        }
    }
}

// Animações para itens do menu
function setupMenuItemsAnimation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    menuItems.forEach(item => {
        observer.observe(item);
    });
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize delivery system
    window.deliverySystem = new DeliveryAreaSystem();
    
    // Initialize cart
    window.cart = new Cart();
    
    // Setup animations
    setupMenuItemsAnimation();
});

// Save cart state when page is closed
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.cart) {
        window.cart.saveToLocalStorage();
    }
});

// Debounce function for optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}