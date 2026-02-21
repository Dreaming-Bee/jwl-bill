"use server";

import { prisma } from "@/db";

// Wastage calculator data
const WASTAGE_DATA: Record<
  string,
  { karatCoeff: number; wastageCoeff: number }
> = {
  K22: { karatCoeff: 0.916, wastageCoeff: 0.05625 },
  K21: { karatCoeff: 0.875, wastageCoeff: 0.06 },
  K18: { karatCoeff: 0.75, wastageCoeff: 0.1 },
  K16: { karatCoeff: 0.666, wastageCoeff: 0.12 },
  K14: { karatCoeff: 0.583, wastageCoeff: 0.13 },
  K9: { karatCoeff: 0.375, wastageCoeff: 0.15 },
  Silver925: { karatCoeff: 0.925, wastageCoeff: 0.1 },
};

export async function calculateWastage(
  karatage: string,
  targetWeight: number,
  finalMetalWeight: number,
  goldGiven: number,
  goldGivenPurity: number,
  goldBalance?: number,
  goldBalancePurity?: number
) {
  const wastageData = WASTAGE_DATA[karatage];
  if (!wastageData) throw new Error("Invalid karatage");

  const theoreticalWastage = targetWeight * wastageData.wastageCoeff;
  const allowedWastage = finalMetalWeight * wastageData.wastageCoeff;

  let purityCorrectedBalance = goldBalance || 0;
  if (goldBalance && goldBalancePurity && goldBalancePurity < goldGivenPurity) {
    purityCorrectedBalance = (goldBalance * goldBalancePurity) / goldGivenPurity;
  }

  const actualWastage = goldGiven - finalMetalWeight - purityCorrectedBalance;
  const difference = actualWastage - allowedWastage;

  let status: "Excess" | "Low" | "Ideal";
  if (difference > 0) status = "Excess";
  else if (difference < 0) status = "Low";
  else status = "Ideal";

  return {
    theoreticalWastage: parseFloat(theoreticalWastage.toFixed(4)),
    allowedWastage: parseFloat(allowedWastage.toFixed(4)),
    actualWastage: parseFloat(actualWastage.toFixed(4)),
    difference: parseFloat(difference.toFixed(4)),
    purityCorrectedBalance: parseFloat(purityCorrectedBalance.toFixed(4)),
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

export async function generateBillNumber(prefix: string = "LJ") {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const lastBill = await prisma.bill.findFirst({
    where: { billNumber: { startsWith: `${prefix}-${year}${month}${day}` } },
    orderBy: { createdAt: "desc" },
  });

  let sequence = 1;
  if (lastBill) {
    const parts = lastBill.billNumber.split("-");
    const lastSequence = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastSequence)) sequence = lastSequence + 1;
  }

  return `${prefix}-${year}${month}${day}-${String(sequence).padStart(4, "0")}`;
}

export async function generateReceiptNumber() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const lastReceipt = await (prisma as any).receipt.findFirst({
    where: { receiptNumber: { startsWith: `REC-${year}${month}${day}` } },
    orderBy: { createdAt: "desc" },
  });

  let sequence = 1;
  if (lastReceipt) {
    const parts = lastReceipt.receiptNumber.split("-");
    const lastSequence = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastSequence)) sequence = lastSequence + 1;
  }

  return `REC-${year}${month}${day}-${String(sequence).padStart(4, "0")}`;
}

export async function getAllBills() {
  try {
    return await prisma.bill.findMany({
      include: {
        customer: true,
        worksheet: true,
        items: {
          include: {
            stones: true,
          },
        },
      },
      orderBy: { billDate: "desc" },
    });
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
        worksheet: {
          include: {
            stoneDetails: true,
          }
        }
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

export async function createBill(billData: any) {
  try {
    const billNumber = await generateBillNumber();

    const newBill = await prisma.bill.create({
      data: {
        billNumber,
        customerId: billData.customerId,
        address: billData.address,
        billType: billData.billType || "ReadyMade",
        subtotal: billData.subtotal || 0,
        tax: billData.tax || 0,
        paymentType: billData.paymentType || "Cash",
        paymentAmount: billData.paymentAmount || 0,
        oldGoldValue: billData.oldGoldValue || 0,
        balance: billData.balance || 0,
        targetWeight: billData.targetWeight || null,
        targetPrice: billData.targetPrice || null,
        deliveryDate: billData.deliveryDate || null,
        specialRemarks: billData.specialRemarks || null,
        designImage: billData.designImage || null,
        items: {
          create: billData.items?.map((item: any) => {
            const stoneCarats = item.stones?.reduce((sum: number, s: any) => sum + (s.weightCarats || 0), 0) || 0;
            const stoneGrams = item.stones?.reduce((sum: number, s: any) => sum + (s.weightGrams || 0), 0) || 0;

            return {
              description: item.description,
              metalType: item.metalType,
              karatage: item.karatage,
              weight: item.weight || 0,
              size: item.size || "Ring",
              sizeValue: item.sizeValue || "",
              price: item.price || 0,
              totalValue: item.totalValue,
              paymentType: billData.paymentType || "Cash",
              inventoryItemId: item.inventoryItemId || null,
              totalStoneWeightCarats: stoneCarats,
              totalStoneWeightGrams: stoneGrams,
              stones: {
                create: item.stones?.map((stone: any) => ({
                  stoneType: stone.stoneType,
                  treatment: stone.treatment,
                  numberOfStones: stone.numberOfStones,
                  weightCarats: stone.weightCarats,
                  weightGrams: stone.weightGrams,
                })) || [],
              },
            };
          }) || [],
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

    // Update inventory for ready-made items
    if (billData.billType === "ReadyMade") {
      for (const item of billData.items) {
        if (item.inventoryItemId) {
          await updateInventoryAfterSale(item.inventoryItemId, 1);
        }
      }
    }

    return newBill;
  } catch (error) {
    console.error("Error creating bill:", error);
    throw error;
  }
}

export async function createReceipt(receiptData: any) {
  try {
    const receiptNumber = await generateReceiptNumber();
    return await (prisma as any).receipt.create({
      data: {
        receiptNumber,
        receiptType: receiptData.receiptType,
        customerId: receiptData.customerId,
        totalWeight: receiptData.totalWeight,
        totalPhoto: receiptData.totalPhoto,
        valuationCharge: receiptData.valuationCharge || 0,
        repairItems: {
          create: receiptData.repairItems?.map((item: any) => ({
            description: item.description,
            weight: item.weight,
            weightPhoto: item.weightPhoto,
            damagePhoto: item.damagePhoto,
            repairRemark: item.repairRemark,
            price: item.price,
            newSize: item.newSize,
            isBroken: item.isBroken || false,
            structureDamaged: item.structureDamaged || false,
            stonesToReplace: item.stonesToReplace,
          })) || [],
        },
        oldGoldItems: {
          create: receiptData.oldGoldItems?.map((item: any) => ({
            description: item.description,
            weight: item.weight,
            weightPhoto: item.weightPhoto,
            isBroken: item.isBroken || false,
            brokenPhoto: item.brokenPhoto,
            specialRemark: item.specialRemark,
          })) || [],
        },
      },
      include: {
        customer: true,
        repairItems: true,
        oldGoldItems: true,
      },
    });
  } catch (error) {
    console.error("Error creating receipt:", error);
    throw error;
  }
}

export async function getReceipts() {
  try {
    return await prisma.receipt.findMany({
      include: { customer: true },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return [];
  }
}

export async function getReceiptsByCustomer(customerId: string) {
  try {
    return await (prisma as any).receipt.findMany({
      where: { customerId },
      include: {
        repairItems: true,
        oldGoldItems: true,
      },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return [];
  }
}

export async function getReceiptById(receiptId: string) { // Renamed from getReceiptById to getReceiptsByCustomer, now this is a true getReceiptById
  try {
    return await (prisma as any).receipt.findUnique({
      where: { id: receiptId },
      include: {
        repairItems: true,
        oldGoldItems: true,
      },
    });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return null;
  }
}

export async function getMetalPrices() {
  try {
    return await (prisma as any).metalPrice.findMany({
      orderBy: { date: "desc" },
      take: 7,
    });
  } catch (error) {
    console.error("Error fetching metal prices:", error);
    return [];
  }
}

export async function updateMetalPrice(data: { price24K: number; price22K: number }) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await (prisma as any).metalPrice.upsert({
      where: { date: today },
      update: {
        price24K: data.price24K,
        price22K: data.price22K,
      },
      create: {
        date: today,
        price24K: data.price24K,
        price22K: data.price22K,
      },
    });
  } catch (error) {
    console.error("Error updating metal price:", error);
    throw error;
  }
}

export async function getWorksheets() {
  try {
    return await prisma.worksheetItem.findMany({
      include: {
        stoneDetails: true,
        bill: {
          include: {
            customer: true,
          },
        },
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
        bill: {
          include: {
            customer: true,
            items: { include: { stones: true } }
          }
        }
      },
    });
  } catch (error) {
    console.error("Error fetching worksheet:", error);
    return null;
  }
}

export async function createWorkshopSheet(billId: string, goldsmithName: string) {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { items: { include: { stones: true } } }
    });

    if (!bill) throw new Error("Bill not found");

    const mainItem = bill.items[0];
    if (!mainItem) throw new Error("No items in bill");

    const wastageData = WASTAGE_DATA[mainItem.karatage];
    const theoreticalWastage = (bill.targetWeight || 0) * (wastageData?.wastageCoeff || 0);

    const worksheet = await (prisma as any).worksheetItem.create({
      data: {
        date: new Date(),
        goldsmithName,
        jewelryDescription: mainItem.description,
        size: mainItem.sizeValue || "N/A",
        metalType: mainItem.metalType,
        metalKaratage: mainItem.karatage,
        targetMetalWeight: bill.targetWeight || 0,
        theoreticalWastage,
        goldGiven: 0,
        goldGivenPurity: 0,
        stoneDetails: {
          create: mainItem.stones.map((s: any) => ({
            stoneType: s.stoneType,
            size: "N/A",
            weight: s.weightGrams,
          }))
        }
      }
    });

    await prisma.bill.update({
      where: { id: billId },
      data: { worksheetId: worksheet.id }
    });

    return worksheet;
  } catch (error) {
    console.error("Error creating workshop sheet:", error);
    throw error;
  }
}

export async function updateWorksheet(id: string, data: any) {
  try {
    const worksheet: any = await prisma.worksheetItem.findUnique({
      where: { id },
      include: { stoneDetails: true }
    });

    if (!worksheet) throw new Error("Worksheet not found");

    const totalStoneWeight = worksheet.stoneDetails.reduce((sum: number, stone: any) => sum + (stone.totalStoneWeight || 0), 0);
    const finalMetalWeight = (data.finalWeight || 0) - totalStoneWeight;

    const wastage = await calculateWastage(
      worksheet.metalKaratage,
      worksheet.targetMetalWeight,
      finalMetalWeight,
      data.goldGiven || worksheet.goldGiven,
      data.goldGivenPurity || worksheet.goldGivenPurity,
      data.goldBalance,
      data.goldBalancePurity
    );

    return await (prisma as any).worksheetItem.update({
      where: { id },
      data: {
        ...data,
        finalMetalWeight,
        theoreticalWastage: wastage.theoreticalWastage,
        allowedWastage: wastage.allowedWastage,
        actualWastage: wastage.actualWastage,
        differenceInWastage: wastage.difference,
        wastageStatus: wastage.status,
        purityCorrectedGoldBalance: wastage.purityCorrectedBalance,
      }
    });
  } catch (error) {
    console.error("Error updating worksheet:", error);
    throw error;
  }
}

export async function finalizeCustomOrder(billId: string, finalData: { finalWeight: number; finalPrice: number; finalWeightPhoto: string }) {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
    });

    if (!bill) throw new Error("Bill not found");

    const weightDifference = finalData.finalWeight - (bill.targetWeight || 0);

    return await (prisma as any).bill.update({
      where: { id: billId },
      data: {
        billType: "CustomFinal",
        finalWeight: finalData.finalWeight,
        finalPrice: finalData.finalPrice,
        finalWeightPhoto: finalData.finalWeightPhoto,
        weightDifference,
      }
    });
  } catch (error) {
    console.error("Error finalizing custom order:", error);
    throw error;
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

export async function addCustomer(customerData: any) {
  try {
    return await prisma.customer.create({
      data: {
        name: customerData.name,
        phone: customerData.phone || "",
        address: customerData.address || "",
      },
    });
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
