# Phase 3: Data Modeling & Star Schema Architecture

**Architectural Paradigm**: Kimball Star Schema Dimensional Modeling  
**Primary Engine**: Microsoft Power BI VertiPaq Engine  

---

## 1. Dimensional Architecture Diagram

```
                 +----------------------+
                 |     Dim_Calendar     |
                 +----------------------+
                 | *Date (PK)           |
                 |  Year                |
                 |  Month_Number        |
                 |  Month_Year          |
                 |  Quarter             |
                 +----------+-----------+
                            | 1
                            | 
                            | *
+--------------------+   +--+-------------------+   +--------------------+
|    Dim_Customer    |   |      Fact_Sales      |   |    Dim_Product     |
+--------------------+   +----------------------+   +--------------------+
| *Customer_ID (PK)  |1  |  Row_ID (PK)         |  1| *Product_ID (PK)   |
|  Customer_Name     +---+  Order_ID            +---+  Product_Name      |
|  Segment           |*  |  Order_Date (FK)     |  *|  Category          |
+--------------------+   |  Ship_Date           |   |  Sub_Category      |
                         |  Customer_ID (FK)    |   +--------------------+
+--------------------+   |  Postal_Code (FK)    |
|   Dim_Geography    |   |  Product_ID (FK)     |
+--------------------+   |  Sales               |
| *Postal_Code (PK)  |1  |  Quantity            |
|  City              +---+  Discount            |
|  State             |*  |  Profit              |
|  Region            |   +----------------------+
|  Country           |
+--------------------+
```

---

## 2. Table Relationships & Cardinality Table

| From (Dimension) | To (Fact) | Dimension Key | Fact Key | Cardinality | Cross Filter Direction | Active? |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `Dim_Calendar` | `Fact_Sales` | `Date` | `Order_Date` | `1 : Many (1:*)` | Single (Calendar -> Sales) | Yes |
| `Dim_Calendar` | `Fact_Sales` | `Date` | `Ship_Date` | `1 : Many (1:*)` | Single | No (Inactive - used with `USERELATIONSHIP`) |
| `Dim_Customer` | `Fact_Sales` | `Customer_ID` | `Customer_ID` | `1 : Many (1:*)` | Single (Customer -> Sales) | Yes |
| `Dim_Product` | `Fact_Sales` | `Product_ID` | `Product_ID` | `1 : Many (1:*)` | Single (Product -> Sales) | Yes |
| `Dim_Geography` | `Fact_Sales` | `Postal_Code` | `Postal_Code` | `1 : Many (1:*)` | Single (Geography -> Sales) | Yes |

---

## 3. Dedicated Date Table (Best Practice Implementation)

In Power BI, NEVER rely on auto-date/time hierarchies. An explicit Date Dimension ensures:
1. Contiguous date sequences required for Time Intelligence DAX (`SAMEPERIODLASTYEAR`, `DATEADD`, `DATESYTD`).
2. Custom financial calendars (4-4-5, fiscal year offset).
3. Optimized VertiPaq column encoding.

### DAX Date Table Formula:
```dax
Dim_Calendar = 
VAR MinYear = YEAR(MIN(Fact_Sales[Order_Date]))
VAR MaxYear = YEAR(MAX(Fact_Sales[Order_Date]))
RETURN
ADDCOLUMNS(
    CALENDAR(DATE(MinYear, 1, 1), DATE(MaxYear, 12, 31)),
    "Year", YEAR([Date]),
    "Month_Number", MONTH([Date]),
    "Month_Name", FORMAT([Date], "MMMM"),
    "Month_Short", FORMAT([Date], "MMM"),
    "Month_Year", FORMAT([Date], "MMM yyyy"),
    "Year_Month_Key", YEAR([Date]) * 100 + MONTH([Date]),
    "Quarter", "Q" & FORMAT([Date], "Q"),
    "Quarter_Year", "Q" & FORMAT([Date], "Q") & " " & YEAR([Date]),
    "Day_of_Week", WEEKDAY([Date], 2), -- 1 = Monday
    "Day_Name", FORMAT([Date], "dddd"),
    "Is_Weekend", IF(WEEKDAY([Date], 2) >= 6, TRUE(), FALSE())
)
```

**CRITICAL STEP**:
In Power BI Model view, select `Month_Year` -> go to **Column Tools** ribbon -> **Sort by Column** -> select `Year_Month_Key`. This prevents alphabetical sorting (e.g., April before January) on your monthly trend visuals!

---

## 4. Key Concepts for Interview Discussion

1. **Why Star Schema instead of a Single Flat Table?**
   - **Performance**: High cardinality columns (like customer names and product descriptions) are compressed significantly better when stored in separate small dimension tables rather than repeating 1,445 times in the fact table.
   - **Usability**: Eliminates redundant filters and simplifies DAX writing.

2. **Why Single Cross-Filter Direction over Bi-directional?**
   - **Ambiguity & Performance**: Bi-directional filtering causes circular relationship paths and performance degradation on large datasets. Filters should naturally flow from 1 (Dimension) down to Many (Fact).

3. **Active vs. Inactive Relationships**:
   - `Order_Date` is the primary active relationship.
   - `Ship_Date` is an inactive relationship. When analyzing shipping metrics, we activate it dynamically in DAX using `USERELATIONSHIP(Fact_Sales[Ship_Date], Dim_Calendar[Date])`.
