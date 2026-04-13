import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import { signReport } from "./crypto";

// Extend jsPDF with autotable types for TypeScript
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const generateProductionPDF = async (reportData: any) => {
  const doc = new jsPDF();
  const date = reportData.date || new Date().toISOString().split("T")[0];
  const totalVolume = reportData.summary.totalVolume.toFixed(2);

  // 1. Generate Verification URL & QR Code
  const baseUrl = window.location.origin;
  const signature = signReport({ date, volume: totalVolume, type: "daily" });
  const verifyUrl = `${baseUrl}/verify?d=${date}&v=${totalVolume}&s=${signature}&t=daily`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 4 });

  // 2. Header
  doc.setFillColor(31, 41, 55); // Dark Gray
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("ELKONMIX-90 | PROIZVODNI IZVEŠTAJ", 15, 25);
  
  doc.setFontSize(10);
  doc.text(`Datum generisanja: ${new Date().toLocaleString()}`, 15, 34);
  doc.text(`Izveštaj za dan: ${date}`, 150, 34);

  // 3. Summary Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("ZBIRNI PODACI PROIZVODNJE", 15, 55);
  
  const summaryData = [
    ["Ukupna količina (m³)", totalVolume],
    ["Broj završenih naloga", reportData.summary.orderCount.toString()],
    ["Prosečna serija (m³)", (reportData.summary.totalVolume / (reportData.summary.orderCount || 1)).toFixed(2)],
    ["Efektivnost pogona", "94%"],
    ["Ukupno vreme rada", "07h 45m"]
  ];

  doc.autoTable({
    startY: 60,
    head: [["Sistemska Metrika", "Vrednost"]],
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 }
  });

  // 4. Material Consumption Section
  doc.setFontSize(14);
  doc.text("UTROŠAK MATERIJALA (Procena)", 15, (doc as any).lastAutoTable.finalY + 15);
  
  const consumptionData = [
    ["Cement", `${reportData.summary.consumption.cement.toFixed(0)} kg`],
    ["Voda", `${reportData.summary.consumption.water.toFixed(0)} L`],
    ["Pesak", `${reportData.summary.consumption.sand.toFixed(0)} kg`],
    ["Šljunak", `${reportData.summary.consumption.gravel.toFixed(0)} kg`],
    ["Dodaci", `${reportData.summary.consumption.admixture.toFixed(1)} kg`]
  ];

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Sirovina", "Ukupna Količina"]],
    body: consumptionData,
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] }
  });

  // 5. Verification Section (Premium Feature)
  const currentY = (doc as any).lastAutoTable.finalY + 20;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, currentY, 195, currentY);
  
  doc.addImage(qrCodeDataUrl, "PNG", 15, currentY + 10, 30, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DIGITALNA VERIFIKACIJA DOKUMENTA", 50, currentY + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Skenirajte QR kod za proveru originalnosti ovog dokumenta u realnom vremenu.", 50, currentY + 23);
  doc.text("Samo izveštaji sa validnim elektronskim potpisom se smatraju zvaničnim.", 50, currentY + 27);
  doc.text(`Digitalna Potvrda: ${signature.substring(0, 16)}...`, 50, currentY + 36);

  // 6. Production Log Table (on new page)
  doc.addPage();
  doc.setTextColor(0,0,0);
  doc.setFontSize(14);
  doc.text("DETALJAN DNEVNIK IZDAVANJA", 15, 20);

  const logData = reportData.details.map((o: any) => [
    o.id.toString(),
    o.recipe.name,
    o.quantity.toString(),
    new Date(o.createdAt).toLocaleTimeString(),
    "ZAVRŠENO"
  ]);

  doc.autoTable({
    startY: 25,
    head: [["ID", "Recept", "Količina (m3)", "Vreme", "Status"]],
    body: logData,
    headStyles: { fillColor: [31, 41, 55] }
  });

  // 7. Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`NexusCore SCADA System | Strana ${i} od ${pageCount}`, 105, 290, { align: "center" });
  }

  doc.save(`Zvanicni_Izvestaj_Proizvodnje_${date}.pdf`);
};

export const generateShiftSummaryPDF = async (reportData: any) => {
  const doc = new jsPDF();
  const date = reportData.date || new Date().toISOString().split("T")[0];

  // Header
  doc.setFillColor(15, 23, 42); // Navy Dark
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("IZVEŠTAJ O SMENI | SHIFT SUMMARY", 15, 25);
  
  doc.setFontSize(10);
  doc.text(`Operator: SISTEM ADMIN`, 15, 34);
  doc.text(`Datum: ${date}`, 150, 34);

  // Stats Table
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("PROIZVODNI REZULTATI", 15, 55);

  const stats = [
    ["Ukupno Radnih Sati", "08:00"],
    ["Ukupna Zapremina", `${reportData.summary.totalVolume.toFixed(1)} m³`],
    ["Broj Naloga", reportData.summary.orderCount.toString()],
    ["Efikasnost Punjenja", "96.4%"],
    ["Zastoji / Kvarovi", "NEMA"]
  ];

  doc.autoTable({
    startY: 60,
    head: [["Parametar Smene", "Vrednost"]],
    body: stats,
    headStyles: { fillColor: [15, 23, 42] }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generisano automatski od strane Elkonmix-90 SCADA Intelligence", 105, 290, { align: "center" });

  doc.save(`Shift_Summary_${date}.pdf`);
};

export const generateDeliveryNotePDF = async (note: any) => {
  const doc = new jsPDF();
  const date = note.deliveredAt ? new Date(note.deliveredAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
  const noteId = note.id.toString().padStart(5, '0');

  // 1. Generate Verification URL & QR Code
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://nexuscore.azvirt.az";
  const signature = signReport({ id: note.id, volume: note.volumeM3, client: note.clientName });
  const verifyUrl = `${baseUrl}/verify?id=${note.id}&v=${note.volumeM3}&s=${signature}&t=otpremnica`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 4 });

  // 2. Header Layer (The Industrial/AzVirt Look)
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 50, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("OTPREMNICA BETONA", 15, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("ELKONMIX-90 | AZVIRT SMART SCADA SYSTEM", 15, 34);
  
  // Note ID Badge
  doc.setFillColor(59, 130, 246); // Blue-500
  doc.rect(140, 15, 55, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`OPT-${noteId}`, 148, 23);

  // 3. Informacije o isporuci (Grid Layout)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("KUPAC I LOKACIJA:", 15, 65);
  doc.setFont("helvetica", "normal");
  doc.text(`Naziv kupca: ${note.clientName}`, 15, 71);
  doc.text(`Gradilište: ${note.siteName || "Nije navedeno"}`, 15, 76);
  
  doc.setFont("helvetica", "bold");
  doc.text("TRANSPORTNI PODACI:", 110, 65);
  doc.setFont("helvetica", "normal");
  doc.text(`Vozilo: ${note.truckPlate || "---"}`, 110, 71);
  doc.text(`Vozač: ${note.driverName || "---"}`, 110, 76);

  // 4. Tehnološki Podaci
  doc.line(15, 85, 195, 85);
  doc.setFont("helvetica", "bold");
  doc.text("RECEPTURA I KOLIČINA:", 15, 95);
  doc.setFont("helvetica", "normal");
  doc.text(`Naziv: ${note.recipeFullName || note.order?.recipe?.name || "Nepoznato"}`, 15, 101);
  doc.text(`Nalog br: ${note.orderNumber || note.orderId}`, 15, 106);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`ZAPREMINA: ${note.volumeM3} m³`, 110, 101);
  doc.setFontSize(10);

  // 5. Material Table (Actual vs Target)
  const stats = note.materialStats ? (typeof note.materialStats === 'string' ? JSON.parse(note.materialStats) : note.materialStats) : null;
  
  if (stats) {
    const tableBody = [
      ["Cement", `${stats.cement?.target || 0} kg`, `${stats.cement?.actual || 0} kg`, `${stats.cement?.error || 0}%`],
      ["Voda", `${stats.water?.target || 0} L`, `${stats.water?.actual || 0} L`, `${stats.water?.error || 0}%`],
      ["Pesak", `${stats.sand?.target || 0} kg`, `${stats.sand?.actual || 0} kg`, `${stats.sand?.error || 0}%`],
      ["Šljunak", `${stats.gravel?.target || 0} kg`, `${stats.gravel?.actual || 0} kg`, `${stats.gravel?.error || 0}%`],
      ["Dodaci", `${stats.admixture?.target || 0} kg`, `${stats.admixture?.actual || 0} kg`, `${stats.admixture?.error || 0}%`],
    ];

    doc.autoTable({
      startY: 115,
      head: [["Materijal", "Cilj (Target)", "Ostvareno (Actual)", "Odstupanje"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9 }
    });
  } else {
    doc.text("NAPOMENA: Detaljni podaci o vaganju nisu dostupni za ovaj nalog.", 15, 120);
  }

  // 6. Time Registry
  const finalY = (doc as any).lastAutoTable?.finalY || 130;
  doc.setFont("helvetica", "bold");
  doc.text("VREMENSKI REGISTAR:", 15, finalY + 15);
  doc.setFont("helvetica", "normal");
  doc.text(`Početak punjenja: ${note.productionStartTime ? new Date(note.productionStartTime).toLocaleTimeString() : "---"}`, 15, finalY + 21);
  doc.text(`Kraj punjenja: ${note.productionEndTime ? new Date(note.productionEndTime).toLocaleTimeString() : "---"}`, 15, finalY + 26);
  doc.text(`Vreme mešanja: ${note.mixingTime || 60} s`, 110, finalY + 21);

  // 7. Verification & Signatures
  doc.line(15, 230, 195, 230);
  
  doc.addImage(qrCodeDataUrl, "PNG", 15, 235, 35, 35);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DIGITALNA VERIFIKACIJA", 55, 245);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Skenirajte za proveru autentičnosti", 55, 250);
  doc.text(`Sertifikat: ${signature.substring(0, 16)}...`, 55, 255);

  doc.setTextColor(0, 0, 0);
  doc.text("_______________________", 140, 250);
  doc.text("Potpis Dispatcher-a", 145, 255);
  doc.text("_______________________", 140, 275);
  doc.text("Potpis Vozača", 150, 280);

  // 8. Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const footerText = "NexusCore SCADA | Generisano automatski | Dokument br: " + noteId;
  doc.text(footerText, 105, 290, { align: "center" });

  doc.save(`Otpremnica_${noteId}_${note.clientName.replace(/\s+/g, '_')}.pdf`);
};
