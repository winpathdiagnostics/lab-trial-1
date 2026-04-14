// =====================================================================
// CLERK AUTHENTICATION (Modern, Shield-Bypassing Login)
// =====================================================================

// Wait for the HTML document and Clerk scripts to finish loading
window.addEventListener('load', function () {
    
    const checkClerkReady = () => {
        if (window.Clerk && window.Clerk.loaded) {
            setupClerkListener();
        } else if (window.Clerk) {
            // Still loading, check again in 50ms
            setTimeout(checkClerkReady, 50);
        } else {
            // Keep checking just in case of slow internet
            setTimeout(checkClerkReady, 250);
        }
    };

    checkClerkReady();

    function setupClerkListener() {
        const clerkAppearance = { variables: { colorPrimary: '#2C5EB4' } };

        // Automatically updates UI when user logs in or out
        window.Clerk.addListener(({ user }) => {
            const btnText = document.getElementById('auth-btn-text');
            const mobText = document.getElementById('mobile-auth-text');
            const loggedInView = document.getElementById('dash-logged-in');
            const loggedOutView = document.getElementById('dash-logged-out');

            if (user) {
                // USER IS LOGGED IN
                if(btnText) btnText.innerText = "Account";
                if(mobText) mobText.innerText = "My Account";
                if(loggedInView) loggedInView.classList.remove('hidden');
                if(loggedOutView) loggedOutView.classList.add('hidden');
                
                // Populate profile data
                if (typeof userProfile !== 'undefined') {
                    userProfile.name = user.fullName || "Patient";
                    userProfile.email = user.primaryEmailAddress?.emailAddress || "";
                    const emailField = document.getElementById('dash-email');
                    if(emailField) emailField.value = userProfile.email;
                }

                // Inject the Profile Avatar / Logout Dropdown
                const userButtonDiv = document.getElementById('clerk-user-button');
                if (userButtonDiv) {
                    window.Clerk.mountUserButton(userButtonDiv, { appearance: clerkAppearance });
                }
            } else {
                // USER IS LOGGED OUT
                if(btnText) btnText.innerText = "Login";
                if(mobText) mobText.innerText = "Login";
                if(loggedInView) loggedInView.classList.add('hidden');
                if(loggedOutView) loggedOutView.classList.remove('hidden');
            }
        });
    }
});

// Global function to manually trigger the Clerk Login Modal when the button is clicked
window.triggerClerkLogin = function() {
    if (window.Clerk && window.Clerk.loaded) {
        window.Clerk.openSignIn({ appearance: { variables: { colorPrimary: '#2C5EB4' } } });
    } else {
        alert("Authentication is still loading. Please wait a few seconds and try again.");
    }
};
