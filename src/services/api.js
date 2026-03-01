import { ASSESSMENT_STRUCTURE } from '../data/assessmentData';

// Replace with your actual deployed Apps Script URL if needed.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2xK3BKmD-G0nPldJNivkC9WCRp4JJRbzBftghbgOq2YKDF56g5mR_K08-Hs6Joho/exec';

export const saveAssessment = async (payload) => {
    try {
        const { patientInfo, assessmentData } = payload;

        // The absolutely optimal way is to just send the raw assessment data to Google App Scripts.
        // Doing this allows the Google App Script to directly map each specific question 
        // to its own dedicated column, instead of condensing them inside a single subsection string.
        const customPayload = {
            patientInfo: {
                patientId: patientInfo.patientId || "",
                name: patientInfo.name || "",
                dob: patientInfo.dob || "",
                ageSex: `${patientInfo.age || ''} ${patientInfo.sex || ''}`,
                assessmentDate: patientInfo.assessmentDate || "",
                informant: patientInfo.informant || "",
                address: patientInfo.address || "",
                chiefComplaints: patientInfo.chiefComplaints || ""
            },
            assessmentData: assessmentData
        };

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(customPayload),
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // no-cors returns a response with type "opaque", so we assume success if no JS throw.
        return { success: true };
    } catch (error) {
        console.error("Error saving assessment:", error);
        throw error;
    }
};
export const fetchPatients = async () => {
    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=getPatients`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn("Could not fetch patients remotely:", error);
        // Return dummy data or rely on local storage cache if we're unable to hit Google successfully due to CORS
        const local = localStorage.getItem('otf_patients');
        return local ? JSON.parse(local) : [];
    }
};
