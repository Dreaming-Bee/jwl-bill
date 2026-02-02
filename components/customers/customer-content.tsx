"use client";

import React from "react"

import { useState, useEffect } from "react";
import { getCustomers, addCustomer } from "@/app/actions/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  address?: string;
}

export function CustomerContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert("Please fill in name and phone");
      return;
    }

    try {
      await addCustomer(formData);
      setFormData({ name: "", phone: "", city: "", address: "" });
      setShowForm(false);
      await loadCustomers();
      alert("Customer added successfully!");
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Error adding customer");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      // In real implementation, you'd have a deleteCustomer action
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customer information and details
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Add Customer Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    City
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Address
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Customer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{customers.length}</div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      {isLoading ? (
        <div className="text-center py-8">Loading customers...</div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No customers added yet
              </p>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Name</th>
                    <th className="py-3 px-4 text-left font-semibold">Phone</th>
                    <th className="py-3 px-4 text-left font-semibold">City</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Address
                    </th>
                    <th className="py-3 px-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">{customer.name}</td>
                      <td className="py-3 px-4">{customer.phone}</td>
                      <td className="py-3 px-4">{customer.city || "-"}</td>
                      <td className="py-3 px-4">
                        {customer.address || "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 bg-transparent"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteCustomer(customer.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
