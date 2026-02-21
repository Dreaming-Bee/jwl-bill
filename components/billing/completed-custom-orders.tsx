"use client";

import React, { useState, useEffect } from "react";
import { getAllBills } from "@/app/actions/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FinalBillForm } from "./final-bill-form";
import { CheckCircle, Clock, ShoppingBag, ArrowRight, User, Calendar } from "lucide-react";

export function CompletedCustomOrders() {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const allBills = await getAllBills();
            // Filter for CustomInitial bills that have an associated worksheet with a final weight
            // OR just show all CustomInitial bills and let the user pick.
            // The requirement says "Completed Custom Orders", which usually means workshop is done.
            const completed = allBills.filter(b =>
                b.billType === "CustomInitial" &&
                b.worksheet && b.worksheet.finalWeight
            );
            setBills(completed);
        } catch (error) {
            console.error("Error loading completed orders:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    if (selectedBillId) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => setSelectedBillId(null)} className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 rotate-180" /> Back to List
                </Button>
                <FinalBillForm
                    billId={selectedBillId}
                    onSuccess={() => {
                        setSelectedBillId(null);
                        load();
                    }}
                    onCancel={() => setSelectedBillId(null)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Ready for Final Billing</h2>
                    <p className="text-muted-foreground text-sm">Custom orders with completed workshop sheets</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                    {bills.length} Orders Ready
                </Badge>
            </div>

            {loading ? (
                <div className="py-20 text-center text-muted-foreground">Scanning workshop records...</div>
            ) : bills.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-4">
                        <Clock className="h-12 w-12 opacity-20" />
                        <p className="font-medium">No orders are currently waiting for final billing.</p>
                        <p className="text-xs">Once a worksheet is updated with a final weight in the Workshop tab, it will appear here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bills.map((bill) => (
                        <Card key={bill.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{bill.items[0]?.description}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <ShoppingBag className="h-3 w-3" /> {bill.billNumber}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="font-mono">
                                        {bill.items[0]?.metalType} {bill.items[0]?.karatage}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-3 w-3" /> {bill.customer.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                                        <Calendar className="h-3 w-3" /> {new Date(bill.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-green-700 dark:text-green-400">Workshop Output</p>
                                        <p className="font-bold text-lg">{bill.worksheet.finalWeight}g</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-green-700 dark:text-green-400">Target Weight</p>
                                        <p className="font-medium">{bill.targetWeight}g</p>
                                    </div>
                                </div>

                                <Button className="w-full gap-2" onClick={() => setSelectedBillId(bill.id)}>
                                    <CheckCircle className="h-4 w-4" /> Finalize Bill & Print
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
