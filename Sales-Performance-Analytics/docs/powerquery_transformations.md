# Phase 2: Data Cleaning & Transformation (Power Query)

**Tool**: Power Query Editor in Microsoft Power BI Desktop  
**Data Source**: `data/raw_sales_data.csv`  
**Purpose**: Document every applied transformation step in M-code and explain the engineering rationale.

---

## 1. Step-by-Step UI Guide in Power BI Desktop

1. Open **Power BI Desktop**.
2. Click **Get Data** -> **Text/CSV** -> Select `data/raw_sales_data.csv`.
3. Do **NOT** click "Load". Always click **Transform Data** to open the **Power Query Editor**.
4. In the Power Query ribbon, verify each column's data type symbol:
   - `Order_Date` and `Ship_Date`: Change to **Date** (calendar icon).
   - `Postal_Code`: Change to **Text** (prevent truncation of leading zeroes).
   - `Sales` and `Profit`: Change to **Fixed Decimal Number (Currency)**.
   - `Quantity`: Change to **Whole Number**.
   - `Discount`: Change to **Percentage** or Decimal Number.
5. Check for null values:
   - Go to **View** tab -> check **Column Quality**, **Column Distribution**, and **Column Profile**.
   - Confirm 100% Valid, 0% Error, 0% Empty across all 1,445 rows.

---

## 2. Complete Power Query M-Code (Copy-Paste Ready)

In Power Query Editor, click **Home** -> **Advanced Editor** and paste the following M code:

```powerquery
let
    // 1. Ingest raw CSV source
    Source = Csv.Document(
        File.Contents("Sales-Performance-Analytics/data/raw_sales_data.csv"),
        [Delimiter=",", Columns=20, Encoding=65001, QuoteStyle=QuoteStyle.Csv]
    ),

    // 2. Promote first row to headers
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),

    // 3. Explicitly enforce production data types
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Row_ID", Int64.Type},
        {"Order_ID", type text},
        {"Order_Date", type date},
        {"Ship_Date", type date},
        {"Ship_Mode", type text},
        {"Customer_ID", type text},
        {"Customer_Name", type text},
        {"Segment", type text},
        {"Country", type text},
        {"City", type text},
        {"State", type text},
        {"Postal_Code", type text}, // Crucial: Text preserves leading zeros!
        {"Region", type text},
        {"Product_ID", type text},
        {"Category", type text},
        {"Sub_Category", type text},
        {"Product_Name", type text},
        {"Sales", Currency.Type},
        {"Quantity", Int64.Type},
        {"Discount", type number},
        {"Profit", Currency.Type}
    }),

    // 4. Add calculated column: Shipping Duration (Days to Ship)
    #"Added Shipping Days" = Table.AddColumn(
        #"Changed Type", 
        "Days_To_Ship", 
        each Duration.Days([Ship_Date] - [Order_Date]), 
        Int64.Type
    ),

    // 5. Clean text fields: Trim accidental leading/trailing whitespace
    #"Trimmed Text" = Table.TransformColumns(#"Added Shipping Days",{
        {"Customer_Name", Text.Trim, type text},
        {"Product_Name", Text.Trim, type text},
        {"City", Text.Trim, type text}
    })
in
    #"Trimmed Text"
```

---

## 3. Engineering Justifications & Interview Explanations

### Why distinguish genuine duplicates from repeated values?
- **Misconception**: A beginner might see duplicate `Order_ID`s (e.g. `CA-2024-10023` appearing 3 times) and click "Remove Duplicates".
- **Senior Explanation**: This would be a catastrophic data error! A customer frequently orders multiple distinct line items in a single transaction. Each row has a distinct `Product_ID` and `Row_ID`. The duplicate `Order_ID` is legitimate transaction granularity.

### Why use Fixed Decimal (`Currency.Type`) over standard `Double/Float`?
- **Senior Explanation**: Standard floating-point numbers can introduce minute binary rounding artifacts (e.g., `$1,249.99999998`). Fixed Decimal Number in Power BI stores values with 4 decimal digits and handles financial arithmetic without rounding drift.

### Why change Postal Code to Text?
- **Senior Explanation**: ZIP codes like Boston's `02138` would be parsed as the integer `2138`, losing the leading zero and corrupting spatial mapping and joins.
