"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";

interface BillViewerProps {
  bill: any;
}

export function BillViewer({ bill }: BillViewerProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  /* ---------- PDF DOWNLOAD ---------- */
  const handleDownloadPDF = async () => {
    setIsPrinting(true);
    try {
      const element = document.getElementById(`bill-${bill.id}`);
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`${bill.billNumber}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed. Please use Print.");
    } finally {
      setIsPrinting(false);
    }
  };

  /* ---------- PRINT ---------- */
  const handlePrint = () => {
    const element = document.getElementById(`bill-${bill.id}`);
    if (!element) return;

    const printWindow = window.open("", "", "width=900,height=650");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      {/* ===== ACTION BUTTONS (PRESERVED) ===== */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={isPrinting}
          className="gap-2 bg-transparent"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-2 bg-transparent"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* ===== INVOICE CONTENT (EXACT FORMAT) ===== */}
      <div
        id={`bill-${bill.id}`}
        className="bg-white text-black"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-12">
          {/* LEFT */}
          <div>
            <Image
              src="/logo.png"
              alt="Lakshika Jewellers"
              width={130}
              height={130}
              priority
            />
            <p className="font-bold text-lg mt-2">LAKSHIKA JEWELLERS</p>
            <p className="text-xs italic">Where Luxury Meets Style</p>
            <p className="text-xs mt-2">
              No. 220B, Galle Road, Walana, Panadura.
            </p>
            <p className="text-xs">
              Tel: 076-4357920, 076-6244372, 076-1576536
            </p>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <p className="text-xl font-semibold mb-4">CUSTOMER INVOICE</p>
            <p className="text-sm">Invoice no : {bill.billNumber}</p>
            <p className="text-sm">
              Date : {new Date(bill.billDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* CUSTOMER DETAILS */}
        <div className="mb-8">
          <p className="text-sm font-semibold mb-3">CUSTOMER DETAILS</p>
          <p className="text-sm">{bill.customer.name}</p>
          <p className="text-sm">{bill.customer.phone}</p>
          {bill.deliveryDate && (
            <p className="text-sm">Delivery by: {bill.deliveryDate}</p>
          )}
        </div>

        {/* TABLE */}
        <table
          className="w-full text-sm border-collapse"
          style={{ borderTop: "1px solid #000" }}
        >
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">DESCRIPTION</th>
              <th className="text-left py-2">Metal Type</th>
              <th className="text-left py-2">KARATAGE</th>
              <th className="text-left py-2">Target Weight</th>
              <th className="text-right py-2">PRICE (LKR)</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item: any, i: number) => (
              <tr key={i} className="border-b">
                <td className="py-3">{item.description}</td>
                <td>{item.metalType}</td>
                <td>{item.karatage}</td>
                <td>{item.targetWeight} g</td>
                <td className="text-right">
                  LKR {item.totalValue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SIGNATURE */}
        <div className="mt-20">
          <p className="text-sm font-semibold mb-8">CUSTOMER SIGNATURE</p>
          <div className="border-t w-64"></div>
        </div>
      </div>
    </div>
  );
}
