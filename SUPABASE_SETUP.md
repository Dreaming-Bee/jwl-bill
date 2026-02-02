# Supabase Database Connection Guide

Your Lakshika Jewellers billing system is now configured to connect to your Supabase PostgreSQL database.

## Environment Variables Set

The following environment variables have been added to your project:

```
DATABASE_URL=postgresql://postgres.mqlzqvzbmuygpbatwjlw:htuRbU7n5ZGItOVN@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.mqlzqvzbmuygpbatwjlw:htuRbU7n5ZGItOVN@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

## Database Schema

The following tables have been created in your Supabase database:

1. **customers** - Customer information and contact details
2. **inventory_items** - Jewelry inventory with pricing and stock
3. **bills** - Bill records with payment information
4. **bill_items** - Individual items in each bill
5. **worksheet_items** - Custom order tracking
6. **stone_details** - Stone specifications for custom orders

## What's Connected

✅ **All Features Using Database:**
- Create new customers (persisted in Supabase)
- Generate bills with customer associations
- Track inventory items and stock levels
- Store bill history and payment records
- Workshop order tracking

✅ **Business Logic Intact:**
- Wastage calculations (K22, K21, K18, K16, K14, K9, Silver925)
- Payment rules (3% card charge for amounts ≥20,000 LKR)
- Bill numbering system
- PDF export and printing

## Next Steps

1. The database is ready to use immediately
2. All data created in the app will be stored in Supabase
3. Multiple users can access the same data
4. Data persists across sessions and restarts

## Database Tables Structure

### Customers Table
- id (UUID) - Primary key
- name - Customer name
- phone - Phone number
- address - Customer address
- city - City/Location
- created_at, updated_at - Timestamps

### Bills Table
- id (UUID) - Primary key
- billNumber - Unique bill identifier
- customerId - Reference to customer
- billDate - Date of bill creation
- billType - ReadyMade or Custom
- subtotal - Total amount before tax
- paymentType - Cash, Card, or Koko
- paymentAmount - Final amount to be paid
- status - Bill status

### Bill Items Table
- id (UUID) - Primary key
- billId - Reference to bill
- description - Item description
- metalType - Gold, Silver, etc.
- karatage - K22, K18, etc.
- weight - Weight in grams
- price - Item price
- totalValue - Total value of item

All data is now persisted in your Supabase PostgreSQL database!
