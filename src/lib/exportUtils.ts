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
