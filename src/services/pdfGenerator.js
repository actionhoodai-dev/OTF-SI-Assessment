import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
    ASSESSMENT_STRUCTURE, 
    INTERPRETATION_COLUMNS, 
    INTERPRETATION_ROWS, 
    computeInterpretationResults 
} from '../data/assessmentData';

export const generatePDF = (patientInfo, assessmentData) => {
    // Landscape A4 size: 297mm width, 210mm height
    const doc = new jsPDF('l', 'mm', 'a4');
    let yPos = 15;

    // Header Styling
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('SRI SARVAVIDHYA MULTISPECIALITY THERAPY CENTRE', 148.5, yPos, { align: 'center' });
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('216, THIRUNAGAR COLONY, ERODE- 638003. TAMIL NADU.', 148.5, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OCCUPATIONAL THERAPY ASSESSMENT REPORT - SENSORY INTEGRATION', 148.5, yPos, { align: 'center' });
    yPos += 8;

    // Header Rule
    doc.setLineWidth(0.4);
    doc.line(14, yPos - 3, 283, yPos - 3);

    // Demographic Data
    doc.setFontSize(10);
    doc.text('DEMOGRAPHIC DATA:', 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');

    const startX = 14;
    const col2X = 150;

    doc.setFont('helvetica', 'bold');
    doc.text('1. NAME: ', startX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patientInfo.name || ''}   (ID: ${patientInfo.patientId || ''})`, startX + 18, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('4. DATE OF ASSESSMENT: ', col2X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patientInfo.assessmentDate || ''}`, col2X + 48, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('2. DATE OF BIRTH: ', startX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patientInfo.dob || ''}`, startX + 32, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('5. INFORMANT: ', col2X, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patientInfo.informant || ''}`, col2X + 30, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('3. AGE / SEX: ', startX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patientInfo.age || ''} / ${patientInfo.sex || ''}`, startX + 24, yPos);
    yPos += 5;

    const addressLines = doc.splitTextToSize(`6. ADDRESS: ${patientInfo.address || ''}`, 269);
    doc.setFont('helvetica', 'bold');
    doc.text('6. ADDRESS: ', startX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(addressLines, startX + 24, yPos);
    yPos += addressLines.length * 4.5;

    const complaintsLines = doc.splitTextToSize(`CHIEF COMPLAINTS: ${patientInfo.chiefComplaints || ''}`, 269);
    doc.setFont('helvetica', 'bold');
    doc.text('CHIEF COMPLAINTS: ', startX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(complaintsLines, startX + 38, yPos);
    yPos += (complaintsLines.length * 4.5) + 3;

    // Divider
    doc.setLineWidth(0.3);
    doc.line(14, yPos, 283, yPos);
    yPos += 7;

    // SENSORY ASSESSMENT INTERPRETATION MATRIX (Header)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SENSORY ASSESSMENT INTERPRETATION MATRIX', 148.5, yPos, { align: 'center' });
    yPos += 5;

    // Compute interpretation results
    const matrix = computeInterpretationResults(assessmentData);

    // Build table columns and rows
    const head = [[
        'SYSTEM',
        ...INTERPRETATION_COLUMNS.map(col => col.label)
    ]];

    const formatQuestionIdForRow = (qId, rowId) => {
        const rowPrefixes = {
            'TACTILE': 'T',
            'VESTIBULAR': 'V',
            'PROPRIOCEPTIVE': 'P',
            'GENERAL REACTIONS': 'GR',
            'AUDITORY': 'A',
            'VISUAL': 'VIS'
        };
        const targetPrefix = rowPrefixes[rowId] || '';
        const match = qId.match(/^([A-Z]+)(\d+)$/);
        if (match) {
            const [, prefix, num] = match;
            if (prefix === targetPrefix) {
                return num; // Strip prefix if it belongs to the current row
            }
        }
        return qId; // Keep prefix if it belongs to another row/section
    };

    const body = INTERPRETATION_ROWS.map(row => {
        const rowData = [row.label];
        INTERPRETATION_COLUMNS.forEach(col => {
            const triggeredList = matrix[row.id] && matrix[row.id][col.id] ? matrix[row.id][col.id] : [];
            const formattedList = triggeredList.map(qId => formatQuestionIdForRow(qId, row.id));
            const displayVal = formattedList.length > 0 ? formattedList.join(', ') : '-';
            rowData.push(displayVal);
        });
        return rowData;
    });

    doc.autoTable({
        startY: yPos,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { 
            fillColor: [13, 27, 42], 
            textColor: 255, 
            fontSize: 7, 
            halign: 'center', 
            valign: 'middle',
            cellPadding: 2
        },
        columnStyles: {
            0: { cellWidth: 34, fontStyle: 'bold', fontSize: 8 },
            1: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' },
            2: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' },
            3: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' },
            4: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' },
            5: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' },
            6: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' },
            7: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' },
            8: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' },
            9: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' },
            10: { cellWidth: 23.5, fontSize: 7.5, halign: 'center' }
        },
        styles: { cellPadding: 2.5, overflow: 'linebreak' },
        margin: { left: 14, right: 14 },
        pageBreak: 'auto',
        rowPageBreak: 'avoid'
    });

    yPos = doc.lastAutoTable.finalY + 6;

    // Comments & Observations
    const allComments = [];
    const structSections = [
        { id: 'TACTILE', label: 'Tactile' },
        { id: 'VESTIBULAR', label: 'Vestibular' },
        { id: 'PROPRIOCEPTION', label: 'Proprioception' },
        { id: 'AUDITORY', label: 'Auditory' },
        { id: 'VISUAL', label: 'Visual' },
        { id: 'GENERAL REACTIONS', label: 'General Reactions' }
    ];

    structSections.forEach(sec => {
        const structSec = ASSESSMENT_STRUCTURE.find(s => s.id === sec.id);
        if (structSec) {
            const secComments = [];
            structSec.subsections.forEach(sub => {
                const commentKey = `${sec.id}_${sub.id}_Comments`;
                const val = assessmentData[commentKey];
                if (val && val.trim() !== '') {
                    secComments.push(`${sub.title}: ${val.trim()}`);
                }
            });
            if (secComments.length > 0) {
                allComments.push(`${sec.label} Comments:\n- ${secComments.join('\n- ')}`);
            }
        }
    });

    if (allComments.length > 0) {
        if (yPos > 155) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('SECTION COMMENTS & OBSERVATIONS:', 14, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const commentsText = allComments.join('\n\n');
        const splitComments = doc.splitTextToSize(commentsText, 269);
        doc.text(splitComments, 14, yPos);
        yPos += (splitComments.length * 4) + 6;
    }

    // Clinical Remarks and Therapist Signature Area
    if (yPos > 150) {
        doc.addPage();
        yPos = 20;
    }

    doc.setLineWidth(0.4);
    doc.line(14, yPos, 283, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CLINICAL REMARKS & RECOMMENDATIONS:', 14, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.rect(14, yPos, 269, 18); // remarks box
    yPos += 24;



    // Add page numbers footer dynamically
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 148.5, 202, { align: 'center' });
    }

    return doc;
};

export const downloadPDF = (patientInfo, assessmentData) => {
    const doc = generatePDF(patientInfo, assessmentData);
    const safeName = (patientInfo.name || 'Assessment').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeName}_otf_report.pdf`);
};
