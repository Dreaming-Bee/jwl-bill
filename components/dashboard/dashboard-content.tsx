"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAllBills, getInventoryItems, getWorksheets } from "@/app/actions/billing";
import { MetalPriceWidget } from "./metal-price-widget";
import { AlertCircle, Clock, ShoppingBag, Info } from "lucide-react";

export function DashboardContent() {
  const [stats, setStats] = useState({
    totalBills: 0,
    totalInventory: 0,
    worksheetsCount: 0,
    totalRevenue: 0,
    pendingCustom: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [bills, inventory, worksheets] = await Promise.all([
          getAllBills(),
          getInventoryItems(),
          getWorksheets(),
        ]);

        const totalRevenue = bills.reduce((sum, bill) => {
          return sum + (bill.paymentAmount || 0);
        }, 0);

        const inventoryCount = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const pendingCustom = bills.filter(b => b.billType === "CustomInitial").length;

        setStats({
          totalBills: bills.length,
          totalInventory: inventoryCount,
          worksheetsCount: worksheets.length,
          totalRevenue,
          pendingCustom,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Lakshika Jewellers Digital Billing System
          </p>
        </div>
        <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">System Date</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {isLoading ? "-" : `LKR ${stats.totalRevenue.toLocaleString()}`}
                </div>
                <p className="text-xs text-blue-600/70 mt-1">Net bills generated</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 border-amber-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Pending Custom Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {isLoading ? "-" : stats.pendingCustom}
                </div>
                <p className="text-xs text-amber-600/70 mt-1">Awaiting finalization</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="bills">Bills Trend</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={[
                      { name: "Mon", revenue: 45000 },
                      { name: "Tue", revenue: 52000 },
                      { name: "Wed", revenue: 38000 },
                      { name: "Thu", revenue: 65000 },
                      { name: "Fri", revenue: 42000 },
                      { name: "Sat", revenue: 89000 },
                      { name: "Sun", revenue: 15000 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bills" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bills Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={[
                      { name: "Mon", bills: 4 },
                      { name: "Tue", bills: 6 },
                      { name: "Wed", bills: 3 },
                      { name: "Thu", bills: 8 },
                      { name: "Fri", bills: 5 },
                      { name: "Sat", bills: 12 },
                      { name: "Sun", bills: 2 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bills" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Prices & Quick Info */}
        <div className="space-y-6">
          <MetalPriceWidget />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Info className="h-3 w-3" /> Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end border-b pb-2">
                <span className="text-xs text-muted-foreground">Inventory Items</span>
                <span className="font-bold">{stats.totalInventory}</span>
              </div>
              <div className="flex justify-between items-end border-b pb-2">
                <span className="text-xs text-muted-foreground">Worksheets</span>
                <span className="font-bold">{stats.worksheetsCount}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-muted-foreground">Total Bills</span>
                <span className="font-bold">{stats.totalBills}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
