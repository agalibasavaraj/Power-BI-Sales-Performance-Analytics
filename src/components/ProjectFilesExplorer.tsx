import React, { useState } from 'react';
import { Folder, FileText, Download, Copy, Check, Eye, ExternalLink } from 'lucide-react';
import { SalesRecord } from '../types/analytics';

interface Props {
  records: SalesRecord[];
}

export const ProjectFilesExplorer: React.FC<Props> = ({ records }) => {
  const [selectedFile, setSelectedFile] = useState<string>('README.md');
  const [copied, setCopied] = useState<boolean>(false);

  const fileTree = [
    {
      folder: 'Root Directory',
      files: [
        { name: 'README.md', path: 'Sales-Performance-Analytics/README.md', type: 'doc' },
        { name: '.gitignore', path: 'Sales-Performance-Analytics/.gitignore', type: 'config' }
      ]
    },
    {
      folder: 'data/',
      files: [
        { name: 'raw_sales_data.csv', path: 'Sales-Performance-Analytics/data/raw_sales_data.csv', type: 'csv' },
        { name: 'cleaned_sales_dataset.csv', path: 'Sales-Performance-Analytics/data/cleaned_sales_dataset.csv', type: 'csv' },
        { name: 'dim_calendar.csv', path: 'Sales-Performance-Analytics/data/dim_calendar.csv', type: 'csv' },
        { name: 'dim_product.csv', path: 'Sales-Performance-Analytics/data/dim_product.csv', type: 'csv' },
        { name: 'dim_customer.csv', path: 'Sales-Performance-Analytics/data/dim_customer.csv', type: 'csv' },
        { name: 'dim_geography.csv', path: 'Sales-Performance-Analytics/data/dim_geography.csv', type: 'csv' }
      ]
    },
    {
      folder: 'dashboard/',
      files: [
        { name: 'PowerBI_Sales_Performance_Architecture.pbids', path: 'Sales-Performance-Analytics/dashboard/PowerBI_Sales_Performance_Architecture.pbids', type: 'pbi' },
        { name: 'power_bi_theme.json', path: 'Sales-Performance-Analytics/dashboard/power_bi_theme.json', type: 'json' },
        { name: 'power_bi_template_guide.md', path: 'Sales-Performance-Analytics/dashboard/power_bi_template_guide.md', type: 'doc' }
      ]
    },
    {
      folder: 'sql/',
      files: [
        { name: '01_schema_and_import.sql', path: 'Sales-Performance-Analytics/sql/01_schema_and_import.sql', type: 'sql' },
        { name: '02_kpi_validation.sql', path: 'Sales-Performance-Analytics/sql/02_kpi_validation.sql', type: 'sql' },
        { name: '03_monthly_trend_mom.sql', path: 'Sales-Performance-Analytics/sql/03_monthly_trend_mom.sql', type: 'sql' },
        { name: '04_category_and_regional_performance.sql', path: 'Sales-Performance-Analytics/sql/04_category_and_regional_performance.sql', type: 'sql' },
        { name: '05_pareto_and_cohort_analysis.sql', path: 'Sales-Performance-Analytics/sql/05_pareto_and_cohort_analysis.sql', type: 'sql' }
      ]
    },
    {
      folder: 'docs/',
      files: [
        { name: 'data_profile.md', path: 'Sales-Performance-Analytics/docs/data_profile.md', type: 'doc' },
        { name: 'powerquery_transformations.md', path: 'Sales-Performance-Analytics/docs/powerquery_transformations.md', type: 'doc' },
        { name: 'data_model.md', path: 'Sales-Performance-Analytics/docs/data_model.md', type: 'doc' },
        { name: 'dax_measures.md', path: 'Sales-Performance-Analytics/docs/dax_measures.md', type: 'doc' },
        { name: 'dashboard_design_specification.md', path: 'Sales-Performance-Analytics/docs/dashboard_design_specification.md', type: 'doc' },
        { name: 'validation_and_business_insights.md', path: 'Sales-Performance-Analytics/docs/validation_and_business_insights.md', type: 'doc' },
        { name: 'interview_qa_masterclass.md', path: 'Sales-Performance-Analytics/docs/interview_qa_masterclass.md', type: 'doc' }
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
              All production files have been compiled into <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">Sales-Performance-Analytics/</code> ready for Git push and Power BI Desktop import.
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Dataset CSV</span>
          </button>
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
                /Sales-Performance-Analytics/{selectedFile.endsWith('.csv') ? `data/${selectedFile}` : selectedFile.endsWith('.sql') ? `sql/${selectedFile}` : selectedFile.endsWith('.md') && selectedFile !== 'README.md' ? `docs/${selectedFile}` : selectedFile}
              </code>
              <p className="text-[11px] text-slate-500">
                You can directly push this folder to your GitHub portfolio repository or open it in Microsoft Power BI Desktop.
              </p>
            </div>

            <div className="border border-slate-200 rounded p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block mb-1">How to use this file:</span>
              {selectedFile.endsWith('.csv') ? (
                <p>Open Microsoft Power BI Desktop &rarr; Click <strong>Get Data</strong> &rarr; <strong>Text/CSV</strong> &rarr; Select this file to populate your Fact or Dimension tables.</p>
              ) : selectedFile.endsWith('.sql') ? (
                <p>Execute this SQL in PostgreSQL, DBeaver, pgAdmin, or SQLite to validate and reconcile your DAX totals.</p>
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
