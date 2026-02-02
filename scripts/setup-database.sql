-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  city VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  weight DECIMAL(10, 3),
  karatage VARCHAR(10),
  metal_type VARCHAR(50),
  quantity INTEGER DEFAULT 0,
  price DECIMAL(12, 2),
  sku VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  bill_date TIMESTAMP DEFAULT NOW(),
  bill_type VARCHAR(50),
  subtotal DECIMAL(12, 2),
  tax DECIMAL(12, 2),
  payment_type VARCHAR(50),
  payment_amount DECIMAL(12, 2),
  old_gold_value DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create bill items table
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  description VARCHAR(255),
  metal_type VARCHAR(50),
  karatage VARCHAR(10),
  weight DECIMAL(10, 3),
  quantity INTEGER,
  pure_weight DECIMAL(10, 3),
  rate DECIMAL(10, 2),
  total_value DECIMAL(12, 2),
  size_value VARCHAR(20),
  price DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create worksheet items table
CREATE TABLE IF NOT EXISTS worksheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT NOW(),
  description VARCHAR(255),
  metal_type VARCHAR(50),
  karatage VARCHAR(10),
  gold_given DECIMAL(10, 3),
  final_weight DECIMAL(10, 3),
  wastage DECIMAL(10, 3),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create stone details table
CREATE TABLE IF NOT EXISTS stone_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_item_id UUID NOT NULL REFERENCES worksheet_items(id) ON DELETE CASCADE,
  stone_name VARCHAR(100),
  quantity INTEGER,
  weight DECIMAL(10, 3),
  rate DECIMAL(10, 2),
  total_value DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_worksheet_items_customer_id ON worksheet_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_stone_details_worksheet_id ON stone_details(worksheet_item_id);
