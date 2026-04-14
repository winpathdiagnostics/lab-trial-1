// =====================================================================
// CLERK AUTHENTICATION (Modern, Shield-Bypassing Login)
// =====================================================================

// 1. REPLACE THIS WITH YOUR CLERK PUBLISHABLE KEY (Starts with 'pk_test_' or 'pk_live_')
const CLERK_PUBLISHABLE_KEY = 'YOUR_CLERK_PUBLISHABLE_KEY';

// 2. Dynamically load the Clerk JavaScript library directly into your website
const script = document.createElement('script');
script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
script.async = true;
script.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js';
script.crossOrigin = 'anonymous';

// 3. What to do once Clerk finishes loading
script.addEventListener('load', async function () {
    // Initialize Clerk
    await window.Clerk.load({
        // Forces the login box to stay beautifully contained in your dashboard 
        // without reloading the page or triggering browser popup blockers.
        appearance: { variables: { colorPrimary: '#2C5EB4' } } 
    });

    // 4. Add a listener. This runs immediately on load, AND automatically runs again 
    // the exact second a user successfully signs in or signs out.
    window.Clerk.addListener(({ user }) => {
        const btnText = document.getElementById('auth-btn-text');
        const mobText = document.getElementById('mobile-auth-text');
        const loggedInView = document.getElementById('dash-logged-in');
        const loggedOutView = document.getElementById('dash-logged-out');

        if (user) {
            // ==========================================
            // STATE: USER IS SUCCESSFULLY LOGGED IN
            // ==========================================
            if(btnText) btnText.innerText = "Account";
            if(mobText) mobText.innerText = "My Account";
            if(loggedInView) loggedInView.classList.remove('hidden');
            if(loggedOutView) loggedOutView.classList.add('hidden');
            
            // Populate our global userProfile (used by main.js for checkout autofill)
            if (typeof userProfile !== 'undefined') {
                userProfile.name = user.fullName || "Patient";
                userProfile.email = user.primaryEmailAddress?.emailAddress || "";
                
                const emailField = document.getElementById('dash-email');
                if(emailField) emailField.value = userProfile.email;
            }

            // Mount Clerk's beautiful "User Button" (Profile Pic + Logout Dropdown)
            const userButtonDiv = document.getElementById('clerk-user-button');
            if (userButtonDiv) {
                window.Clerk.mountUserButton(userButtonDiv);
            }

        } else {
            // ==========================================
            // STATE: USER IS LOGGED OUT
            // ==========================================
            if(btnText) btnText.innerText = "Login";
            if(mobText) mobText.innerText = "Login";
            if(loggedInView) loggedInView.classList.add('hidden');
            if(loggedOutView) loggedOutView.classList.remove('hidden');
            
            // Mount Clerk's secure "Sign In" Box directly into your dashboard page
            const signInDiv = document.getElementById('clerk-sign-in');
            if (signInDiv) {
                window.Clerk.mountSignIn(signInDiv);
            }
        }
    });
});

// Append the script to the document to trigger the loading process
document.body.appendChild(script);
