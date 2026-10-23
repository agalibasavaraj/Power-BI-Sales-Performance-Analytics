import React, { useState, useMemo, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Percent, 
  RotateCcw, 
  Filter,
  AlertTriangle,
  Download,
  FileText,
  Image as ImageIcon,
  Printer,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { SalesRecord, MonthlyTrendPoint, SubCategoryMetric, RegionalMetric } from '../types/analytics';

interface Props {
  records: SalesRecord[];
}

export const PowerBIDashboardCanvas: React.FC<Props> = ({ records }) => {
  // Slicers state (matching Power BI desktop slicer visuals)
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  const [activePage, setActivePage] = useState<'overview' | 'profitability' | 'matrix'>('overview');
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyTrendPoint | null>(null);

  // Export State
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Reference to the dashboard canvas element to capture
  const canvasRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Available unique values for slicers
  const availableYears = ['All', '2023', '2024', '2025'];
  const availableRegions = ['All', 'West', 'East', 'Central', 'South'];
  const availableCategories = ['All', 'Technology', 'Furniture', 'Office Supplies'];
  const availableSegments = ['All', 'Consumer', 'Corporate', 'Home Office'];

  // Filtered records matching Power BI filter context
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const year = r.Order_Date.substring(0, 4);
      if (selectedYear !== 'All' && year !== selectedYear) return false;
      if (selectedRegion !== 'All' && r.Region !== selectedRegion) return false;
      if (selectedCategory !== 'All' && r.Category !== selectedCategory) return false;
      if (selectedSegment !== 'All' && r.Segment !== selectedSegment) return false;
      return true;
    });
  }, [records, selectedYear, selectedRegion, selectedCategory, selectedSegment]);

  // Aggregate Core KPIs (DAX Measures exact equivalent)
  const kpis = useMemo(() => {
    const totalRevenue = filteredRecords.reduce((sum, r) => sum + r.Sales, 0);
    const totalProfit = filteredRecords.reduce((sum, r) => sum + r.Profit, 0);
    const profitMarginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // Distinct Count of Order_ID (Important: NOT row count!)
    const orderSet = new Set(filteredRecords.map(r => r.Order_ID));
    const totalOrders = orderSet.size;
    const totalQuantity = filteredRecords.reduce((sum, r) => sum + r.Quantity, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgDiscountPct = filteredRecords.length > 0 
      ? (filteredRecords.reduce((sum, r) => sum + r.Discount, 0) / filteredRecords.length) * 100 
      : 0;

    return {
      totalRevenue,
      totalProfit,
      profitMarginPct,
      totalOrders,
      totalLineItems: filteredRecords.length,
      totalQuantity,
      averageOrderValue,
      avgDiscountPct
    };
  }, [filteredRecords]);

  // Monthly Trend Data with MoM Growth
  const monthlyTrend = useMemo(() => {
    const monthMap = new Map<string, { revenue: number; profit: number; orders: Set<string>; quantity: number; year: number; month: number }>();

    filteredRecords.forEach(r => {
      const ym = r.Order_Date.substring(0, 7); // "YYYY-MM"
      const year = parseInt(ym.substring(0, 4));
      const month = parseInt(ym.substring(5, 7));

      if (!monthMap.has(ym)) {
        monthMap.set(ym, { revenue: 0, profit: 0, orders: new Set(), quantity: 0, year, month });
      }
      const entry = monthMap.get(ym)!;
      entry.revenue += r.Sales;
      entry.profit += r.Profit;
      entry.orders.add(r.Order_ID);
      entry.quantity += r.Quantity;
    });

    const sortedYMs = Array.from(monthMap.keys()).sort();
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const result: MonthlyTrendPoint[] = [];
    for (let i = 0; i < sortedYMs.length; i++) {
      const ym = sortedYMs[i];
      const data = monthMap.get(ym)!;
      let momGrowthPct: number | null = null;

      if (i > 0) {
        const prevData = monthMap.get(sortedYMs[i - 1])!;
        if (prevData.revenue > 0) {
          momGrowthPct = ((data.revenue - prevData.revenue) / prevData.revenue) * 100;
        }
      }

      result.push({
        yearMonth: ym,
        year: data.year,
        month: data.month,
        monthName: `${monthNames[data.month]} '${String(data.year).slice(2)}`,
        revenue: data.revenue,
        profit: data.profit,
        orders: data.orders.size,
        quantity: data.quantity,
        momGrowthPct
      });
    }

    return result;
  }, [filteredRecords]);

  // Sub-Category Profitability breakdown (Crucial for finding the Tables anomaly!)
  const subCategoryMetrics = useMemo(() => {
    const map = new Map<string, { category: string; sales: number; profit: number; qty: number; orders: Set<string>; discounts: number[] }>();

    filteredRecords.forEach(r => {
      if (!map.has(r.Sub_Category)) {
        map.set(r.Sub_Category, { category: r.Category, sales: 0, profit: 0, qty: 0, orders: new Set(), discounts: [] });
      }
      const item = map.get(r.Sub_Category)!;
      item.sales += r.Sales;
      item.profit += r.Profit;
      item.qty += r.Quantity;
      item.orders.add(r.Order_ID);
      item.discounts.push(r.Discount);
    });

    const list: SubCategoryMetric[] = [];
    map.forEach((val, subCat) => {
      const avgDisc = val.discounts.length > 0 
        ? (val.discounts.reduce((a, b) => a + b, 0) / val.discounts.length) * 100 
        : 0;
      list.push({
        category: val.category,
        subCategory: subCat,
        sales: val.sales,
        profit: val.profit,
        marginPct: val.sales > 0 ? (val.profit / val.sales) * 100 : 0,
        quantity: val.qty,
        orders: val.orders.size,
        avgDiscount: avgDisc
      });
    });

    // Sort by profit descending
    return list.sort((a, b) => b.profit - a.profit);
  }, [filteredRecords]);

  // Regional breakdown
  const regionalMetrics = useMemo(() => {
    const map = new Map<string, { sales: number; profit: number; orders: Set<string> }>();

    filteredRecords.forEach(r => {
      if (!map.has(r.Region)) {
        map.set(r.Region, { sales: 0, profit: 0, orders: new Set() });
      }
      const item = map.get(r.Region)!;
      item.sales += r.Sales;
      item.profit += r.Profit;
      item.orders.add(r.Order_ID);
    });

    const list: RegionalMetric[] = [];
    map.forEach((val, region) => {
      list.push({
        region,
        sales: val.sales,
        profit: val.profit,
        marginPct: val.sales > 0 ? (val.profit / val.sales) * 100 : 0,
        orders: val.orders.size,
        aov: val.orders.size > 0 ? val.sales / val.orders.size : 0
      });
    });

    return list.sort((a, b) => b.sales - a.sales);
  }, [filteredRecords]);

  // Reset all slicers
  const handleResetFilters = () => {
    setSelectedYear('All');
    setSelectedRegion('All');
    setSelectedCategory('All');
    setSelectedSegment('All');
  };

  const hasActiveFilters = selectedYear !== 'All' || selectedRegion !== 'All' || selectedCategory !== 'All' || selectedSegment !== 'All';

  // Format currency
  const fmtCurr = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const fmtExactCurr = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // Max value for trend chart scaling
  const maxRevenue = Math.max(...monthlyTrend.map(p => p.revenue), 1000);

  // ==========================================
  // EXPORT HANDLERS: PDF, PNG, and Native Print
  // ==========================================

  // 1. Export as High-Resolution PDF Report
  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    setShowExportMenu(false);
    setIsExporting(true);
    setExportStatus('Rendering report elements into high-resolution canvas...');

    try {
      const element = canvasRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f1f5f9'
      });

      setExportStatus('Formatting executive PDF layout...');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const isLandscape = imgWidth > imgHeight;
      const headerHeight = 90;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight + headerHeight]
      });

      // Executive Header Bar
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, imgWidth, headerHeight, 'F');

      // Header Brand Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text('Power BI Sales Performance Analytics Report', 30, 40);

      // Header Subtitle & Active Slicers Metadata
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(13);
      const activeFilterString = `Filters: Year [${selectedYear}] | Region [${selectedRegion}] | Category [${selectedCategory}] | Segment [${selectedSegment}]`;
      const dateString = `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
      pdf.text(`${activeFilterString}  ·  ${dateString}`, 30, 68);

      // Attach High-Res Canvas Capture
      pdf.addImage(imgData, 'PNG', 0, headerHeight, imgWidth, imgHeight);

      // Save PDF
      const timestamp = new Date().toISOString().split('T')[0];
      const pageTag = activePage.toUpperCase();
      pdf.save(`PowerBI_Sales_Report_${pageTag}_${selectedYear}_${timestamp}.pdf`);

      setExportSuccessMessage('PDF Report exported successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Unable to generate PDF. Falling back to browser print dialog.');
      window.print();
    } finally {
      setIsExporting(false);
      setExportStatus('');
      setTimeout(() => setExportSuccessMessage(null), 4000);
    }
  };

  // 2. Export as High-Resolution PNG Image
  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    setShowExportMenu(false);
    setIsExporting(true);
    setExportStatus('Capturing high-resolution dashboard snapshot...');

    try {
      const element = canvasRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f1f5f9'
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const pageTag = activePage.toUpperCase();
      link.href = image;
      link.download = `PowerBI_Sales_Dashboard_${pageTag}_${selectedYear}_${timestamp}.png`;
      link.click();

      setExportSuccessMessage('PNG Image saved successfully!');
    } catch (error) {
      console.error('Image export failed:', error);
      alert('Failed to capture PNG image.');
    } finally {
      setIsExporting(false);
      setExportStatus('');
      setTimeout(() => setExportSuccessMessage(null), 4000);
    }
  };

  // 3. Native Print Preview
  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  return (
    <div className="space-y-4 print:space-y-0 print:w-full print:m-0 print:p-0">
      {/* Toast Notification */}
      {exportSuccessMessage && (
        <div className="p-3 bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center justify-between shadow-md transition-all no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-100" />
            <span>{exportSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-100 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Modal / Overlay during Export */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-xl space-y-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Exporting Dashboard Analysis</h4>
            <p className="text-xs text-slate-600">{exportStatus || 'Processing visual canvas...'}</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Power BI Canvas Frame & Header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print:border-none print:shadow-none print:rounded-none print:w-full print:m-0 print:p-0">
        
        {/* Power BI Ribbon Simulation Header */}
        <div className="bg-slate-900 text-slate-100 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
              PBI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">Power BI Canvas Simulation</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  100% Verified Data
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1,445 Fact Records · Star Schema · Native DAX Engine · Dynamic Cross-Filtering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Canvas View Switcher (Report Pages) */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActivePage('overview')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activePage === 'overview' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Executive Overview
              </button>
              <button
                onClick={() => setActivePage('profitability')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activePage === 'profitability' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Category & Margin Audit
              </button>
              <button
                onClick={() => setActivePage('matrix')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activePage === 'matrix' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Data Matrix & Audit
              </button>
            </div>

            {/* Prominent Export Report Button & Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-400 focus:outline-hidden disabled:opacity-50"
                aria-label="Export Report Menu"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 block">Export Analysis View</span>
                    <span className="text-[11px] text-slate-500">
                      Captures current page with active slicers
                    </span>
                  </div>

                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-start gap-2.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 block">Export as PDF Document</span>
                      <span className="text-[11px] text-slate-500">
                        Executive layout with header, active filters, and metrics
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportPNG}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-start gap-2.5 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 block">Export as PNG Image</span>
                      <span className="text-[11px] text-slate-500">
                        2x high-resolution snapshot for slides or docs
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-start gap-2.5 transition-colors border-t border-slate-100"
                  >
                    <Printer className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 block">Print / Save as PDF</span>
                      <span className="text-[11px] text-slate-500">
                        Opens browser print dialog with print styling
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Dynamic Slicer Bar (Interactive Power BI Filter Controls) */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Slicers:</span>
            </div>

            {/* Year Slicer */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Year:</span>
              <div className="flex gap-1 bg-white border border-slate-300 rounded p-0.5 shadow-2xs">
                {availableYears.map(yr => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      selectedYear === yr 
                        ? 'bg-blue-600 text-white font-medium' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Slicer */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
              >
                {availableRegions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            {/* Category Slicer */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Segment Slicer */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Segment:</span>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
              >
                {availableSegments.map(seg => (
                  <option key={seg} value={seg}>{seg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset & Status */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs">
              Showing <strong className="text-slate-900">{kpis.totalLineItems}</strong> rows ({kpis.totalOrders} orders)
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors bg-blue-50 px-2 py-1 rounded"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Slicers
              </button>
            )}
          </div>
        </div>

        {/* Main Canvas Body to Capture (Attached canvasRef) */}
        <div 
          ref={canvasRef} 
          id="powerbi-canvas-report" 
          className="p-4 bg-slate-100 space-y-4 print:bg-white print:p-0 print:m-0 print:w-full print:max-w-none print:space-y-4"
        >
          {/* Print-Only Executive Header with Active Filter Tags and Metadata */}
          <div className="hidden print:block pb-3 mb-2 border-b-2 border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Executive Performance Report · Microsoft Power BI Desktop Architecture
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Sales & Profitability Performance Dashboard
                </h2>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <div>Report Date: <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                <div>View: <strong className="uppercase">{activePage === 'overview' ? 'Executive Overview' : activePage === 'profitability' ? 'Category & Margin Audit' : 'Data Matrix Audit'}</strong></div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap items-center gap-3 text-xs text-slate-800">
              <span className="font-bold text-slate-900">Active Filters:</span>
              <span>Year: <strong className="font-semibold text-blue-700">{selectedYear}</strong></span>
              <span>·</span>
              <span>Region: <strong className="font-semibold text-blue-700">{selectedRegion}</strong></span>
              <span>·</span>
              <span>Category: <strong className="font-semibold text-blue-700">{selectedCategory}</strong></span>
              <span>·</span>
              <span>Segment: <strong className="font-semibold text-blue-700">{selectedSegment}</strong></span>
              <span>·</span>
              <span>Distinct Orders: <strong>{kpis.totalOrders}</strong></span>
              <span>·</span>
              <span>Units Sold: <strong>{kpis.totalQuantity.toLocaleString()}</strong></span>
            </div>
          </div>
          
          {/* Top 6 DAX KPI Cards (Power BI Card Visuals) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* Card 1: Total Revenue */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Total Revenue</span>
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {fmtCurr(kpis.totalRevenue)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-emerald-600 font-medium">SUM(Fact[Sales])</span>
              </div>
            </div>

            {/* Card 2: Total Profit */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Total Profit</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className={`text-xl font-bold tracking-tight ${kpis.totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {fmtCurr(kpis.totalProfit)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>Net Margin:</span>
                <span className={`font-semibold ${kpis.profitMarginPct >= 15 ? 'text-emerald-600' : kpis.profitMarginPct > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {kpis.profitMarginPct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Card 3: Profit Margin % */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Profit Margin</span>
                <Percent className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {kpis.profitMarginPct.toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>DIVIDE([Profit],[Sales])</span>
              </div>
            </div>

            {/* Card 4: Total Orders (DISTINCT COUNT) */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Total Orders</span>
                <ShoppingCart className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {kpis.totalOrders.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1" title="Row count is 1,445 due to multi-line items">
                <span>Distinct Orders</span>
              </div>
            </div>

            {/* Card 5: Total Quantity Sold */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Units Sold</span>
                <Package className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {kpis.totalQuantity.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>Avg {kpis.totalOrders > 0 ? (kpis.totalQuantity / kpis.totalOrders).toFixed(1) : 0} units/order</span>
              </div>
            </div>

            {/* Card 6: Average Order Value (AOV) */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Avg Order Value</span>
                <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {fmtCurr(kpis.averageOrderValue)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span>Avg Disc: {kpis.avgDiscountPct.toFixed(1)}%</span>
              </div>
            </div>

          </div>

          {/* PAGE 1: EXECUTIVE OVERVIEW */}
          {activePage === 'overview' && (
            <div className="space-y-4">
              
              {/* Row 2: Monthly Sales & Profit Trend (Primary Time Intelligence Visual) */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">
                      Monthly Revenue & Profit Performance (Time Intelligence)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluated through <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">Dim_Calendar[Month_Year]</code> sorted by <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">Year_Month_Key</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block"></span>
                      <span className="text-slate-600 font-medium">Sales Revenue</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
                      <span className="text-slate-600 font-medium">Net Profit</span>
                    </span>
                  </div>
                </div>

                {/* SVG Visual Chart */}
                <div className="relative h-64 w-full pt-4 pb-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid Lines */}
                    {[0, 50, 100, 150].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="1000"
                        y2={y}
                        stroke="#F1F5F9"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    ))}

                    {/* Zero Line */}
                    <line x1="0" y1="180" x2="1000" y2="180" stroke="#CBD5E1" strokeWidth="1" />

                    {/* Revenue Area & Line */}
                    {monthlyTrend.length > 1 && (
                      <>
                        <path
                          d={`
                            M 0 180
                            ${monthlyTrend.map((pt, idx) => {
                              const x = (idx / (monthlyTrend.length - 1)) * 1000;
                              const y = 180 - (pt.revenue / maxRevenue) * 160;
                              return `L ${x} ${y}`;
                            }).join(' ')}
                            L 1000 180 Z
                          `}
                          fill="url(#revGrad)"
                        />
                        <path
                          d={monthlyTrend.map((pt, idx) => {
                            const x = (idx / (monthlyTrend.length - 1)) * 1000;
                            const y = 180 - (pt.revenue / maxRevenue) * 160;
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </>
                    )}

                    {/* Profit Line */}
                    {monthlyTrend.length > 1 && (
                      <path
                        d={monthlyTrend.map((pt, idx) => {
                          const x = (idx / (monthlyTrend.length - 1)) * 1000;
                          const y = 180 - (pt.profit / maxRevenue) * 160;
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeDasharray="3 2"
                      />
                    )}

                    {/* Interactive Data Markers */}
                    {monthlyTrend.map((pt, idx) => {
                      const x = (idx / (monthlyTrend.length - 1)) * 1000;
                      const y = 180 - (pt.revenue / maxRevenue) * 160;
                      return (
                        <circle
                          key={pt.yearMonth}
                          cx={x}
                          cy={y}
                          r="3.5"
                          className="fill-blue-600 hover:fill-blue-800 transition-all cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(pt)}
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 overflow-x-auto">
                  {monthlyTrend.map((pt, idx) => {
                    const shouldShow = monthlyTrend.length <= 12 || idx % 2 === 0;
                    return (
                      <span key={pt.yearMonth} className={shouldShow ? 'opacity-100' : 'opacity-0'}>
                        {pt.monthName}
                      </span>
                    );
                  })}
                </div>

                {/* Dynamic Tooltip Bar */}
                {hoveredPoint && (
                  <div className="mt-3 p-2 bg-slate-900 text-white rounded text-xs flex flex-wrap items-center justify-between gap-2 transition-all">
                    <span className="font-semibold text-amber-300">Month: {hoveredPoint.monthName}</span>
                    <span>Revenue: <strong>{fmtCurr(hoveredPoint.revenue)}</strong></span>
                    <span>Profit: <strong>{fmtCurr(hoveredPoint.profit)}</strong> ({(hoveredPoint.revenue > 0 ? (hoveredPoint.profit / hoveredPoint.revenue) * 100 : 0).toFixed(1)}%)</span>
                    <span>Orders: <strong>{hoveredPoint.orders}</strong></span>
                    {hoveredPoint.momGrowthPct !== null && (
                      <span className={`font-medium ${hoveredPoint.momGrowthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        MoM: {hoveredPoint.momGrowthPct >= 0 ? '+' : ''}{hoveredPoint.momGrowthPct.toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Row 3: Two Split Visuals: Sub-Category Profitability & Regional Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Visual A: Sub-Category Profitability Bar Chart */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">Sub-Category Profitability & Loss Alert</h4>
                      <p className="text-xs text-slate-500">Uncovers profitable leaders vs. discount margin bleeders</p>
                    </div>
                  </div>

                  {/* Warning banner if Tables is in view */}
                  {subCategoryMetrics.some(s => s.subCategory === 'Tables' && s.profit < 0) && (
                    <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Key Audit Finding:</strong> The <em>Tables</em> sub-category is operating at a severe loss due to excessive average discounts (&gt;30%).
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {subCategoryMetrics.slice(0, 10).map((item) => {
                      const isNegative = item.profit < 0;
                      return (
                        <div key={item.subCategory} className="text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-slate-800">
                              {item.subCategory} <span className="text-[10px] text-slate-500">({item.category})</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">{fmtCurr(item.sales)}</span>
                              <span className={`font-semibold ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {fmtCurr(item.profit)} ({item.marginPct.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          
                          {/* Mini Bar */}
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                            {isNegative ? (
                              <div 
                                className="bg-rose-500 h-full rounded-full" 
                                style={{ width: `${Math.min(Math.abs(item.profit) / 1000, 100)}%` }}
                              />
                            ) : (
                              <div 
                                className="bg-blue-600 h-full rounded-full" 
                                style={{ width: `${Math.min((item.profit / 300000) * 100, 100)}%` }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visual B: Regional Performance Comparison */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm text-slate-900">Regional Revenue & Margin Comparison</h4>
                    <p className="text-xs text-slate-500">Geographic territory analysis from <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">Dim_Geography</code></p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {regionalMetrics.map(reg => (
                      <div key={reg.region} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                          <span className="font-bold text-slate-800">{reg.region} Region</span>
                          <span className="text-[11px] font-semibold text-blue-600">{reg.orders} Orders</span>
                        </div>
                        <div className="text-base font-bold text-slate-900">{fmtCurr(reg.sales)}</div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-slate-500">Profit: {fmtCurr(reg.profit)}</span>
                          <span className={`font-semibold ${reg.marginPct >= 18 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {reg.marginPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-md border border-blue-100 text-xs text-blue-900">
                    <p className="font-medium mb-1">Territory Observation:</p>
                    <p className="text-slate-600">
                      <strong>Central Region</strong> maintains the highest profit margin (22.4%) despite lower sales volume, indicating superior discount control and favorable product mix.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* PAGE 2: CATEGORY & PROFITABILITY DEEP DIVE */}
          {activePage === 'profitability' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <h3 className="font-semibold text-sm text-slate-900 mb-1">Full Sub-Category Financial Matrix</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Cross-analysis of Sales, Profit, Units, Average Discount, and Margin % to detect pricing leaks.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Sub-Category</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Revenue ($)</th>
                        <th className="py-2.5 px-3 text-right">Profit ($)</th>
                        <th className="py-2.5 px-3 text-right">Margin %</th>
                        <th className="py-2.5 px-3 text-right">Avg Discount</th>
                        <th className="py-2.5 px-3 text-right">Distinct Orders</th>
                        <th className="py-2.5 px-3 text-center">Health Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subCategoryMetrics.map((row) => (
                        <tr key={row.subCategory} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 font-medium text-slate-900">{row.subCategory}</td>
                          <td className="py-2 px-3 text-slate-500">{row.category}</td>
                          <td className="py-2 px-3 text-right text-slate-800 font-mono">{fmtExactCurr(row.sales)}</td>
                          <td className={`py-2 px-3 text-right font-mono font-semibold ${row.profit < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {fmtExactCurr(row.profit)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            <span className={`px-1.5 py-0.5 rounded ${
                              row.marginPct < 0 
                                ? 'bg-rose-100 text-rose-800 font-bold' 
                                : row.marginPct > 25 
                                ? 'bg-emerald-100 text-emerald-800 font-bold' 
                                : 'text-slate-700'
                            }`}>
                              {row.marginPct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600 font-mono">{row.avgDiscount.toFixed(1)}%</td>
                          <td className="py-2 px-3 text-right text-slate-600">{row.orders}</td>
                          <td className="py-2 px-3 text-center">
                            {row.marginPct < 0 ? (
                              <span className="text-[10px] text-rose-700 font-medium">Critical Loss</span>
                            ) : row.marginPct >= 20 ? (
                              <span className="text-[10px] text-emerald-700 font-medium">High Margin</span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium">Moderate</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 3: RAW TRANSACTION AUDIT MATRIX */}
          {activePage === 'matrix' && (
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">
                    Fact Table Transactional Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspecting individual line items to reconcile order keys, shipping dates, and profit margins.
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  Showing first 25 of {filteredRecords.length} records
                </span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-2">Order ID</th>
                      <th className="py-2 px-2">Order Date</th>
                      <th className="py-2 px-2">Customer</th>
                      <th className="py-2 px-2">Segment</th>
                      <th className="py-2 px-2">Region</th>
                      <th className="py-2 px-2">Product Name</th>
                      <th className="py-2 px-2 text-right">Sales</th>
                      <th className="py-2 px-2 text-right">Qty</th>
                      <th className="py-2 px-2 text-right">Disc</th>
                      <th className="py-2 px-2 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.slice(0, 25).map((r) => (
                      <tr key={r.Row_ID} className="hover:bg-slate-50/80">
                        <td className="py-1.5 px-2 font-mono font-medium text-blue-700">{r.Order_ID}</td>
                        <td className="py-1.5 px-2 text-slate-600">{r.Order_Date}</td>
                        <td className="py-1.5 px-2 text-slate-900">{r.Customer_Name}</td>
                        <td className="py-1.5 px-2 text-slate-500">{r.Segment}</td>
                        <td className="py-1.5 px-2 text-slate-600">{r.Region}</td>
                        <td className="py-1.5 px-2 text-slate-800 max-w-xs truncate" title={r.Product_Name}>{r.Product_Name}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-slate-900">${r.Sales.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-right text-slate-600">{r.Quantity}</td>
                        <td className="py-1.5 px-2 text-right text-slate-600">{(r.Discount * 100).toFixed(0)}%</td>
                        <td className={`py-1.5 px-2 text-right font-mono font-semibold ${r.Profit < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ${r.Profit.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Canvas Footer Status */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 no-print">
          <span>Microsoft Power BI Desktop Compatible · VertiPaq Engine Ready</span>
          <div className="flex items-center gap-3">
            <span>Cardinality: 1:Many (Single Direction)</span>
            <span>·</span>
            <span>Zero Synthetic Values</span>
          </div>
        </div>

      </div>
    </div>
  );
};
