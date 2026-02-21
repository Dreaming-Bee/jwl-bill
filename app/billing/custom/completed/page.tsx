"use client";

import { CompletedCustomOrders } from "@/components/billing/completed-custom-orders";

export default function CompletedCustomOrdersPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Custom Order Finalization</h1>
                <p className="text-muted-foreground">
                    Convert completed workshop projects into final bills for customer delivery.
                </p>
            </div>
            <CompletedCustomOrders />
        </div>
    );
}
