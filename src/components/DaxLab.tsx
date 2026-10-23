import React, { useState } from 'react';
import { Calculator, Copy, Check, Info, ArrowRight, Code, Layers } from 'lucide-react';
import { SalesRecord } from '../types/analytics';

interface Props {
  records: SalesRecord[];
}

export const DaxLab: React.FC<Props> = ({ records }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMeasure, setSelectedMeasure] = useState<string>('Total Revenue');

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const measures = [
    {
      name: 'Total Revenue',
      category: 'Aggregation',
      format: 'Currency ($#,##0.00)',
      dax: `Total Revenue = SUM(Fact_Sales[Sales])`,
      explanation: 'Evaluates the monetary sales sum over the active filter context. Uses VertiPaq optimized column scan.'
    },
    {
      name: 'Total Profit',
      category: 'Aggregation',
      format: 'Currency ($#,##0.00)',
      dax: `Total Profit = SUM(Fact_Sales[Profit])`,
      explanation: 'Aggregates net profit. In our dataset, when discounts exceed 20%, profit can be negative for certain items like Tables.'
    },
    {
      name: 'Profit Margin %',
      category: 'Ratio / Protection',
      format: 'Percentage (0.0%)',
      dax: `Profit Margin % = \nDIVIDE(\n    [Total Profit], \n    [Total Revenue], \n    0\n)`,
      explanation: 'Uses DIVIDE() instead of "/" to prevent NaN/Infinity when Revenue is 0. 3rd parameter returns 0 as a safe fallback.'
    },
    {
      name: 'Total Orders',
      category: 'Distinct Count',
      format: 'Integer (#,##0)',
      dax: `Total Orders = DISTINCTCOUNT(Fact_Sales[Order_ID])`,
      explanation: 'Crucial distinction! Multi-line orders mean COUNTROWS would return 1,445 lines. DISTINCTCOUNT correctly evaluates 750 orders.'
    },
    {
      name: 'Average Order Value (AOV)',
      category: 'Ratio',
      format: 'Currency ($#,##0.00)',
      dax: `Average Order Value = \nDIVIDE(\n    [Total Revenue], \n    [Total Orders], \n    0\n)`,
      explanation: 'Evaluates revenue per distinct customer transaction basket.'
    },
    {
      name: 'Revenue Previous Month (PM)',
      category: 'Time Intelligence',
      format: 'Currency ($#,##0.00)',
      dax: `Revenue PM = \nCALCULATE(\n    [Total Revenue],\n    DATEADD(Dim_Calendar[Date], -1, MONTH)\n)`,
      explanation: 'CALCULATE modifies the filter context by shifting the active date set 1 month back using the continuous Dim_Calendar table.'
    },
    {
      name: 'Revenue MoM Growth %',
      category: 'Time Intelligence',
      format: 'Percentage (+0.0%;-0.0%;0.0%)',
      dax: `Revenue MoM Growth % = \nVAR CurrentRev = [Total Revenue]\nVAR PrevRev = [Revenue PM]\nRETURN\nDIVIDE(CurrentRev - PrevRev, PrevRev, BLANK())`,
      explanation: 'Uses DAX Variables (VAR ... RETURN) for clarity and CPU optimization (evaluates [Revenue PM] once instead of multiple times).'
    },
    {
      name: 'Revenue Previous Year (PY)',
      category: 'Time Intelligence',
      format: 'Currency ($#,##0.00)',
      dax: `Revenue PY = \nCALCULATE(\n    [Total Revenue],\n    SAMEPERIODLASTYEAR(Dim_Calendar[Date])\n)`,
      explanation: 'Evaluates sales for the identical dates exactly 1 year prior.'
    }
  ];

  const activeMeasureObj = measures.find(m => m.name === selectedMeasure) || measures[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">DAX Measures & Context Transition Studio</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Explore the exact DAX measures used in the Power BI dashboard, learn the mechanics of CALCULATE, and master interview explanations.
            </p>
          </div>
        </div>

        {/* Measure Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3 mb-4 text-xs">
          {measures.map((m) => (
            <button
              key={m.name}
              onClick={() => setSelectedMeasure(m.name)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedMeasure === m.name 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Active Measure Detailed Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* DAX Code Block */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800">DAX Formula Expression:</span>
              <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">
                {activeMeasureObj.category}
              </span>
            </div>

            <div className="relative bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <button
                onClick={() => copyCode(activeMeasureObj.dax, activeMeasureObj.name)}
                className="absolute top-2 right-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] transition-colors"
              >
                {copiedId === activeMeasureObj.name ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedId === activeMeasureObj.name ? 'Copied' : 'Copy DAX'}
              </button>
              <pre className="text-emerald-400 leading-relaxed">
                {activeMeasureObj.dax}
              </pre>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block mb-1">Architectural Explanation:</span>
              <p className="leading-relaxed">{activeMeasureObj.explanation}</p>
            </div>
          </div>

          {/* Theoretical Breakdown Card */}
          <div className="space-y-3">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
              <span className="font-bold text-blue-900 block">Interview Quick-Reference:</span>
              <div>
                <span className="text-[11px] text-blue-700 font-semibold block">Format String:</span>
                <code className="text-blue-900 font-mono text-xs">{activeMeasureObj.format}</code>
              </div>
              <div>
                <span className="text-[11px] text-blue-700 font-semibold block">Evaluation Context:</span>
                <span className="text-slate-700 text-xs">Filter Context (Dynamic on visual axes)</span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
              <strong className="text-amber-900 block mb-1">Recruiter Pro-Tip:</strong>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Always explain that in Power BI, you created a dedicated disconnected table called <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">_Measures</code> to house all business metrics so they are neatly organized at the top of the field list.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Calculated Column vs Measure Masterclass Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <span>Calculated Columns vs. Measures — Interview Comparison Table</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          This is the #1 most frequently asked question in Power BI fresher and trainee interviews.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Criteria</th>
                <th className="py-2.5 px-3 text-purple-700">Calculated Column</th>
                <th className="py-2.5 px-3 text-blue-700">DAX Measure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Evaluation Context</td>
                <td className="py-2 px-3">Evaluated in <strong>Row Context</strong> (iterates row-by-row)</td>
                <td className="py-2 px-3">Evaluated in <strong>Filter Context</strong> (slicers & visual cells)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">RAM / Memory Footprint</td>
                <td className="py-2 px-3 text-rose-700 font-medium">Consumes permanent memory in VertiPaq RAM</td>
                <td className="py-2 px-3 text-emerald-700 font-medium">Consumes 0 RAM; computed dynamically in CPU</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">When Evaluated</td>
                <td className="py-2 px-3">At dataset <strong>Refresh time</strong></td>
                <td className="py-2 px-3">At <strong>Query / Render time</strong> when user interacts</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Primary Purpose</td>
                <td className="py-2 px-3">To use as a <strong>Slicer, Category Axis, or Relationship Key</strong></td>
                <td className="py-2 px-3">For all <strong>Numeric Aggregations & KPIs</strong> (SUM, AVG, DIVIDE)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Golden Practice</td>
                <td className="py-2 px-3">Avoid unless structurally necessary for slicing</td>
                <td className="py-2 px-3 text-emerald-800 font-semibold">Always prefer measures for business KPIs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
