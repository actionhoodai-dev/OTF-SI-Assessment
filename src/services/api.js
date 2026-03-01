import { ASSESSMENT_STRUCTURE } from '../data/assessmentData';

// Replace with your actual deployed Apps Script URL if needed.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2xK3BKmD-G0nPldJNivkC9WCRp4JJRbzBftghbgOq2YKDF56g5mR_K08-Hs6Joho/exec';

export const saveAssessment = async (payload) => {
    try {
        const { patientInfo, assessmentData } = payload;

        const mapToBackend = () => {
            const tData = {}; const vData = {}; const pData = {}; const aData = {}; const viData = {}; const gData = {};

            const compressQ = (secId, subId) => {
                const section = ASSESSMENT_STRUCTURE.find(s => s.id === secId);
                if (!section) return "";
                const subsection = section.subsections.find(s => s.title === subId || s.id === subId);
                if (!subsection) return "";

                const results = [];
                subsection.questions.forEach(q => {
                    const key = `${secId}_${subsection.id}_${q.id}`;
                    const answer = assessmentData[key];
                    if (answer) {
                        results.push(`${q.text}: ${answer}`);
                    } else {
                        results.push(`${q.text}: Not Answered`);
                    }
                });
                return results.join('\n');
            };

            // Tactile
            tData["Dressing"] = { value: compressQ('TACTILE', 'Dressing'), comment: assessmentData["TACTILE_Dressing_Comments"] || "" };
            tData["ADL"] = { value: compressQ('TACTILE', 'Activities of Daily Living'), comment: assessmentData["TACTILE_Activities of Daily Living_Comments"] || "" };
            tData["Personal_Space"] = { value: compressQ('TACTILE', 'Personal Space'), comment: assessmentData["TACTILE_Personal Space_Comments"] || "" };
            tData["Social"] = { value: compressQ('TACTILE', 'Social'), comment: assessmentData["TACTILE_Social_Comments"] || "" };
            tData["Self_Stimulatory"] = { value: compressQ('TACTILE', 'Self-Stimulatory Behaviors'), comment: assessmentData["TACTILE_Self-Stimulatory Behaviors_Comments"] || "" };
            tData["Self_Injurious"] = { value: compressQ('TACTILE', 'Self-Injurious Behaviors'), comment: assessmentData["TACTILE_Self-Injurious Behaviors_Comments"] || "" };

            // Vestibular
            vData["Muscle_Tone"] = { value: compressQ('VESTIBULAR', 'Muscle tone'), comment: assessmentData["VESTIBULAR_Muscle tone_Comments"] || "" };
            vData["Equilibrium"] = { value: compressQ('VESTIBULAR', 'Equilibrium Responses'), comment: assessmentData["VESTIBULAR_Equilibrium Responses_Comments"] || "" };
            vData["Posture_Movement"] = { value: compressQ('VESTIBULAR', 'Posture and movement'), comment: assessmentData["VESTIBULAR_Posture and movement_Comments"] || "" };
            vData["Bilateral_Coordination"] = { value: compressQ('VESTIBULAR', 'Bilateral Coordination'), comment: assessmentData["VESTIBULAR_Bilateral Coordination_Comments"] || "" };
            vData["Spatial_Perception"] = { value: compressQ('VESTIBULAR', 'Spatial perception'), comment: assessmentData["VESTIBULAR_Spatial perception_Comments"] || "" };
            vData["Emotional_Expression"] = { value: compressQ('VESTIBULAR', 'Emotional Expression'), comment: assessmentData["VESTIBULAR_Emotional Expression_Comments"] || "" };
            vData["Self_Stimulatory"] = { value: compressQ('VESTIBULAR', 'Self-Stimulatory Behaviors'), comment: assessmentData["VESTIBULAR_Self-Stimulatory Behaviors_Comments"] || "" };

            // Proprioception
            pData["Muscle_Tone"] = { value: compressQ('PROPRIOCEPTION', 'Muscle tone'), comment: assessmentData["PROPRIOCEPTION_Muscle tone_Comments"] || "" };
            pData["Motor_Planning"] = { value: compressQ('PROPRIOCEPTION', 'Motor Skills/Planning and Body Image'), comment: assessmentData["PROPRIOCEPTION_Motor Skills/Planning and Body Image_Comments"] || "" };
            pData["Self_Stimulatory"] = { value: compressQ('PROPRIOCEPTION', 'Self-Stimulatory Behaviors'), comment: assessmentData["PROPRIOCEPTION_Self-Stimulatory Behaviors_Comments"] || "" };
            pData["Self_Injurious"] = { value: compressQ('PROPRIOCEPTION', 'Self-Injurious Behaviors'), comment: assessmentData["PROPRIOCEPTION_Self-Injurious Behaviors_Comments"] || "" };

            // Auditory
            aData["Social_Behaviour"] = { value: compressQ('AUDITORY', 'Social Behavior'), comment: assessmentData["AUDITORY_Social Behavior_Comments"] || "" };
            aData["Self_Stimulatory"] = { value: compressQ('AUDITORY', 'Self-Stimulatory behavior'), comment: assessmentData["AUDITORY_Self-Stimulatory behavior_Comments"] || "" };

            // Visual
            viData["General_Behaviour"] = { value: compressQ('VISUAL', 'General behavior/ Social'), comment: assessmentData["VISUAL_General behavior/ Social_Comments"] || "" };
            viData["Visual_Spatial"] = { value: compressQ('VISUAL', 'Visual spatal'), comment: assessmentData["VISUAL_Visual spatal_Comments"] || "" };
            viData["Motor_Planning"] = { value: compressQ('VISUAL', 'Motor Planning'), comment: assessmentData["VISUAL_Motor Planning_Comments"] || "" };
            viData["Self_Stimulatory"] = { value: compressQ('VISUAL', 'Self-Stimulatory behavior'), comment: assessmentData["VISUAL_Self-Stimulatory behavior_Comments"] || "" };

            // General
            gData["General_Reactions"] = { value: compressQ('GENERAL REACTIONS', 'General Reactions'), comment: assessmentData["GENERAL REACTIONS_General Reactions_Comments"] || "" };

            return { tactile: tData, vestibular: vData, proprioception: pData, auditory: aData, visual: viData, general: gData };
        };

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
            ...mapToBackend()
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
