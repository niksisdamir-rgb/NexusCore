import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

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

export const generateProductionPDF = (reportData: any) => {
  const doc = new jsPDF();
  const date = reportData.date || new Date().toISOString().split("T")[0];

  // 1. Header
  doc.setFillColor(31, 41, 55); // Dark Gray
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("ELKONMIX-90 | PROIZVODNI IZVEŠTAJ", 15, 25);
  
  doc.setFontSize(10);
  doc.text(`Datum generisanja: ${new Date().toLocaleString()}`, 15, 34);
  doc.text(`Izveštaj za dan: ${date}`, 150, 34);

  // 2. Summary Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("ZBIRNI PODACI PROIZVODNJE", 15, 55);
  
  const summaryData = [
    ["Ukupna količina (m3)", reportData.summary.totalVolume.toFixed(2)],
    ["Broj završenih naloga", reportData.summary.orderCount.toString()],
    ["Prosečna serija (m3)", (reportData.summary.totalVolume / (reportData.summary.orderCount || 1)).toFixed(2)]
  ];

  doc.autoTable({
    startY: 60,
    head: [["Metrika", "Vrednost"]],
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] } // Blue
  });

  // 3. Material Consumption Section
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
    headStyles: { fillColor: [16, 185, 129] } // Green
  });

  // 4. Production Log Table
  doc.addPage();
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

  // 5. Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`NexusCore SCADA System | Strana ${i} od ${pageCount}`, 105, 290, { align: "center" });
  }

  doc.save(`Izvestaj_Proizvodnje_${date}.pdf`);
};
