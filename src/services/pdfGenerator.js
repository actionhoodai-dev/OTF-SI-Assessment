import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
    ASSESSMENT_STRUCTURE, 
    INTERPRETATION_CATEGORIES, 
    computeInterpretationResults 
} from '../data/assessmentData';

export const generatePDF = (patientInfo, assessmentData) => {
    const doc = new jsPDF();
    let yPos = 20;

    // Header Styling
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SRI SARVAVIDHYA MULTISPECIALITY THERAPY CENTRE', 105, yPos, { align: 'center' });
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('216, THIRUNAGAR COLONY, ERODE- 638003. TAMIL NADU.', 105, yPos, { align: 'center' });
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OCCUPATIONAL THERAPY ASSESSMENT REPORT', 105, yPos, { align: 'center' });
    yPos += 15;

    // Header Rule
    doc.setLineWidth(0.5);
    doc.line(14, yPos - 5, 196, yPos - 5);

    // Demographic Data
    doc.setFontSize(11);
    doc.text('DEMOGRAPHIC DATA:', 14, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');

    const startX = 14;
    const col2X = 105;

    doc.text(`1. NAME: ${patientInfo.name || ''}   (ID: ${patientInfo.patientId || ''})`, startX, yPos);
    doc.text(`4. DATE OF ASSESSMENT: ${patientInfo.assessmentDate || ''}`, col2X, yPos);
    yPos += 7;
    doc.text(`2. DATE OF BIRTH: ${patientInfo.dob || ''}`, startX, yPos);
    doc.text(`5. INFORMANT: ${patientInfo.informant || ''}`, col2X, yPos);
    yPos += 7;
    doc.text(`3. AGE: ${patientInfo.age || ''}     SEX: ${patientInfo.sex || ''}`, startX, yPos);
    yPos += 7;
    const addressLines = doc.splitTextToSize(`6. ADDRESS: ${patientInfo.address || ''}`, 180);
    doc.text(addressLines, startX, yPos);
    yPos += addressLines.length * 6;
    const complaintsLines = doc.splitTextToSize(`CHIEF COMPLAINTS: ${patientInfo.chiefComplaints || ''}`, 180);
    doc.text(complaintsLines, startX, yPos);
    yPos += (complaintsLines.length * 6) + 5;

    // Divider
    doc.line(14, yPos, 196, yPos);
    yPos += 10;

    // SENSORY ASSESSMENT INTERPRETATION MATRIX (Header)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SENSORY ASSESSMENT INTERPRETATION MATRIX', 105, yPos, { align: 'center' });
    yPos += 10;

    // Compute interpretation results
    const matrix = computeInterpretationResults(assessmentData);

    const sectionsToRender = [
        { id: 'TACTILE', title: 'TACTILE SYSTEM' },
        { id: 'VESTIBULAR', title: 'VESTIBULAR SYSTEM' },
        { id: 'PROPRIOCEPTION', title: 'PROPRIOCEPTIVE SYSTEM' },
        { id: 'AUDITORY', title: 'AUDITORY SYSTEM' },
        { id: 'VISUAL', title: 'VISUAL SYSTEM' },
        { id: 'GENERAL REACTIONS', title: 'GENERAL REACTIONS' }
    ];

    sectionsToRender.forEach(sec => {
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(sec.title, 14, yPos);
        yPos += 5;

        // Build table body from categories in this section
        const categories = INTERPRETATION_CATEGORIES[sec.id] || [];
        const tableBody = [];

        categories.forEach(cat => {
            const triggeredIds = matrix[sec.id] && matrix[sec.id][cat.id] ? matrix[sec.id][cat.id] : [];
            const displayVal = triggeredIds.length > 0 ? triggeredIds.join(', ') : 'None';
            tableBody.push([
                cat.label,
                displayVal
            ]);
        });

        // Add Section Comments if any are present
        const sectionComments = [];
        const structSec = ASSESSMENT_STRUCTURE.find(s => s.id === sec.id);
        if (structSec) {
            structSec.subsections.forEach(sub => {
                const commentKey = `${sec.id}_${sub.id}_Comments`;
                const val = assessmentData[commentKey];
                if (val && val.trim() !== '') {
                    sectionComments.push(`${sub.title}: ${val.trim()}`);
                }
            });
        }
        
        if (sectionComments.length > 0) {
            tableBody.push([
                {
                    content: `Section Comments:\n${sectionComments.join('\n')}`,
                    colSpan: 2,
                    styles: { fontStyle: 'italic', fillColor: [248, 249, 250], halign: 'left' }
                }
            ]);
        }

        doc.autoTable({
            startY: yPos,
            head: [['Interpretation Category', 'Triggered Question IDs']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [13, 27, 42], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 60, fontStyle: 'bold' },
                1: { cellWidth: 120, overflow: 'linebreak' }
            },
            styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
            margin: { left: 14, right: 14 },
            pageBreak: 'auto',
            rowPageBreak: 'avoid'
        });

        yPos = doc.lastAutoTable.finalY + 8;
    });

    // Clinical Remarks and Therapist Signature Area
    if (yPos > 220) {
        doc.addPage();
        yPos = 20;
    }

    yPos += 5;
    doc.line(14, yPos, 196, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CLINICAL REMARKS & RECOMMENDATIONS:', 14, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.rect(14, yPos, 182, 25); // Draw a box for remarks
    yPos += 35;

    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Therapist Signature:', 14, yPos);
    doc.text('Date:', 140, yPos);
    yPos += 15;
    doc.line(14, yPos, 70, yPos); // Signature line
    doc.line(140, yPos, 180, yPos); // Date line
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Occupational Therapist', 14, yPos);

    // Add page numbers footer dynamically
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
    }

    return doc;
};

export const downloadPDF = (patientInfo, assessmentData) => {
    const doc = generatePDF(patientInfo, assessmentData);
    const safeName = (patientInfo.name || 'Assessment').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeName}_otf_report.pdf`);
};
