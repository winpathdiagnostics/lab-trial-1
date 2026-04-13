// =====================================================================
// BILLING & FEE CONFIGURATION
// =====================================================================
// Adjust these values anytime. The website will automatically update.

const BILLING_CONFIG = {
    // Standard Fees (in ₹)
    homeCollectionFee: 110,  // Charge for visiting the patient's home
    bookingFee: 30,          // Fee for processing the booking
    platformFee: 10,         // Fee for platform maintenance
    
    // Discount Codes Dictionary
    // Format: "CODENAME": percentage_number
    validDiscountCodes: {
        "WINPATH20": 20,     // 20% off
        "HEALTH50": 50,      // 50% off
        "DRDSA10": 10        // 10% off
    }
};
