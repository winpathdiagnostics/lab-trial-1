// =====================================================================
// CLERK AUTHENTICATION (Modern, Shield-Bypassing Login)
// =====================================================================

// Wait for the HTML document and Clerk scripts (loaded in index.html) to finish loading
window.addEventListener('load', function () {
    
    // 1. Robust initialization checker
    const checkClerkReady = () => {
        // FIXED: Clerk Version 6 uses .loaded instead of .isReady
        if (window.Clerk && window.Clerk.loaded) {
            setupClerkListener();
        } else if (window.Clerk) {
            // Still loading, check again in 50ms
            setTimeout(checkClerkReady, 50);
        } else {
            console.error("Clerk script tag not found.");
        }
    };

    // Start checking
    checkClerkReady();

    // 2. Add the authentication listener
    function setupClerkListener() {
        // Centralized theme matching your Winpath branding
        const clerkAppearance = { 
            variables: { colorPrimary: '#2C5EB4' } 
        };

        // This runs immediately, AND automatically runs again the exact second 
        // a user successfully signs in or signs out.
        window.Clerk.addListener(({ user }) => {
            
            // Grab the UI elements that need to change based on login state
            const btnText = document.getElementById('auth-btn-text');
            const mobText = document.getElementById('mobile-auth-text');
            const loggedInView = document.getElementById('dash-logged-in');
            const loggedOutView = document.getElementById('dash-logged-out');

            if (user) {
                // ==========================================
                // STATE: USER IS SUCCESSFULLY LOGGED IN
                // ==========================================
                
                // Change Navigation bar text
                if(btnText) btnText.innerText = "Account";
                if(mobText) mobText.innerText = "My Account";
                
                // Swap the Dashboard views
                if(loggedInView) loggedInView.classList.remove('hidden');
                if(loggedOutView) loggedOutView.classList.add('hidden');
                
                // Populate our global userProfile (used by main.js to autofill the checkout cart)
                if (typeof userProfile !== 'undefined') {
                    userProfile.name = user.fullName || "Patient";
                    // Clerk stores emails in an array, we grab the primary one
                    userProfile.email = user.primaryEmailAddress?.emailAddress || "";
                    
                    // Pre-fill the dashboard email field and lock it
                    const emailField = document.getElementById('dash-email');
                    if(emailField) emailField.value = userProfile.email;
                }

                // Mount Clerk's beautiful "User Button" (Profile Pic + Logout Dropdown)
                // This replaces the manual Logout button
                const userButtonDiv = document.getElementById('clerk-user-button');
                if (userButtonDiv) {
                    window.Clerk.mountUserButton(userButtonDiv, { appearance: clerkAppearance });
                }

            } else {
                // ==========================================
                // STATE: USER IS LOGGED OUT
                // ==========================================
                
                // Reset Navigation bar text
                if(btnText) btnText.innerText = "Login";
                if(mobText) mobText.innerText = "Login";
                
                // Swap the Dashboard views
                if(loggedInView) loggedInView.classList.add('hidden');
                if(loggedOutView) loggedOutView.classList.remove('hidden');
                
                // Inject our custom Login Button into the empty div
                const signInDiv = document.getElementById('clerk-sign-in');
                if (signInDiv) {
                    // Clear out anything currently inside it
                    signInDiv.innerHTML = '';
                    
                    // Create a beautiful button with the Google logo
                    const loginBtn = document.createElement('button');
                    loginBtn.className = "inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-white border-2 border-gray-100 hover:border-brand-blue rounded-2xl text-sm font-black text-gray-700 hover:text-brand-blue transition-all shadow-sm active:scale-95";
                    loginBtn.innerHTML = `
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Continue with Google
                    `;
                    
                    // Tell the button to trigger Clerk's secure modal popup!
                    loginBtn.onclick = () => {
                        window.Clerk.openSignIn({ appearance: clerkAppearance });
                    };
                    
                    signInDiv.appendChild(loginBtn);
                }
            }
        });
    }
});
