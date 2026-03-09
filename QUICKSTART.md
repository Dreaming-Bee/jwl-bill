# Quick Start - Lakshika Jewellers Billing System

Get up and running in 5 minutes!

## Installation (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Setup database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start development server
npm run dev
```

Open **http://localhost:3000** in your browser. Done! ✅

## First Steps (3 minutes)

### 1. Explore the Dashboard
- You're logged in as **Admin**
- See business statistics and charts
- Navigate using the sidebar

### 2. Create Your First Bill
```
Sidebar → Ready-Made Billing → New Bill
├── Select customer: "Rajesh Kumar"
├── Add item: "Classic Gold Ring"
├── Payment type: "Cash"
└── Submit
```

### 3. View the Bill
- Click the eye icon to preview
- Download PDF or print
- See auto-calculated totals

### 4. Check Inventory
```
Sidebar → Inventory
├── See all ready-made items
├── View quantities
└── Monitor total inventory value
```

### 5. Explore Workshop
```
Sidebar → Workshop
├── View pending custom orders
├── See wastage calculations
└── Check order progress
```

## Key Features to Try

### 🧾 Billing
- Create bills with multiple items
- Auto-calculated payment charges (3% for card payments ≥LKR 20,000)
- PDF download and printing
- Customer details auto-filled

### 📦 Inventory
- Real-time stock tracking
- Low stock alerts
- Metal type filtering
- Total value calculations

### 🔨 Workshop
- Custom order tracking
- Wastage analysis
- Stone weight management
- Goldsmith assignment

### 📊 Reports
- Revenue trends
- Metal distribution charts
- Business analytics
- Export functionality

## Test Different Roles

Edit `.env.local` to change role:

```bash
# Admin - Full Access
NEXT_PUBLIC_CURRENT_ROLE="Admin"

# Sales - Can create bills
NEXT_PUBLIC_CURRENT_ROLE="Sales"

# Workshop - Can manage orders
NEXT_PUBLIC_CURRENT_ROLE="Workshop"

# Manager - Can view reports
NEXT_PUBLIC_CURRENT_ROLE="Manager"
```

Then restart: `npm run dev`

## Sample Data Included

### Customers (3)
- Rajesh Kumar - Mumbai
- Priya Sharma - Bangalore
- Arjun Patel - Ahmedabad

### Inventory Items (5)
- Classic Gold Ring (18K)
- Silver Chain (925)
- Gold Bracelet (22K)
- Rose Gold Pendant (18K)
- Silver Bangles (925)

### Sample Bills (2)
- Ready-made bill with items
- Custom order with workshop tracking

## Common Tasks

### Create a Bill with Multiple Items
1. Go to **Ready-Made Billing**
2. Click **New Bill**
3. Select customer
4. Click **Add Item** for each piece
5. Configure payment type
6. Submit

### Download Bill as PDF
1. View bill list
2. Click eye icon to preview
3. Click **Download PDF**
4. Save to computer

### Track Wastage
1. Go to **Workshop**
2. Click **Wastage Analysis** tab
3. View completed orders
4. See wastage status (Ideal, Low, Excess)

### Check Inventory Value
1. Go to **Inventory**
2. See **Inventory Value** card at top
3. View items with low stock
4. Monitor total quantity

### Generate Reports
1. Go to **Reports**
2. Choose tab: Revenue, Metals, Trends, or Summary
3. Export data if needed

## Troubleshooting

### Database Issues
```bash
npx prisma migrate reset
npm run dev
```

### Port Already in Use
```bash
npm run dev -- -p 3001
```

### Changes Not Showing
- Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- Clear browser cache

## Next Steps

### Development
- Read `SETUP.md` for detailed setup
- Read `FEATURES.md` for complete features
- Check `README.md` for project overview

### Customization
- Modify colors in `app/globals.css`
- Add your business logo to sidebar
- Update company details in components

### Production
- Update `.env` with production database
- Run: `npm run build && npm run start`
- Deploy to Vercel or your hosting

## Need Help?

- **Setup Issues** → See `SETUP.md`
- **Feature Details** → See `FEATURES.md`
- **Architecture** → See `README.md`
- **Code** → Check inline comments

## Key Files to Know

```
/app/page.tsx              Dashboard
/components/sidebar.tsx    Navigation
/app/billing/             Billing pages
/app/inventory/           Inventory page
/app/workshop/            Workshop page
/app/reports/             Reports page
/prisma/schema.prisma     Database schema
/app/actions/billing.ts   Business logic
```

## Pro Tips

💡 **Use the sidebar** - All navigation is in the always-visible sidebar

💡 **Theme switching** - Click moon/sun icon in sidebar footer for dark mode

💡 **Sample data** - Use existing customers and items to test without setup

💡 **Role testing** - Switch roles to see different permissions

💡 **PDF export** - Every bill can be downloaded as professional PDF

## You're All Set! 🎉

Start creating bills, managing inventory, and tracking custom orders.

Have fun with the system!
