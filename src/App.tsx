/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import datasetJson from './data/dataset.json';
import { SalesRecord } from './types/analytics';
import { PowerBIDashboardCanvas } from './components/PowerBIDashboardCanvas';
import { PowerBIMentorGuide } from './components/PowerBIMentorGuide';
import { DaxLab } from './components/DaxLab';
import { SqlValidator } from './components/SqlValidator';
import { InterviewMasterclass } from './components/InterviewMasterclass';
import { ProjectFilesExplorer } from './components/ProjectFilesExplorer';
import { 
  BarChart3, 
  BookOpen, 
  Calculator, 
  Database, 
  Award, 
  FolderGit2, 
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'guide' | 'dax' | 'sql' | 'interview' | 'files'>('canvas');
  const records = datasetJson.records as SalesRecord[];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* Top Application Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs tracking-tighter">
              PBI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-white">
                  Sales Performance Analytics — Power BI Desktop
                </h1>
                <span className="hidden sm:inline-block text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-medium">
                  Portfolio Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Data Analyst & Data Science Trainee Mentorship Hub · Basavaraj Agali
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              .PBIX File Ready
            </span>
            <div className="text-slate-600">|</div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Synthetic (Seed 42)</span>
            </div>
            <div className="text-slate-600">|</div>
            <div className="text-slate-300">
              <span>Avg Disc: </span>
              <strong className="text-amber-300">8.64%</strong>
            </div>
            <div className="text-slate-600">|</div>
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DAX = SQL ($0.00 delta)</span>
            </div>
          </div>

        </div>

        {/* Global Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto text-xs border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 py-2.5 px-3.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'canvas'
                ? 'border-amber-400 text-amber-300 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Power BI Canvas Simulation</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 py-2.5 px-3.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-blue-400 text-blue-300 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Step-by-Step Mentor Guide (Phases 1-7)</span>
          </button>

          <button
            onClick={() => setActiveTab('dax')}
            className={`flex items-center gap-2 py-2.5 px-3.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dax'
                ? 'border-purple-400 text-purple-300 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-purple-400" />
            <span>DAX Formula Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 py-2.5 px-3.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-emerald-400 text-emerald-300 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQL Validation Suite</span>
          </button>

          <button
            onClick={() => setActiveTab('interview')}
            className={`flex items-center gap-2 py-2.5 px-3.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'interview'
                ? 'border-rose-400 text-rose-300 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-rose-400" />
            <span>Interview Defense Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 py-2.5 px-3.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'files'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Project Workspace Files</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 print:max-w-none print:p-0 print:m-0 print:w-full">
        {activeTab === 'canvas' && <PowerBIDashboardCanvas records={records} />}
        {activeTab === 'guide' && <PowerBIMentorGuide />}
        {activeTab === 'dax' && <DaxLab records={records} />}
        {activeTab === 'sql' && <SqlValidator records={records} />}
        {activeTab === 'interview' && <InterviewMasterclass />}
        {activeTab === 'files' && <ProjectFilesExplorer records={records} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 py-4 px-6 text-xs mt-auto no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Sales Performance Analytics Project · Microsoft Power BI Desktop & DAX Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Star Schema (Kimball)</span>
            <span>·</span>
            <span>Power Query M</span>
            <span>·</span>
            <span>SQL Reconciled</span>
            <span>·</span>
            <span>Zero Hallucinated Numbers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
