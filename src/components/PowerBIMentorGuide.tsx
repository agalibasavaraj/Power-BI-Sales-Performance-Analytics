import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  Check, 
  FileText, 
  Layers, 
  Calculator, 
  Layout, 
  ShieldCheck, 
  Github, 
  Lightbulb, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const PowerBIMentorGuide: React.FC = () => {
  const [activePhase, setActivePhase] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const phases = [
    {
      id: 1,
      title: 'Phase 1: Environment & Dataset Inspection',
      icon: BookOpen,
      badge: 'Data Profiling',
      summary: 'Inspect schema structure, understand transaction grain, audit data quality, and determine KPI feasibility.'
    },
    {
      id: 2,
      title: 'Phase 2: Data Cleaning in Power Query',
      icon: Layers,
      badge: 'Power Query M',
      summary: 'Apply type conversions, handle postal code text types, calculate shipping duration, and avoid false duplicate removal.'
    },
    {
      id: 3,
      title: 'Phase 3: Kimball Star Schema Data Model',
      icon: Layout,
      badge: 'Data Modeling',
      summary: 'Design 1-to-many relationships, generate dedicated Date dimension, and avoid bi-directional cross-filtering.'
    },
    {
      id: 4,
      title: 'Phase 4: DAX Measures & Context Transition',
      icon: Calculator,
      badge: 'DAX Formulas',
      summary: 'Build core aggregations, distinct order counting, time intelligence (MoM, YoY), and understand row vs filter context.'
    },
    {
      id: 5,
      title: 'Phase 5: Executive Dashboard Design',
      icon: Layout,
      badge: 'Canvas Architecture',
      summary: 'Assemble 16:9 canvas layout, top slicer bar, card visuals, monthly trend lines, and subcategory profit loss alerts.'
    },
    {
      id: 6,
      title: 'Phase 6: SQL Validation & Business Insights',
      icon: ShieldCheck,
      badge: 'Audit & Insights',
      summary: 'Reconcile DAX measures against SQL down to $0.00 delta, and uncover 4 critical business findings like the Tables loss.'
    },
    {
      id: 7,
      title: 'Phase 7: Portfolio & Interview Defense',
      icon: Github,
      badge: 'Career Readiness',
      summary: 'Publish portfolio repository on GitHub with architectural README, data profile, and master interview Q&A.'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Mentor Intro Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-xl border border-blue-800 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
              Senior Mentor Curriculum · Trainee & Fresher Role Readiness
            </span>
            <h2 className="text-xl font-bold mt-1 text-white">
              Building a Production Power BI Sales Analytics Solution
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Step-by-step masterclass guiding you from raw CSV transaction rows to Power Query transformations, Star Schema modeling, advanced DAX time intelligence, and SQL validation.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs text-blue-200">
            <span className="font-semibold text-white">7 Structured Phases</span>
            <span>100% Interview Aligned</span>
          </div>
        </div>

        {/* Phase Pill Navigation */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 text-xs">
          {phases.map((p) => {
            const Icon = p.icon;
            const isActive = activePhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePhase(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-xs' 
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>Phase {p.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Phase Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
        
        {/* Phase Header */}
        <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {phases[activePhase - 1].badge}
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {phases[activePhase - 1].title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {phases[activePhase - 1].summary}
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">
            Step {activePhase} of 7
          </span>
        </div>

        {/* PHASE 1 CONTENT */}
        {activePhase === 1 && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Mentor Advice for Freshers:</strong> Never open Power BI and immediately build charts! Top interviewers want to hear: <em>"First, I profiled the dataset structure, audited the transaction grain, verified column nullability, and checked data types."</em>
              </div>
            </div>

            <h4 className="font-bold text-sm text-slate-900">1. Understanding Dataset Grain</h4>
            <p>
              In our retail dataset (`data/raw_sales_data.csv`), the grain is <strong>one row per line item within an order</strong>.
              For example, order <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">CA-2024-10023</code> contains 3 items. 
              The dataset contains <strong>1,445 rows</strong> but only <strong>750 distinct orders</strong>.
            </p>

            <h4 className="font-bold text-sm text-slate-900">2. Critical Data Quality Checks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-900 block mb-1">Postal Code Truncation Trap</span>
                <p className="text-slate-600 text-[11px]">
                  ZIP codes like <code className="text-blue-700 font-mono">01001</code> must be stored as <strong>Text</strong>. If loaded as an Integer, Power BI drops the leading zero to <code className="text-rose-700 font-mono">1001</code>, breaking geographic map visual lookups.
                </p>
              </div>
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-900 block mb-1">Distinct vs Row Count Logic</span>
                <p className="text-slate-600 text-[11px]">
                  Aggregating <code className="text-rose-700 font-mono">COUNT(Order_ID)</code> counts line items (1,445), not customer orders (750). Always use <code className="text-emerald-700 font-mono">DISTINCTCOUNT(Order_ID)</code>.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[11px] text-blue-400">File Generated: docs/data_profile.md</span>
                <span className="text-[10px] text-slate-400">Phase 1 Deliverable</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Full data profiling report saved in <code className="text-emerald-300">Sales-Performance-Analytics/docs/data_profile.md</code> detailing all 20 columns, type mappings, and analytical feasibility.
              </p>
            </div>
          </div>
        )}

        {/* PHASE 2 CONTENT */}
        {activePhase === 2 && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Power Query Rule of Thumb:</strong> <em>"Perform transformations as far upstream as possible, and as far downstream as necessary."</em> Clean data in Power Query M-code, not in DAX calculated columns!
              </div>
            </div>

            <h4 className="font-bold text-sm text-slate-900">Power Query M-Code Transformation Recipe</h4>
            <p>
              Open Power BI Desktop &rarr; Click <strong>Transform Data</strong> &rarr; In the <strong>Home</strong> tab, click <strong>Advanced Editor</strong>, and paste this verified M-code:
            </p>

            <div className="relative bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
              <button
                onClick={() => copyToClipboard(`let
    Source = Csv.Document(File.Contents("Sales-Performance-Analytics/data/raw_sales_data.csv"),[Delimiter=",", Columns=20, Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Row_ID", Int64.Type}, {"Order_ID", type text}, {"Order_Date", type date}, {"Ship_Date", type date},
        {"Ship_Mode", type text}, {"Customer_ID", type text}, {"Customer_Name", type text}, {"Segment", type text},
        {"Country", type text}, {"City", type text}, {"State", type text}, {"Postal_Code", type text},
        {"Region", type text}, {"Product_ID", type text}, {"Category", type text}, {"Sub_Category", type text},
        {"Product_Name", type text}, {"Sales", Currency.Type}, {"Quantity", Int64.Type}, {"Discount", type number}, {"Profit", Currency.Type}
    }),
    #"Added Shipping Days" = Table.AddColumn(#"Changed Type", "Days_To_Ship", each Duration.Days([Ship_Date] - [Order_Date]), Int64.Type)
in
    #"Added Shipping Days"`, 'mcode')}
                className="absolute top-2 right-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] transition-colors"
              >
                {copiedCode === 'mcode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode === 'mcode' ? 'Copied M-Code' : 'Copy M-Code'}
              </button>
              <pre className="text-slate-300">
{`let
    Source = Csv.Document(File.Contents("Sales-Performance-Analytics/data/raw_sales_data.csv"),[Delimiter=",", Columns=20, Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Row_ID", Int64.Type}, {"Order_ID", type text}, {"Order_Date", type date}, {"Ship_Date", type date},
        {"Ship_Mode", type text}, {"Customer_ID", type text}, {"Customer_Name", type text}, {"Segment", type text},
        {"Country", type text}, {"City", type text}, {"State", type text}, {"Postal_Code", type text}, // Text type preserves leading zeros!
        {"Region", type text}, {"Product_ID", type text}, {"Category", type text}, {"Sub_Category", type text},
        {"Product_Name", type text}, {"Sales", Currency.Type}, {"Quantity", Int64.Type}, {"Discount", type number}, {"Profit", Currency.Type}
    }),
    #"Added Shipping Days" = Table.AddColumn(#"Changed Type", "Days_To_Ship", each Duration.Days([Ship_Date] - [Order_Date]), Int64.Type)
in
    #"Added Shipping Days"`}
              </pre>
            </div>
          </div>
        )}

        {/* PHASE 3 CONTENT */}
        {activePhase === 3 && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h4 className="font-bold text-sm text-slate-900">Star Schema: Kimball Dimensional Modeling</h4>
            <p>
              In Power BI, a single flat table hurts VertiPaq compression. We normalize into a clean Star Schema:
            </p>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg font-mono text-[11px] text-slate-800">
              <div className="text-center font-bold text-blue-700 mb-2">Dim_Calendar (1)</div>
              <div className="text-center text-slate-400 text-xs mb-2">↓ (1 : *)</div>
              <div className="flex justify-between items-center">
                <span className="p-1.5 bg-white border border-slate-300 rounded shadow-2xs font-semibold">Dim_Customer (1)</span>
                <span className="p-2 bg-blue-100 border border-blue-300 rounded text-blue-900 font-bold">Fact_Sales (*)</span>
                <span className="p-1.5 bg-white border border-slate-300 rounded shadow-2xs font-semibold">Dim_Product (1)</span>
              </div>
              <div className="text-center text-slate-400 text-xs mt-2">↑ (1 : *)</div>
              <div className="text-center font-bold text-purple-700 mt-2">Dim_Geography (1)</div>
            </div>

            <h4 className="font-bold text-sm text-slate-900">Explicit Date Dimension (DAX Formula)</h4>
            <p>
              Never rely on Power BI's automatic date hierarchy! Create a dedicated calendar table with this DAX expression:
            </p>

            <div className="relative bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
              <button
                onClick={() => copyToClipboard(`Dim_Calendar = 
VAR MinYear = YEAR(MIN(Fact_Sales[Order_Date]))
VAR MaxYear = YEAR(MAX(Fact_Sales[Order_Date]))
RETURN
ADDCOLUMNS(
    CALENDAR(DATE(MinYear, 1, 1), DATE(MaxYear, 12, 31)),
    "Year", YEAR([Date]),
    "Month_Number", MONTH([Date]),
    "Month_Name", FORMAT([Date], "MMMM"),
    "Month_Year", FORMAT([Date], "MMM yyyy"),
    "Year_Month_Key", YEAR([Date]) * 100 + MONTH([Date]),
    "Quarter", "Q" & FORMAT([Date], "Q"),
    "Quarter_Year", "Q" & FORMAT([Date], "Q") & " " & YEAR([Date]),
    "Day_of_Week", WEEKDAY([Date], 2),
    "Is_Weekend", IF(WEEKDAY([Date], 2) >= 6, TRUE(), FALSE())
)`, 'dateTable')}
                className="absolute top-2 right-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] transition-colors"
              >
                {copiedCode === 'dateTable' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode === 'dateTable' ? 'Copied DAX' : 'Copy DAX'}
              </button>
              <pre className="text-slate-300">
{`Dim_Calendar = 
VAR MinYear = YEAR(MIN(Fact_Sales[Order_Date]))
VAR MaxYear = YEAR(MAX(Fact_Sales[Order_Date]))
RETURN
ADDCOLUMNS(
    CALENDAR(DATE(MinYear, 1, 1), DATE(MaxYear, 12, 31)),
    "Year", YEAR([Date]),
    "Month_Number", MONTH([Date]),
    "Month_Name", FORMAT([Date], "MMMM"),
    "Month_Year", FORMAT([Date], "MMM yyyy"),
    "Year_Month_Key", YEAR([Date]) * 100 + MONTH([Date]),
    "Quarter", "Q" & FORMAT([Date], "Q")
)`}
              </pre>
            </div>
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
              <strong>Interview Gold:</strong> Mention that you marked `Month_Year` to <em>Sort by Column</em> using `Year_Month_Key` so charts sort chronologically rather than alphabetically!
            </p>
          </div>
        )}

        {/* PHASE 4 CONTENT */}
        {activePhase === 4 && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h4 className="font-bold text-sm text-slate-900">Essential DAX Measures Library</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <span className="font-bold text-slate-900 block mb-1">Total Revenue & Profit</span>
                <code className="text-blue-700 font-mono text-[11px] block">Total Revenue = SUM(Fact_Sales[Sales])</code>
                <code className="text-emerald-700 font-mono text-[11px] block mt-1">Total Profit = SUM(Fact_Sales[Profit])</code>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <span className="font-bold text-slate-900 block mb-1">Profit Margin % (Safe Division)</span>
                <code className="text-purple-700 font-mono text-[11px] block">
                  Profit Margin % = DIVIDE([Total Profit], [Total Revenue], 0)
                </code>
                <span className="text-[10px] text-slate-500 mt-1 block">Third argument 0 prevents division by zero</span>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <span className="font-bold text-slate-900 block mb-1">Total Distinct Orders</span>
                <code className="text-indigo-700 font-mono text-[11px] block">
                  Total Orders = DISTINCTCOUNT(Fact_Sales[Order_ID])
                </code>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <span className="font-bold text-slate-900 block mb-1">MoM Revenue Growth %</span>
                <code className="text-slate-800 font-mono text-[11px] block">
                  Revenue MoM % = VAR Cur = [Total Revenue] VAR Prev = CALCULATE([Total Revenue], DATEADD(Dim_Calendar[Date], -1, MONTH)) RETURN DIVIDE(Cur - Prev, Prev, BLANK())
                </code>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="font-bold text-blue-900 text-xs block mb-1">Calculated Column vs Measure (Interview Classic)</span>
              <p className="text-slate-600 text-[11px]">
                A <strong>calculated column</strong> is computed row-by-row during data refresh and stored in RAM. A <strong>measure</strong> is evaluated dynamically at query time in response to filter context and consumes zero storage RAM. Always prefer measures for aggregations!
              </p>
            </div>
          </div>
        )}

        {/* PHASE 5 CONTENT */}
        {activePhase === 5 && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h4 className="font-bold text-sm text-slate-900">Dashboard Layout & Visual Hierarchy</h4>
            <p>
              In Power BI Desktop, format canvas settings to <strong>16:9 widescreen</strong> (1920x1080).
            </p>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <span><strong>Row 1: Header & Slicer Bar</strong> (Date Slider, Region, Category, Segment)</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">Top Bar</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <span><strong>Row 2: KPI Callout Cards</strong> (Revenue, Profit, Margin %, Distinct Orders, Units, AOV)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">KPI Cards</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <span><strong>Row 3: Monthly Time-Intelligence Trend</strong> (Area + Profit Line Chart)</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">Trend Visual</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <span><strong>Row 4: Sub-Category Profit Matrix & Regional Breakdown</strong></span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Decomposition</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600">
              Apply the custom JSON theme from <code className="text-blue-700 font-mono">dashboard/power_bi_theme.json</code> via <strong>View &rarr; Themes &rarr; Browse for themes</strong>.
            </p>
          </div>
        )}

        {/* PHASE 6 CONTENT */}
        {activePhase === 6 && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h4 className="font-bold text-sm text-slate-900">Independent SQL Reconciliation & Findings</h4>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-2 px-3">Metric</th>
                    <th className="py-2 px-3">Power BI DAX Value</th>
                    <th className="py-2 px-3">SQL Audit Query</th>
                    <th className="py-2 px-3 text-center">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="py-1.5 px-3 font-medium">Total Net Revenue</td>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-900">$2,233,854.31</td>
                    <td className="py-1.5 px-3 font-mono text-slate-600">$2,233,854.31</td>
                    <td className="py-1.5 px-3 text-center text-emerald-600 font-bold">$0.00 (0%)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-medium">Total Net Profit</td>
                    <td className="py-1.5 px-3 font-mono font-bold text-emerald-600">$398,325.74</td>
                    <td className="py-1.5 px-3 font-mono text-slate-600">$398,325.74</td>
                    <td className="py-1.5 px-3 text-center text-emerald-600 font-bold">$0.00 (0%)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-medium">Distinct Customer Orders</td>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-900">750 Orders</td>
                    <td className="py-1.5 px-3 font-mono text-slate-600">750 Orders</td>
                    <td className="py-1.5 px-3 text-center text-emerald-600 font-bold">0 (0%)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
              <strong className="block mb-1">Headline Finding: Unprofitable "Tables" Discounting</strong>
              <p className="text-[11px] text-rose-800">
                While Copiers generated <strong>+$266,369</strong> profit, Tables generated <strong>-$104,172</strong> in losses because average discounts exceeded 30%, which wiped out the base 5% product margin. Restricting table discounts to 12% protects over $100K in margin!
              </p>
            </div>
          </div>
        )}

        {/* PHASE 7 CONTENT */}
        {activePhase === 7 && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h4 className="font-bold text-sm text-slate-900">GitHub Portfolio & Career Presentation</h4>
            <p>
              Hiring managers evaluate whether your GitHub repository looks like a senior engineer or an amateur tutorial follower.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <span className="font-bold text-slate-900 block mb-1">What to Push to GitHub</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li>`Sales-Performance-Analytics/README.md` (Executive summary & badges)</li>
                  <li>`data/` (CSV datasets: fact & dimensions)</li>
                  <li>`sql/` (5 complete SQL query scripts)</li>
                  <li>`docs/` (Data profile, DAX library, Star Schema diagram)</li>
                  <li>`dashboard/` (`.pbids` connection file & theme)</li>
                </ul>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <span className="font-bold text-slate-900 block mb-1">Resume Bullet Points</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  <em>"Engineered interactive Power BI Sales Dashboard modeling 1,400+ transaction line items using Kimball Star Schema; authored 15+ DAX measures evaluating MoM growth; executed SQL audit achieving $0.00 variance and identified $104K profit recovery opportunity."</em>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Phase Navigation Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActivePhase(p => Math.max(1, p - 1))}
            disabled={activePhase === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &larr; Previous Phase
          </button>
          <span className="text-slate-400">Phase {activePhase} of 7</span>
          <button
            onClick={() => setActivePhase(p => Math.min(7, p + 1))}
            disabled={activePhase === 7}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next Phase</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
