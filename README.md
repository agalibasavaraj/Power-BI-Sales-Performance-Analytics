# Power BI Sales Performance Analytics — Portfolio & Mentorship Studio

Welcome to the **Power BI Sales Performance Analytics** portfolio project.

This repository contains the complete end-to-end data analytics workflow built for Power BI Desktop, accompanied by an interactive browser-based learning workbench and validator.

## Power BI Files Included
- **`Sales-Performance-Analytics/dashboard/Sales_Performance_Analytics.pbix`**: Complete Power BI Desktop report with Star Schema model, DAX measures, and visual canvas.
- **`Sales-Performance-Analytics/dashboard/Sales_Performance_Analytics.pbit`**: Power BI Template file for rapid deployment and customization.
- **`Sales-Performance-Analytics/dashboard/PowerBI_Sales_Performance_Architecture.pbids`**: 1-click Power BI Data Source connector.

## Dataset Disclosure & ETL Provenance
- **Dataset**: Statistically realistic **synthetic** enterprise retail sales dataset generated deterministically (`seed = 42`) spanning 3 fiscal years (2023–2025).
- **Audit Metrics**: 1,445 line items across 750 distinct orders · $2,233,854.31 Total Revenue · $398,325.74 Total Profit (17.83% Margin) · **8.64% Average Discount**.
- **Data Cleaning**: `data/raw_sales_data.csv` (1,448 rows containing whitespace, casing anomalies, truncated zip codes, timestamps, and scrape duplicates) cleaned via Power Query M into `data/cleaned_sales_dataset.csv` (1,445 normalized rows with `Days_To_Ship` calculated).

## Project Directory
- `Sales-Performance-Analytics/dashboard/`: `.pbix` report, `.pbit` template, theme JSON, and canvas guide.
- `Sales-Performance-Analytics/data/`: Raw dirty CSV, cleaned fact CSV, and Star Schema dimension CSVs (`dim_calendar`, `dim_product`, `dim_customer`, `dim_geography`).
- `Sales-Performance-Analytics/sql/`: 5 production SQL scripts for DDL, DAX-to-SQL reconciliation ($0.00 delta), window functions, and Pareto analysis.
- `Sales-Performance-Analytics/docs/`: Detailed phase-by-phase documentation (`data_profile.md`, `powerquery_transformations.md`, `data_model.md`, `dax_measures.md`, `dashboard_design_specification.md`, `validation_and_business_insights.md`, `interview_qa_masterclass.md`).
