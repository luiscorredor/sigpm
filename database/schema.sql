-- Esquema relacional inicial SIGPM para PostgreSQL.
CREATE TABLE IF NOT EXISTS app_users (
 id BIGSERIAL PRIMARY KEY,
 full_name VARCHAR(160) NOT NULL,
 username VARCHAR(80) NOT NULL UNIQUE,
 email VARCHAR(254) UNIQUE,
 password_hash TEXT NOT NULL,
 role VARCHAR(30) NOT NULL CHECK (role IN ('admin','supervisor','employee')),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS products (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 name VARCHAR(180) NOT NULL,
 category VARCHAR(120),
 stock NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (stock >= 0),
 unit VARCHAR(30) NOT NULL DEFAULT 'Unidad',
 min_stock NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
 cost_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
 sale_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
 description TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS materials (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 name VARCHAR(180) NOT NULL,
 stock NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (stock >= 0),
 unit VARCHAR(30) NOT NULL DEFAULT 'Unidad',
 min_stock NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
 supplier VARCHAR(180),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS machines (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 name VARCHAR(180) NOT NULL,
 location VARCHAR(180),
 status VARCHAR(50) NOT NULL DEFAULT 'Operativa',
 purchase_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
 purchase_date DATE,
 last_maintenance DATE,
 notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS technicians (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 name VARCHAR(180) NOT NULL,
 specialty VARCHAR(180),
 phone VARCHAR(40),
 email VARCHAR(254),
 status VARCHAR(30) NOT NULL DEFAULT 'Activo',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS spare_parts (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 name VARCHAR(180) NOT NULL,
 stock NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (stock >= 0),
 unit VARCHAR(30) NOT NULL DEFAULT 'Unidad',
 min_stock NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
 unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS production_orders (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
 product_name VARCHAR(180) NOT NULL,
 quantity NUMERIC(14,3) NOT NULL CHECK (quantity > 0),
 start_date DATE NOT NULL,
 due_date DATE NOT NULL,
 status VARCHAR(50) NOT NULL DEFAULT 'Planificada',
 assigned_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 machine_codes TEXT,
 notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS maintenance_records (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 machine_id BIGINT REFERENCES machines(id) ON DELETE SET NULL,
 machine_code VARCHAR(80) NOT NULL,
 maintenance_type VARCHAR(30) NOT NULL CHECK (maintenance_type IN ('Preventivo','Correctivo')),
 maintenance_date DATE NOT NULL,
 technician_id BIGINT REFERENCES technicians(id) ON DELETE SET NULL,
 assigned_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 status VARCHAR(50) NOT NULL DEFAULT 'Programado',
 cost NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
 description TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS sales (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 sale_date DATE NOT NULL,
 product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
 product_code VARCHAR(80) NOT NULL,
 product_name VARCHAR(180),
 quantity NUMERIC(14,3) NOT NULL CHECK (quantity > 0),
 unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
 unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
 total NUMERIC(14,2) NOT NULL CHECK (total >= 0),
 profit NUMERIC(14,2) NOT NULL DEFAULT 0,
 customer VARCHAR(180),
 payment_method VARCHAR(40),
 notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS costs (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 category VARCHAR(80) NOT NULL,
 reference_code VARCHAR(100),
 cost_date DATE NOT NULL,
 amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
 description TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS customer_orders (
 id BIGSERIAL PRIMARY KEY,
 code VARCHAR(80) NOT NULL UNIQUE,
 order_date DATE NOT NULL,
 customer_name VARCHAR(180) NOT NULL,
 customer_phone VARCHAR(40),
 customer_email VARCHAR(254),
 product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
 product_code VARCHAR(80) NOT NULL,
 product_name VARCHAR(180) NOT NULL,
 quantity NUMERIC(14,3) NOT NULL CHECK (quantity > 0),
 status VARCHAR(50) NOT NULL DEFAULT 'Recibido',
 notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS app_settings (
 setting_key VARCHAR(100) PRIMARY KEY,
 setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_date ON maintenance_records(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_customer_orders_date ON customer_orders(order_date);
