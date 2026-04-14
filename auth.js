
// =====================================================================
// CLERK AUTHENTICATION (Modern, Shield-Bypassing Login)
// =====================================================================

// Wait for the HTML document and Clerk scripts to finish downloading
window.addEventListener('load', function () {
    
    // Function to safely initialize the Clerk engine
    const initializeClerk = async () => {
        // 1. Check if the Clerk scripts from index.html have finished downloading
        if (window.Clerk) {
            try {
                // 2. CRITICAL FIX: We MUST call .load() to start the Clerk engine!
                await window.Clerk.load({
                    appearance: { variables: { colorPrimary: '#2C5EB4' } }
                });

                // 3. Now that the engine is running, we can listen for logins
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
                        
                        // Populate global profile data
                        if (typeof userProfile !== 'undefined') {
                            userProfile.name = user.fullName || "Patient";
                            userProfile.email = user.primaryEmailAddress?.emailAddress || "";
                            const emailField = document.getElementById('dash-email');
                            if(emailField) emailField.value = userProfile.email;
                        }

                        // Inject the Profile Avatar & Logout Dropdown
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
                console.error("Clerk engine failed to start:", error);
            }
        } else {
            // If the script hasn't downloaded yet, check again in 100ms
            setTimeout(initializeClerk, 100);
        }
    };

    // Start the initialization process
    initializeClerk();
});

// Global function triggered by the hardcoded "Continue with Google" button in index.html
window.triggerClerkLogin = function() {
    // If Clerk exists and the openSignIn function is ready, pop the modal
    if (window.Clerk && window.Clerk.openSignIn) {
        window.Clerk.openSignIn({ 
            appearance: { variables: { colorPrimary: '#2C5EB4' } } 
        });
    } else {
        alert("Authentication is still connecting to the server. Please wait a moment and try again.");
    }
};


```
