// =====================================================================
// MAIN APPLICATION LOGIC (Navigation, Cart, Catalog, & Checkout)
// =====================================================================
// This file acts as the "brain" of your website. It controls how pages change,
// handles the math for the shopping cart, and processes the final checkout.

// --- Global State Variables ---
let rateCard = [];          // Will hold all tests imported from data.js
let navHistory = ['home'];  // Keeps track of the pages the user visited so the "Back" button works
let shoppingCart = [];      // Array to hold the tests the user wants to book
let userLocationLink = "";  // Stores the Google Maps link if they click "Pinpoint GPS"

// --- Promo Code State ---
let appliedDiscountPercentage = 0; // Currently active discount percentage (e.g., 20)
let appliedPromoCode = "";         // Currently active discount code text (e.g., "WINPATH20")

// --- Security Utility ---
/**
 * Prevents Cross-Site Scripting (XSS) attacks.
 * If a user tries to type malicious code into the search bar or checkout forms,
 * this function neutralizes it by converting special characters into safe text.
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, match => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
    });
}

// =====================================================================
// NAVIGATION & VIEW MANAGEMENT
// =====================================================================

/**
 * Opens and closes the mobile hamburger menu.
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const isOpen = !menu.classList.contains('hidden');
    
    menu.classList.toggle('hidden', isOpen);
    menuIcon.classList.toggle('hidden', !isOpen);
    closeIcon.classList.toggle('hidden', isOpen);
}

/**
 * The core Single Page Application (SPA) navigator.
 * Instead of loading a new HTML page, this hides all sections of the site
 * and only shows the one you requested (viewId).
 */
function switchView(viewId, pushToHistory = true) {
    // List of every possible "page" on the site
    const views = ['home-view', 'packages-page-view', 'contact-view', 'about-view', 'test-detail-view', 'privacy-view', 'terms-view', 'cart-view'];
    
    // Hide all views by adding the 'view-hidden' CSS class
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('view-hidden');
    });
    
    // Show the specific view requested
    const target = document.getElementById(viewId + '-view');
    if (target) {
        target.classList.remove('view-hidden');
        if (pushToHistory) navHistory.push(viewId); // Save to history for the back button
        window.scrollTo(0, 0); // Scroll to the top of the new "page"
    }

    // Auto-close mobile menu if it was open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) toggleMobileMenu();
    
    // If they opened the cart, calculate the math right away
    if (viewId === 'cart') renderCartView();
    
    // Hide the floating WhatsApp button if they are in the cart or test details (to avoid clutter)
    const globalWa = document.getElementById('global-wa-btn');
    if (globalWa) {
        if (viewId === 'test-detail' || viewId === 'cart') {
            globalWa.classList.add('hidden');
        } else {
            globalWa.classList.remove('hidden');
        }
    }
}

/**
 * Goes back to the previous "page" the user was looking at.
 */
function goBack() {
    if (navHistory.length > 1) {
        navHistory.pop(); // Remove current page
        const prev = navHistory.pop(); // Get previous page
        switchView(prev, true);
    } else { 
        switchView('home'); 
    }
}

// =====================================================================
// SHOPPING CART & PROMO FUNCTIONS
// =====================================================================

/**
 * Adds a test to the cart if it isn't already there.
 */
function addToCart(testId) {
    const test = rateCard.find(t => t.id === testId);
    if (test && !shoppingCart.some(item => item.id === testId)) {
        shoppingCart.push(test);
        updateCartBadge();
        showToast(); // Show "Added to Cart" popup
    }
}

/**
 * Removes a test from the cart and updates the math.
 */
function removeFromCart(testId) {
    shoppingCart = shoppingCart.filter(item => item.id !== testId);
    updateCartBadge();
    renderCartView(); 
}

/**
 * Updates the red notification bubble numbers on the cart icons.
 */
function updateCartBadge() {
    const count = shoppingCart.length;
    const badges = document.querySelectorAll('#cart-badge');
    badges.forEach(b => b.innerText = count);
    const mobileBadge = document.getElementById('mobile-cart-count');
    if(mobileBadge) mobileBadge.innerText = count;
}

/**
 * Triggers the small "Added to Cart" banner animation.
 */
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2500); 
}

/**
 * Checks the user's promo code against the BILLING_CONFIG dictionary.
 */
function applyPromoCode() {
    const input = document.getElementById('promo-code-input');
    const code = input.value.trim().toUpperCase();
    
    if (!code) return;

    // Check if billing.js is loaded AND if the code exists in the validDiscountCodes dictionary
    if (typeof BILLING_CONFIG !== 'undefined' && BILLING_CONFIG.validDiscountCodes[code]) {
        appliedDiscountPercentage = BILLING_CONFIG.validDiscountCodes[code];
        appliedPromoCode = code;
        alert(`Success! ${appliedDiscountPercentage}% discount applied.`);
    } else {
        appliedDiscountPercentage = 0;
        appliedPromoCode = "";
        alert("Invalid or expired discount code.");
        input.value = "";
    }
    
    // Re-render the cart so the new discount applies to the math immediately
    renderCartView(); 
}

/**
 * Removes the currently applied promo code and resets the cart math.
 */
function removePromoCode() {
    appliedDiscountPercentage = 0;
    appliedPromoCode = "";
    
    const input = document.getElementById('promo-code-input');
    if (input) {
        input.value = "";
    }
    
    renderCartView();
}

/**
 * Dynamically builds the HTML for the Cart View and performs all billing math.
 */
function renderCartView() {
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartContent = document.getElementById('cart-content');
    const itemList = document.getElementById('cart-items-list');

    // Show empty state if cart array is empty
    if (shoppingCart.length === 0) {
        emptyMsg.classList.remove('hidden');
        cartContent.classList.add('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        cartContent.classList.remove('hidden');

        itemList.innerHTML = '';
        let subtotal = 0;

        // Loop through everything in the cart
        shoppingCart.forEach(item => {
            // Remove commas from prices like "5,999" so JavaScript can do math on them
            const priceNum = parseInt(item.price.replace(/,/g, ''));
            subtotal += priceNum;
            
            // Build the HTML list item for the cart
            itemList.innerHTML += `
                <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                        <h4 class="font-black text-sm text-gray-900">${escapeHTML(item.name)}</h4>
                        <span class="text-xs font-bold text-brand-blue uppercase tracking-widest">₹${escapeHTML(item.price)}</span>
                    </div>
                    <button onclick="removeFromCart('${escapeHTML(item.id)}')" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
        });

        // --- BILLING MATH ---
        // Fallback to zero if billing.js is somehow missing
        let config = typeof BILLING_CONFIG !== 'undefined' ? BILLING_CONFIG : { homeCollectionFee: 0, bookingFee: 0, platformFee: 0 };
        
        // Calculate dynamic values
        const discountVal = (subtotal * appliedDiscountPercentage) / 100;
        const totalFees = config.homeCollectionFee + config.bookingFee + config.platformFee;
        const total = subtotal + totalFees - discountVal;
        
        // Update HTML interface numbers
        document.getElementById('bill-subtotal').innerText = `₹${subtotal.toLocaleString()}`;
        document.getElementById('bill-collection').innerText = `₹${config.homeCollectionFee}`;
        
        const bookingEl = document.getElementById('bill-booking');
        if(bookingEl) bookingEl.innerText = `₹${config.bookingFee}`;
        
        const platformEl = document.getElementById('bill-platform');
        if(platformEl) platformEl.innerText = `₹${config.platformFee}`;
        
        const discountEl = document.getElementById('bill-discount');
        const promoLabel = document.getElementById('active-promo-label');
        
        // --- UI Elements for Promo Toggle ---
        const promoInput = document.getElementById('promo-code-input');
        const applyBtn = document.getElementById('promo-apply-btn');
        const removeBtn = document.getElementById('promo-remove-btn');
        
        // If there is an active discount, show it in green. Otherwise, show ₹0.
        if (appliedDiscountPercentage > 0 && subtotal > 0) {
            discountEl.innerText = `-₹${Math.round(discountVal).toLocaleString()}`;
            if(promoLabel) promoLabel.innerText = `(${appliedPromoCode})`;
            discountEl.classList.add('text-brand-green');
            
            // Lock input, turn it green, and show "Cancel" button
            if (applyBtn) applyBtn.classList.add('hidden');
            if (removeBtn) removeBtn.classList.remove('hidden');
            if (promoInput) {
                promoInput.value = appliedPromoCode;
                promoInput.disabled = true;
                promoInput.classList.add('bg-brand-green/10', 'text-brand-green', 'border-brand-green/30');
            }
        } else {
            discountEl.innerText = `₹0`;
            if(promoLabel) promoLabel.innerText = "";
            discountEl.classList.remove('text-brand-green');
            
            // Unlock input, remove green styling, and show "Apply" button
            if (applyBtn) applyBtn.classList.remove('hidden');
            if (removeBtn) removeBtn.classList.add('hidden');
            if (promoInput) {
                promoInput.disabled = false;
                promoInput.classList.remove('bg-brand-green/10', 'text-brand-green', 'border-brand-green/30');
            }
        }

        // Final total (Math.max ensures the total never goes below 0)
        document.getElementById('bill-total').innerText = `₹${Math.max(0, Math.round(total)).toLocaleString()}`;
    }
}

// =====================================================================
// CHECKOUT & GPS INTEGRATION
// =====================================================================

/**
 * Accesses the user's phone/browser GPS to pinpoint their location for home collection.
 */
function locateUser() {
    const statusEl = document.getElementById('location-status');
    statusEl.innerText = "Locating (Please allow permissions)...";
    statusEl.className = "text-xs font-semibold text-brand-blue italic";

    if (navigator.geolocation) {
        const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            // Create a usable Google Maps URL
            userLocationLink = `https://maps.google.com/?q=${lat},${lng}`;
            statusEl.innerText = "GPS Location Pinned Successfully! ✓";
            statusEl.className = "text-xs font-black uppercase tracking-widest text-brand-green mt-1";
        }, error => {
            // Handle cases where the user denies GPS permissions
            console.error("GPS Error:", error);
            let errorMsg = "GPS Error. Please type your address manually.";
            if (error.code === 1) errorMsg = "GPS Access Denied. Please type your address manually.";
            else if (error.code === 2) errorMsg = "GPS Signal Unavailable. Please type your address.";
            else if (error.code === 3) errorMsg = "Location Request Timed Out. Please type your address.";
            statusEl.innerText = errorMsg;
            statusEl.className = "text-xs font-bold text-red-500 italic mt-1";
        }, options);
    } else {
        statusEl.innerText = "Geolocation not supported by this browser. Please type address.";
        statusEl.className = "text-xs font-bold text-red-500 italic mt-1";
    }
}

/**
 * The final Checkout Action.
 * 1. Validates the form.
 * 2. Compiles WhatsApp Message string.
 * 3. Dispatches data silently to Google Sheets via Forms.
 * 4. Opens WhatsApp.
 */
async function proceedToWhatsApp() {
    // 1. Gather all inputs
    const nameEl = document.getElementById('checkout-name');
    const ageEl = document.getElementById('checkout-age');
    const genderEl = document.getElementById('checkout-gender');
    const mobileEl = document.getElementById('checkout-mobile');
    const emailEl = document.getElementById('checkout-email');
    const addressEl = document.getElementById('checkout-address');

    const name = nameEl.value.trim();
    const age = ageEl.value.trim();
    const gender = genderEl.value;
    const mobile = mobileEl.value.trim();
    const email = emailEl.value.trim();
    const address = addressEl.value.trim();

    // 2. Reset previous validation red borders
    [nameEl, ageEl, genderEl, mobileEl, addressEl].forEach(el => {
        if (el) el.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
    });

    // 3. Validation Rules
    let missingFields = [];
    if (!name) { missingFields.push("Full Name"); nameEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); }
    if (!age) { missingFields.push("Age"); ageEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); }
    if (!gender) { missingFields.push("Gender"); genderEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); }
    if (!mobile) { missingFields.push("Mobile Number"); mobileEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); }
    // User must provide EITHER a typed address OR a GPS link
    if (!address && !userLocationLink) { missingFields.push("Home Collection Address (or GPS Location)"); addressEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); }

    if (missingFields.length > 0) {
        alert("Please fill out the following mandatory fields:\n\n- " + missingFields.join("\n- "));
        return;
    }

    // 4. Build the WhatsApp Message string
    let message = `*NEW HOME COLLECTION BOOKING*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${name}\n`;
    message += `Age: ${age} Yrs | Gender: ${gender}\n`;
    message += `Mobile: ${mobile}\n`;
    if (email) message += `Email: ${email}\n`;
    if (userLocationLink) message += `GPS Link: ${userLocationLink}\n`;
    if (address) message += `Address Note: ${address}\n\n`;

    message += `*Selected Tests:*\n`;
    let subtotal = 0;
    shoppingCart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (₹${item.price})\n`;
        subtotal += parseInt(item.price.replace(/,/g, ''));
    });

    // Apply exact same math logic as renderCartView()
    let config = typeof BILLING_CONFIG !== 'undefined' ? BILLING_CONFIG : { homeCollectionFee: 0, bookingFee: 0, platformFee: 0 };
    const discountVal = (subtotal * appliedDiscountPercentage) / 100;
    const totalFees = config.homeCollectionFee + config.bookingFee + config.platformFee;
    const total = subtotal + totalFees - discountVal;

    message += `\n*Billing Summary:*\n`;
    message += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
    if (config.homeCollectionFee > 0) message += `Home Collection: ₹${config.homeCollectionFee}\n`;
    if (config.bookingFee > 0) message += `Booking Fee: ₹${config.bookingFee}\n`;
    if (config.platformFee > 0) message += `Platform Fee: ₹${config.platformFee}\n`;
    
    if (appliedDiscountPercentage > 0 && subtotal > 0) {
        message += `Discount Applied (*${appliedPromoCode}*): -₹${Math.round(discountVal).toLocaleString()}\n`;
    }
    
    message += `*Total Amount: ₹${Math.max(0, Math.round(total)).toLocaleString()}*`;

    // 5. Visual loading state on the button
    const checkoutBtn = document.getElementById('checkout-btn');
    const originalBtnText = checkoutBtn.innerText;
    checkoutBtn.innerText = "Processing Details...";
    checkoutBtn.disabled = true;

    // 6. Google Sheets Dispatch
    // Bundle the data and hand it off to patient-details.js to send to the Form
    const customerData = {
        name: name,
        age: age,
        gender: gender,
        mobile: mobile,
        email: email || "N/A",
        address: address || "N/A",
        gpsLink: userLocationLink || "N/A",
        tests: shoppingCart.map(item => item.name).join(", "),
        totalAmount: Math.max(0, Math.round(total)),
        promoCode: appliedPromoCode || "None" 
    };

    if (typeof recordPatientDetails === 'function') {
        await recordPatientDetails(customerData); // Await the background fetch request
    }
    
    checkoutBtn.innerText = originalBtnText;
    checkoutBtn.disabled = false;

    // 7. Format the string for URLs and open WhatsApp in a new tab
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/919380116362?text=${encodedMessage}`;
    
    // NOTE: Cart persistence is active! We do NOT clear the shoppingCart[] here.
    window.open(waUrl, '_blank', 'noopener,noreferrer');
}

// =====================================================================
// CATALOG LOGIC & RENDERING
// =====================================================================

/**
 * Filter triggered by the Mega Menu dropdowns.
 */
function filterByCategory(type, value) {
    switchView('packages-page');
    // Update headers based on the chosen category
    document.getElementById('menu-title').innerHTML = `${escapeHTML(value)} <span class="brand-gradient-text italic">Tests.</span>`;
    document.getElementById('menu-subtitle').innerText = `Browsing specialized screenings for ${escapeHTML(value)}`;
    document.getElementById('clear-btn').classList.remove('hidden');
    
    // Filter the global rateCard
    const filtered = rateCard.filter(t => t.category && t.category[type] === value);
    renderTests(filtered);
    clearSearchInput(false); 
}

let searchTimeout;
/**
 * Triggers every time the user types a letter in the search bar.
 * Uses a 'debounce' timeout so it doesn't try to search 100 times a second.
 */
function handleSearchInput() {
    const input = document.getElementById('test-search');
    const clearBtn = document.getElementById('search-clear-icon');
    if (input.value.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { filterTests(); }, 300);
}

function clearSearchInput(executeFilter = true) {
    const input = document.getElementById('test-search');
    input.value = '';
    document.getElementById('search-clear-icon').classList.add('hidden');
    if (executeFilter) filterTests();
}

/**
 * Takes the user's search text, sanitizes it, and looks for matches in the test names or parameters.
 */
function filterTests() {
    const rawQuery = document.getElementById('test-search').value.toLowerCase();
    const query = rawQuery.replace(/[^a-z0-9\s-]/g, ''); // Remove weird characters
    
    if(query === "") { 
        // If search is empty, just show the first 18 tests
        renderTests(rateCard.slice(0, 18)); 
    } else { 
        renderTests(rateCard.filter(t => t.name.toLowerCase().includes(query) || (t.params && t.params.toLowerCase().includes(query)))); 
    }
}

/**
 * Resets the catalog view back to normal after a filter was applied.
 */
function clearFilter() {
    clearSearchInput(false);
    document.getElementById('clear-btn').classList.add('hidden');
    document.getElementById('menu-title').innerHTML = `Test <span class="brand-gradient-text italic">Menu.</span>`;
    document.getElementById('menu-subtitle').innerText = "Browsing 100+ clinical investigations";
    filterTests();
}

/**
 * Changes the view to the Test Details page and injects the specific test's information.
 */
function showTestDetail(testId) {
    const test = rateCard.find(t => t.id === testId);
    if (!test) return;
    const content = document.getElementById('detail-content');

    const safeName = escapeHTML(test.name);
    const safePrice = escapeHTML(test.price);
    const safeImportance = escapeHTML(test.importance);
    const safeParams = escapeHTML(test.params);

    // Packages have a different layout than standalone tests
    let bodyHtml = test.isPackage ? `
            <div class="space-y-12">
                <div>
                    <h3 class="text-[10px] font-black uppercase text-brand-blue tracking-[0.2em] mb-4 underline underline-offset-4 decoration-brand-cyan">Clinical Importance</h3>
                    <p class="text-xl text-gray-600 font-medium leading-relaxed">${safeImportance}</p>
                </div>
                <div class="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                    <h3 class="text-[10px] font-black uppercase text-brand-blue tracking-[0.2em] mb-6">Tested Parameters</h3>
                    <p class="text-lg font-bold text-gray-900 italic leading-relaxed tracking-tight underline decoration-brand-cyan/20 underline-offset-8">${safeParams}</p>
                </div>
            </div>` : 
            `<div class="bg-gray-50 p-10 rounded-[3rem] border border-gray-100"><p class="text-lg text-gray-500 font-medium leading-relaxed">This standalone investigation is processed using ISO 15189:2022 standardized protocols. Results will be delivered within 24 hours.</p></div>`;

    content.innerHTML = `
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 class="text-4xl sm:text-6xl font-black text-gray-900 mb-8 tracking-tighter uppercase leading-tight">${safeName}</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div class="lg:col-span-2">${bodyHtml}</div>
                <div class="hidden lg:block">
                    <!-- Sticky pricing box on desktop -->
                    <div class="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 sticky top-32">
                        <div class="text-[9px] font-black text-gray-400 uppercase mb-2">Service Fee</div>
                        <div class="text-5xl font-black brand-gradient-text tracking-tighter mb-8">₹${safePrice}</div>
                        <button onclick="addToCart('${escapeHTML(test.id)}')" class="block w-full py-5 brand-gradient-bg text-white text-[10px] font-black uppercase tracking-widest rounded-2xl text-center shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Sticky pricing bar on mobile at the bottom of the screen -->
        <div class="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-200 p-6 pb-8 z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2rem] flex justify-between items-center">
            <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Fee</p>
                <div class="text-3xl font-black brand-gradient-text tracking-tighter leading-none">₹${safePrice}</div>
            </div>
            <button onclick="addToCart('${escapeHTML(test.id)}')" class="px-8 py-4 brand-gradient-bg text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Add to Cart</button>
        </div>
    `;
    switchView('test-detail');
}

/**
 * Loops through a given array of tests and generates the clickable HTML cards for the catalog.
 */
function renderTests(tests) {
    const container = document.getElementById('test-results');
    
    // Empty state message
    container.innerHTML = tests.length > 0 ? '' : '<p class="col-span-full py-20 text-center font-bold text-gray-400">No clinical parameters matched your search</p>';
    
    // Sort packages to appear before standalone tests
    const sorted = [...tests].sort((a,b) => (b.isPackage ? 1 : 0) - (a.isPackage ? 1 : 0));
    
    sorted.forEach(test => {
        const card = document.createElement('div');
        const isPkg = test.isPackage;
        // Packages get a slight blue background to stand out
        card.className = `test-card p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full ${isPkg ? 'bg-brand-blue/5 border-brand-blue/20' : 'bg-white'}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-6 cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')">
                <h4 class="text-lg font-black text-gray-900 leading-tight text-left hover:text-brand-blue transition-colors">${escapeHTML(test.name)}</h4>
                <span class="text-xl font-black brand-gradient-text ml-4 shrink-0">₹${escapeHTML(test.price)}</span>
            </div>
            ${isPkg ? `<p class="text-[10px] text-brand-blue font-black uppercase tracking-widest mb-4 text-left">Health Package</p><div class="bg-gray-50/80 p-5 rounded-2xl flex-grow mb-6 text-left cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')"><p class="text-[10px] text-gray-600 font-semibold italic line-clamp-2">${escapeHTML(test.params)}</p></div>` : `<div class="flex-grow cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')"></div>`}
            <button onclick="addToCart('${escapeHTML(test.id)}')" class="w-full py-3 mt-4 bg-brand-cyan/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Add to Cart</button>
        `;
        container.appendChild(card);
    });
}

/**
 * Pulls specific packages (by ID) from the rateCard and displays them on the Home Page.
 */
function populateFeaturedPackages() {
    const container = document.getElementById('featured-packages-grid');
    if(!container) return;
    container.innerHTML = "";
    
    // Hardcoded IDs of the packages you want to feature on the homepage
    const featuredIds = ['p-3', 'p-4', 'p-5', 'p-2']; 
    
    featuredIds.forEach(id => {
        const pkg = rateCard.find(t => t.id === id);
        if(pkg) {
            const card = document.createElement('div');
            // Give 'p-5' a special "Most Popular" glow and scale
            card.className = `bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all ${id==='p-5' ? 'transform scale-[1.03] z-10 border-2 border-brand-cyan/20 shadow-2xl relative' : ''}`;
            let badgeHtml = id === 'p-5' ? `<div class="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 brand-gradient-bg rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-lg">Most Popular</div>` : '';
            card.innerHTML = `
                ${badgeHtml}
                <div class="cursor-pointer" onclick="showTestDetail('${escapeHTML(pkg.id)}')">
                    <h3 class="text-2xl font-black text-gray-900 mb-2 hover:text-brand-blue transition-colors">${escapeHTML(pkg.name)}</h3>
                    <p class="text-[11px] text-gray-400 font-medium leading-relaxed mb-8 italic line-clamp-2">${escapeHTML(pkg.importance)}</p>
                    <div class="text-3xl font-black text-brand-blue mb-8">₹${escapeHTML(pkg.price)}</div>
                </div>
                <div class="mt-auto">
                    <button onclick="addToCart('${escapeHTML(pkg.id)}')" class="w-full py-4 ${id==='p-5' ? 'brand-gradient-bg text-white shadow-xl hover:scale-[1.02]' : 'bg-gray-50 text-brand-blue hover:bg-gray-100'} text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Add to Cart</button>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

/**
 * Renders the timeline on the "About Us" page from the data.js file.
 */
function renderRoadmap() {
    const container = document.getElementById('roadmap-container');
    if (!container) return;
    container.innerHTML = '';
    
    if (typeof roadmapGoals !== 'undefined') {
        roadmapGoals.forEach((goal) => {
            const isCompleted = goal.status === 'completed';
            const dotStyle = isCompleted ? 'brand-gradient-bg border-white' : 'bg-white border-brand-cyan/40';
            const textStyle = isCompleted ? 'text-gray-900' : 'text-gray-400';
            container.innerHTML += `
                <div class="relative pl-8 sm:pl-12 group cursor-default">
                    <div class="absolute left-[-9px] top-2 w-4 h-4 rounded-full border-2 ${dotStyle} z-10"></div>
                    <div class="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 group-hover:shadow-xl transition-all">
                        <span class="text-[10px] font-black uppercase tracking-widest text-brand-cyan mb-2 block">${escapeHTML(goal.year)} ${isCompleted ? '' : '(Goal)'}</span>
                        <h4 class="text-xl font-black ${textStyle} mb-2 tracking-tight group-hover:text-brand-blue transition-colors">${escapeHTML(goal.title)}</h4>
                        <p class="text-sm text-gray-500 leading-relaxed">${escapeHTML(goal.desc)}</p>
                    </div>
                </div>
            `;
        });
    }
}

/**
 * Executed automatically when the browser finishes loading the website.
 */
window.onload = () => { 
    // Combine arrays from data.js into one master list
    if (typeof healthPackages !== 'undefined' && typeof investigations !== 'undefined') {
        rateCard = [...healthPackages, ...investigations];
    }
    // Initialize the UI
    filterTests(); 
    renderRoadmap(); 
    populateFeaturedPackages();
};
