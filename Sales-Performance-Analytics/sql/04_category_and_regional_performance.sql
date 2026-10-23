-- ==============================================================================
-- 04_category_and_regional_performance.sql
-- Project: Sales Performance Analytics — Power BI Portfolio
-- Description: Uncovers business bottlenecks, unprofitable subcategories, & regional disparities
-- ==============================================================================

-- 1. Category and Sub-Category Performance (Identifies Unprofitable Product Lines)
SELECT 
    p.category,
    p.sub_category,
    COUNT(DISTINCT s.order_id) AS total_orders,
    SUM(s.quantity) AS total_units_sold,
    ROUND(SUM(s.sales), 2) AS total_revenue,
    ROUND(SUM(s.profit), 2) AS total_profit,
    ROUND((SUM(s.profit) / NULLIF(SUM(s.sales), 0)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(s.discount) * 100, 2) AS avg_discount_applied
FROM fact_sales s
JOIN dim_product p ON s.product_id = p.product_id
GROUP BY p.category, p.sub_category
ORDER BY total_profit ASC;
-- Observation: Look at 'Tables' subcategory. High discount rates directly drag profit into negative territory!

-- 2. Regional Breakdown with Performance Index
SELECT 
    g.region,
    COUNT(DISTINCT s.order_id) AS total_orders,
    ROUND(SUM(s.sales), 2) AS total_revenue,
    ROUND(SUM(s.profit), 2) AS total_profit,
    ROUND((SUM(s.profit) / NULLIF(SUM(s.sales), 0)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(s.discount) * 100, 2) AS avg_discount_pct,
    ROUND(SUM(s.sales) / NULLIF(COUNT(DISTINCT s.order_id), 0), 2) AS aov
FROM fact_sales s
JOIN dim_geography g ON s.postal_code = g.postal_code
GROUP BY g.region
ORDER BY total_revenue DESC;

-- 3. Discount Sensitivity Matrix (Correlation between Discount Tiers and Negative Margin)
SELECT 
    CASE 
        WHEN discount = 0 THEN '0% No Discount'
        WHEN discount > 0 AND discount <= 0.10 THEN '1% - 10% Low Discount'
        WHEN discount > 0.10 AND discount <= 0.20 THEN '11% - 20% Moderate Discount'
        ELSE 'Over 20% Deep Discount'
    END AS discount_tier,
    COUNT(*) AS transaction_count,
    ROUND(SUM(sales), 2) AS total_revenue,
    ROUND(SUM(profit), 2) AS total_profit,
    ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2) AS profit_margin_pct
FROM fact_sales
GROUP BY 
    CASE 
        WHEN discount = 0 THEN '0% No Discount'
        WHEN discount > 0 AND discount <= 0.10 THEN '1% - 10% Low Discount'
        WHEN discount > 0.10 AND discount <= 0.20 THEN '11% - 20% Moderate Discount'
        ELSE 'Over 20% Deep Discount'
    END
ORDER BY profit_margin_pct DESC;
