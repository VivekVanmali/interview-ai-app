import React from 'react';
import { jsPDF } from 'jspdf';

const TextToPdfDownloader = () => {
  const handleDownload = () => {
    const doc = new jsPDF();
    const text = `Vivek Dilipkumar Vanmali
Harrow, HA3 5RQ
E: vivekvanmali@hotmail.com
P: 07454344966

Personal Profile:
Driven Computer Science student at Queen Mary University of London...`;

    const marginLeft = 10;
    const marginTop = 10;
    const maxLineWidth = 180;

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(text, maxLineWidth);
    doc.text(lines, marginLeft, marginTop);

    doc.save("interview_summary.pdf");
  };

  return (
    <button onClick={handleDownload}>
      Download PDF
    </button>
  );
};

export default TextToPdfDownloader;