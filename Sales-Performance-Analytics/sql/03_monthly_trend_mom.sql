-- ==============================================================================
-- 03_monthly_trend_mom.sql
-- Project: Sales Performance Analytics — Power BI Portfolio
-- Description: Window Functions to validate Power BI Time Intelligence & MoM Growth
-- Matches DAX: [Revenue MoM Growth %] = DIVIDE([Total Revenue] - [Revenue PM], [Revenue PM], 0)
-- ==============================================================================

WITH monthly_sales AS (
    SELECT 
        TO_CHAR(order_date, 'YYYY-MM') AS year_month,
        EXTRACT(YEAR FROM order_date) AS order_year,
        EXTRACT(MONTH FROM order_date) AS order_month,
        COUNT(DISTINCT order_id) AS monthly_orders,
        ROUND(SUM(sales), 2) AS monthly_revenue,
        ROUND(SUM(profit), 2) AS monthly_profit
    FROM fact_sales
    GROUP BY 
        TO_CHAR(order_date, 'YYYY-MM'),
        EXTRACT(YEAR FROM order_date),
        EXTRACT(MONTH FROM order_date)
),
mom_metrics AS (
    SELECT 
        year_month,
        order_year,
        order_month,
        monthly_orders,
        monthly_revenue,
        monthly_profit,
        LAG(monthly_revenue, 1) OVER (ORDER BY year_month) AS prev_month_revenue,
        LAG(monthly_profit, 1) OVER (ORDER BY year_month) AS prev_month_profit
    FROM monthly_sales
)
SELECT 
    year_month,
    monthly_orders,
    monthly_revenue,
    prev_month_revenue,
    ROUND(monthly_revenue - prev_month_revenue, 2) AS revenue_variance,
    CASE 
        WHEN prev_month_revenue IS NULL OR prev_month_revenue = 0 THEN NULL
        ELSE ROUND(((monthly_revenue - prev_month_revenue) / prev_month_revenue) * 100, 2)
    END AS mom_growth_pct,
    monthly_profit,
    ROUND((monthly_profit / NULLIF(monthly_revenue, 0)) * 100, 2) AS monthly_profit_margin_pct
FROM mom_metrics
ORDER BY year_month ASC;
