"use client";

import React, { useState } from "react";
import { createBill, calculatePaymentAmount } from "@/app/actions/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X, Gem, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const PAYMENT_TYPES = ["Cash", "Card", "Koko"];
const METAL_TYPES = ["Gold", "WhiteGold", "RoseGold", "Silver"];
const KARATAGES = ["K22", "K21", "K18", "K16", "K14", "K9", "Silver925"];
const JEWELRY_SIZES = ["Ring", "Chain", "Bracelet", "BanglesWithScrews", "BanglesWithoutScrews"];

type Stone = {
  id: string;
  stoneType: string;
  treatment: string;
  numberOfStones: number;
  weightCarats: number;
  weightGrams: number;
};

type BillItem = {
  id: string;
  description: string;
  metalType: string;
  karatage: string;
  weight: number;
  size: string;
  sizeValue: string;
  price: number;
  stones: Stone[];
  inventoryItemId?: string;
};

interface BillFormProps {
  customers: any[];
  onSuccess: () => void;
}

export function BillForm({ customers, onSuccess }: BillFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState<BillItem[]>([]);
  const [paymentType, setPaymentType] = useState("Cash");
  const [oldGoldValue, setOldGoldValue] = useState(0);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    import("@/app/actions/billing").then(m => m.getInventoryItems().then(setInventory));
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        metalType: "Gold",
        karatage: "K22",
        weight: 0,
        size: "Ring",
        sizeValue: "",
        price: 0,
        stones: [],
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addStone = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? {
            ...item,
            stones: [
              ...item.stones,
              {
                id: Date.now().toString(),
                stoneType: "",
                treatment: "",
                numberOfStones: 1,
                weightCarats: 0,
                weightGrams: 0,
              },
            ],
          }
          : item
      )
    );
  };

  const updateStone = (itemId: string, stoneId: string, field: string, value: any) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? {
            ...item,
            stones: item.stones.map((s) =>
              s.id === stoneId ? { ...s, [field]: value } : s
            ),
          }
          : item
      )
    );
  };

  const removeStone = (itemId: string, stoneId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, stones: item.stones.filter((s) => s.id !== stoneId) }
          : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const bankCharge = paymentType === "Card" && subtotal >= 20000 ? (subtotal * 3) / 100 : 0;
  const totalAmount = subtotal + bankCharge;
  const balance = totalAmount - oldGoldValue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      alert("Please select a customer");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    // Constraint: Koko only for Silver < 20K
    if (paymentType === "Koko") {
      const isAllSilver = items.every(item => item.metalType === "Silver");
      if (!isAllSilver || subtotal >= 20000) {
        alert("Koko payment is only available for Silver jewelry below 20K");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const paymentAmount = await calculatePaymentAmount(subtotal, paymentType);

      const billData = {
        customerId: selectedCustomerId,
        address,
        billType: "ReadyMade",
        items: items.map((item) => ({
          ...item,
          totalValue: item.price,
        })),
        subtotal,
        paymentType,
        paymentAmount,
        oldGoldValue,
        balance,
      };

      await createBill(billData);

      onSuccess();
    } catch (error) {
      console.error("Error creating bill:", error);
      alert("Error creating bill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-4 border-dashed bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Override Address (Optional)</Label>
            <Input
              placeholder="Enter address if different from profile"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Jewelry Items
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            Add Item
          </Button>
        </div>

        <Accordion type="multiple" className="space-y-4">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 justify-between items-center pr-4">
                  <span className="font-medium">{item.description || "New Item"} {item.inventoryItemId && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">In Stock</span>}</span>
                  <span className="text-sm font-semibold">LKR {item.price.toLocaleString()}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 border-t space-y-4">
                <div className="bg-muted/30 p-3 rounded-md mb-4 flex items-center justify-between gap-4">
                  <div className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <Plus className="h-3 w-3" /> Link to Stock
                  </div>
                  <Select
                    value={item.inventoryItemId || ""}
                    onValueChange={(val: string) => {
                      const inv = inventory.find(i => i.id === val);
                      if (inv) {
                        updateItem(item.id, "description", inv.itemName);
                        updateItem(item.id, "metalType", inv.metalType);
                        updateItem(item.id, "karatage", inv.karatage);
                        updateItem(item.id, "weight", inv.weight);
                        updateItem(item.id, "size", inv.size);
                        updateItem(item.id, "sizeValue", inv.sizeValue || "");
                        updateItem(item.id, "price", inv.price);
                        updateItem(item.id, "inventoryItemId", inv.id);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 max-w-[250px]"><SelectValue placeholder="Search inventory..." /></SelectTrigger>
                    <SelectContent>
                      {inventory.map(inv => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.itemName} ({inv.metalType} {inv.karatage}) - {inv.weight}g
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={e => updateItem(item.id, "description", e.target.value)}
                      placeholder="e.g. Gold Necklace"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Metal Type</Label>
                    <Select value={item.metalType} onValueChange={(v: string) => updateItem(item.id, "metalType", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {METAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Karatage</Label>
                    <Select value={item.karatage} onValueChange={(v: string) => updateItem(item.id, "karatage", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {KARATAGES.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (g)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={item.weight}
                      onChange={e => updateItem(item.id, "weight", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Size Category</Label>
                    <Select value={item.size} onValueChange={(v: string) => updateItem(item.id, "size", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {JEWELRY_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Size Value</Label>
                    <Input
                      placeholder="e.g. 17 or 16''"
                      value={item.sizeValue}
                      onChange={e => updateItem(item.id, "sizeValue", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (LKR)</Label>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={e => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Stones Section */}
                <div className="pt-4 space-y-3">
                  <div className="flex justify-between items-center border-t pt-4">
                    <Label className="flex items-center gap-2">
                      <Gem className="h-4 w-4 text-primary" />
                      Gemstones (Internal Use)
                    </Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => addStone(item.id)} className="h-8">
                      + Add Stone
                    </Button>
                  </div>

                  {item.stones.map((stone) => (
                    <div key={stone.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 bg-muted/50 p-2 rounded-md items-end">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase">Type</Label>
                        <Input className="h-8 text-xs" value={stone.stoneType} onChange={e => updateStone(item.id, stone.id, "stoneType", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase">Treatment</Label>
                        <Input className="h-8 text-xs" value={stone.treatment} onChange={e => updateStone(item.id, stone.id, "treatment", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase">Count</Label>
                        <Input className="h-8 text-xs" type="number" value={stone.numberOfStones} onChange={e => updateStone(item.id, stone.id, "numberOfStones", parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase">Weight (ct)</Label>
                        <Input className="h-8 text-xs" type="number" step="0.01" value={stone.weightCarats} onChange={e => updateStone(item.id, stone.id, "weightCarats", parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase">Weight (g)</Label>
                        <Input className="h-8 text-xs" type="number" step="0.01" value={stone.weightGrams} onChange={e => updateStone(item.id, stone.id, "weightGrams", parseFloat(e.target.value) || 0)} />
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeStone(item.id, stone.id)} className="h-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {item.stones.length > 0 && (
                    <div className="text-[10px] text-right text-muted-foreground uppercase font-semibold">
                      Total Stone Weight: {item.stones.reduce((s, st) => s + st.weightGrams, 0).toFixed(3)}g
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(item.id)} className="gap-2">
                    <Trash2 className="h-4 w-4" /> Remove Item
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Card className="p-6 bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Old Gold Value (Deduction)</Label>
              <Input
                type="number"
                value={oldGoldValue}
                onChange={e => setOldGoldValue(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items Subtotal:</span>
              <span className="font-medium">LKR {subtotal.toLocaleString()}</span>
            </div>
            {bankCharge > 0 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>Bank Charge (3% for Card &gt; 20K):</span>
                <span className="font-medium">+ LKR {bankCharge.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground">Gross Total:</span>
              <span className="font-semibold">LKR {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-destructive">
              <span>Old Gold Deduction:</span>
              <span className="font-medium">- LKR {oldGoldValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end border-t pt-4">
              <Label className="text-base font-bold">Net Balance to Pay:</Label>
              <span className="text-2xl font-bold text-primary">LKR {balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-40">
          {isSubmitting ? "Generating..." : "Generate Bill"}
        </Button>
      </div>
    </form>
  );
}

