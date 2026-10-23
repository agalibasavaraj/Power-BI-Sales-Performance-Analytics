import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle, Award, Target, MessageSquare } from 'lucide-react';

export const InterviewMasterclass: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'modeling' | 'dax' | 'insights'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const questions = [
    {
      id: 1,
      category: 'modeling',
      role: 'Core Data Modeling',
      question: 'Why did you design a Star Schema instead of using a single flat denormalized table in Power BI?',
      shortAnswer: 'VertiPaq column compression, eliminating relationship ambiguity, and maintaining clean 1-to-many filter flow.',
      detailedAnswer: `In a single flat table, repetitive high-cardinality strings (Customer Names, Product Descriptions, States) duplicate across all 1,445 rows, causing substantial memory bloat in VertiPaq RAM.
By implementing a Kimball Star Schema with Fact_Sales and 4 Dimension tables (Dim_Calendar, Dim_Product, Dim_Customer, Dim_Geography):
1. VertiPaq applies optimal dictionary compression and Run-Length Encoding (RLE).
2. DAX formulas are simplified because filters propagate predictably from 1 (Dimension) to * (Fact).
3. It eliminates bi-directional filter ambiguities and performance hits on large-scale models.`
    },
    {
      id: 2,
      category: 'dax',
      role: 'DAX Mechanics',
      question: 'What is the exact technical difference between a Calculated Column and a Measure?',
      shortAnswer: 'Calculated columns are computed during data refresh and stored in RAM (Row Context); measures are calculated on-the-fly at visual query time in Filter Context.',
      detailedAnswer: `1. Storage: Calculated columns consume RAM space in the data model. Measures consume ZERO model storage.
2. Timing: Calculated columns are computed once during data refresh. Measures are computed dynamically whenever a visual renders or a slicer moves.
3. Context: Calculated columns operate in Row Context. Measures operate in Filter Context.
4. Golden Rule: Always use measures for aggregations, ratios, and KPIs. Only use calculated columns when a field is required as a Slicer or Category Axis.`
    },
    {
      id: 3,
      category: 'dax',
      role: 'DAX Granularity Trap',
      question: 'Why did you use DISTINCTCOUNT(Fact_Sales[Order_ID]) instead of COUNTROWS(Fact_Sales) for Total Orders?',
      shortAnswer: 'Fact_Sales is at the order line-item grain. Multiple rows belong to the same Order ID.',
      detailedAnswer: `Because one customer order often contains multiple line items (e.g. purchasing a phone, a case, and paper in one checkout). 
If I had used COUNTROWS(Fact_Sales), the visual would report 1,445 orders instead of the true 750 distinct customer orders. 
This would distort Average Order Value (AOV = Total Sales / Total Orders) by almost 50%!`
    },
    {
      id: 4,
      category: 'dax',
      role: 'Error Handling',
      question: 'Why is DIVIDE([Total Profit], [Total Revenue], 0) preferred over [Total Profit] / [Total Revenue]?',
      shortAnswer: 'Built-in division-by-zero protection prevents NaN and visual crashes.',
      detailedAnswer: `The "/" operator in DAX evaluates to NaN or Infinity if the denominator is 0 or Blank. 
In interactive reports, if an executive slices for an inactive month or unpurchased SKU, visual cards using "/" will throw an ugly error.
The DIVIDE() function provides safe division and takes a third optional argument (e.g. 0 or BLANK()) to return a graceful fallback.`
    },
    {
      id: 5,
      category: 'insights',
      role: 'Business Discovery',
      question: 'What is the most impactful commercial finding you uncovered from the data?',
      shortAnswer: 'The Tables subcategory is losing -$104,172 with -36.8% margin due to unconstrained discounting averaging 30.1%.',
      detailedAnswer: `Our category profitability audit revealed that while Copiers (+36.8% margin) and Phones (+23.4% margin) are high-earning stars, the Tables sub-category generated $282,738 in revenue but caused -$104,172 in net losses.
The root cause was aggressive sales discounting averaging 30.1% on a product line with base manufacturing margins of only ~5%. 
I recommended establishing a hard 12% discount threshold in the CRM, which would immediately recover over $100K in EBITDA.`
    },
    {
      id: 6,
      category: 'modeling',
      role: 'Time Intelligence',
      question: 'Why must you create an explicit Date Table instead of relying on Power BI’s automatic date hierarchy?',
      shortAnswer: 'Auto-date/time creates hidden bloat tables and lacks continuous sequential dates required for Time Intelligence DAX.',
      detailedAnswer: `1. Auto Date/Time generates hidden tables for every date column, bloating file size and memory.
2. Built-in DAX Time Intelligence (SAMEPERIODLASTYEAR, DATEADD, DATESYTD) requires a contiguous, unbroken date range with zero missing days.
3. An explicit Dim_Calendar allows custom sorting (e.g., Year_Month_Key so Month_Year sorts chronologically instead of alphabetically).`
    },
    {
      id: 7,
      category: 'insights',
      role: 'Data Quality & Validation',
      question: 'How do you guarantee to stakeholders that your Power BI dashboard numbers are accurate?',
      shortAnswer: 'Independent SQL reconciliation against the database with 0.00 delta verification.',
      detailedAnswer: `Before presenting any dashboard, I write and execute SQL validation scripts directly against the source database. 
I reconciled SUM(sales), SUM(profit), and COUNT(DISTINCT order_id) against my Power BI DAX measures. 
Both produced exactly $2,233,854.31 in revenue, $398,325.74 in profit, and 750 orders with a $0.00 variance.`
    }
  ];

  const filteredQuestions = activeTab === 'all' 
    ? questions 
    : questions.filter(q => q.category === activeTab);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Technical Interview Masterclass & Portfolio Defense
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curated questions asked by recruiters and senior technical interviewers for Data Analyst & BI Developer roles.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
            <Target className="w-4 h-4 text-amber-600" />
            <span>Pass Rate: Top 5% Model Answers</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3 mb-4 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('modeling')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'modeling' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Data Modeling & Schema
          </button>
          <button
            onClick={() => setActiveTab('dax')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'dax' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            DAX Engine & Context
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'insights' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Business Impact & Validation
          </button>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div 
                key={q.id}
                className="border border-slate-200 rounded-lg overflow-hidden transition-all bg-white"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full text-left p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {q.role}
                      </span>
                    </div>
                    <span className="font-semibold text-sm text-slate-900 block">
                      {q.question}
                    </span>
                    <p className="text-xs text-slate-500 font-medium">
                      <em>Quick Take:</em> {q.shortAnswer}
                    </p>
                  </div>
                  <div className="shrink-0 text-slate-400 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-700 space-y-3">
                    <div>
                      <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Senior Analyst Recommended Model Answer:</span>
                      </span>
                      <div className="bg-white p-3.5 rounded border border-slate-200 whitespace-pre-line leading-relaxed text-slate-800">
                        {q.detailedAnswer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
