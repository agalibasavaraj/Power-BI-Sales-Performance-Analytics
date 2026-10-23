-- ==============================================================================
-- 02_kpi_validation.sql
-- Project: Sales Performance Analytics — Power BI Portfolio
-- Description: Reconciles all core Power BI DAX measures against the database
-- Interview Key Concept: "How do you validate your Power BI report numbers?"
-- Answer: Cross-querying SQL directly against the data source before client presentation.
-- ==============================================================================

-- 1. Executive Level KPI Audit (Single Row Reconciliation)
-- Matches:
-- DAX: [Total Revenue], [Total Profit], [Profit Margin %], [Total Orders], [Total Quantity], [AOV]
SELECT 
    ROUND(SUM(sales), 2) AS total_revenue,
    ROUND(SUM(profit), 2) AS total_profit,
    ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2) AS profit_margin_pct,
    COUNT(DISTINCT order_id) AS total_orders, -- DISTINCT COUNT! Note: NOT COUNT(*) which gives row count
    COUNT(*) AS total_order_line_items,
    SUM(quantity) AS total_quantity_sold,
    ROUND(SUM(sales) / NULLIF(COUNT(DISTINCT order_id), 0), 2) AS average_order_value,
    ROUND(AVG(discount) * 100, 2) AS avg_discount_pct
FROM fact_sales;

-- 2. Validation by Calendar Year (Reconciles Slicers & Yearly Summaries)
SELECT 
    EXTRACT(YEAR FROM order_date) AS order_year,
    COUNT(DISTINCT order_id) AS distinct_orders,
    SUM(quantity) AS total_quantity,
    ROUND(SUM(sales), 2) AS yearly_revenue,
    ROUND(SUM(profit), 2) AS yearly_profit,
    ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2) AS profit_margin_pct
FROM fact_sales
GROUP BY EXTRACT(YEAR FROM order_date)
ORDER BY order_year ASC;

-- 3. Multi-Line Order Check (Proof that Order Count != Row Count)
-- Interviewers frequently ask: "Why can't we use COUNTROWS(Sales) for total orders?"
-- This query proves that single orders contain multiple line items:
SELECT 
    order_id,
    COUNT(*) AS line_item_count,
    ROUND(SUM(sales), 2) AS order_total_sales
FROM fact_sales
GROUP BY order_id
HAVING COUNT(*) > 1
ORDER BY line_item_count DESC
LIMIT 10;
