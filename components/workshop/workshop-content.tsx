"use client";

import { useEffect, useState } from "react";
import { getWorksheets } from "@/app/actions/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { WorksheetUpdateForm } from "./worksheet-update-form";
import { Hammer, Clock, CheckCircle, ArrowLeft } from "lucide-react";

interface Worksheet {
  id: string;
  date: Date | string;
  goldsmithName: string;
  jewelryDescription: string;
  size: string;
  metalType: string;
  metalKaratage: string;
  targetMetalWeight: number;
  theoreticalWastage: number;
  goldGiven: number;
  finalWeight?: number;
  finalMetalWeight?: number;
  allowedWastage?: number;
  actualWastage?: number;
  wastageStatus?: string;
  stoneDetails: any[];
  bill?: {
    billNumber: string;
    customer: {
      name: string;
    };
  };
}

export function WorkshopContent() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);

  async function loadWorksheets() {
    setIsLoading(true);
    try {
      const data = await getWorksheets();
      setWorksheets(data as any);
    } catch (error) {
      console.error("Error loading worksheets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWorksheets();
  }, []);

  const completedOrders = worksheets.filter((w) => w.finalWeight);
  const pendingOrders = worksheets.filter((w) => !w.finalWeight);

  const getWastageStatusColor = (status?: string) => {
    switch (status) {
      case "Ideal":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Excess":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (selectedWsId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setSelectedWsId(null)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Workshop
        </Button>
        <Card>
          <CardContent className="pt-6">
            <WorksheetUpdateForm
              worksheetId={selectedWsId}
              onSuccess={() => {
                setSelectedWsId(null);
                loadWorksheets();
              }}
              onCancel={() => setSelectedWsId(null)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Workshop Management</h1>
          <p className="text-muted-foreground">Track custom orders and wastage</p>
        </div>
        <Badge variant="outline" className="text-base py-1 px-4 border-primary/20 bg-primary/5 text-primary">
          Active Jobs: {pendingOrders.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-l-4 border-l-slate-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Hammer className="h-4 w-4" /> Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{worksheets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Life-time worksheets</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pendingOrders.length}
            </div>
            <p className="text-xs text-orange-600/70 mt-1">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Completed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {completedOrders.length}
            </div>
            <p className="text-xs text-green-600/70 mt-1">
              Final weights received
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Current Jobs</TabsTrigger>
          <TabsTrigger value="orders">History</TabsTrigger>
          <TabsTrigger value="wastage">Wastage Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">In-Progress Workshop Sheets</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-12 text-muted-foreground">Loading pending jobs...</p>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl border-muted">
                  <Hammer className="h-10 w-10 text-muted mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No pending orders in workshop</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrders.map((ws) => (
                    <Card key={ws.id} className="p-5 hover:border-primary/50 transition-colors shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Goldsmith: {ws.goldsmithName}</p>
                          <h4 className="font-bold text-lg">{ws.jewelryDescription}</h4>
                          <p className="text-xs text-muted-foreground">Assigned: {new Date(ws.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-100">
                          {ws.metalKaratage}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="bg-muted/30 p-2 rounded">
                          <p className="text-[10px] text-muted-foreground font-bold">Target Weight</p>
                          <p className="font-semibold">{ws.targetMetalWeight}g</p>
                        </div>
                        <div className="bg-muted/30 p-2 rounded">
                          <p className="text-[10px] text-muted-foreground font-bold">Theoretical Wastage</p>
                          <p className="font-semibold">{ws.theoreticalWastage.toFixed(3)}g</p>
                        </div>
                      </div>

                      <Button className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5" variant="outline" onClick={() => setSelectedWsId(ws.id)}>
                        <Hammer className="h-4 w-4" /> Update Progress
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>History Log</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : worksheets.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No workshop orders found
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium uppercase text-[10px]">Date</th>
                        <th className="text-left py-3 px-4 font-medium uppercase text-[10px]">Goldsmith</th>
                        <th className="text-left py-3 px-4 font-medium uppercase text-[10px]">Jewelry</th>
                        <th className="text-left py-3 px-4 font-medium uppercase text-[10px]">Metal</th>
                        <th className="text-center py-3 px-4 font-medium uppercase text-[10px]">Target</th>
                        <th className="text-center py-3 px-4 font-medium uppercase text-[10px]">Final</th>
                        <th className="text-center py-3 px-4 font-medium uppercase text-[10px]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {worksheets.map((ws) => (
                        <tr
                          key={ws.id}
                          className="border-b hover:bg-muted/50 transition cursor-pointer"
                          onClick={() => ws.finalWeight ? null : setSelectedWsId(ws.id)}
                        >
                          <td className="py-3 px-4">
                            {new Date(ws.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {ws.goldsmithName}
                          </td>
                          <td className="py-3 px-4">
                            {ws.jewelryDescription}
                          </td>
                          <td className="py-3 px-4">
                            {ws.metalType} {ws.metalKaratage}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {ws.targetMetalWeight}g
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {ws.finalWeight ? `${ws.finalWeight}g` : "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              className={
                                ws.finalWeight
                                  ? getWastageStatusColor(ws.wastageStatus)
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }
                            >
                              {ws.finalWeight ? ws.wastageStatus : "Pending"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wastage" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Wastage Analysis by Job</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={completedOrders.slice(0, 10).map(ws => ({
                  name: ws.jewelryDescription.slice(0, 10),
                  allowed: ws.allowedWastage,
                  actual: ws.actualWastage
                }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend />
                  <Bar dataKey="allowed" fill="#10b981" name="Allowed (g)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="#f59e0b" name="Actual (g)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {completedOrders.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Completion Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedOrders.map((ws) => (
                    <div
                      key={ws.id}
                      className="p-4 border rounded-xl shadow-sm space-y-3 bg-white dark:bg-slate-900"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold">{ws.jewelryDescription} <span className="text-xs font-normal text-muted-foreground ml-2">by {ws.goldsmithName}</span></h4>
                        <Badge className={getWastageStatusColor(ws.wastageStatus)}>{ws.wastageStatus}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
                        <div className="p-2 bg-muted/30 rounded">
                          <p className="text-muted-foreground uppercase text-[8px] mb-1">Target</p>
                          <p>{ws.targetMetalWeight}g</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                          <p className="text-muted-foreground uppercase text-[8px] mb-1">Theoretical</p>
                          <p>{ws.theoreticalWastage.toFixed(3)}g</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                          <p className="text-muted-foreground uppercase text-[8px] mb-1">Allowed</p>
                          <p className="text-green-600">{ws.allowedWastage?.toFixed(3)}g</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                          <p className="text-muted-foreground uppercase text-[8px] mb-1">Actual</p>
                          <p className={ws.wastageStatus === 'Excess' ? 'text-orange-600' : 'text-blue-600'}>{ws.actualWastage?.toFixed(3)}g</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
