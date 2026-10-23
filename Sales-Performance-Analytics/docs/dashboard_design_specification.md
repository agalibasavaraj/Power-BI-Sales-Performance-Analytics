# Phase 5: Dashboard Design Specification & Visual Architecture

**Canvas Resolution**: 16:9 Standard HD (1920 x 1080 or 1280 x 720)  
**Visual Style**: Clean Corporate Modern / High Contrast Typography  
**Palette**: Deep Slate (`#0F172A`), Tech Indigo (`#3B82F6`), Profit Green (`#10B981`), Loss Red (`#EF4444`), Warning Amber (`#F59E0B`), Neutral Slate (`#64748B`).

---

## 1. Page Architecture & Layout Grid

The dashboard is structured into 3 dedicated analytical views:

```
+-----------------------------------------------------------------------------------------------+
| HEADER BAR: Company Logo | Sales Performance Executive Dashboard | Last Refreshed: Current Date |
+-----------------------------------------------------------------------------------------------+
| TOP SLICER BAR: [Date Range Slider] | [Region: All] | [Category: All] | [Customer Segment: All] |
+-----------------------------------------------------------------------------------------------+
| KPI ROW (Top 6 Cards with Secondary Indicators):                                              |
| [ Total Revenue ]  | [ Total Profit ]  | [ Profit Margin % ] | [ Total Orders ] | [ Total Units ] | [ AOV ] |
| $648.2K (+8.4% MoM)| $112.5K (17.4%)   | 17.4% (Target 15%)  | 750 Orders       | 4,210 Units     | $864.30 |
+---------------------------------------------------------+-------------------------------------+
| MONTHLY REVENUE & PROFIT TREND (Area + Line Chart)      | REGIONAL REVENUE & MARGIN           |
| X: Month_Year (Jan 2023 - Dec 2025)                     | Clustered Bar / Donut Chart         |
| Primary Y: [Total Revenue] (Area Fill)                  | West, East, Central, South          |
| Secondary Y: [Total Profit] (Line)                      | Tooltip: Orders & AOV               |
+---------------------------------------------------------+-------------------------------------+
| CATEGORY & SUB-CATEGORY PROFITABILITY MATRIX            | DISCOUNT VS PROFIT SENSITIVITY      |
| Bar Chart / Decomposition Tree                          | Scatter Plot / Tier Breakdown       |
| Identifies profit bleeders (e.g. Tables -12.4% margin)  | Proves erosion beyond 20% discount  |
+-----------------------------------------------------------------------------------------------+
```

---

## 2. Visual Element Configuration Guide

### 1. KPI Cards (New Card Visual)
- **Primary Metric**: Callout value 24pt bold, formatted to currency/percentage with zero ambiguous abbreviations.
- **Secondary Reference**: Compare with Prior Month (`[Revenue PM]`) or Target with dynamic green/red delta arrows (`▲ +8.4% MoM`).

### 2. Monthly Trend Chart (Area / Clustered Column + Line)
- **X-Axis**: `Dim_Calendar[Month_Year]`.
- **Y-Axis**: `[Total Revenue]`.
- **Secondary Y-Axis**: `[Total Profit]`.
- **Formatting**: Set smooth interpolation; enable data markers for high and low points.
- **Sort**: Must ensure `Month_Year` is sorted by `Year_Month_Key` in Data View!

### 3. Category & Sub-Category Performance (Bar Chart / Table Matrix)
- **Hierarchy**: `Dim_Product[Category]` -> `Dim_Product[Sub_Category]`.
- **Values**: `[Total Revenue]`, `[Total Profit]`, `[Profit Margin %]`.
- **Conditional Formatting**: Background color on `[Profit Margin %]` using gradient: Red (`#EF4444`) below 0%, Yellow (`#F59E0B`) at 10%, Green (`#10B981`) at 20%+.

### 4. Regional Breakdown (Clustered Bar Chart)
- **Y-Axis**: `Dim_Geography[Region]`.
- **X-Axis**: `[Total Revenue]`.
- **Color Saturation**: `[Profit Margin %]`.

## 4. Executive Report Export Capabilities

The dashboard provides automated 1-click reporting for stakeholder reviews:
- **PDF Executive Presentation**: Generates a high-resolution PDF document embedded with company header branding, active slicer filter tags (Year, Region, Category, Segment), generation timestamp, and the captured canvas state.
- **PNG High-Resolution Snapshot**: Generates a 2x scaled image artifact for insertion into executive PowerPoint slide decks or portfolio presentations.
- **Print / Browser PDF Integration**: Standardized `@media print` CSS stylesheet formatting that hides ribbons and toolbars while preserving crisp typography and visual contrast.

