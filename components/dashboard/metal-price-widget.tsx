"use client";

import React, { useState, useEffect } from "react";
import { getMetalPrices, updateMetalPrice } from "@/app/actions/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Save, History, GoldIcon } from "lucide-react";

export function MetalPriceWidget() {
    const [prices, setPrices] = useState<any[]>([]);
    const [price24K, setPrice24K] = useState(0);
    const [price22K, setPrice22K] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getMetalPrices();
                setPrices(data);
                if (data.length > 0) {
                    setPrice24K(data[0].price24K);
                    setPrice22K(data[0].price22K);
                }
            } catch (error) {
                console.error("Error loading prices:", error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    const handleUpdate = async () => {
        if (price24K <= 0 || price22K <= 0) return;
        setIsUpdating(true);
        try {
            await updateMetalPrice({ price24K, price22K });
            const updated = await getMetalPrices();
            setPrices(updated);
            alert("Metal prices updated successfully for today.");
        } catch (error) {
            console.error("Error updating price:", error);
            alert("Error updating price.");
        } finally {
            setIsUpdating(false);
        }
    };

    const calculateChange = (current: number, previous: number) => {
        if (!previous) return null;
        const diff = current - previous;
        const percent = (diff / previous) * 100;
        return {
            diff: diff.toFixed(2),
            percent: percent.toFixed(1),
            isUp: diff > 0,
            isDown: diff < 0
        };
    };

    const change24K = prices.length > 1 ? calculateChange(prices[0].price24K, prices[1].price24K) : null;

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    Daily Metal Prices (8g)
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">Loading prices...</div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Gold 24K</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={price24K}
                                        onChange={e => setPrice24K(parseFloat(e.target.value) || 0)}
                                        className="font-bold text-lg"
                                    />
                                </div>
                                {change24K && (
                                    <p className={`text-[10px] flex items-center gap-1 ${change24K.isUp ? 'text-green-600' : 'text-red-600'}`}>
                                        {change24K.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {change24K.isUp ? '+' : ''}{change24K.percent}% from yesterday
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Gold 22K (8g)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={price22K}
                                        onChange={e => setPrice22K(parseFloat(e.target.value) || 0)}
                                        className="font-bold text-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleUpdate} disabled={isUpdating} size="sm" className="w-full gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10" variant="outline">
                            <Save className="h-4 w-4" /> {isUpdating ? "Updating..." : "Set Today's Prices"}
                        </Button>

                        <div className="pt-4 border-t">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                                <History className="h-3 w-3" /> Recent History
                            </h4>
                            <div className="space-y-2">
                                {prices.slice(1, 5).map((p, i) => (
                                    <div key={i} className="flex justify-between text-xs py-1 border-b border-muted last:border-0">
                                        <span className="text-muted-foreground">{new Date(p.date).toLocaleDateString()}</span>
                                        <span className="font-medium">24K: {p.price24K.toLocaleString()} | 22K: {p.price22K.toLocaleString()}</span>
                                    </div>
                                ))}
                                {prices.length <= 1 && <p className="text-[10px] text-muted-foreground italic text-center">No history available yet.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
