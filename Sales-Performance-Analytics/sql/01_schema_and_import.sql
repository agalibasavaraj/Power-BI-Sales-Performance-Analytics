-- ==============================================================================
-- 01_schema_and_import.sql
-- Project: Sales Performance Analytics — Power BI Portfolio
-- Description: DDL Schema creation for Star Schema relational representation
-- Compatible with PostgreSQL, SQLite, MySQL, and Microsoft SQL Server
-- ==============================================================================

-- 1. Create Dimension: Dim_Calendar
CREATE TABLE IF NOT EXISTS dim_calendar (
    date DATE PRIMARY KEY,
    year INT NOT NULL,
    month_number INT NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    month_year VARCHAR(20) NOT NULL,
    quarter VARCHAR(5) NOT NULL,
    quarter_year VARCHAR(10) NOT NULL,
    day_of_week INT NOT NULL,
    day_name VARCHAR(15) NOT NULL,
    is_weekend BOOLEAN NOT NULL
);

-- 2. Create Dimension: Dim_Product
CREATE TABLE IF NOT EXISTS dim_product (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL
);

-- 3. Create Dimension: Dim_Customer
CREATE TABLE IF NOT EXISTS dim_customer (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    segment VARCHAR(50) NOT NULL
);

-- 4. Create Dimension: Dim_Geography
CREATE TABLE IF NOT EXISTS dim_geography (
    postal_code VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    PRIMARY KEY (postal_code, city)
);

-- 5. Create Fact Table: Fact_Sales
CREATE TABLE IF NOT EXISTS fact_sales (
    row_id INT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    order_date DATE NOT NULL,
    ship_date DATE NOT NULL,
    ship_mode VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    sales NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL,
    discount NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    profit NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_sales_calendar FOREIGN KEY (order_date) REFERENCES dim_calendar(date),
    CONSTRAINT fk_sales_product FOREIGN KEY (product_id) REFERENCES dim_product(product_id),
    CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES dim_customer(customer_id)
);

-- Indexes for lightning-fast aggregation performance
CREATE INDEX IF NOT EXISTS idx_fact_sales_order_date ON fact_sales(order_date);
CREATE INDEX IF NOT EXISTS idx_fact_sales_product_id ON fact_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_fact_sales_customer_id ON fact_sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_fact_sales_order_id ON fact_sales(order_id);

-- Optional Bulk Import Commands (PostgreSQL example):
-- \copy dim_calendar FROM 'data/dim_calendar.csv' WITH (FORMAT csv, HEADER true);
-- \copy dim_product FROM 'data/dim_product.csv' WITH (FORMAT csv, HEADER true);
-- \copy dim_customer FROM 'data/dim_customer.csv' WITH (FORMAT csv, HEADER true);
-- \copy fact_sales (row_id, order_id, order_date, ship_date, ship_mode, customer_id, postal_code, product_id, sales, quantity, discount, profit) FROM 'data/cleaned_sales_dataset.csv' WITH (FORMAT csv, HEADER true);
