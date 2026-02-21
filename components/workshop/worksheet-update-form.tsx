"use client";

import React, { useState, useEffect } from "react";
import { updateWorksheet, getWorksheetById } from "@/app/actions/billing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, Save, Info, ArrowRight } from "lucide-react";

interface WorksheetUpdateFormProps {
    worksheetId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function WorksheetUpdateForm({ worksheetId, onSuccess, onCancel }: WorksheetUpdateFormProps) {
    const [worksheet, setWorksheet] = useState<any>(null);
    const [goldGiven, setGoldGiven] = useState(0);
    const [goldGivenPurity, setGoldGivenPurity] = useState(0);
    const [finalWeight, setFinalWeight] = useState(0);
    const [goldBalance, setGoldBalance] = useState(0);
    const [goldBalancePurity, setGoldBalancePurity] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [calculation, setCalculation] = useState<any>(null);

    useEffect(() => {
        async function load() {
            const data: any = await getWorksheetById(worksheetId);
            if (data) {
                setWorksheet(data);
                setGoldGiven(Number(data.goldGiven) || 0);
                setGoldGivenPurity(Number(data.goldGivenPurity) || 0);
                setFinalWeight(Number(data.finalWeight) || 0);
                setGoldBalance(Number(data.goldBalance) || 0);
                setGoldBalancePurity(Number(data.goldBalancePurity) || 0);
            }
        }
        load();
    }, [worksheetId]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateWorksheet(worksheetId, {
                goldGiven,
                goldGivenPurity,
                finalWeight,
                goldBalance,
                goldBalancePurity,
            });
            onSuccess();
        } catch (error) {
            console.error("Error updating worksheet:", error);
            alert("Error updating worksheet.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!worksheet) return <div className="p-8 text-center">Loading worksheet details...</div>;

    const totalStoneWeight = worksheet.stoneDetails?.reduce((sum: number, s: any) => sum + (s.totalStoneWeight || 0), 0) || 0;
    const finalMetalWeight = finalWeight - totalStoneWeight;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold">{worksheet.jewelryDescription}</h3>
                    <p className="text-sm text-muted-foreground">Worksheet: {worksheet.id.slice(-8).toUpperCase()}</p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                    Target: {worksheet.targetMetalWeight}g ({worksheet.metalKaratage})
                </Badge>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 space-y-4 border-l-4 border-l-blue-500">
                    <h4 className="font-semibold flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Gold Issued</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Gold Given (g)</Label>
                            <Input type="number" step="0.001" value={goldGiven} onChange={e => setGoldGiven(parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Given Purity (%)</Label>
                            <Input type="number" step="0.1" value={goldGivenPurity} onChange={e => setGoldGivenPurity(parseFloat(e.target.value) || 0)} />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 space-y-4 border-l-4 border-l-green-500">
                    <h4 className="font-semibold flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Final Product</h4>
                    <div className="space-y-2">
                        <Label>Final Total Weight (incl. stones) (g)</Label>
                        <Input type="number" step="0.001" value={finalWeight} onChange={e => setFinalWeight(parseFloat(e.target.value) || 0)} />
                        <p className="text-[10px] text-muted-foreground uppercase">Stone Weight Deduction: -{totalStoneWeight.toFixed(3)}g</p>
                        <p className="text-xs font-bold text-green-700">Calculated Metal Weight: {finalMetalWeight.toFixed(3)}g</p>
                    </div>
                </Card>

                <Card className="p-4 space-y-4 border-l-4 border-l-amber-500">
                    <h4 className="font-semibold flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Gold Balance Returned</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Gold Balance (g)</Label>
                            <Input type="number" step="0.001" value={goldBalance} onChange={e => setGoldBalance(parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Balance Purity (%)</Label>
                            <Input type="number" step="0.1" value={goldBalancePurity} onChange={e => setGoldBalancePurity(parseFloat(e.target.value) || 0)} />
                        </div>
                    </div>
                    {goldBalancePurity < goldGivenPurity && goldBalance > 0 && (
                        <div className="text-[10px] text-amber-700 font-medium">
                            Purity Corrected Balance: {((goldBalance * goldBalancePurity) / goldGivenPurity).toFixed(3)}g
                        </div>
                    )}
                </Card>

                <Card className="p-4 bg-muted/30 flex flex-col justify-between">
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2 text-primary"><Info className="h-4 w-4" /> Wastage Calculations</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Theoretical (Target):</span>
                                <span>{worksheet.theoreticalWastage.toFixed(3)}g</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span>Allowed (on final metal):</span>
                                <span>{(finalMetalWeight * (worksheet.theoreticalWastage / worksheet.targetMetalWeight || 0)).toFixed(3)}g</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        <Button type="button" variant="outline" size="sm" className="w-full gap-2">
                            <Camera className="h-4 w-4" /> Upload Final Weight Photo
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
                                <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Progress"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    );
}
