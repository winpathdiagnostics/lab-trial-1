// =====================================================================
// MAIN APPLICATION LOGIC (Navigation, Cart, Catalog, Dashboard & Checkout)
// =====================================================================
// This file acts as the primary "engine" of the website. 
// It manages the user session, shopping cart, catalog filtering, 
// and coordinate formatting for checkout.

// --- Global State Variables ---
let rateCard = [];          // Master list of all tests/packages from data.js
let navHistory = ['home'];  // Keeps track of navigation for the "Back" button
let shoppingCart = [];      // Current items the user intends to book
let userLocationLink = "";  // Stores the Google Maps link generated via GPS

// --- Billing & Promo State ---
let appliedDiscountPercentage = 0; 
let appliedPromoCode = "";

// --- User Profile State (Dashboard Memory) ---
// This object is updated by auth.js upon successful Google Login.
// It is used to pre-fill checkout forms and manage family members.
let userProfile = {
    name: "",
    email: "",
    phone: "",
    family: [] // Array of {name, age, gender, mobile}
};

// --- Security Utility ---
/**
 * Sanitizes strings to prevent XSS (Cross-Site Scripting).
 * Converts special characters into HTML entities.
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, match => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
    });
}

// =====================================================================
// NAVIGATION & VIEW MANAGEMENT (SPA Logic)
// =====================================================================

/**
 * Toggles the visibility of the mobile navigation drawer.
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
 * Switches between different sections of the site (Home, Catalog, Dashboard, etc.)
 * by adding or removing the 'view-hidden' CSS class.
 */
function switchView(viewId, pushToHistory = true) {
    // Every ID defined in the HTML main-content
    const views = ['home-view', 'packages-page-view', 'contact-view', 'about-view', 'test-detail-view', 'privacy-view', 'terms-view', 'cart-view', 'dashboard-view'];
    
    // Hide all active views
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('view-hidden');
    });
    
    // Show requested view
    const target = document.getElementById(viewId + '-view');
    if (target) {
        target.classList.remove('view-hidden');
        if (pushToHistory) navHistory.push(viewId);
        window.scrollTo(0, 0); // Always reset scroll position to top
    }

    // Auto-close mobile menu if it's open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) toggleMobileMenu();
    
    // Refresh dynamic content if entering Cart or Dashboard
    if (viewId === 'cart') renderCartView();
    if (viewId === 'dashboard') renderDashboard();
    
    // Hide floating WA button in cluttered views
    const globalWa = document.getElementById('global-wa-btn');
    if (globalWa) {
        const waHiddenViews = ['test-detail', 'cart', 'dashboard'];
        if (waHiddenViews.includes(viewId)) {
            globalWa.classList.add('hidden');
        } else {
            globalWa.classList.remove('hidden');
        }
    }
}

/**
 * Logic for the "Back" button used in Test Detail and other deep views.
 */
function goBack() {
    if (navHistory.length > 1) {
        navHistory.pop();
        const prev = navHistory.pop();
        switchView(prev, true);
    } else { 
        switchView('home'); 
    }
}

// =====================================================================
// SHOPPING CART & PROMO LOGIC
// =====================================================================

function addToCart(testId) {
    const test = rateCard.find(t => t.id === testId);
    if (test && !shoppingCart.some(item => item.id === testId)) {
        shoppingCart.push(test);
        updateCartBadge();
        showToast(); // Visual feedback
    }
}

function removeFromCart(testId) {
    shoppingCart = shoppingCart.filter(item => item.id !== testId);
    updateCartBadge();
    renderCartView(); 
}

function updateCartBadge() {
    const count = shoppingCart.length;
    document.querySelectorAll('#cart-badge').forEach(b => b.innerText = count);
    const mobileBadge = document.getElementById('mobile-cart-count');
    if(mobileBadge) mobileBadge.innerText = count;
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2500); 
}

/**
 * Applies a promo code if it matches keys in BILLING_CONFIG (billing.js).
 */
function applyPromoCode() {
    const input = document.getElementById('promo-code-input');
    const code = input.value.trim().toUpperCase();
    if (!code) return;

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
    renderCartView(); 
}

function removePromoCode() {
    appliedDiscountPercentage = 0;
    appliedPromoCode = "";
    const input = document.getElementById('promo-code-input');
    if (input) input.value = "";
    renderCartView();
}

/**
 * Renders the Cart screen and calculates the final breakdown.
 */
function renderCartView() {
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartContent = document.getElementById('cart-content');
    const itemList = document.getElementById('cart-items-list');

    if (shoppingCart.length === 0) {
        emptyMsg.classList.remove('hidden');
        cartContent.classList.add('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        cartContent.classList.remove('hidden');

        itemList.innerHTML = '';
        let subtotal = 0;

        shoppingCart.forEach(item => {
            const priceNum = parseInt(item.price.replace(/,/g, ''));
            subtotal += priceNum;
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

        // Pull math from BILLING_CONFIG (billing.js)
        let config = typeof BILLING_CONFIG !== 'undefined' ? BILLING_CONFIG : { homeCollectionFee: 0, bookingFee: 0, platformFee: 0 };
        
        const discountVal = (subtotal * appliedDiscountPercentage) / 100;
        const totalFees = config.homeCollectionFee + config.bookingFee + config.platformFee;
        const total = subtotal + totalFees - discountVal;
        
        // Update Breakdown UI
        document.getElementById('bill-subtotal').innerText = `₹${subtotal.toLocaleString()}`;
        document.getElementById('bill-collection').innerText = `₹${config.homeCollectionFee}`;
        document.getElementById('bill-booking').innerText = `₹${config.bookingFee}`;
        document.getElementById('bill-platform').innerText = `₹${config.platformFee}`;
        
        const discountEl = document.getElementById('bill-discount');
        const promoLabel = document.getElementById('active-promo-label');
        const promoInput = document.getElementById('promo-code-input');
        const applyBtn = document.getElementById('promo-apply-btn');
        const removeBtn = document.getElementById('promo-remove-btn');
        
        if (appliedDiscountPercentage > 0 && subtotal > 0) {
            discountEl.innerText = `-₹${Math.round(discountVal).toLocaleString()}`;
            if(promoLabel) promoLabel.innerText = `(${appliedPromoCode})`;
            discountEl.classList.add('text-brand-green');
            
            // Lock Promo UI
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
            
            // Unlock Promo UI
            if (applyBtn) applyBtn.classList.remove('hidden');
            if (removeBtn) removeBtn.classList.add('hidden');
            if (promoInput) {
                promoInput.disabled = false;
                promoInput.classList.remove('bg-brand-green/10', 'text-brand-green', 'border-brand-green/30');
            }
        }

        document.getElementById('bill-total').innerText = `₹${Math.max(0, Math.round(total)).toLocaleString()}`;
        
        // Autofill checkout details from userProfile (if logged in via auth.js)
        const emailCheckout = document.getElementById('checkout-email');
        const phoneCheckout = document.getElementById('checkout-mobile');
        if(emailCheckout && userProfile.email && !emailCheckout.value) emailCheckout.value = userProfile.email;
        if(phoneCheckout && userProfile.phone && !phoneCheckout.value) phoneCheckout.value = userProfile.phone;
    }
}

// =====================================================================
// CHECKOUT & GPS
// =====================================================================

/**
 * Accesses phone/browser GPS to pinpoint collection coordinates.
 */
function locateUser() {
    const statusEl = document.getElementById('location-status');
    statusEl.innerText = "Locating (Please allow permissions)...";
    statusEl.className = "text-xs font-semibold text-brand-blue italic";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userLocationLink = `https://maps.google.com/?q=${lat},${lng}`;
            statusEl.innerText = "GPS Location Pinned Successfully! ✓";
            statusEl.className = "text-xs font-black uppercase tracking-widest text-brand-green mt-1";
        }, error => {
            console.error("GPS Error:", error);
            statusEl.innerText = "GPS Error. Please type address manually.";
            statusEl.className = "text-xs font-bold text-red-500 italic mt-1";
        }, { enableHighAccuracy: true, timeout: 10000 });
    } else {
        statusEl.innerText = "Geolocation not supported.";
        statusEl.className = "text-xs font-bold text-red-500 italic mt-1";
    }
}

/**
 * Validates form, submits data to Google Form (patient-details.js),
 * and redirects to WhatsApp for final confirmation.
 */
async function proceedToWhatsApp() {
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

    if (!name || !age || !gender || !mobile || (!address && !userLocationLink)) {
        alert("Please fill out all mandatory fields marked with *");
        return;
    }

    // Build the WhatsApp formatted message
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

    let config = typeof BILLING_CONFIG !== 'undefined' ? BILLING_CONFIG : { homeCollectionFee: 0, bookingFee: 0, platformFee: 0 };
    const discountVal = (subtotal * appliedDiscountPercentage) / 100;
    const total = subtotal + config.homeCollectionFee + config.bookingFee + config.platformFee - discountVal;

    message += `\n*Billing Summary:*\n`;
    message += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
    message += `Home Collection: ₹${config.homeCollectionFee}\n`;
    message += `Booking Fee: ₹${config.bookingFee}\n`;
    message += `Platform Fee: ₹${config.platformFee}\n`;
    if (appliedDiscountPercentage > 0) message += `Discount Applied (${appliedPromoCode}): -₹${Math.round(discountVal).toLocaleString()}\n`;
    message += `*Total Amount: ₹${Math.max(0, Math.round(total)).toLocaleString()}*`;

    // Dispatch to Google Sheets
    const customerData = {
        name, age, gender, mobile, 
        email: email || "N/A", 
        address: address || "N/A", 
        gpsLink: userLocationLink || "N/A",
        tests: shoppingCart.map(item => item.name).join(", "),
        totalAmount: Math.max(0, Math.round(total)),
        promoCode: appliedPromoCode || "None"
    };

    if (typeof recordPatientDetails === 'function') {
        await recordPatientDetails(customerData);
    }
    
    // Redirect
    window.open(`https://wa.me/919380116362?text=${encodeURIComponent(message)}`, '_blank');
}

// =====================================================================
// CATALOG RENDERING & FILTERING
// =====================================================================

function filterByCategory(type, value) {
    switchView('packages-page');
    document.getElementById('menu-title').innerHTML = `${escapeHTML(value)} <span class="brand-gradient-text italic">Tests.</span>`;
    document.getElementById('menu-subtitle').innerText = `Browsing specialized screenings for ${escapeHTML(value)}`;
    document.getElementById('clear-btn').classList.remove('hidden');
    
    const filtered = rateCard.filter(t => t.category && t.category[type] === value);
    renderTests(filtered);
}

let searchTimeout;
function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { filterTests(); }, 300);
}

function clearSearchInput() {
    document.getElementById('test-search').value = '';
    filterTests();
}

function filterTests() {
    const query = document.getElementById('test-search').value.toLowerCase().replace(/[^a-z0-9\s-]/g, '');
    if(query === "") { 
        renderTests(rateCard.slice(0, 18)); 
    } else { 
        renderTests(rateCard.filter(t => t.name.toLowerCase().includes(query) || (t.params && t.params.toLowerCase().includes(query)))); 
    }
}

function clearFilter() {
    clearSearchInput();
    document.getElementById('clear-btn').classList.add('hidden');
    document.getElementById('menu-title').innerHTML = `Test <span class="brand-gradient-text italic">Menu.</span>`;
    document.getElementById('menu-subtitle').innerText = "Browsing 100+ clinical investigations";
}

function showTestDetail(testId) {
    const test = rateCard.find(t => t.id === testId);
    if (!test) return;
    const content = document.getElementById('detail-content');

    let bodyHtml = test.isPackage ? `
            <div class="space-y-8 mt-12">
                <div>
                    <h3 class="text-[10px] font-black uppercase text-brand-blue tracking-widest mb-4">Clinical Importance</h3>
                    <p class="text-xl text-gray-600 font-medium leading-relaxed">${escapeHTML(test.importance)}</p>
                </div>
                <div class="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                    <h3 class="text-[10px] font-black uppercase text-brand-blue tracking-widest mb-4">Parameters Tested</h3>
                    <p class="text-lg font-bold text-gray-900 italic leading-relaxed underline underline-offset-8 decoration-brand-cyan/20">${escapeHTML(test.params)}</p>
                </div>
            </div>` : 
            `<div class="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 mt-12"><p class="text-lg text-gray-500 font-medium leading-relaxed">Processed under strict ISO 15189:2022 protocols. Results delivered digitally within 24 hours.</p></div>`;

    content.innerHTML = `
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 class="text-4xl sm:text-6xl font-black text-gray-900 mb-8 tracking-tighter uppercase leading-tight">${escapeHTML(test.name)}</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div class="lg:col-span-2">${bodyHtml}</div>
                <div class="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 h-fit lg:sticky lg:top-32">
                    <div class="text-[9px] font-black text-gray-400 uppercase mb-2">Service Fee</div>
                    <div class="text-5xl font-black brand-gradient-text tracking-tighter mb-8">₹${escapeHTML(test.price)}</div>
                    <button onclick="addToCart('${escapeHTML(test.id)}')" class="block w-full py-5 brand-gradient-bg text-white text-[10px] font-black uppercase tracking-widest rounded-2xl text-center shadow-xl active:scale-95 transition-all">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    switchView('test-detail');
}

function renderTests(tests) {
    const container = document.getElementById('test-results');
    container.innerHTML = tests.length > 0 ? '' : '<p class="col-span-full py-20 text-center font-bold text-gray-400">No clinical parameters matched your search</p>';
    
    [...tests].sort((a,b) => (b.isPackage ? 1 : 0) - (a.isPackage ? 1 : 0)).forEach(test => {
        const card = document.createElement('div');
        const isPkg = test.isPackage;
        card.className = `test-card p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full ${isPkg ? 'bg-brand-blue/5 border-brand-blue/20' : 'bg-white'}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-6 cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')">
                <h4 class="text-lg font-black text-gray-900 leading-tight text-left hover:text-brand-blue transition-colors">${escapeHTML(test.name)}</h4>
                <span class="text-xl font-black brand-gradient-text ml-4 shrink-0">₹${escapeHTML(test.price)}</span>
            </div>
            ${isPkg ? `<p class="text-[10px] text-brand-blue font-black uppercase tracking-widest mb-4">Package</p><div class="bg-gray-50/80 p-5 rounded-2xl flex-grow mb-6"><p class="text-[10px] text-gray-600 font-semibold italic line-clamp-2">${escapeHTML(test.params)}</p></div>` : `<div class="flex-grow"></div>`}
            <button onclick="addToCart('${escapeHTML(test.id)}')" class="w-full py-3 mt-4 bg-brand-cyan/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl text-[9px] font-black uppercase transition-colors">Add to Cart</button>
        `;
        container.appendChild(card);
    });
}

function populateFeaturedPackages() {
    const container = document.getElementById('featured-packages-grid');
    if(!container) return;
    container.innerHTML = "";
    // Featured Package IDs (from data.js)
    const featuredIds = ['p-3', 'p-4', 'p-5', 'p-1']; 
    
    featuredIds.forEach(id => {
        const pkg = rateCard.find(t => t.id === id);
        if(pkg) {
            const card = document.createElement('div');
            card.className = `bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all`;
            card.innerHTML = `
                <div class="cursor-pointer" onclick="showTestDetail('${escapeHTML(pkg.id)}')">
                    <h3 class="text-2xl font-black text-gray-900 mb-2">${escapeHTML(pkg.name)}</h3>
                    <p class="text-[11px] text-gray-400 font-medium leading-relaxed mb-8 italic line-clamp-2">${escapeHTML(pkg.desc || pkg.importance)}</p>
                    <div class="text-3xl font-black text-brand-blue mb-8">₹${escapeHTML(pkg.price)}</div>
                </div>
                <button onclick="addToCart('${escapeHTML(pkg.id)}')" class="w-full py-4 mt-auto bg-gray-50 text-brand-blue hover:bg-brand-blue hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Add to Cart</button>
            `;
            container.appendChild(card);
        }
    });
}

function renderRoadmap() {
    const container = document.getElementById('roadmap-container');
    if (!container || typeof roadmapGoals === 'undefined') return;
    container.innerHTML = '';
    roadmapGoals.forEach((goal) => {
        const isCompleted = goal.status === 'completed';
        container.innerHTML += `
            <div class="relative pl-12 group">
                <div class="absolute left-[-9px] top-2 w-4 h-4 rounded-full border-2 ${isCompleted ? 'brand-gradient-bg border-white' : 'bg-white border-brand-cyan/40'}"></div>
                <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
                    <span class="text-[10px] font-black uppercase tracking-widest text-brand-cyan mb-2 block">${escapeHTML(goal.year)}</span>
                    <h4 class="text-xl font-black text-gray-900 mb-2">${escapeHTML(goal.title)}</h4>
                    <p class="text-sm text-gray-500 leading-relaxed">${escapeHTML(goal.desc)}</p>
                </div>
            </div>
        `;
    });
}

// =====================================================================
// DASHBOARD LOGIC (Profile & Family)
// =====================================================================

function renderDashboard() {
    const emailInput = document.getElementById('dash-email');
    const phoneInput = document.getElementById('dash-phone');
    if (emailInput) emailInput.value = userProfile.email;
    if (phoneInput) phoneInput.value = userProfile.phone;
    renderFamilyList();
}

function saveProfileDetails() {
    const phoneInput = document.getElementById('dash-phone');
    if (phoneInput) userProfile.phone = phoneInput.value.trim();
    alert("Phone number updated locally! (Next step: Cloud Sync)");
}

function addFamilyMember() {
    const nameInput = document.getElementById('fam-name');
    const ageInput = document.getElementById('fam-age');
    const genderInput = document.getElementById('fam-gender');
    const mobileInput = document.getElementById('fam-mobile');

    if (!nameInput.value || !ageInput.value || !genderInput.value) {
        alert("Name, Age, and Gender are required.");
        return;
    }

    userProfile.family.push({
        name: nameInput.value.trim(),
        age: ageInput.value.trim(),
        gender: genderInput.value,
        mobile: mobileInput.value.trim() || userProfile.phone 
    });

    nameInput.value = ''; ageInput.value = ''; genderInput.value = ''; mobileInput.value = '';
    renderFamilyList();
}

function removeFamilyMember(index) {
    userProfile.family.splice(index, 1);
    renderFamilyList();
}

function renderFamilyList() {
    const container = document.getElementById('family-members-list');
    if (!container) return;

    if (userProfile.family.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 font-medium italic p-4 bg-gray-50 rounded-xl text-center">No dependents added yet.</p>';
        return;
    }

    container.innerHTML = '';
    userProfile.family.forEach((member, index) => {
        container.innerHTML += `
            <div class="flex justify-between items-center bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div>
                    <h4 class="font-black text-sm text-gray-900">${escapeHTML(member.name)}</h4>
                    <p class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">${escapeHTML(member.age)} Yrs | ${escapeHTML(member.gender)} ${member.mobile ? `| ${escapeHTML(member.mobile)}` : ''}</p>
                </div>
                <button onclick="removeFamilyMember(${index})" class="text-red-500 hover:bg-red-50 text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all">Remove</button>
            </div>
        `;
    });
}

// =====================================================================
// INITIALIZATION
// =====================================================================
window.onload = () => { 
    if (typeof healthPackages !== 'undefined' && typeof investigations !== 'undefined') {
        rateCard = [...healthPackages, ...investigations];
    }
    filterTests(); 
    renderRoadmap(); 
    populateFeaturedPackages();
};
