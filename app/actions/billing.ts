"use server";

import { prisma } from "@/db";

// Wastage calculator data
const WASTAGE_DATA: Record<
  string,
  { karatCoeff: number; wastageCoeff: number }
> = {
  K22: { karatCoeff: 0.916, wastageCoeff: 0.0562 },
  K21: { karatCoeff: 0.875, wastageCoeff: 0.06 },
  K18: { karatCoeff: 0.75, wastageCoeff: 0.1 },
  K16: { karatCoeff: 0.666, wastageCoeff: 0.12 },
  K14: { karatCoeff: 0.583, wastageCoeff: 0.13 },
  K9: { karatCoeff: 0.375, wastageCoeff: 0.15 },
  Silver925: { karatCoeff: 0.925, wastageCoeff: 0.1 },
};

export async function calculateWastage(
  metalType: string,
  karatage: string,
  targetWeight: number,
  finalMetalWeight: number,
  goldGiven: number,
  purityCorrectedBalance?: number
) {
  const wastageData = WASTAGE_DATA[karatage];
  if (!wastageData) throw new Error("Invalid karatage");

  const theoreticalWastage = targetWeight * wastageData.wastageCoeff;
  const allowedWastage = finalMetalWeight * wastageData.wastageCoeff;
  const actualWastage =
    goldGiven -
    finalMetalWeight -
    (purityCorrectedBalance || 0);
  const difference = actualWastage - allowedWastage;

  let status: "Excess" | "Low" | "Ideal";
  if (difference > 0) status = "Excess";
  else if (difference < 0) status = "Low";
  else status = "Ideal";

  return {
    theoreticalWastage: parseFloat(theoreticalWastage.toFixed(3)),
    allowedWastage: parseFloat(allowedWastage.toFixed(3)),
    actualWastage: parseFloat(actualWastage.toFixed(3)),
    difference: parseFloat(difference.toFixed(4)),
    status,
  };
}

export async function calculatePaymentAmount(
  totalValue: number,
  paymentType: string
) {
  if (paymentType === "Card" && totalValue >= 20000) {
    // Add 3% bank charge
    const charge = (totalValue * 3) / 100;
    return parseFloat((totalValue + charge).toFixed(2));
  }
  return parseFloat(totalValue.toFixed(2));
}

export async function generateBillNumber() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const lastBill = await prisma.bill.findFirst({
    orderBy: { createdAt: "desc" },
  });

  let sequence = 1;
  if (lastBill) {
    const parts = lastBill.billNumber.split("-");
    const lastSequence = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastSequence)) sequence = lastSequence + 1;
  }

  return `LJ-${year}${month}${day}-${String(sequence).padStart(4, "0")}`;
}

export async function getAllBills() {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        customer: true,
        items: {
          include: {
            stones: true,
          },
        },
      },
      orderBy: { billDate: "desc" },
    });
    return bills;
  } catch (error) {
    console.error("Error fetching bills:", error);
    return [];
  }
}

export async function getBillById(billId: string) {
  try {
    return await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        customer: true,
        items: {
          include: {
            stones: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    return null;
  }
}

export async function getInventoryItems() {
  try {
    return await prisma.inventoryItem.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
}

export async function updateInventoryAfterSale(itemId: string, quantity: number) {
  try {
    return await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return null;
  }
}

export async function getWorksheets() {
  try {
    return await prisma.worksheetItem.findMany({
      include: {
        stoneDetails: true,
      },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Error fetching worksheets:", error);
    return [];
  }
}

export async function getWorksheetById(worksheetId: string) {
  try {
    return await prisma.worksheetItem.findUnique({
      where: { id: worksheetId },
      include: {
        stoneDetails: true,
      },
    });
  } catch (error) {
    console.error("Error fetching worksheet:", error);
    return null;
  }
}

export async function getCustomers() {
  try {
    return await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export async function createBill(billData: any) {
  try {
    const billNumber = await generateBillNumber();
    
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: billData.customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const newBill = await prisma.bill.create({
      data: {
        billNumber,
        customerId: billData.customerId,
        billType: billData.billType || "ReadyMade",
        subtotal: billData.subtotal || 0,
        tax: billData.tax || 0,
        paymentType: billData.paymentType || "Cash",
        paymentAmount: billData.paymentAmount || 0,
        oldGoldValue: billData.oldGoldValue || 0,
        items: {
          create: billData.items?.map((item: any) => ({
            description: item.description || item.name,
            metalType: item.metalType || "Gold",
            karatage: item.karatage || "K22",
            weight: item.weight || 0,
            size: item.size || "Ring",
            sizeValue: item.sizeValue,
            price: item.price || 0,
            totalValue: item.totalValue || 0,
            paymentType: billData.paymentType || "Cash",
          })) || [],
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            stones: true,
          },
        },
      },
    });

    return newBill;
  } catch (error) {
    console.error("Error creating bill:", error);
    throw error;
  }
}

export async function exportBillToPDF(billId: string) {
  try {
    const bill = await getBillById(billId);
    if (!bill) {
      throw new Error("Bill not found");
    }
    return bill;
  } catch (error) {
    console.error("Error exporting bill:", error);
    throw error;
  }
}

export async function addCustomer(customerData: any) {
  try {
    const newCustomer = await prisma.customer.create({
      data: {
        name: customerData.name,
        phone: customerData.phone || "",
        address: customerData.address || "",
      },
    });
    return newCustomer;
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    return await prisma.customer.delete({
      where: { id: customerId },
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
}

export async function updateCustomer(customerId: string, customerData: any) {
  try {
    return await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
      },
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
}
