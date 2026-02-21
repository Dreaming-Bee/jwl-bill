"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "@/app/actions/billing";
import { ReceiptForm } from "@/components/billing/receipt-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReceiptsPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Error loading customers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Repair & Old Gold Receipts</h1>
                <p className="text-muted-foreground">
                    Generate formal receipts for customer jewelry repairs and old gold valuations.
                </p>
            </div>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            ) : (
                <ReceiptForm
                    customers={customers}
                    onSuccess={() => {
                        alert("Receipt generated successfully!");
                        // Optional: redirect or reset
                    }}
                />
            )}
        </div>
    );
}
