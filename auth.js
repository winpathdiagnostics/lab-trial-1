// =====================================================================
// FIREBASE AUTHENTICATION (Google Login)
// =====================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Your live Firebase configuration keys
const firebaseConfig = {
    apiKey: "AIzaSyAuf2TDHdcjVLIVIsAjTmuQIK5DEpzbl1g",
    authDomain: "winpath-diagnostics.firebaseapp.com",
    projectId: "winpath-diagnostics",
    storageBucket: "winpath-diagnostics.firebasestorage.app",
    messagingSenderId: "95881304047",
    appId: "1:95881304047:web:3610a884853c051c5c481a"
};

// Initialize Firebase App and Authentication
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Listen for changes in the user's login state (fires automatically on load, login, and logout)
onAuthStateChanged(auth, (user) => {
    const btnText = document.getElementById('auth-btn-text');
    const mobText = document.getElementById('mobile-auth-text');
    const loggedInView = document.getElementById('dash-logged-in');
    const loggedOutView = document.getElementById('dash-logged-out');
    const logoutBtn = document.getElementById('logout-btn');

    if (user) {
        // USER IS LOGGED IN: Update UI to show Account/Dashboard
        if(btnText) btnText.innerText = "Account";
        if(mobText) mobText.innerText = "My Account";
        if(loggedInView) loggedInView.classList.remove('hidden');
        if(loggedOutView) loggedOutView.classList.add('hidden');
        if(logoutBtn) logoutBtn.classList.remove('hidden');
        
        // Update our global user profile state (defined in main.js) with real Google Data
        if (typeof userProfile !== 'undefined') {
            userProfile.name = user.displayName || "Patient";
            userProfile.email = user.email || "";
            
            // Pre-fill the dashboard email field with their verified Google email
            const emailField = document.getElementById('dash-email');
            if(emailField) emailField.value = userProfile.email;
        }
        
    } else {
        // USER IS LOGGED OUT: Show login prompts
        if(btnText) btnText.innerText = "Login";
        if(mobText) mobText.innerText = "Login";
        if(loggedInView) loggedInView.classList.add('hidden');
        if(loggedOutView) loggedOutView.classList.remove('hidden');
        if(logoutBtn) logoutBtn.classList.add('hidden');
    }
});

// Triggered when user clicks "Continue with Google"
// Attached to the global window object so HTML buttons can trigger it
window.loginWithGoogle = async () => {
    try {
        // Triggers the secure Google sign-in popup
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login failed:", error);
        // Provide friendly error message if they close the popup without signing in
        if (error.code !== 'auth/popup-closed-by-user') {
            alert("Login failed. Please try again.");
        }
    }
};

// Triggered when user clicks "Logout / Sign Out"
window.logoutUser = async () => {
    try {
        await signOut(auth);
        // Relies on switchView function from main.js to send them home
        if (typeof switchView === 'function') switchView('home'); 
    } catch (error) {
        console.error("Logout failed:", error);
    }
};
