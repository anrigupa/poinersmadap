import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface GeneratePdfOptions {
  fileName?: string;
  elementId?: string;
}

/**
 * Triggers standard browser window.print() formatted with print media stylesheets.
 */
export function printLetterDocument(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Print failed: Element with id #${elementId} not found`);
    window.print();
    return;
  }

  // Create an isolated printing iframe to prevent parent layout clipping
  const printIframe = document.createElement("iframe");
  printIframe.style.position = "fixed";
  printIframe.style.right = "0";
  printIframe.style.bottom = "0";
  printIframe.style.width = "0";
  printIframe.style.height = "0";
  printIframe.style.border = "0";
  document.body.appendChild(printIframe);

  const doc = printIframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Gather parent head styles (Tailwind styles)
  const headStyles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((el) => el.outerHTML)
    .join("\n");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8" />
      <title>Surat Panggilan Siswa</title>
      ${headStyles}
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
        body {
          background: white !important;
          color: black !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
      </style>
    </head>
    <body>
      <div style="padding: 10px;">
        ${element.outerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    printIframe.contentWindow?.focus();
    printIframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(printIframe);
    }, 1000);
  }, 300);
}

/**
 * Captures the target letter element and exports an A4 PDF using html2canvas & jsPDF.
 */
export async function downloadLetterAsPdf(
  elementId: string,
  fileName: string = "Surat_Panggilan.pdf"
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`PDF generation failed: Element with id #${elementId} not found`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp Indonesian font rendering
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL("image/png");

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10; // 10mm padding
    const printableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    if (imgHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, "PNG", margin, margin, printableWidth, imgHeight);
    } else {
      // Multi-page slicing if content overflows single A4 page
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, printableWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, printableWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    const safeName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    pdf.save(safeName);
    return true;
  } catch (err) {
    console.error("Failed to generate PDF via html2canvas/jsPDF:", err);
    return false;
  }
}
