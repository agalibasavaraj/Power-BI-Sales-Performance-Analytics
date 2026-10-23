# Data Analyst Trainee / Fresher Interview Masterclass

This guide prepares you to defend this Power BI project with confidence in technical rounds, live coding assessments, and hiring manager discussions.

---

## Part 1: Core DAX & Data Modeling Questions

### Q1: "Why did you implement a Star Schema instead of importing a single flat denormalized table?"
**Model Answer**:
> "I implemented a Star Schema composed of one central `Fact_Sales` table and four dimension tables (`Dim_Calendar`, `Dim_Product`, `Dim_Customer`, `Dim_Geography`). 
> 1. **VertiPaq Storage & Compression**: In a flat table, text fields like `Customer_Name` and `Product_Name` repeat across 1,445 rows, bloating memory. In a Star Schema, dimensions store unique values once with integer keys, allowing VertiPaq to achieve high dictionary compression and run-length encoding.
> 2. **DAX Simplicity**: Star schemas guarantee clean 1-to-many filter propagation. This avoids complex DAX workarounds and bi-directional cross-filtering ambiguity.
> 3. **Maintenance**: Product or territory hierarchy updates require changing one row in a dimension table, not thousands of records in the fact table."

---

### Q2: "What is the difference between Row Context and Filter Context in DAX?"
**Model Answer**:
> "Row context exists during calculated column evaluation or iterator functions like `SUMX` and `FILTER`. It means Power BI knows which specific row it is currently evaluating, but it does NOT inherently filter other tables.
> Filter context is the set of all active filters applied to the data model at the time a measure is evaluated. Filter context comes from slicers, visual axes, matrix headers, page-level filters, and the `CALCULATE` function.
> When we use `CALCULATE`, it performs **context transition**, transforming the current row context into an equivalent filter context."

---

### Q3: "Why did you use `DISTINCTCOUNT(Fact_Sales[Order_ID])` instead of `COUNTROWS(Fact_Sales)`?"
**Model Answer**:
> "Because our fact table is at the **order line item granularity**, not the order header granularity. In our dataset of 1,445 rows, single orders contain multiple items (e.g. order `CA-2024-10023` has 3 items). 
> If I had used `COUNTROWS`, I would have reported 1,445 orders instead of the actual **750 distinct customer orders**, which would have overstated order volume by almost double and completely distorted Average Order Value."

---

### Q4: "Why do you use `DIVIDE([Total Profit], [Total Revenue], 0)` instead of `[Total Profit] / [Total Revenue]`?"
**Model Answer**:
> "The `/` operator in DAX evaluates to `NaN` (or `Infinity`) if the denominator is zero or blank. In interactive dashboards, when users slice for an unrepresented time range or product, this throws an ugly visual error. 
> The `DIVIDE()` function has built-in division-by-zero protection and accepts a third argument for an alternate result (which I set to `0`), ensuring seamless report stability."

---

### Q5: "Why did you create an explicit Date Table instead of using Power BI's automatic date hierarchy?"
**Model Answer**:
> "Auto-date/time generates hidden internal tables behind every date column in the background, bloating the `.pbix` file size and memory consumption.
> More importantly, Power BI's built-in Time Intelligence functions like `SAMEPERIODLASTYEAR`, `DATESYTD`, and `DATEADD` require a continuous date sequence without gaps. A retail fact table has natural missing dates on holidays or weekends. An explicit `Dim_Calendar` table ensures continuous sequential dates, supports fiscal calendar offsets, and allows custom sorting columns like `Year_Month_Key`."

---

## Part 2: Business & Analytical Defense Questions

### Q6: "What is the most critical business discovery you made in this project?"
**Model Answer**:
> "The most striking discovery was that our `Tables` subcategory in Furniture is heavily loss-making despite strong sales volume. It generated **$282,738 in sales**, but created **-$104,172 in net losses** with a **-36.8% profit margin**.
> When I investigated why, I noticed that average discounts on Tables reached **30.1%**, while base product margin is only ~5%. Sales reps were using heavy discounts to win deals, causing the company to lose money on every unit sold.
> My recommendation was to enforce a 12% discount approval ceiling in the CRM, which would immediately protect over $100,000 in bottom-line profit."

---

### Q7: "How did you validate your Power BI metrics before presenting to stakeholders?"
**Model Answer**:
> "I wrote dedicated SQL audit scripts (`02_kpi_validation.sql` and `03_monthly_trend_mom.sql`) against the source database. I compared `SUM(sales)`, `SUM(profit)`, `COUNT(DISTINCT order_id)`, and monthly window function results against the DAX measure outputs. 
> I confirmed zero variance ($0.00 delta) across all core metrics: Total Revenue at `$2,233,854.31`, Total Profit at `$398,325.74`, and Total Orders at 750."
