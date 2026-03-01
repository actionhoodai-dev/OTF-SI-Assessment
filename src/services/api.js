// Replace with your actual deployed Apps Script URL if needed.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2xK3BKmD-G0nPldJNivkC9WCRp4JJRbzBftghbgOq2YKDF56g5mR_K08-Hs6Joho/exec';

export const saveAssessment = async (data) => {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'submitAssessment',
                data: data
            }),
            // no-cors is often needed for simple apps script deployments if CORS isn't explicitly handled
            mode: 'no-cors'
        });

        // With no-cors, we can't read the response. We assume success if it doesn't throw.
        return { success: true };
    } catch (error) {
        console.error("Error saving assessment:", error);
        throw error;
    }
};
