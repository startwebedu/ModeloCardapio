// Sistema de Disponibilidade Universal com Sincronização
class RestaurantAvailability {
    constructor() {
        this.businessHours = {
            monday: { open: '18:00', close: '23:00' },
            tuesday: { open: '18:00', close: '23:00' },
            wednesday: { open: '18:00', close: '23:00' },
            thursday: { open: '18:00', close: '23:00' },
            friday: { open: '18:00', close: '23:00' },
            saturday: { open: '18:00', close: '23:30' },
            sunday: { open: '18:00', close: '23:30' }
        };
        
        this.holidays = [
            '2024-01-01', '2024-04-21', '2024-05-01', '2024-09-07',
            '2024-10-12', '2024-11-02', '2024-11-15', '2024-12-25',
            '2025-01-01', '2025-04-21', '2025-05-01', '2025-09-07',
            '2025-10-12', '2025-11-02', '2025-11-15', '2025-12-25'
        ];
        
        this.manualClosure = false;
        this.forceOpen = false;
        this.closureReason = '';
        this.countdownInterval = null;
        this.bannerClosed = false;
        this.syncInterval = null;
        
        this.loadSettings();
        this.init();
        this.startUniversalSync();
    }
    
    init() {
        this.updateAvailabilityStatus();
        this.startCountdown();
        this.bindBannerEvents();
        
        // Atualizar status a cada minuto
        setInterval(() => {
            this.updateAvailabilityStatus();
        }, 60000);
    }
    
    // Sistema de sincronização universal usando localStorage e eventos
    startUniversalSync() {
        // Verificar mudanças a cada 2 segundos
        this.syncInterval = setInterval(() => {
            this.checkForUniversalChanges();
        }, 2000);
        
        // Escutar mudanças no localStorage de outras abas
        window.addEventListener('storage', (e) => {
            if (e.key === 'restaurantSettings' || e.key === 'restaurantStatusChange') {
                this.loadSettings();
                this.updateAvailabilityStatus();
            }
        });
        
        // Escutar eventos customizados para mudanças na mesma aba
        window.addEventListener('restaurantStatusChanged', () => {
            this.loadSettings();
            this.updateAvailabilityStatus();
        });
    }
    
    checkForUniversalChanges() {
        const lastChange = localStorage.getItem('restaurantStatusChange');
        const currentTime = Date.now();
        
        // Se houve uma mudança nos últimos 5 segundos, sincronizar
        if (lastChange && (currentTime - parseInt(lastChange)) < 5000) {
            this.loadSettings();
            this.updateAvailabilityStatus();
        }
    }
    
    broadcastStatusChange() {
        // Marcar timestamp da mudança para sincronização universal
        localStorage.setItem('restaurantStatusChange', Date.now().toString());
        
        // Disparar evento customizado para outras instâncias na mesma aba
        window.dispatchEvent(new CustomEvent('restaurantStatusChanged'));
        
        // Forçar evento de storage para outras abas
        localStorage.setItem('restaurantStatusChange', Date.now().toString());
    }
    
    bindBannerEvents() {
        const closeBanner = document.getElementById('closeBanner');
        if (closeBanner) {
            closeBanner.addEventListener('click', () => {
                this.closeBanner();
            });
        }
    }
    
    closeBanner() {
        const banner = document.getElementById('availabilityBanner');
        if (banner) {
            banner.style.display = 'none';
            document.body.classList.remove('banner-visible');
            this.bannerClosed = true;
        }
    }
    
    loadSettings() {
        const saved = localStorage.getItem('restaurantSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.manualClosure = settings.manualClosure || false;
            this.forceOpen = settings.forceOpen || false;
            this.closureReason = settings.closureReason || '';
        }
    }
    
    saveSettings() {
        const settings = {
            manualClosure: this.manualClosure,
            forceOpen: this.forceOpen,
            closureReason: this.closureReason,
            timestamp: Date.now()
        };
        localStorage.setItem('restaurantSettings', JSON.stringify(settings));
        this.broadcastStatusChange();
    }
    
    isHoliday(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.holidays.includes(dateStr);
    }
    
    isWithinBusinessHours(date = new Date()) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[date.getDay()];
        const hours = this.businessHours[dayName];
        
        if (!hours) return false;
        
        const currentTime = date.getHours() * 60 + date.getMinutes();
        const openTime = this.parseTime(hours.open);
        const closeTime = this.parseTime(hours.close);
        
        return currentTime >= openTime && currentTime <= closeTime;
    }
    
    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    isOpen() {
        const now = new Date();
        
        if (this.forceOpen) return true;
        if (this.manualClosure) return false;
        if (this.isHoliday(now)) return false;
        
        return this.isWithinBusinessHours(now);
    }
    
    getNextOpenTime() {
        const now = new Date();
        let nextOpen = new Date(now);
        
        if (this.manualClosure || this.forceOpen) return null;
        
        for (let i = 0; i < 7; i++) {
            if (i > 0) nextOpen.setDate(nextOpen.getDate() + 1);
            
            if (!this.isHoliday(nextOpen)) {
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const dayName = dayNames[nextOpen.getDay()];
                const hours = this.businessHours[dayName];
                
                if (hours) {
                    const [openHour, openMinute] = hours.open.split(':').map(Number);
                    nextOpen.setHours(openHour, openMinute, 0, 0);
                    
                    if (i === 0 && nextOpen > now) return nextOpen;
                    else if (i > 0) return nextOpen;
                }
            }
        }
        return null;
    }
    
    updateAvailabilityStatus() {
        const isOpen = this.isOpen();
        const banner = document.getElementById('availabilityBanner');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const addButtons = document.querySelectorAll('.add-btn');
        
        if (isOpen) {
            statusIndicator.className = 'status-indicator open';
            statusText.textContent = 'Aberto';
            
            if (banner && !this.bannerClosed) {
                banner.style.display = 'none';
                document.body.classList.remove('banner-visible');
            }
            
            addButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
        } else {
            statusIndicator.className = 'status-indicator closed';
            statusText.textContent = 'Fechado';
            
            if (!this.bannerClosed) {
                this.showUnavailableBanner();
            }
            
            addButtons.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            });
        }
    }
    
    showUnavailableBanner() {
        const banner = document.getElementById('availabilityBanner');
        const bannerTitle = document.getElementById('bannerTitle');
        const bannerMessage = document.getElementById('bannerMessage');
        const countdown = document.getElementById('countdown');
        
        banner.style.display = 'block';
        document.body.classList.add('banner-visible');
        
        if (this.manualClosure) {
            bannerTitle.textContent = 'Temporariamente Fechado';
            const reasons = {
                'manutencao': 'Estamos em manutenção',
                'ferias': 'Estamos de férias',
                'reforma': 'Estamos em reforma',
                'emergencia': 'Fechado por emergência',
                'outro': 'Fechado temporariamente'
            };
            bannerMessage.textContent = reasons[this.closureReason] || 'Fechado temporariamente';
            countdown.style.display = 'none';
        } else {
            const now = new Date();
            if (this.isHoliday(now)) {
                bannerTitle.textContent = 'Fechado - Feriado';
                bannerMessage.textContent = 'Não funcionamos em feriados';
                countdown.style.display = 'none';
            } else {
                bannerTitle.textContent = 'Fora do Horário';
                bannerMessage.textContent = 'Funcionamos das 18:00 às 23:00 (23:30 fins de semana)';
                countdown.style.display = 'block';
            }
        }
    }
    
    startCountdown() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }
    
    updateCountdown() {
        const countdownElement = document.getElementById('countdownTime');
        if (!countdownElement) return;
        
        const nextOpen = this.getNextOpenTime();
        if (!nextOpen) {
            countdownElement.textContent = '--:--:--';
            return;
        }
        
        const now = new Date();
        const diff = nextOpen - now;
        
        if (diff <= 0) {
            countdownElement.textContent = '00:00:00';
            this.updateAvailabilityStatus();
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    setManualClosure(closed, reason = '') {
        this.manualClosure = closed;
        this.closureReason = reason;
        this.saveSettings();
        this.updateAvailabilityStatus();
    }
    
    setForceOpen(forced) {
        this.forceOpen = forced;
        this.saveSettings();
        this.updateAvailabilityStatus();
    }
}

// Sistema de Carrinho com Redirecionamento Automático para WhatsApp
class Cart {
    constructor() {
        this.items = [];
        this.deliveryFee = 4.99;
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
                
                if (!window.availability.isOpen()) {
                    this.showError('Não é possível fazer pedidos no momento. Restaurante fechado.');
                    return;
                }
                
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
        document.getElementById('floatingCart').addEventListener('click', () => {
            this.openCart();
        });

        // Drink selection modal events
        document.getElementById('closeDrinkSelection').addEventListener('click', () => {
            this.closeDrinkSelection();
        });

        document.getElementById('drinkSelectionModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('drinkSelectionModal')) {
                this.closeDrinkSelection();
            }
        });

        // Drink option selection
        document.querySelectorAll('.drink-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const drinkType = e.target.closest('.drink-option').getAttribute('data-drink');
                this.selectDrink(drinkType);
            });
        });

        // Customization modal events
        document.getElementById('closeCustomization').addEventListener('click', () => {
            this.closeCustomization();
        });

        document.getElementById('customizationModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('customizationModal')) {
                this.closeCustomization();
            }
        });

        document.getElementById('addToCartBtn').addEventListener('click', () => {
            this.addCustomizedItem();
        });

        // Close cart
        document.getElementById('closeCart').addEventListener('click', () => {
            this.closeCart();
        });

        // Cart modal overlay
        document.getElementById('cartModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('cartModal')) {
                this.closeCart();
            }
        });

        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.processOrder();
        });

        // Payment method change
        document.getElementById('paymentMethod').addEventListener('change', (e) => {
            const changeGroup = document.getElementById('changeGroup');
            if (e.target.value === 'dinheiro') {
                changeGroup.style.display = 'block';
            } else {
                changeGroup.style.display = 'none';
                document.getElementById('needChange').checked = false;
                document.getElementById('changeAmount').style.display = 'none';
            }
        });

        // Need change checkbox
        document.getElementById('needChange').addEventListener('change', (e) => {
            const changeAmount = document.getElementById('changeAmount');
            changeAmount.style.display = e.target.checked ? 'block' : 'none';
        });

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
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeDrinkSelection() {
        const modal = document.getElementById('drinkSelectionModal');
        modal.classList.remove('open');
        document.body.style.overflow = '';
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

        document.getElementById('customizationTitle').textContent = `Personalizar ${this.currentCustomization.name}`;
        this.renderAddons();
        this.updateCustomizationTotal();
        
        const modal = document.getElementById('customizationModal');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeCustomization() {
        const modal = document.getElementById('customizationModal');
        modal.classList.remove('open');
        document.body.style.overflow = '';
        this.currentCustomization = null;
        document.getElementById('specialInstructions').value = '';
    }

    renderAddons() {
        const container = document.getElementById('addonsContainer');
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
            if (nameElement.textContent === addonName) {
                const quantityElement = item.querySelector('.addon-quantity');
                const minusBtn = item.querySelector('.addon-btn');
                
                const addon = this.currentCustomization.addons.find(a => a.name === addonName);
                const quantity = addon ? addon.quantity : 0;
                
                quantityElement.textContent = quantity;
                minusBtn.disabled = quantity <= 0;
            }
        });
    }

    updateCustomizationTotal() {
        if (!this.currentCustomization) return;

        const addonsTotal = this.currentCustomization.addons.reduce((sum, addon) => {
            return sum + (addon.price * addon.quantity);
        }, 0);

        const total = this.currentCustomization.basePrice + addonsTotal;
        document.getElementById('customizationTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    addCustomizedItem() {
        if (!this.currentCustomization) return;

        const specialInstructions = document.getElementById('specialInstructions').value.trim();
        this.currentCustomization.specialInstructions = specialInstructions;

        const addonsTotal = this.currentCustomization.addons.reduce((sum, addon) => {
            return sum + (addon.price * addon.quantity);
        }, 0);

        const finalPrice = this.currentCustomization.basePrice + addonsTotal;

        this.addItem(
            this.currentCustomization.name,
            finalPrice,
            this.currentCustomization.image,
            this.currentCustomization.addons,
            specialInstructions
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

        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalAmount = totalItems > 0 ? subtotalAmount + this.deliveryFee : 0;

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

        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalAmount = totalItems > 0 ? subtotalAmount + this.deliveryFee : 0;

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Seu carrinho está vazio</p>
                    <small>Adicione itens do cardápio</small>
                </div>
            `;
            cartForm.style.display = 'none';
            checkoutBtn.disabled = true;
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
            
            cartForm.style.display = 'block';
            checkoutBtn.disabled = !this.isFormValid();
        }

        subtotal.textContent = `R$ ${subtotalAmount.toFixed(2).replace('.', ',')}`;
        cartTotal.textContent = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
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
        cartModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        const cartModal = document.getElementById('cartModal');
        cartModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    isFormValid() {
        const name = document.getElementById('customerName').value.trim();
        const address = document.getElementById('customerAddress').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        return name && address && paymentMethod && this.items.length > 0;
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

    // Redirecionamento automático para WhatsApp
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

        // Gerar mensagem profissional para WhatsApp
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
        const totalAmount = subtotalAmount + this.deliveryFee;

        message += '💰 *TOTAL DA COMPRA:*\n';
        message += `Subtotal dos itens: R$ ${subtotalAmount.toFixed(2).replace('.', ',')}\n`;
        message += `Taxa de entrega: R$ ${this.deliveryFee.toFixed(2).replace('.', ',')}\n`;
        message += `*VALOR TOTAL: R$ ${totalAmount.toFixed(2).replace('.', ',')}*\n\n`;

        message += '📍 *DADOS PARA ENTREGA:*\n';
        message += `Cliente: ${customerName}\n`;
        message += `Endereço: ${customerAddress}\n\n`;

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

        // Número do WhatsApp
        const whatsappNumber = '5543920011899';
        
        // Redirecionar automaticamente para WhatsApp
        this.redirectToWhatsApp(whatsappNumber, message);
        
        // Mostrar modal de sucesso
        this.showSuccessModal();
        
        // Limpar carrinho após delay
        setTimeout(() => {
            this.clearCart();
            this.closeCart();
            this.hideSuccessModal();
        }, 3000);
    }

    redirectToWhatsApp(phoneNumber, message) {
        // Criar URL do WhatsApp
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        // Redirecionar automaticamente
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
        if (successModal) {
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

// Painel Administrativo
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.credentials = {
            username: 'eduardo',
            password: '123'
        };
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        document.getElementById('adminBtn').addEventListener('click', () => {
            this.openAdminModal();
        });
        
        document.getElementById('closeAdmin').addEventListener('click', () => {
            this.closeAdminModal();
        });
        
        document.getElementById('adminModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('adminModal')) {
                this.closeAdminModal();
            }
        });
        
        document.getElementById('adminLoginBtn').addEventListener('click', () => {
            this.login();
        });
        
        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.login();
            }
        });
        
        document.getElementById('manualClosure').addEventListener('change', (e) => {
            this.updateClosureSettings();
        });
        
        document.getElementById('forceOpen').addEventListener('change', (e) => {
            this.updateClosureSettings();
        });
        
        document.getElementById('closureReason').addEventListener('change', () => {
            this.updateClosureSettings();
        });
        
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });
    }
    
    openAdminModal() {
        const modal = document.getElementById('adminModal');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        if (this.isLoggedIn) {
            this.showAdminPanel();
        } else {
            this.showLoginForm();
        }
    }
    
    closeAdminModal() {
        const modal = document.getElementById('adminModal');
        modal.classList.remove('open');
        document.body.style.overflow = '';
        this.clearLoginForm();
    }
    
    login() {
        const username = document.getElementById('adminUser').value.trim();
        const password = document.getElementById('adminPassword').value;
        
        if (username === this.credentials.username && password === this.credentials.password) {
            this.isLoggedIn = true;
            this.showAdminPanel();
        } else {
            this.showError('Usuário ou senha incorretos');
            this.clearLoginForm();
        }
    }
    
    showLoginForm() {
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
    }
    
    showAdminPanel() {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        this.loadCurrentSettings();
    }
    
    loadCurrentSettings() {
        const manualClosureCheckbox = document.getElementById('manualClosure');
        const forceOpenCheckbox = document.getElementById('forceOpen');
        const closureReasonSelect = document.getElementById('closureReason');
        
        manualClosureCheckbox.checked = window.availability.manualClosure;
        forceOpenCheckbox.checked = window.availability.forceOpen;
        closureReasonSelect.value = window.availability.closureReason || 'manutencao';
    }
    
    updateClosureSettings() {
        const manualClosure = document.getElementById('manualClosure').checked;
        const forceOpen = document.getElementById('forceOpen').checked;
        const closureReason = document.getElementById('closureReason').value;
        
        if (forceOpen && manualClosure) {
            document.getElementById('manualClosure').checked = false;
            window.availability.setManualClosure(false, closureReason);
        } else {
            window.availability.setManualClosure(manualClosure, closureReason);
        }
        
        window.availability.setForceOpen(forceOpen);
    }
    
    saveSettings() {
        this.updateClosureSettings();
        this.showSuccessMessage('Configurações salvas e sincronizadas universalmente!');
        setTimeout(() => {
            this.closeAdminModal();
        }, 1500);
    }
    
    clearLoginForm() {
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPassword').value = '';
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
        }, 3000);
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

// Inicializar tudo quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de disponibilidade
    window.availability = new RestaurantAvailability();
    
    // Inicializar carrinho
    window.cart = new Cart();
    
    // Inicializar painel admin
    window.admin = new AdminPanel();
    
    // Configurar animações
    setupMenuItemsAnimation();
});

// Salvar estado do carrinho quando página for fechada
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.cart) {
        window.cart.saveToLocalStorage();
    }
});

// Função de debounce para otimização
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