# Phase 4: DAX Measures Library & Context Transition

**Folder Organization**: Create a dedicated empty disconnected table called `_Measures` in Power BI to house all calculations cleanly.

---

## 1. Fundamental Core Measures

### Total Revenue
```dax
Total Revenue = SUM(Fact_Sales[Sales])
```
*Format*: Currency (`$#,##0.00`)  
*Description*: Aggregates monetary turnover across all sales line items subject to active filter context.

### Total Profit
```dax
Total Profit = SUM(Fact_Sales[Profit])
```
*Format*: Currency (`$#,##0.00`)  
*Description*: Aggregates gross profit (Sales minus Cost of Goods Sold). Can be negative when discounts exceed margins.

### Profit Margin %
```dax
Profit Margin % = 
DIVIDE(
    [Total Profit], 
    [Total Revenue], 
    0
)
```
*Format*: Percentage (`0.0%`)  
*Interview Tip*: Always explain why `DIVIDE()` is superior to `/`: `DIVIDE()` provides a safe alternate result (`0`) and protects against division-by-zero crashes (NaN/Infinity) when sales are zero.

### Total Orders
```dax
Total Orders = DISTINCTCOUNT(Fact_Sales[Order_ID])
```
*Format*: Whole Number (`#,##0`)  
*Critical Logic*: Distinct count of order IDs. Do NOT use `COUNTROWS(Fact_Sales)` because one order can contain multiple product lines.

### Total Quantity Sold
```dax
Total Quantity Sold = SUM(Fact_Sales[Quantity])
```
*Format*: Whole Number (`#,##0`)

### Average Order Value (AOV)
```dax
Average Order Value = 
DIVIDE(
    [Total Revenue], 
    [Total Orders], 
    0
)
```
*Format*: Currency (`$#,##0.00`)

### Average Discount Rate %
```dax
Avg Discount Rate % = AVERAGE(Fact_Sales[Discount])
```
*Format*: Percentage (`0.0%`)

---

## 2. Time Intelligence & Trend Measures

### Revenue Previous Month (PM)
```dax
Revenue PM = 
CALCULATE(
    [Total Revenue],
    DATEADD(Dim_Calendar[Date], -1, MONTH)
)
```

### Revenue Month-over-Month (MoM) Growth %
```dax
Revenue MoM Growth % = 
VAR CurrentRev = [Total Revenue]
VAR PrevRev = [Revenue PM]
RETURN
DIVIDE(CurrentRev - PrevRev, PrevRev, BLANK())
```
*Format*: Percentage (`+0.0%;-0.0%;0.0%`)

### Revenue Previous Year (PY)
```dax
Revenue PY = 
CALCULATE(
    [Total Revenue],
    SAMEPERIODLASTYEAR(Dim_Calendar[Date])
)
```

### Revenue Year-over-Year (YoY) Growth %
```dax
Revenue YoY Growth % = 
VAR CurrentRev = [Total Revenue]
VAR PrevYearRev = [Revenue PY]
RETURN
DIVIDE(CurrentRev - PrevYearRev, PrevYearRev, BLANK())
```

### Revenue Year-to-Date (YTD)
```dax
Revenue YTD = 
CALCULATE(
    [Total Revenue],
    DATESYTD(Dim_Calendar[Date])
)
```

---

## 3. Dynamic Status & Indicator Measures

### Profit Margin Status Color (For Conditional Formatting)
```dax
Profit Margin Status Color = 
SWITCH(
    TRUE(),
    [Profit Margin %] < 0, "#EF4444",      -- Red alert: loss-making
    [Profit Margin %] < 0.15, "#F59E0B",   -- Amber: low margin warning
    "#10B981"                              -- Green: healthy margin (>= 15%)
)
```

### Unprofitable Sub-Category Flag
```dax
Is Loss Making = IF([Total Profit] < 0, 1, 0)
```

---

## 4. Theory & Interview Masterclass: Calculated Columns vs Measures

| Aspect | Calculated Column | Measure |
| :--- | :--- | :--- |
| **Evaluation Timing** | Computed at **Data Refresh** time. Stored row-by-row in RAM. | Computed **On-The-Fly** at query/render time. |
| **Memory Footprint** | Consumes RAM (VertiPaq column dictionary and data vector). | Consumes ZERO model storage; only CPU during visual rendering. |
| **Evaluation Context** | Operates strictly in **Row Context** (current row). | Operates in **Filter Context** (slicers, visual axes, filters). |
| **When to Use** | When the field is needed as a **Slicer**, **Axis/Category**, or **Relationship Key**. | For any numerical aggregation, KPI, or dynamic ratio (`SUM`, `DIVIDE`, `AVG`). |
| **Golden Rule** | *If you can calculate it as a Measure, NEVER create a Calculated Column.* | *Always prefer Measures for analytical metrics.* |
