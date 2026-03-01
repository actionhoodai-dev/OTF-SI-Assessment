// Replace with your actual deployed Apps Script URL if needed.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2xK3BKmD-G0nPldJNivkC9WCRp4JJRbzBftghbgOq2YKDF56g5mR_K08-Hs6Joho/exec';

export const saveAssessment = async (payload) => {
    try {
        const { patientInfo, assessmentData } = payload;

        // Flatten the data since Google Sheets usually expects a flat row of columns
        const flatData = {
            ...patientInfo,
            ...assessmentData
        };

        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(flatData)) {
            // Append each field as a form parameter
            if (value !== undefined && value !== null) {
                params.append(key, value);
            }
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: params, // Automatically sets to application/x-www-form-urlencoded
            mode: 'no-cors' // Prevent CORS preflight errors
        });

        // no-cors returns a response with type "opaque", so we assume success if no JS throw.
        return { success: true };
    } catch (error) {
        console.error("Error saving assessment:", error);
        throw error;
    }
};
