"use client";

import React, { useState, useEffect } from "react";
import { finalizeCustomOrder, getBillById } from "@/app/actions/billing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, CheckCircle, Info, Scale } from "lucide-react";

interface FinalBillFormProps {
    billId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function FinalBillForm({ billId, onSuccess, onCancel }: FinalBillFormProps) {
    const [bill, setBill] = useState<any>(null);
    const [finalWeight, setFinalWeight] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [finalWeightPhoto, setFinalWeightPhoto] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            const data = await getBillById(billId);
            if (data) {
                setBill(data);
                setFinalPrice(data.targetPrice || 0);
            }
        }
        load();
    }, [billId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (finalWeight <= 0) {
            alert("Please enter final weight");
            return;
        }

        setIsSubmitting(true);
        try {
            await finalizeCustomOrder(billId, {
                finalWeight,
                finalPrice,
                finalWeightPhoto: finalWeightPhoto || "pending_upload", // Placeholder
            });
            onSuccess();
        } catch (error) {
            console.error("Error finalizing bill:", error);
            alert("Error finalizing bill.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!bill) return <div className="p-8 text-center">Loading order details...</div>;

    const weightDifference = finalWeight - (bill.targetWeight || 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6 border-2 border-primary/20">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <CheckCircle className="h-6 w-6 text-primary" /> Finalizing Custom Order
                    </h3>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Initial Order #</p>
                        <p className="font-mono font-bold">{bill.billNumber}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Order Reference</h4>
                            <p className="font-medium">{bill.items[0]?.description}</p>
                            <div className="flex gap-4 text-xs font-medium">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{bill.items[0]?.metalType} {bill.items[0]?.karatage}</span>
                                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded">Target: {bill.targetWeight}g</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Scale className="h-4 w-4" /> Final Weight (g)</Label>
                            <Input
                                type="number"
                                step="0.001"
                                value={finalWeight}
                                onChange={e => setFinalWeight(parseFloat(e.target.value) || 0)}
                                className="text-lg h-12 font-bold"
                                placeholder="0.000"
                            />
                            {finalWeight > 0 && (
                                <p className={`text-xs font-medium ${weightDifference > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                    Difference from target: {weightDifference > 0 ? '+' : ''}{weightDifference.toFixed(3)}g
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Final Price (LKR)</Label>
                            <Input
                                type="number"
                                value={finalPrice}
                                onChange={e => setFinalPrice(parseFloat(e.target.value) || 0)}
                                className="text-lg h-12 font-bold text-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Mandatory Weight Verification Photo</Label>
                        <div className="aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
                            <Camera className="h-8 w-8" />
                            <span className="text-sm">Click to upload photo of weight on scale</span>
                            <p className="text-[10px] uppercase font-bold text-destructive">Verification Required</p>
                        </div>

                        <div className="pt-4 p-4 border rounded-lg bg-blue-50/50 space-y-2">
                            <h4 className="text-sm font-bold flex items-center gap-2 text-blue-700"><Info className="h-4 w-4" /> Final Step</h4>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Submitting this will convert the custom quote into a final bill. Ensure the total price includes all workshop charges and stone values.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={isSubmitting || finalWeight <= 0} className="min-w-40">
                        {isSubmitting ? "Finalizing..." : "Generate Final Bill"}
                    </Button>
                </div>
            </Card>
        </form>
    );
}
