import { ASSESSMENT_STRUCTURE } from '../data/assessmentData';

// Replace with your actual deployed Apps Script URL if needed.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2xK3BKmD-G0nPldJNivkC9WCRp4JJRbzBftghbgOq2YKDF56g5mR_K08-Hs6Joho/exec';

export const saveAssessment = async (payload) => {
    try {
        const { patientInfo, assessmentData } = payload;

        // Transform frontend assessment structure keys into the backend's expected array formats.
        // E.g. TACTILE_Dressing_Q1 needs to go into tactile array.

        const buildSection = (sectionPrefixName, dbSectionName) => {
            let out = {};
            // We need to look at assessmentData and extract matching keys
            Object.keys(assessmentData).forEach(key => {
                if (key.startsWith(`${sectionPrefixName}_`)) {
                    // Key is like TACTILE_Dressing_Q1
                    // We just need to aggregate by item name
                    // e.g. "Dressing", "ADL", "Personal_Space", etc.
                    // The backend script expects a dictionary where each key is an item
                    // and the value is { value: "YES/NO", comment: "..." }
                    // Note: We'll construct standard properties here, but the backend script
                    // specifically runs a flatten() method that takes every dict property 
                    // and turns them into a row array.

                    // In the web app, we save Q1, Q2, etc as well. To accommodate the script,
                    // we will pack everything for a subsection exactly as the script demands.
                }
            });
        }

        // According to the script, wait... the script does:
        // Object.keys(section).forEach(key=>{ out.push(section[key].value || ""); out.push(section[key].comment || ""); });
        // It relies entirely on the ORDER of keys inside the object.

        const mapToBackend = () => {
            // We must create an exact representation matching the backend's manual column mappings
            const tData = {}; const vData = {}; const pData = {}; const aData = {}; const viData = {}; const gData = {};

            // The backend expects each item as a key, holding { value: "...", comment: "..." }
            // However, our UI has multiple questions per subsection. We must concatenate Qs or build custom logic...
            // Let's just create raw payloads matching what the backend `flatten()` will traverse.

            // Tactile
            tData["Dressing"] = { value: "", comment: assessmentData["TACTILE_Dressing_Comments"] || "" };
            tData["ADL"] = { value: "", comment: assessmentData["TACTILE_Activities of Daily Living_Comments"] || "" };
            tData["Personal_Space"] = { value: "", comment: assessmentData["TACTILE_Personal Space_Comments"] || "" };
            tData["Social"] = { value: "", comment: assessmentData["TACTILE_Social_Comments"] || "" };
            tData["Self_Stimulatory"] = { value: "", comment: assessmentData["TACTILE_Self-Stimulatory Behaviors_Comments"] || "" };
            tData["Self_Injurious"] = { value: "", comment: assessmentData["TACTILE_Self-Injurious Behaviors_Comments"] || "" };

            // Note: In our frontend, we have YES/NO on EACH QUESTION, not each SUBSECTION. 
            // The optimal map is to provide the full list of Yes/No/Not Answered for each question within the single subsection cell.
            const compressQ = (secId, subId) => {
                const section = ASSESSMENT_STRUCTURE.find(s => s.id === secId);
                if (!section) return "";
                const subsection = section.subsections.find(s => s.id === subId);
                if (!subsection) return "";

                const results = [];
                subsection.questions.forEach(q => {
                    const key = `${secId}_${subId}_${q.id}`;
                    const answer = assessmentData[key] || 'Not Answered';
                    results.push(`${q.text}: ${answer}`);
                });
                return results.join('\n');
            };

            tData["Dressing"].value = compressQ('TACTILE', 'Dressing');
            tData["ADL"].value = compressQ('TACTILE', 'Activities of Daily Living');
            tData["Personal_Space"].value = compressQ('TACTILE', 'Personal Space');
            tData["Social"].value = compressQ('TACTILE', 'Social');
            tData["Self_Stimulatory"].value = compressQ('TACTILE', 'Self-Stimulatory Behaviors');
            tData["Self_Injurious"].value = compressQ('TACTILE', 'Self-Injurious Behaviors');

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
            viData["Self_Stimulatory"] = { value: compressQ('VISUAL', 'Self-Stimulatory behavior'), comment: assessmentData["VISUAL_Self-Stimulatory behavior_Comments"] || "" }; // Note App.js mapped visual sim as 'Self Stimulatory behavior' lacking hyphen

            // General
            gData["General_Reactions"] = { value: compressQ('GENERAL REACTIONS', 'General Reactions'), comment: assessmentData["GENERAL REACTIONS_General Reactions_Comments"] || "" };

            return { tactile: tData, vestibular: vData, proprioception: pData, auditory: aData, visual: viData, general: gData };
        };

        const backendStructure = mapToBackend();

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
            ...backendStructure
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
