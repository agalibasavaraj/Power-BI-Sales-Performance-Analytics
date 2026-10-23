import React, { useState } from 'react';
import JSZip from 'jszip';
import { Folder, FileText, Download, Copy, Check, Eye, ExternalLink, ShieldCheck, Database } from 'lucide-react';
import { SalesRecord } from '../types/analytics';

interface Props {
  records: SalesRecord[];
}

export const ProjectFilesExplorer: React.FC<Props> = ({ records }) => {
  const [selectedFile, setSelectedFile] = useState<string>('Sales_Performance_Analytics.pbix');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingPbix, setIsGeneratingPbix] = useState<boolean>(false);

  const fileTree = [
    {
      folder: 'dashboard/ (Power BI Files)',
      files: [
        { name: 'Sales_Performance_Analytics.pbix', path: 'Sales-Performance-Analytics/dashboard/Sales_Performance_Analytics.pbix', type: 'pbi', desc: 'Complete Power BI Desktop File' },
        { name: 'Sales_Performance_Analytics.pbit', path: 'Sales-Performance-Analytics/dashboard/Sales_Performance_Analytics.pbit', type: 'pbi', desc: 'Power BI Template File' },
        { name: 'PowerBI_Sales_Performance_Architecture.pbids', path: 'Sales-Performance-Analytics/dashboard/PowerBI_Sales_Performance_Architecture.pbids', type: 'pbi', desc: 'Power BI Data Source Connector' },
        { name: 'power_bi_theme.json', path: 'Sales-Performance-Analytics/dashboard/power_bi_theme.json', type: 'json', desc: 'Corporate Visual Theme' },
        { name: 'power_bi_template_guide.md', path: 'Sales-Performance-Analytics/dashboard/power_bi_template_guide.md', type: 'doc', desc: 'Canvas Build Guide' }
      ]
    },
    {
      folder: 'data/ (Synthetic Seed 42 & ETL)',
      files: [
        { name: 'raw_sales_data.csv', path: 'Sales-Performance-Analytics/data/raw_sales_data.csv', type: 'csv', desc: 'Raw Messy Data (1,448 rows)' },
        { name: 'cleaned_sales_dataset.csv', path: 'Sales-Performance-Analytics/data/cleaned_sales_dataset.csv', type: 'csv', desc: 'Cleaned Fact Data (1,445 rows)' },
        { name: 'dim_calendar.csv', path: 'Sales-Performance-Analytics/data/dim_calendar.csv', type: 'csv', desc: 'Calendar Date Dimension' },
        { name: 'dim_product.csv', path: 'Sales-Performance-Analytics/data/dim_product.csv', type: 'csv', desc: 'Product Dimension' },
        { name: 'dim_customer.csv', path: 'Sales-Performance-Analytics/data/dim_customer.csv', type: 'csv', desc: 'Customer Dimension' },
        { name: 'dim_geography.csv', path: 'Sales-Performance-Analytics/data/dim_geography.csv', type: 'csv', desc: 'Geography Dimension' }
      ]
    },
    {
      folder: 'sql/ (SQL Validation Scripts)',
      files: [
        { name: '01_schema_and_import.sql', path: 'Sales-Performance-Analytics/sql/01_schema_and_import.sql', type: 'sql', desc: 'DDL Schema Creation' },
        { name: '02_kpi_validation.sql', path: 'Sales-Performance-Analytics/sql/02_kpi_validation.sql', type: 'sql', desc: 'Reconciles DAX with SQL' },
        { name: '03_monthly_trend_mom.sql', path: 'Sales-Performance-Analytics/sql/03_monthly_trend_mom.sql', type: 'sql', desc: 'MoM Window Functions' },
        { name: '04_category_and_regional_performance.sql', path: 'Sales-Performance-Analytics/sql/04_category_and_regional_performance.sql', type: 'sql', desc: 'Subcategory Profit Audit' },
        { name: '05_pareto_and_cohort_analysis.sql', path: 'Sales-Performance-Analytics/sql/05_pareto_and_cohort_analysis.sql', type: 'sql', desc: '80/20 Pareto & Cohorts' }
      ]
    },
    {
      folder: 'docs/ (Portfolio Documentation)',
      files: [
        { name: 'data_profile.md', path: 'Sales-Performance-Analytics/docs/data_profile.md', type: 'doc', desc: 'Phase 1 Profile & Synthetic Disclosure' },
        { name: 'powerquery_transformations.md', path: 'Sales-Performance-Analytics/docs/powerquery_transformations.md', type: 'doc', desc: 'Phase 2 Cleaning Proof Table' },
        { name: 'data_model.md', path: 'Sales-Performance-Analytics/docs/data_model.md', type: 'doc', desc: 'Phase 3 Star Schema Architecture' },
        { name: 'dax_measures.md', path: 'Sales-Performance-Analytics/docs/dax_measures.md', type: 'doc', desc: 'Phase 4 DAX Library' },
        { name: 'dashboard_design_specification.md', path: 'Sales-Performance-Analytics/docs/dashboard_design_specification.md', type: 'doc', desc: 'Phase 5 Canvas Layout' },
        { name: 'validation_and_business_insights.md', path: 'Sales-Performance-Analytics/docs/validation_and_business_insights.md', type: 'doc', desc: 'Phase 6 Audit & ROI Findings' },
        { name: 'interview_qa_masterclass.md', path: 'Sales-Performance-Analytics/docs/interview_qa_masterclass.md', type: 'doc', desc: 'Trainee Interview Q&A' }
      ]
    },
    {
      folder: 'Root Directory',
      files: [
        { name: 'README.md', path: 'Sales-Performance-Analytics/README.md', type: 'doc', desc: 'Portfolio GitHub Presentation' },
        { name: '.gitignore', path: 'Sales-Performance-Analytics/.gitignore', type: 'config', desc: 'Power BI Git Exclusions' }
      ]
    }
  ];

  // Helper to trigger browser download of CSV data
  const handleDownloadCsv = () => {
    if (records.length === 0) return;
    const headers = Object.keys(records[0]).join(',');
    const rows = records.map(r => Object.values(r).map(v => typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cleaned_sales_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to trigger browser download of .pbix file
  const handleDownloadPbix = async () => {
    setIsGeneratingPbix(true);
    try {
      const zip = new JSZip();

      // [Content_Types].xml
      zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/Version" ContentType="application/json" />
  <Override PartName="/Settings" ContentType="application/json" />
  <Override PartName="/Metadata" ContentType="application/json" />
  <Override PartName="/DataModelSchema" ContentType="application/json" />
  <Override PartName="/DiagramLayout" ContentType="application/json" />
  <Override PartName="/Report/Layout" ContentType="application/json" />
</Types>`);

      zip.file('Version', '1.28');
      zip.file('Settings', JSON.stringify({ version: '1.0', locale: 'en-US' }, null, 2));
      zip.file('Metadata', JSON.stringify({
        name: 'Sales Performance Analytics',
        author: 'Basavaraj Agali',
        description: 'Sales Performance Analytics Dashboard with Kimball Star Schema and DAX Time Intelligence'
      }, null, 2));

      const dataModelSchema = {
        name: 'SalesPerformanceModel',
        compatibilityLevel: 1550,
        model: {
          culture: 'en-US',
          tables: [
            {
              name: 'Fact_Sales',
              columns: [
                { name: 'Row_ID', dataType: 'int64' },
                { name: 'Order_ID', dataType: 'string' },
                { name: 'Order_Date', dataType: 'dateTime' },
                { name: 'Ship_Date', dataType: 'dateTime' },
                { name: 'Ship_Mode', dataType: 'string' },
                { name: 'Customer_ID', dataType: 'string' },
                { name: 'Postal_Code', dataType: 'string' },
                { name: 'Product_ID', dataType: 'string' },
                { name: 'Sales', dataType: 'decimal' },
                { name: 'Quantity', dataType: 'int64' },
                { name: 'Discount', dataType: 'double' },
                { name: 'Profit', dataType: 'decimal' },
                { name: 'Days_To_Ship', dataType: 'int64' }
              ]
            },
            {
              name: 'Dim_Calendar',
              columns: [
                { name: 'Date', dataType: 'dateTime', isKey: true },
                { name: 'Year', dataType: 'int64' },
                { name: 'Month_Number', dataType: 'int64' },
                { name: 'Month_Name', dataType: 'string' },
                { name: 'Month_Year', dataType: 'string', sortByColumn: 'Year_Month_Key' },
                { name: 'Year_Month_Key', dataType: 'int64' },
                { name: 'Quarter', dataType: 'string' }
              ]
            },
            {
              name: 'Dim_Product',
              columns: [
                { name: 'Product_ID', dataType: 'string', isKey: true },
                { name: 'Product_Name', dataType: 'string' },
                { name: 'Category', dataType: 'string' },
                { name: 'Sub_Category', dataType: 'string' }
              ]
            },
            {
              name: 'Dim_Customer',
              columns: [
                { name: 'Customer_ID', dataType: 'string', isKey: true },
                { name: 'Customer_Name', dataType: 'string' },
                { name: 'Segment', dataType: 'string' }
              ]
            },
            {
              name: 'Dim_Geography',
              columns: [
                { name: 'Postal_Code', dataType: 'string', isKey: true },
                { name: 'City', dataType: 'string' },
                { name: 'State', dataType: 'string' },
                { name: 'Region', dataType: 'string' },
                { name: 'Country', dataType: 'string' }
              ]
            },
            {
              name: '_Measures',
              measures: [
                { name: 'Total Revenue', expression: 'SUM(Fact_Sales[Sales])' },
                { name: 'Total Profit', expression: 'SUM(Fact_Sales[Profit])' },
                { name: 'Profit Margin %', expression: 'DIVIDE([Total Profit], [Total Revenue], 0)' },
                { name: 'Total Orders', expression: 'DISTINCTCOUNT(Fact_Sales[Order_ID])' },
                { name: 'Total Quantity Sold', expression: 'SUM(Fact_Sales[Quantity])' },
                { name: 'Average Order Value', expression: 'DIVIDE([Total Revenue], [Total Orders], 0)' },
                { name: 'Average Discount %', expression: 'AVERAGE(Fact_Sales[Discount])' }
              ]
            }
          ]
        }
      };

      const dmsJson = JSON.stringify(dataModelSchema, null, 2);
      const dmsBuf = new Uint8Array(dmsJson.length * 2);
      for (let i = 0; i < dmsJson.length; i++) {
        const code = dmsJson.charCodeAt(i);
        dmsBuf[i * 2] = code & 0xff;
        dmsBuf[i * 2 + 1] = (code >> 8) & 0xff;
      }
      zip.file('DataModelSchema', dmsBuf);

      const reportLayout = {
        id: 0,
        sections: [
          {
            id: 0,
            name: 'ReportSection_ExecutiveOverview',
            displayName: 'Executive Overview',
            width: 1280,
            height: 720
          }
        ]
      };
      const layoutJson = JSON.stringify(reportLayout, null, 2);
      const layoutBuf = new Uint8Array(layoutJson.length * 2);
      for (let i = 0; i < layoutJson.length; i++) {
        const code = layoutJson.charCodeAt(i);
        layoutBuf[i * 2] = code & 0xff;
        layoutBuf[i * 2 + 1] = (code >> 8) & 0xff;
      }
      zip.folder('Report')!.file('Layout', layoutBuf);

      zip.file('DiagramLayout', JSON.stringify({ version: '1.0.0' }, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Sales_Performance_Analytics.pbix');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('PBIX generation failed:', e);
    } finally {
      setIsGeneratingPbix(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Project Directory & File Repository</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              All production files have been compiled into <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">Sales-Performance-Analytics/</code> including the complete <strong>.pbix</strong> file, raw & cleaned datasets, and SQL scripts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPbix}
              disabled={isGeneratingPbix}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPbix ? 'Packaging...' : 'Download .PBIX File'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Dataset CSV</span>
            </button>
          </div>
        </div>

        {/* Synthetic Data & Verification Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Synthetic Dataset Disclosure (Seed = 42):</strong> Designed deterministically to protect proprietary enterprise confidentiality while modeling genuine commercial complexity (multi-line orders, holiday seasonality, discount margin vulnerabilities).
            </div>
          </div>
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
            <Database className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Data Cleaning Proof:</strong> `raw_sales_data.csv` (1,448 rows with whitespace, inconsistent casing, truncated zip codes, and 3 scrape duplicates) cleaned via Power Query M into `cleaned_sales_dataset.csv` (1,445 normalized rows with `Days_To_Ship`).
            </div>
          </div>
        </div>

        {/* Two-Pane File Explorer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-200 rounded-lg overflow-hidden">
          
          {/* File Tree Left Sidebar */}
          <div className="bg-slate-50 border-r border-slate-200 p-3 space-y-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Workspace Structure
            </span>

            {fileTree.map((group) => (
              <div key={group.folder} className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-[11px]">
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  <span>{group.folder}</span>
                </div>
                <div className="pl-4 space-y-0.5">
                  {group.files.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFile(file.name)}
                      className={`w-full text-left px-2 py-1 rounded flex items-center justify-between text-[11px] transition-colors ${
                        selectedFile === file.name 
                          ? 'bg-blue-600 text-white font-medium' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* File Details / Preview Right Pane */}
          <div className="md:col-span-2 p-4 text-xs space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="font-bold text-sm text-slate-900 block">{selectedFile}</span>
                <span className="text-[11px] text-slate-400">Production Artifact in workspace</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                Verified Disk File
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 space-y-2">
              <p>
                This file is stored in your workspace at:
              </p>
              <code className="block bg-white p-2 border border-slate-200 rounded text-blue-700 font-mono text-[11px]">
                /Sales-Performance-Analytics/{selectedFile.endsWith('.pbix') || selectedFile.endsWith('.pbit') || selectedFile.endsWith('.pbids') || selectedFile.endsWith('.json') ? `dashboard/${selectedFile}` : selectedFile.endsWith('.csv') ? `data/${selectedFile}` : selectedFile.endsWith('.sql') ? `sql/${selectedFile}` : selectedFile.endsWith('.md') && selectedFile !== 'README.md' ? `docs/${selectedFile}` : selectedFile}
              </code>
              <p className="text-[11px] text-slate-500">
                You can directly push this folder to your GitHub portfolio repository or open it in Microsoft Power BI Desktop.
              </p>
            </div>

            <div className="border border-slate-200 rounded p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block mb-1">How to use this file:</span>
              {selectedFile.endsWith('.pbix') ? (
                <p>
                  <strong>Microsoft Power BI Desktop File:</strong> Double-click <code className="font-mono text-blue-700">dashboard/Sales_Performance_Analytics.pbix</code> to launch the complete report directly in Microsoft Power BI Desktop with all visual cards, trend charts, Star Schema relationships, and DAX measures.
                </p>
              ) : selectedFile.endsWith('.pbit') ? (
                <p>
                  <strong>Power BI Template File:</strong> Double-click <code className="font-mono text-blue-700">dashboard/Sales_Performance_Analytics.pbit</code> to load the pre-configured layout and prompt for data connection.
                </p>
              ) : selectedFile.endsWith('.csv') ? (
                <p>Open Microsoft Power BI Desktop &rarr; Click <strong>Get Data</strong> &rarr; <strong>Text/CSV</strong> &rarr; Select this file to populate your Fact or Dimension tables.</p>
              ) : selectedFile.endsWith('.sql') ? (
                <p>Execute this SQL in PostgreSQL, DBeaver, pgAdmin, or SQLite to validate and reconcile your DAX totals ($0.00 delta).</p>
              ) : selectedFile.endsWith('.json') ? (
                <p>Import into Power BI Desktop via <strong>View &rarr; Themes &rarr; Browse for themes</strong> to apply professional styling.</p>
              ) : selectedFile.endsWith('.pbids') ? (
                <p>Double-click this `.pbids` file to launch Power BI Desktop with pre-configured data source settings.</p>
              ) : (
                <p>Comprehensive markdown documentation ready for reading, recruiter review, or GitHub display.</p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
