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
          <title>Invoice - ${bill.billNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              #print-content { width: 100% !important; height: auto !important; padding: 20mm !important; }
            }
          </style>
        </head>
        <body>
          <div id="print-content">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-4 overflow-auto">
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
        className="mx-auto"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#000000",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-12">
          {/* LEFT */}
          <div>
            <Image
              src="/logo.png"
              alt="Lakshika Jewellers"
              width={100}
              height={100}
              priority
              className="mb-2"
            />
            <p className="font-bold text-xl tracking-tight">LAKSHIKA JEWELLERS</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Where Luxury Meets Style</p>
            <div className="text-[11px] leading-relaxed">
              <p>No. 220B, Galle Road, Walana, Panadura.</p>
              <p>Tel: 076-4357920, 076-6244372, 076-1576536</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <h1 className="text-2xl font-bold mb-4">INVOICE</h1>
            <div className="text-sm space-y-1">
              <p><span className="font-semibold">Invoice No:</span> {bill.billNumber}</p>
              <p><span className="font-semibold">Date:</span> {new Date(bill.billDate).toLocaleDateString()}</p>
              <p><span className="font-semibold">Payment:</span> {bill.paymentType}</p>
            </div>
          </div>
        </div>

        {/* CUSTOMER DETAILS */}
        <div className="grid grid-cols-2 gap-8 mb-10 border-y py-6">
          <div>
            <p className="text-[11px] uppercase text-gray-500 font-bold mb-2">Customer Details</p>
            <p className="text-base font-bold">{bill.customer?.name}</p>
            <p className="text-sm text-gray-700">{bill.address || bill.customer?.address}</p>
            <p className="text-sm text-gray-700">Tel: {bill.customer?.phone}</p>
          </div>
          <div className="text-right">
            {bill.deliveryDate && (
              <>
                <p className="text-[11px] uppercase text-gray-500 font-bold mb-2">Delivery Details</p>
                <p className="text-sm font-semibold">Delivery Date: {new Date(bill.deliveryDate).toLocaleDateString()}</p>
              </>
            )}
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm mb-10 border-collapse">
          <thead>
            <tr className="bg-gray-100 uppercase text-[11px] font-bold border-b-2 border-black">
              <th className="text-left py-3 px-2">Description</th>
              <th className="text-left py-3 px-2">Type</th>
              <th className="text-left py-3 px-2">Karat</th>
              <th className="text-center py-3 px-2">Weight</th>
              <th className="text-center py-3 px-2">Size</th>
              <th className="text-right py-3 px-2">Price (LKR)</th>
            </tr>
          </thead>
          <tbody>
            {bill.items?.map((item: any, i: number) => (
              <tr key={i} className="border-b">
                <td className="py-4 px-2 font-medium">
                  {item.description}
                  {item.sizeValue && <span className="text-xs text-gray-500 block">Size: {item.sizeValue} ({item.size})</span>}
                </td>
                <td className="py-4 px-2">{item.metalType}</td>
                <td className="py-4 px-2">{item.karatage}</td>
                <td className="py-4 px-2 text-center">{item.weight} g</td>
                <td className="py-4 px-2 text-center">{item.sizeValue || "-"}</td>
                <td className="py-4 px-2 text-right">
                  {item.price.toLocaleString()}
                  {item.stones && item.stones.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed text-[10px] text-gray-600 text-left">
                      <p className="font-bold uppercase mb-1">Gemstone Details:</p>
                      {item.stones.map((s: any, si: number) => (
                        <div key={si} className="grid grid-cols-2 gap-x-2">
                          <span>{s.numberOfStones} x {s.stoneType}</span>
                          <span className="text-right">{s.weightCarats} ct / {s.weightGrams} g</span>
                        </div>
                      ))}
                      <div className="mt-1 font-bold border-t pt-1 flex justify-between">
                        <span>Total Stone Weight:</span>
                        <span>{item.totalStoneWeightCarats?.toFixed(2) || 0} ct / {item.totalStoneWeightGrams?.toFixed(2) || 0} g</span>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SUMMARY SECTION */}
        <div className="flex justify-end">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">LKR {bill.subtotal.toLocaleString()}</span>
            </div>
            {bill.paymentAmount > bill.subtotal && (
              <div className="flex justify-between text-xs text-orange-600 italic">
                <span>Incl. Bank Charges (3% Card):</span>
                <span>+ LKR {(bill.paymentAmount - bill.subtotal).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Gross Total:</span>
              <span>LKR {bill.paymentAmount.toLocaleString()}</span>
            </div>
            {bill.oldGoldValue > 0 && (
              <div className="flex justify-between text-base text-red-600 italic">
                <span>Old Gold Value:</span>
                <span>- LKR {bill.oldGoldValue.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black border-t-2 border-black pt-3">
              <span>BALANCE:</span>
              <span>LKR {(bill.balance || (bill.paymentAmount - bill.oldGoldValue)).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* TERMS & SIGNATURE */}
        <div className="mt-24 grid grid-cols-2 gap-20">
          <div className="space-y-4">
            <div className="h-0.5 bg-black w-full opacity-30 mt-10"></div>
            <p className="text-[10px] uppercase font-bold text-center">Authorized Signature</p>
          </div>
          <div className="space-y-4">
            <div className="h-0.5 bg-black w-full opacity-30 mt-10"></div>
            <p className="text-[10px] uppercase font-bold text-center">Customer Signature</p>
          </div>
        </div>

        <div className="mt-20 text-[10px] text-center text-gray-500 italic">
          <p>Thank you for choosing Lakshika Jewellers. Your trust, our priority.</p>
          <p className="mt-1">Generated by Lakshika Digital Bill System</p>
        </div>
      </div>
    </div>
  );
}

