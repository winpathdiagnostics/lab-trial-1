// =====================================================================
// CUSTOMER & LOCATION DETAILS (Google Forms Gateway)
// =====================================================================

/**
 * DIRECT MAPPING GATEWAY
 * This file connects your custom website fields directly to your Google Form.
 * Data lands in your linked Google Sheet instantly upon checkout.
 */

// Your specific Form Response URL
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe-eX7YISxrHAgkg9_9O-f8j_tzT02k5C9GQzDuME9Rcm94kA/formResponse";

/**
 * Maps website fields to Google Sheets via your Google Form bridge.
 */
async function recordPatientDetails(customerData) {
    if (!GOOGLE_FORM_URL) {
        console.warn("Google Form URL not configured.");
        return;
    }

    try {
        // We use the exact entry IDs you extracted from the pre-filled link
        const formData = new URLSearchParams();
        formData.append("entry.898710334", customerData.name);        // Name
        formData.append("entry.921188093", customerData.age);         // Age
        formData.append("entry.154247004", customerData.gender);      // Gender
        formData.append("entry.1047906780", customerData.mobile);     // Mobile
        formData.append("entry.1450782203", customerData.email);      // Email
        formData.append("entry.913704077", customerData.address);     // Address Note
        formData.append("entry.636938048", customerData.gpsLink);     // GPS Link
        formData.append("entry.1007532172", customerData.tests);      // Tests Booked
        formData.append("entry.1433709427", customerData.totalAmount); // Total Amount
        formData.append("entry.1096714223", customerData.promoCode);   // Promo Code


        // Submit the data silently in the background
        await fetch(GOOGLE_FORM_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        console.log("Data successfully logged to Google Sheet via Google Form.");
    } catch (error) {
        console.error("Data capture failed:", error);
    }
}
