"use client";

import React, { useState, useEffect } from "react";
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
import { Plus, Trash2, Camera, Info } from "lucide-react";

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

    // Split target weight into metal and stone estimates
    const [estimatedMetalWeight, setEstimatedMetalWeight] = useState(0);
    const [estimatedStoneWeight, setEstimatedStoneWeight] = useState(0);

    const [targetPrice, setTargetPrice] = useState(0);
    const [deliveryDate, setDeliveryDate] = useState("");
    const [size, setSize] = useState("Ring");
    const [sizeValue, setSizeValue] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const targetWeight = estimatedMetalWeight + estimatedStoneWeight;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCustomerId || !description || estimatedMetalWeight <= 0) {
            alert("Please fill in all required fields (Customer, Description, Estimated Metal Weight)");
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
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Initial Custom Order Details</h3>
                    <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                        Target Weight: {targetWeight.toFixed(3)}g
                    </div>
                </div>

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
                        <Label>Estimated Metal Weight (g) (Required)</Label>
                        <Input
                            type="number"
                            step="0.001"
                            value={estimatedMetalWeight}
                            onChange={e => setEstimatedMetalWeight(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Estimated Stone Weight (g)</Label>
                        <Input
                            type="number"
                            step="0.001"
                            value={estimatedStoneWeight}
                            onChange={e => setEstimatedStoneWeight(parseFloat(e.target.value) || 0)}
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

                    <div className="space-y-2 md:col-span-2">
                        <Label>Special Remarks (Mat Polish, Engraving, Design details, etc.)</Label>
                        <Input
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="e.g. Leaf pattern on sides, No heat sapphire"
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                        <p className="font-semibold">Workflow Information:</p>
                        <ul className="list-disc ml-4 mt-1 space-y-1">
                            <li>Target weight is calculated as the sum of metal and stone estimates.</li>
                            <li>A workshop sheet will be generated automatically with these details.</li>
                            <li>Design images can be uploaded after the order is created.</li>
                        </ul>
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
