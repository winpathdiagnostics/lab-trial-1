// =====================================================================
// CLERK AUTHENTICATION (Modern, Shield-Bypassing Login)
// =====================================================================

// CHANGED: Made the event listener callback 'async' so we can use 'await' 
// as required by the Clerk v6 documentation.
window.addEventListener('load', async function () {
    
    if (window.Clerk) {
        try {
            // NEW: Explicitly initialize the Clerk engine. 
            // According to the Quickstart docs, this is mandatory for the script tag setup.
            await window.Clerk.load({
                appearance: { variables: { colorPrimary: '#2C5EB4' } }
            });

            // 2. Add the listener for login/logout events
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
                    
                    // Populate global profile data for checkout autofill
                    if (typeof userProfile !== 'undefined') {
                        userProfile.name = user.fullName || "Patient";
                        userProfile.email = user.primaryEmailAddress?.emailAddress || "";
                        const emailField = document.getElementById('dash-email');
                        if(emailField) emailField.value = userProfile.email;
                    }

                    // CHANGED: Uses Clerk.mountUserButton as per the Components Overview docs
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
                }
            });
        } catch (error) {
            console.error("Clerk initialization failed:", error);
        }
    } else {
        console.error("Clerk script was not found on the window object.");
    }
});

// Global function triggered by the hardcoded "Continue with Google" button in index.html
window.triggerClerkLogin = function() {
    try {
        // CHANGED: Simplified check. Because we 'await' the load above, 
        // we just need to confirm openSignIn is available as per the components docs.
        if (window.Clerk && typeof window.Clerk.openSignIn === 'function') {
            window.Clerk.openSignIn();
        } else {
            // Failsafe alert in case the user clicked too fast or has slow internet
            alert("Secure connection is still loading. Please wait a few seconds and try again.");
        }
    } catch (error) {
        console.error("Error opening login modal:", error);
        alert("An error occurred while opening the login box. Please refresh the page.");
    }
};
