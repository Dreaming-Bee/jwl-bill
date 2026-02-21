"use client";

import React, { useState } from "react";
import { createBill } from "@/app/actions/billing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Plus, Trash2, Camera, WorksheetIcon } from "lucide-react";

const METAL_TYPES = ["Gold", "WhiteGold", "RoseGold", "Silver"];
const KARATAGES = ["K22", "K21", "K18", "K16", "K14", "K9", "Silver925"];

interface CustomOrderFormProps {
    customers: any[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function CustomOrderForm({ customers, onSuccess, onCancel }: CustomOrderFormProps) {
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [description, setDescription] = useState("");
    const [metalType, setMetalType] = useState("Gold");
    const [karatage, setKaratage] = useState("K22");
    const [targetWeight, setTargetWeight] = useState(0);
    const [targetPrice, setTargetPrice] = useState(0);
    const [deliveryDate, setDeliveryDate] = useState("");
    const [size, setSize] = useState("Ring");
    const [sizeValue, setSizeValue] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCustomerId || !description || targetWeight <= 0) {
            alert("Please fill in all required fields (Customer, Description, Target Weight)");
            return;
        }

        setIsSubmitting(true);
        try {
            const billData = {
                customerId: selectedCustomerId,
                billType: "CustomInitial",
                targetWeight,
                targetPrice,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                specialRemarks: remarks,
                items: [{
                    description,
                    metalType,
                    karatage,
                    weight: 0,
                    size,
                    sizeValue,
                    price: targetPrice,
                    totalValue: targetPrice,
                }],
            };

            await createBill(billData);
            onSuccess();
        } catch (error) {
            console.error("Error creating custom order:", error);
            alert("Error creating custom order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Initial Custom Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Customer (Required)</Label>
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
                        <Label>Item Description (Required)</Label>
                        <Input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g. 22K Men's Ring with Blue Sapphire"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Metal Type</Label>
                        <Select value={metalType} onValueChange={(v: string) => setMetalType(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {METAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Karatage</Label>
                        <Select value={karatage} onValueChange={(v: string) => setKaratage(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {KARATAGES.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Target Weight (g) (Required)</Label>
                        <Input
                            type="number"
                            step="0.001"
                            value={targetWeight}
                            onChange={e => setTargetWeight(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Target Price (LKR)</Label>
                        <Input
                            type="number"
                            value={targetPrice}
                            onChange={e => setTargetPrice(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Size Category</Label>
                        <Select value={size} onValueChange={(v: string) => setSize(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {["Ring", "Chain", "Bracelet", "BanglesWithScrews", "BanglesWithoutScrews"].map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Size Value</Label>
                        <Input
                            placeholder="e.g. 17 or 16''"
                            value={sizeValue}
                            onChange={e => setSizeValue(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Delivery Date</Label>
                        <Input
                            type="date"
                            value={deliveryDate}
                            onChange={e => setDeliveryDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Special Remarks (Design details, stone requests, etc.)</Label>
                        <Input
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="e.g. Leaf pattern on sides, No heat sapphire"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Camera className="h-5 w-5" />
                        <span className="text-sm font-medium">Design images can be uploaded after creation.</span>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Custom Quote"}
                    </Button>
                </div>
            </Card>
        </form>
    );
}
