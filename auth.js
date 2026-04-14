// =====================================================================
// CLERK AUTHENTICATION (Modern, Shield-Bypassing Login)
// =====================================================================

// Wait for the HTML document and deferred Clerk scripts to finish loading
window.addEventListener('load', function () {
    
    // 1. Safe Polling: Wait for Clerk to auto-initialize from the script tag
    const checkClerkReady = setInterval(() => {
        
        // Check if the Clerk object exists and the listener function is ready
        if (window.Clerk && typeof window.Clerk.addListener === 'function') {
            clearInterval(checkClerkReady); // Stop polling
            
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

                    // Mount the Profile Avatar & Logout Dropdown
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
        }
    }, 100); // Check every 100 milliseconds
});

// Global function triggered by the hardcoded "Continue with Google" button in index.html
window.triggerClerkLogin = function() {
    try {
        // If Clerk exists and the openSignIn function is ready, pop the modal!
        if (window.Clerk && typeof window.Clerk.openSignIn === 'function') {
            window.Clerk.openSignIn();
        } else {
            // Failsafe alert in case the user has slow internet
            alert("Secure connection is still loading. Please ensure you have internet access and try again in 3 seconds.");
        }
    } catch (error) {
        console.error("Error opening login modal:", error);
        alert("An error occurred while opening the login box. Please refresh the page.");
    }
};
