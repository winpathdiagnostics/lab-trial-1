// =====================================================================
// CLERK AUTHENTICATION (Modern, Shield-Bypassing Login)
// =====================================================================

// Wait for the HTML document and Clerk scripts (loaded in index.html) to finish loading
window.addEventListener('load', function () {
    
    // 1. Robust initialization checker
    // Because your script tags in index.html auto-load Clerk, we need to wait 
    // for it to finish initializing before we attach our listeners.
    const checkClerkReady = () => {
        if (window.Clerk && window.Clerk.isReady) {
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
                
                // Mount Clerk's secure "Sign In" Box directly into your dashboard page
                const signInDiv = document.getElementById('clerk-sign-in');
                if (signInDiv) {
                    window.Clerk.mountSignIn(signInDiv, { appearance: clerkAppearance });
                }
            }
        });
    }
});
