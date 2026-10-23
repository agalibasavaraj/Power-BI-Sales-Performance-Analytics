-- ==============================================================================
-- 05_pareto_and_cohort_analysis.sql
-- Project: Sales Performance Analytics — Power BI Portfolio
-- Description: Advanced SQL analysis: 80/20 Pareto principle and customer cohorts
-- ==============================================================================

-- 1. Customer Pareto Analysis (80/20 Rule)
-- Evaluates whether ~20% of customers generate ~80% of total revenue
WITH customer_totals AS (
    SELECT 
        c.customer_id,
        c.customer_name,
        c.segment,
        ROUND(SUM(s.sales), 2) AS customer_revenue,
        ROUND(SUM(s.profit), 2) AS customer_profit,
        COUNT(DISTINCT s.order_id) AS order_count
    FROM fact_sales s
    JOIN dim_customer c ON s.customer_id = c.customer_id
    GROUP BY c.customer_id, c.customer_name, c.segment
),
ranked_customers AS (
    SELECT 
        customer_id,
        customer_name,
        segment,
        customer_revenue,
        customer_profit,
        order_count,
        SUM(customer_revenue) OVER (ORDER BY customer_revenue DESC) AS cumulative_revenue,
        SUM(customer_revenue) OVER () AS grand_total_revenue,
        ROW_NUMBER() OVER (ORDER BY customer_revenue DESC) AS rank,
        COUNT(*) OVER () AS total_customer_count
    FROM customer_totals
)
SELECT 
    rank,
    customer_name,
    segment,
    customer_revenue,
    ROUND((cumulative_revenue / grand_total_revenue) * 100, 2) AS cumulative_revenue_pct,
    ROUND((rank::NUMERIC / total_customer_count::NUMERIC) * 100, 2) AS customer_percentile
FROM ranked_customers
ORDER BY rank ASC;

-- 2. Customer Cohort First Purchase Year vs Subsequent Activity
WITH first_purchase AS (
    SELECT 
        customer_id,
        EXTRACT(YEAR FROM MIN(order_date)) AS cohort_year
    FROM fact_sales
    GROUP BY customer_id
)
SELECT 
    fp.cohort_year,
    EXTRACT(YEAR FROM s.order_date) AS activity_year,
    COUNT(DISTINCT s.customer_id) AS active_customers,
    ROUND(SUM(s.sales), 2) AS cohort_sales,
    ROUND(SUM(s.profit), 2) AS cohort_profit
FROM fact_sales s
JOIN first_purchase fp ON s.customer_id = fp.customer_id
GROUP BY fp.cohort_year, EXTRACT(YEAR FROM s.order_date)
ORDER BY fp.cohort_year, activity_year;
