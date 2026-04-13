// =====================================================================
// 1. HEALTH PACKAGES
// =====================================================================
const healthPackages = [
    // --- LIFESTYLE & GENERAL WELLNESS ---
    { id: 'p-1', name: "Master Health Checkup", price: "5,999", isPackage: true, desc: "Our gold-standard clinical audit.", importance: "A complete clinical audit of major organ systems. Highly recommended once a year for proactive health management of heart, liver, kidney, and metabolic status.", params: "CBC, LFT, RFT, Lipid, HbA1c, Vitamin D, Vitamin B12, Urine Routine, Thyroid, Fasting Sugar", category: { package: 'LifeStyle' } },
    { id: 'p-2', name: "Full Body Checkup", price: "1,999", isPackage: true, desc: "Essential baseline organ health screen.", importance: "Perfect for routine monitoring of metabolic health, liver, and kidney functions at an accessible price for the entire family.", params: "CBC, Sugar, Lipid Profile, LFT, RFT, Urine Routine", category: { package: 'LifeStyle' } },
    
    // --- GENDER SPECIFIC ---
    { id: 'p-3', name: "Women's Health Package", price: "2,499", isPackage: true, desc: "Hormonal & nutritional focus.", importance: "Specifically designed for women to monitor reproductive health, hormonal balance, bone density markers, and iron levels.", params: "CBC, Thyroid Profile, Iron, Calcium, Vitamin D", category: { package: 'Women' } },
    { id: 'p-4', name: "Men's Health Package", price: "2,499", isPackage: true, desc: "Heart risk & prostate focus.", importance: "Targeted screening for cardiac risks, liver function, and age-related markers including prostate health indicators.", params: "CBC, Lipid Profile, LFT, PSA Total, Vitamin B12", category: { package: 'Men' } },
    
    // --- SENIORS & SPECIALIZED ---
    { id: 'p-5', name: "Seniors Health Screen", price: "3,499", isPackage: true, desc: "Age-related chronic monitoring.", importance: "Targets age-related risks including chronic inflammation, blood sugar stability, renal filtration, and bone mineral loss.", params: "CBC, HbA1c, Cardiac Profile, RFT, Vitamin D", category: { package: 'Senior' } },
    { id: 'p-6', name: "PCOS Screen", price: "2,999", isPackage: true, desc: "Reproductive hormonal panel.", importance: "Clinical evaluation of hormonal imbalance and insulin resistance associated with PCOS symptoms.", params: "FSH, LH, Prolactin, Insulin (F), Testosterone", category: { package: 'Women' } }
];

// =====================================================================
// 2. STANDALONE CLINICAL INVESTIGATIONS 
// =====================================================================
let investigations = [
    // --- HEMATOLOGY & COAGULATION ---
    { id: 'i-1', name: "Complete Blood Count (CBC)", price: "450", params: "Hb, WBC, Platelets, DC, Indices", category: { risk: 'General' } },
    { id: 'i-2', name: "Erythrocyte Sedimentation Rate (ESR)", price: "200", params: "ESR", category: { condition: 'Fever' } },
    { id: 'i-3', name: "Blood Grouping & Rh Factor", price: "250", params: "ABO, Rh Type", category: { risk: 'General' } },
    { id: 'i-4', name: "Peripheral Blood Smear", price: "350", params: "Morphology Analysis", category: { risk: 'General' } },
    { id: 'i-5', name: "Reticulocyte Count", price: "450", params: "Retic Count", category: { risk: 'General' } },
    { id: 'i-6', name: "Prothrombin Time (PT/INR)", price: "650", params: "PT, INR", category: { risk: 'Heart' } },
    { id: 'i-7', name: "APTT", price: "750", params: "Activated Partial Thromboplastin Time", category: { risk: 'Heart' } },
    { id: 'i-8', name: "Fibrinogen", price: "850", params: "Plasma Fibrinogen", category: { risk: 'Heart' } },
    { id: 'i-9', name: "D-Dimer", price: "1800", params: "D-Dimer Quantitative", category: { risk: 'Lungs' } },
    { id: 'i-10', name: "AEC (Absolute Eosinophil Count)", price: "250", params: "Eosinophil Count", category: { risk: 'Lungs' } },

    // --- DIABETES & METABOLIC ---
    { id: 'i-11', name: "Glucose Fasting (FBS)", price: "150", params: "Sugar (F)", category: { risk: 'Diabetes', condition: 'Diabetes' } },
    { id: 'i-12', name: "Glucose Post Prandial (PPBS)", price: "150", params: "Sugar (PP)", category: { risk: 'Diabetes', condition: 'Diabetes' } },
    { id: 'i-13', name: "Glucose Random (RBS)", price: "150", params: "Sugar (Random)", category: { risk: 'Diabetes', condition: 'Diabetes' } },
    { id: 'i-14', name: "HbA1c", price: "600", params: "Glycated Hemoglobin", category: { risk: 'Diabetes', condition: 'Diabetes' } },
    { id: 'i-15', name: "Insulin Fasting", price: "950", params: "Fasting Insulin", category: { risk: 'Diabetes', condition: 'Obesity' } },
    { id: 'i-16', name: "Insulin PP", price: "950", params: "Post Prandial Insulin", category: { risk: 'Diabetes', condition: 'Obesity' } },
    { id: 'i-17', name: "C-Peptide", price: "1200", params: "C-Peptide Fasting", category: { risk: 'Diabetes' } },
    { id: 'i-18', name: "Glucose Tolerance Test (GTT)", price: "600", params: "GTT (3 Samples)", category: { risk: 'Diabetes' } },

    // --- CARDIAC & LIPIDS ---
    { id: 'i-19', name: "Lipid Profile", price: "850", params: "Cholesterol, Triglycerides, HDL, LDL, VLDL", category: { risk: 'Heart', condition: 'Cardiovascular' } },
    { id: 'i-20', name: "Cholesterol (Total)", price: "250", params: "Total Cholesterol", category: { risk: 'Heart' } },
    { id: 'i-21', name: "Triglycerides", price: "350", params: "Serum Triglycerides", category: { risk: 'Heart' } },
    { id: 'i-22', name: "CRP (High Sensitivity)", price: "950", params: "hs-CRP", category: { risk: 'Heart', condition: 'Cardiovascular' } },
    { id: 'i-23', name: "Troponin I", price: "1800", params: "hs-Troponin I", category: { risk: 'Heart' } },
    { id: 'i-24', name: "Troponin T", price: "1800", params: "hs-Troponin T", category: { risk: 'Heart' } },
    { id: 'i-25', name: "CPK Total", price: "650", params: "Creatine Phosphokinase", category: { risk: 'Heart' } },
    { id: 'i-26', name: "CPK-MB", price: "850", params: "CPK-MB Isoenzyme", category: { risk: 'Heart' } },
    { id: 'i-27', name: "Homocysteine", price: "1500", params: "Homocysteine Levels", category: { risk: 'Heart' } },

    // --- LIVER FUNCTION (HEPATIC) ---
    { id: 'i-28', name: "Liver Function Test (LFT)", price: "950", params: "SGOT, SGPT, Bilirubin, ALP, Proteins", category: { risk: 'Liver', condition: 'Gut Health' } },
    { id: 'i-29', name: "Bilirubin Total & Direct", price: "350", params: "Total, Direct, Indirect Bilirubin", category: { risk: 'Liver' } },
    { id: 'i-30', name: "SGOT (AST)", price: "250", params: "AST", category: { risk: 'Liver' } },
    { id: 'i-31', name: "SGPT (ALT)", price: "250", params: "ALT", category: { risk: 'Liver' } },
    { id: 'i-32', name: "Alkaline Phosphatase (ALP)", price: "300", params: "Serum ALP", category: { risk: 'Liver' } },
    { id: 'i-33', name: "GGT", price: "550", params: "Gamma GT", category: { risk: 'Liver', condition: 'Alcohol' } },
    { id: 'i-34', name: "Total Protein & A/G Ratio", price: "350", params: "Protein, Albumin, Globulin", category: { risk: 'Liver', condition: 'Nutrition' } },

    // --- RENAL FUNCTION (KIDNEY) & ELECTROLYTES ---
    { id: 'i-35', name: "Renal Function Test (RFT)", price: "950", params: "Creatinine, Urea, Uric Acid, BUN, Electrolytes", category: { risk: 'Kidney', condition: 'Hypertension' } },
    { id: 'i-36', name: "Serum Creatinine", price: "250", params: "Creatinine", category: { risk: 'Kidney' } },
    { id: 'i-37', name: "Blood Urea Nitrogen (BUN)", price: "300", params: "BUN", category: { risk: 'Kidney' } },
    { id: 'i-38', name: "Uric Acid", price: "250", params: "Uric Acid", category: { risk: 'Kidney' } },
    { id: 'i-39', name: "Serum Electrolytes", price: "650", params: "Sodium, Potassium, Chloride", category: { risk: 'Kidney' } },
    { id: 'i-40', name: "Calcium (Total)", price: "300", params: "Serum Calcium", category: { condition: 'Bone Health' } },
    { id: 'i-41', name: "Phosphorus", price: "300", params: "Inorganic Phosphorus", category: { condition: 'Bone Health' } },
    { id: 'i-42', name: "Magnesium", price: "550", params: "Serum Magnesium", category: { risk: 'Kidney' } },
    { id: 'i-43', name: "Creatinine Clearance", price: "1200", params: "Blood & 24H Urine Creatinine", category: { risk: 'Kidney' } },

    // --- THYROID & ENDOCRINOLOGY ---
    { id: 'i-44', name: "Thyroid Profile (Total)", price: "750", params: "T3, T4, TSH", category: { risk: 'Thyroid' } },
    { id: 'i-45', name: "Thyroid Profile (Free)", price: "1100", params: "FT3, FT4, TSH", category: { risk: 'Thyroid' } },
    { id: 'i-46', name: "TSH (Ultrasensitive)", price: "450", params: "Thyroid Stimulating Hormone", category: { risk: 'Thyroid' } },
    { id: 'i-47', name: "Anti-TPO Antibodies", price: "1600", params: "Microsomal Antibody", category: { risk: 'Thyroid' } },
    { id: 'i-48', name: "Anti-Thyroglobulin (Anti-Tg)", price: "1600", params: "Anti-Tg", category: { risk: 'Thyroid' } },
    { id: 'i-49', name: "Prolactin", price: "750", params: "Serum Prolactin", category: { risk: 'Infertility', condition: 'Sexual Wellness' } },
    { id: 'i-50', name: "FSH", price: "700", params: "Follicle Stimulating Hormone", category: { risk: 'Infertility' } },
    { id: 'i-51', name: "LH", price: "700", params: "Luteinizing Hormone", category: { risk: 'Infertility' } },
    { id: 'i-52', name: "Testosterone (Total)", price: "950", params: "Total Testosterone", category: { risk: 'Infertility', condition: 'Sexual Wellness' } },
    { id: 'i-53', name: "Testosterone (Free)", price: "1400", params: "Free Testosterone", category: { risk: 'Infertility' } },
    { id: 'i-54', name: "Cortisol (Morning)", price: "850", params: "8 AM Cortisol", category: { condition: 'Sleep Disorder' } },
    { id: 'i-55', name: "Cortisol (Evening)", price: "850", params: "4 PM Cortisol", category: { condition: 'Sleep Disorder' } },
    { id: 'i-56', name: "Beta HCG (Quantitative)", price: "950", params: "Serum Beta HCG", category: { risk: 'General' } },

    // --- VITAMINS & NUTRITION ---
    { id: 'i-57', name: "Vitamin D (25-Hydroxy)", price: "1450", params: "25-OH Vitamin D", category: { condition: 'Bone Health' } },
    { id: 'i-58', name: "Vitamin B12", price: "1200", params: "Cyanocobalamin", category: { condition: 'Nutrition' } },
    { id: 'i-59', name: "Vitamin B9 (Folic Acid)", price: "1200", params: "Folate Levels", category: { condition: 'Nutrition' } },
    { id: 'i-60', name: "Iron Profile", price: "1100", params: "Iron, TIBC, UIBC, Transferrin Saturation", category: { condition: 'Nutrition' } },
    { id: 'i-61', name: "Ferritin", price: "850", params: "Serum Ferritin", category: { condition: 'Nutrition' } },
    { id: 'i-62', name: "Transferrin", price: "950", params: "Serum Transferrin", category: { condition: 'Nutrition' } },

    // --- IMMUNOLOGY, ARTHRITIS & INFLAMMATION ---
    { id: 'i-63', name: "CRP (Standard)", price: "550", params: "C-Reactive Protein", category: { condition: 'Fever' } },
    { id: 'i-64', name: "RA Factor (Quantitative)", price: "650", params: "Rheumatoid Factor", category: { condition: 'Bone Health' } },
    { id: 'i-65', name: "Anti-CCP", price: "1500", params: "Cyclic Citrullinated Peptide", category: { condition: 'Bone Health' } },
    { id: 'i-66', name: "ANA (Anti-Nuclear Antibody)", price: "1100", params: "ANA IFA Method", category: { risk: 'General' } },
    { id: 'i-67', name: "ANA Profile (Immunoblot)", price: "3500", params: "17 Antigen Panel", category: { risk: 'General' } },
    { id: 'i-68', name: "ASO Titre", price: "650", params: "Anti-Streptolysin O", category: { risk: 'Heart' } },
    { id: 'i-69', name: "HLA-B27", price: "1800", params: "HLA-B27 Antigen", category: { condition: 'Bone Health' } },

    // --- INFECTIOUS DISEASES & SEROLOGY ---
    { id: 'i-70', name: "Dengue NS1 Antigen", price: "850", params: "NS1 Ag", category: { condition: 'Fever' } },
    { id: 'i-71', name: "Dengue IgM/IgG Antibodies", price: "1100", params: "Dengue Serology", category: { condition: 'Fever' } },
    { id: 'i-72', name: "Malaria Antigen (Rapid)", price: "400", params: "Pf/Pv Antigen", category: { condition: 'Fever' } },
    { id: 'i-73', name: "Widal Test", price: "350", params: "Typhoid Screen", category: { condition: 'Fever' } },
    { id: 'i-74', name: "Typhidot (IgM/IgG)", price: "650", params: "Salmonella Antibodies", category: { condition: 'Fever' } },
    { id: 'i-75', name: "HBsAg (Hepatitis B)", price: "450", params: "Hepatitis B Surface Antigen", category: { risk: 'Liver' } },
    { id: 'i-76', name: "Anti-HCV (Hepatitis C)", price: "850", params: "HCV Antibodies", category: { risk: 'Liver' } },
    { id: 'i-77', name: "HIV 1&2 Antibody", price: "650", params: "4th Generation Screen", category: { condition: 'Sexual Wellness' } },
    { id: 'i-78', name: "VDRL / RPR", price: "350", params: "Syphilis Screen", category: { condition: 'Sexual Wellness' } },
    { id: 'i-79', name: "H. Pylori IgG", price: "950", params: "Helicobacter Pylori Ab", category: { condition: 'Gut Health' } },
    { id: 'i-80', name: "Mantoux Test", price: "350", params: "TB Skin Test (Requires 48H reading)", category: { risk: 'Lungs' } },
    { id: 'i-81', name: "Chikungunya IgM", price: "950", params: "Chikungunya Antibodies", category: { condition: 'Fever' } },
    { id: 'i-82', name: "Leptospira IgM", price: "850", params: "Leptospirosis Screen", category: { condition: 'Fever' } },
    { id: 'i-83', name: "Microfilaria Screen", price: "450", params: "Filaria Smear (Night Sample)", category: { condition: 'Fever' } },

    // --- ONCOLOGY (TUMOR MARKERS) ---
    { id: 'i-84', name: "PSA Total", price: "1200", params: "Prostate Antigen", category: { risk: 'Cancer' } },
    { id: 'i-85', name: "CEA", price: "1100", params: "Carcinoembryonic Antigen", category: { risk: 'Cancer', condition: 'Gut Health' } },
    { id: 'i-86', name: "CA-125", price: "1450", params: "Ovarian Cancer Marker", category: { risk: 'Cancer' } },
    { id: 'i-87', name: "CA-15.3", price: "1450", params: "Breast Cancer Marker", category: { risk: 'Cancer' } },
    { id: 'i-88', name: "CA-19.9", price: "1450", params: "Pancreatic Cancer Marker", category: { risk: 'Cancer', condition: 'Gut Health' } },
    { id: 'i-89', name: "Alpha Fetoprotein (AFP)", price: "1100", params: "Liver/Germ Cell Marker", category: { risk: 'Cancer', risk: 'Liver' } },

    // --- CLINICAL PATHOLOGY (URINE & STOOL) ---
    { id: 'i-90', name: "Urine Routine & Microscopic", price: "250", params: "Physical, Chemical & Microscopic Exam", category: { risk: 'Kidney' } },
    { id: 'i-91', name: "Urine Microalbumin", price: "750", params: "ACR Ratio", category: { risk: 'Kidney', condition: 'Hypertension' } },
    { id: 'i-92', name: "24-Hour Urine Protein", price: "850", params: "Total Protein Excretion", category: { risk: 'Kidney' } },
    { id: 'i-93', name: "Urine Culture & Sensitivity", price: "850", params: "Bacterial Culture", category: { risk: 'Kidney' } },
    { id: 'i-94', name: "Stool Routine", price: "250", params: "Ova, Cyst, Microscopy", category: { condition: 'Gut Health' } },
    { id: 'i-95', name: "Stool Occult Blood", price: "350", params: "Hidden Blood Detection", category: { condition: 'Gut Health' } },
    { id: 'i-96', name: "Stool Hanging Drop", price: "350", params: "Cholera Screen", category: { condition: 'Gut Health' } },
    { id: 'i-97', name: "Semen Analysis", price: "850", params: "Count, Motility, Morphology", category: { risk: 'Infertility', condition: 'Sexual Wellness' } },

    // --- SPECIALIZED BIOCHEMISTRY & DRUGS ---
    { id: 'i-98', name: "Amylase", price: "750", params: "Serum Amylase", category: { condition: 'Gut Health' } },
    { id: 'i-99', name: "Lipase", price: "950", params: "Serum Lipase", category: { condition: 'Gut Health' } },
    { id: 'i-100', name: "LDH (Lactate Dehydrogenase)", price: "650", params: "Total LDH", category: { risk: 'Lungs' } },
    { id: 'i-101', name: "G6PD", price: "850", params: "Glucose-6-Phosphate Dehydrogenase", category: { risk: 'General' } },
    { id: 'i-102', name: "Serum Copper", price: "1200", params: "Copper Levels", category: { risk: 'General' } },
    { id: 'i-103', name: "Serum Zinc", price: "1200", params: "Zinc Levels", category: { risk: 'General' } },
    { id: 'i-104', name: "Ceruloplasmin", price: "1500", params: "Wilson's Disease Screen", category: { risk: 'Liver' } },
    { id: 'i-105', name: "Phenytoin Level", price: "1200", params: "Drug Monitoring", category: { risk: 'General' } },
    { id: 'i-106', name: "Valproic Acid Level", price: "1200", params: "Drug Monitoring", category: { risk: 'General' } },
    { id: 'i-107', name: "Lithium Level", price: "850", params: "Drug Monitoring", category: { risk: 'General' } },
    { id: 'i-108', name: "Digoxin Level", price: "1800", params: "Drug Monitoring", category: { risk: 'Heart' } }
];

// =====================================================================
// 3. STRATEGIC ROADMAP GOALS
// =====================================================================
const roadmapGoals = [
    { year: "2026", title: "Foundation of Winpath", desc: "Established Winpath Diagnostics with a vision for delivering precision pathology directly to patients.", status: "completed" },
    { year: "2026", title: "NABL M(EL)T Labs Accreditation", desc: "Achieved strict global quality standards, ensuring flawless precision in all our clinical reporting.", status: "upcoming" },
    { year: "2026", title: "Digital Integration", desc: "Launched seamless WhatsApp bookings, at-home collections, and rapid 24H digital report delivery.", status: "upcoming" },

];
