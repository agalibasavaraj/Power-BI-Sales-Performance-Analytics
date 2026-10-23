# Power BI Desktop Implementation & Canvas Construction Guide

Follow these sequential steps in Microsoft Power BI Desktop to build the production report:

---

## Quick Start: Direct .PBIX File Access
If you have Microsoft Power BI Desktop installed:
1. Double-click **`Sales-Performance-Analytics/dashboard/Sales_Performance_Analytics.pbix`** to open the ready-to-view dashboard immediately with all visual cards, charts, Star Schema relationships, and DAX measures pre-loaded!
2. Alternatively, open **`Sales_Performance_Analytics.pbit`** to load the template structure.

---

## Step 1: Open Power BI & Apply Theme
1. Launch **Microsoft Power BI Desktop**.
2. Go to **View** ribbon tab -> **Themes** dropdown -> **Browse for themes...**
3. Select `Sales-Performance-Analytics/dashboard/power_bi_theme.json`.

---

## Step 2: Ingest the Datasets via Star Schema
1. Click **Get Data** -> **Text/CSV**.
2. Import the following CSVs from `Sales-Performance-Analytics/data/`:
   - `cleaned_sales_dataset.csv` (Name table: `Fact_Sales`)
   - `dim_product.csv` (Name table: `Dim_Product`)
   - `dim_customer.csv` (Name table: `Dim_Customer`)
   - `dim_geography.csv` (Name table: `Dim_Geography`)
   - `dim_calendar.csv` (Name table: `Dim_Calendar`)
3. Click **Model View** (left navigation bar):
   - Drag `Dim_Calendar[Date]` to `Fact_Sales[Order_Date]` (1 : * Single).
   - Drag `Dim_Customer[Customer_ID]` to `Fact_Sales[Customer_ID]` (1 : * Single).
   - Drag `Dim_Product[Product_ID]` to `Fact_Sales[Product_ID]` (1 : * Single).
   - Drag `Dim_Geography[Postal_Code]` to `Fact_Sales[Postal_Code]` (1 : * Single).

---

## Step 3: Create the `_Measures` Table
1. On the **Home** ribbon, click **Enter Data**.
2. Name the table `_Measures` and column `Dummy`. Click **Load**.
3. Create each DAX measure documented in `docs/dax_measures.md` by right-clicking `_Measures` -> **New measure**.
4. Delete the `Dummy` column. The `_Measures` table will automatically move to the very top with a calculator icon!

---

## Step 4: Build Canvas Visuals (Page 1: Executive Overview)
1. **Header Banner**: Add a Text box titled `"Executive Sales & Profit Performance"`.
2. **Top Slicers**:
   - Add a **Slicer** -> `Dim_Calendar[Date]` (set style to Between / Date Slider).
   - Add a **Slicer** -> `Dim_Geography[Region]` (Tile or Dropdown).
   - Add a **Slicer** -> `Dim_Product[Category]` (Tile or Dropdown).
   - Add a **Slicer** -> `Dim_Customer[Segment]` (Tile or Dropdown).
3. **KPI Cards (New Card Visual)**:
   - Card 1: `[Total Revenue]` (formatted as Currency).
   - Card 2: `[Total Profit]` (formatted as Currency).
   - Card 3: `[Profit Margin %]` (formatted as 0.0%).
   - Card 4: `[Total Orders]` (formatted as Integer).
   - Card 5: `[Total Quantity Sold]` (formatted as Integer).
   - Card 6: `[Average Order Value]` (formatted as Currency).
4. **Monthly Trend Chart**:
   - Insert an **Area Chart** or **Line and Clustered Column Chart**.
   - Shared X-Axis: `Dim_Calendar[Month_Year]`.
   - Column / Line Values: `[Total Revenue]` and `[Total Profit]`.
5. **Category Profitability Tree / Bar Visual**:
   - Insert a **Clustered Bar Chart**.
   - Y-Axis: `Dim_Product[Sub_Category]`.
   - X-Axis: `[Total Profit]`.
   - Conditional formatting: Red if `< 0`, Green if `>= 0`. Notice the negative bar for `Tables`!
6. **Regional Comparison**:
   - Insert a **Clustered Column Chart** or **Donut Chart** comparing `[Total Revenue]` across `Dim_Geography[Region]`.
