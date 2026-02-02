"use client";

import React from "react"

import { useState } from "react";
import { createBill, calculatePaymentAmount } from "@/app/actions/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

const PAYMENT_TYPES = ["Cash", "Card", "Koko"];

type BillItem = {
  id: string;
  description: string;
  weight: number;
  price: number;
};

interface BillFormProps {
  customers: any[];
  onSuccess: () => void;
}

export function BillForm({ customers, onSuccess }: BillFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [items, setItems] = useState<BillItem[]>([]);
  const [paymentType, setPaymentType] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        weight: 0,
        price: 0,
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

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

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

    setIsSubmitting(true);
    try {
      const paymentAmount = await calculatePaymentAmount(subtotal, paymentType);

      const billData = {
        customerId: selectedCustomerId,
        items: items.map((item) => ({
          ...item,
          totalValue: item.price,
        })),
        subtotal,
        tax: 0,
        paymentType,
        paymentAmount,
      };

      await createBill(billData);
      
      // Reset form
      setSelectedCustomerId("");
      setItems([]);
      setPaymentType("Cash");
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
      {/* Customer Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Customer</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="">Select a customer...</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Payment Type</label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {PAYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No items added yet
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Description
                    </label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder="e.g., Gold Ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Weight (g)
                    </label>
                    <Input
                      type="number"
                      value={item.weight}
                      onChange={(e) =>
                        updateItem(item.id, "weight", parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Price (LKR)
                    </label>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(item.id, "price", parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Total
                    </label>
                    <div className="px-3 py-2 border border-input rounded-md bg-muted text-sm font-medium">
                      (LKR) {item.price.toLocaleString()}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">(LKR) {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Payment Type:</span>
              <span className="font-medium">{paymentType}</span>
            </div>
            {paymentType === "Card" && subtotal >= 20000 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>Bank Charge (3%):</span>
                <span className="font-medium">
                  (LKR) {((subtotal * 3) / 100).toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                (LKR) {(
                  paymentType === "Card" && subtotal >= 20000
                    ? subtotal + (subtotal * 3) / 100
                    : subtotal
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? "Creating..." : "Create Bill"}
        </Button>
      </div>
    </form>
  );
}
