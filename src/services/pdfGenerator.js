import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ASSESSMENT_STRUCTURE } from '../data/assessmentData';

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

    // SENSORY INTEGRATION PROBLEMS (Header)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SENSORY INTEGRATION PROBLEMS', 105, yPos, { align: 'center' });
    yPos += 10;

    // Main Logic to iterate over structure using autotable
    ASSESSMENT_STRUCTURE.forEach(section => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(section.title, 14, yPos);
        yPos += 6;

        section.subsections.forEach(sub => {
            const tableBody = [];

            sub.questions.forEach(q => {
                const key = `${section.id}_${sub.id}_${q.id}`;
                const selection = assessmentData[key];

                let checkYes = '';
                let checkNo = '';

                if (selection === 'YES') {
                    checkYes = 'x';
                } else if (selection === 'NO') {
                    checkNo = 'x';
                }

                tableBody.push([
                    q.text,
                    checkYes,
                    checkNo
                ]);
            });

            const commentKey = `${section.id}_${sub.id}_Comments`;
            const commentData = assessmentData[commentKey];

            tableBody.push([
                {
                    content: `Comments: ${commentData || ''}`,
                    colSpan: 3,
                    styles: { fontStyle: 'italic', fillColor: [248, 249, 250], halign: 'left' }
                }
            ]);

            doc.autoTable({
                startY: yPos,
                head: [[sub.title, 'YES', 'NO']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [13, 27, 42], textColor: 255 },
                columnStyles: {
                    0: { cellWidth: 145 },
                    1: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
                    2: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }
                },
                styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
                margin: { left: 14, right: 14 },
                pageBreak: 'auto',
                rowPageBreak: 'avoid' // This strictly prevents questions from slicing across two pages
            });

            yPos = doc.lastAutoTable.finalY + 8;
        });

        yPos += 5;
    });

    return doc;
};

export const downloadPDF = (patientInfo, assessmentData) => {
    const doc = generatePDF(patientInfo, assessmentData);
    const safeName = (patientInfo.name || 'Assessment').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeName}_otf_report.pdf`);
};
