"use client";

import React, { useState } from "react";
import { createReceipt } from "@/app/actions/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Camera, AlertCircle, Scale, Hammer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ReceiptFormProps {
    customers: any[];
    onSuccess: () => void;
}

export function ReceiptForm({ customers, onSuccess }: ReceiptFormProps) {
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [receiptType, setReceiptType] = useState<"Repair" | "OldGold">("Repair");
    const [repairItems, setRepairItems] = useState<any[]>([]);
    const [oldGoldItems, setOldGoldItems] = useState<any[]>([]);
    const [valuationCharge, setValuationCharge] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addRepairItem = () => {
        setRepairItems([...repairItems, {
            id: Date.now().toString(),
            description: "",
            weight: 0,
            repairRemark: "",
            price: 0,
            newSize: "",
            isBroken: true, // Default to true for repairs usually
            structureDamaged: false,
            stonesToReplace: "",
        }]);
    };

    const addOldGoldItem = () => {
        setOldGoldItems([...oldGoldItems, {
            id: Date.now().toString(),
            description: "",
            weight: 0,
            isBroken: false,
            specialRemark: "",
        }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId) {
            alert("Please select a customer");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = {
                customerId: selectedCustomerId,
                receiptType,
                valuationCharge: receiptType === "OldGold" ? valuationCharge : 0,
                repairItems: receiptType === "Repair" ? repairItems : [],
                oldGoldItems: receiptType === "OldGold" ? oldGoldItems : [],
            };

            await createReceipt(data);
            onSuccess();
        } catch (error) {
            console.error("Error creating receipt:", error);
            alert("Error creating receipt. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Customer (Required)</Label>
                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                            <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                            <SelectContent>
                                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Submission Type</Label>
                        <Tabs value={receiptType} onValueChange={(v: any) => setReceiptType(v)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="Repair">Repair</TabsTrigger>
                                <TabsTrigger value="OldGold">Old Gold</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </Card>

            {receiptType === "Repair" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                            <Hammer className="h-5 w-5" /> Repair Items
                        </h3>
                        <Button type="button" variant="outline" size="sm" onClick={addRepairItem}>+ Add Item</Button>
                    </div>

                    <div className="space-y-4">
                        {repairItems.map((item, index) => (
                            <Card key={item.id} className="relative pt-8 px-4 pb-4 border-l-4 border-l-blue-500">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 text-destructive"
                                    onClick={() => setRepairItems(repairItems.filter(i => i.id !== item.id))}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Item Description</Label>
                                        <Input
                                            value={item.description}
                                            onChange={e => {
                                                const newItems = [...repairItems];
                                                newItems[index].description = e.target.value;
                                                setRepairItems(newItems);
                                            }}
                                            placeholder="e.g. Broken Gold Chain"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weight (g)</Label>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            value={item.weight}
                                            onChange={e => {
                                                const newItems = [...repairItems];
                                                newItems[index].weight = parseFloat(e.target.value) || 0;
                                                setRepairItems(newItems);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Repair Remark (Broken part details)</Label>
                                        <Input
                                            value={item.repairRemark}
                                            onChange={e => {
                                                const newItems = [...repairItems];
                                                newItems[index].repairRemark = e.target.value;
                                                setRepairItems(newItems);
                                            }}
                                            placeholder="e.g. Soldering at the clasp"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Repair Price (LKR)</Label>
                                        <Input
                                            type="number"
                                            value={item.price}
                                            onChange={e => {
                                                const newItems = [...repairItems];
                                                newItems[index].price = parseFloat(e.target.value) || 0;
                                                setRepairItems(newItems);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Size (if resizing)</Label>
                                        <Input
                                            value={item.newSize}
                                            onChange={e => {
                                                const newItems = [...repairItems];
                                                newItems[index].newSize = e.target.value;
                                                setRepairItems(newItems);
                                            }}
                                            placeholder="e.g. Resizing to 18"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Stone Replacement Details</Label>
                                        <Input
                                            value={item.stonesToReplace}
                                            onChange={e => {
                                                const newItems = [...repairItems];
                                                newItems[index].stonesToReplace = e.target.value;
                                                setRepairItems(newItems);
                                            }}
                                            placeholder="e.g. 2 x 1.5mm CZ"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-6 mt-4 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`broken-${item.id}`}
                                            checked={item.isBroken}
                                            onCheckedChange={(v: boolean) => {
                                                const newItems = [...repairItems];
                                                newItems[index].isBroken = v;
                                                setRepairItems(newItems);
                                            }}
                                        />
                                        <Label htmlFor={`broken-${item.id}`} className="text-destructive font-medium">Item is Broken</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`structure-${item.id}`}
                                            checked={item.structureDamaged}
                                            onCheckedChange={(v: boolean) => {
                                                const newItems = [...repairItems];
                                                newItems[index].structureDamaged = v;
                                                setRepairItems(newItems);
                                            }}
                                        />
                                        <Label htmlFor={`structure-${item.id}`}>Structure/Prongs Damaged</Label>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-4 text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                                    <Camera className="h-4 w-4 mt-0.5" />
                                    <p>Remember to capture photos of: 1. Item on scale showing weight. 2. Specific damage point.</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {receiptType === "OldGold" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600">
                            <Scale className="h-5 w-5" /> Old Gold Valuation
                        </h3>
                        <Button type="button" variant="outline" size="sm" onClick={addOldGoldItem}>+ Add Item</Button>
                    </div>

                    <div className="space-y-4">
                        {oldGoldItems.map((item, index) => (
                            <Card key={item.id} className="relative pt-8 px-4 pb-4 border-l-4 border-l-amber-500">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 text-destructive"
                                    onClick={() => setOldGoldItems(oldGoldItems.filter(i => i.id !== item.id))}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Item Description</Label>
                                        <Input
                                            value={item.description}
                                            onChange={e => {
                                                const newItems = [...oldGoldItems];
                                                newItems[index].description = e.target.value;
                                                setOldGoldItems(newItems);
                                            }}
                                            placeholder="e.g. 22K Bangle"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weight (g)</Label>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            value={item.weight}
                                            onChange={e => {
                                                const newItems = [...oldGoldItems];
                                                newItems[index].weight = parseFloat(e.target.value) || 0;
                                                setOldGoldItems(newItems);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Special Remarks (Broken, scratches, etc.)</Label>
                                        <Input
                                            value={item.specialRemark}
                                            onChange={e => {
                                                const newItems = [...oldGoldItems];
                                                newItems[index].specialRemark = e.target.value;
                                                setOldGoldItems(newItems);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <Checkbox
                                        id={`og-broken-${item.id}`}
                                        checked={item.isBroken}
                                        onCheckedChange={(v: boolean) => {
                                            const newItems = [...oldGoldItems];
                                            newItems[index].isBroken = v;
                                            setOldGoldItems(newItems);
                                        }}
                                    />
                                    <Label htmlFor={`og-broken-${item.id}`}>Item is Broken (Mandatory record)</Label>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="p-4 bg-amber-50 border-amber-200">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <Label>Valuation Status</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id="free"
                                            name="charge"
                                            checked={valuationCharge === 0}
                                            onChange={() => setValuationCharge(0)}
                                        />
                                        <Label htmlFor="free">Free (New Job)</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id="paid"
                                            name="charge"
                                            checked={valuationCharge === 500}
                                            onChange={() => setValuationCharge(500)}
                                        />
                                        <Label htmlFor="paid">Charge Rs. 500 (Valuation Only)</Label>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Total Old Gold Weight</p>
                                <p className="text-xl font-bold">{oldGoldItems.reduce((s, i) => s + i.weight, 0).toFixed(3)}g</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting || (repairItems.length === 0 && oldGoldItems.length === 0)}>
                    {isSubmitting ? "Generating Receipt..." : "Generate Receipt"}
                </Button>
            </div>
        </form>
    );
}
