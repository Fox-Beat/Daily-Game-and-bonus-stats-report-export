
import React, { useState } from 'react';
import { UserConfig, ReportDefinition } from '../types';
import { calculateReportDates, formatDateForApi } from '../utils/dateHelper';
import { Download, FileDown, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  userConfig: UserConfig;
  reports: ReportDefinition[];
}

const ReportExporter: React.FC<Props> = ({ userConfig, reports }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [completed, setCompleted] = useState(false);

  const runExport = async () => {
    setIsProcessing(true);
    setCompleted(false);
    setStatus('Initializing export sequence...');

    // 1. Calculate Dates
    // We use the first report's format preference to determine the range, 
    // but effectively we want the same logical range (Yesterday or Weekend) for both.
    // We'll use 'date' format for the calculation base and format specifically per report later.
    const dateRanges = calculateReportDates('date'); 
    const activeRange = dateRanges[0]; // We typically only have one range (Yesterday OR Weekend)

    if (!activeRange) {
      setStatus('Error: Could not determine date range.');
      setIsProcessing(false);
      return;
    }

    // 2. Helper to create and submit form
    const submitReport = (report: ReportDefinition, delayMs: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setStatus(`Exporting ${report.name}...`);

          // Format dates for this specific report type
          const startStr = formatDateForApi(new Date(activeRange.startDate), report.dateFormat, false);
          const endStr = formatDateForApi(new Date(activeRange.endDate), report.dateFormat, true);

          // Construct the nested JSON date object string
          // The API expects: "daterange": "{\"startdate\":\"...\",\"enddate\":\"...\"}"
          const dateRangeInnerJson = JSON.stringify({
            startdate: startStr,
            enddate: endStr
          });

          // Get filters and inject the date string
          const filtersObj = report.getFilters(userConfig, dateRangeInnerJson);
          
          // Create Form
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = 'https://admin-cur.techonlinecorp.com/reportviewer/api/report/execute/export';
          form.target = '_blank'; // Opens in new tab/downloads in background
          form.style.display = 'none';

          // Payload
          const payload = {
            reportId: report.reportId,
            configurationCode: report.configurationCode,
            format: 'csv',
            apikey: userConfig.apiKey || '',
            filters: JSON.stringify(filtersObj),
            outputs: report.outputs,
            jsonOptions: JSON.stringify({ includeLegend: "none" })
          };

          // Append inputs
          Object.entries(payload).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(form);
          }, 1000);

          resolve();
        }, delayMs);
      });
    };

    // 3. Execution Loop
    try {
      let delayCounter = 0;
      const DELAY_STEP = 2500; // 2.5s delay between downloads to prevent blocking

      for (const report of reports) {
        await submitReport(report, delayCounter * DELAY_STEP);
        delayCounter++;
      }

      // Finalize
      setTimeout(() => {
        setStatus(`Success! Exported reports for ${activeRange.label}`);
        setIsProcessing(false);
        setCompleted(true);
      }, (reports.length * DELAY_STEP) + 500);

    } catch (error) {
      console.error(error);
      setStatus('Error during export sequence.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      
      <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg text-indigo-200 text-sm max-w-lg w-full text-left">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-indigo-400 shrink-0 mt-0.5" size={18} />
          <div>
             <p className="font-semibold text-indigo-100 mb-1">Browser Requirement</p>
             <p className="text-indigo-200/80 mb-2">
               Because this tool downloads multiple files at once, your browser may block the second download.
             </p>
             <p className="text-indigo-200/80">
               Please look for a <strong>"Pop-up blocked"</strong> icon in your address bar and select <strong>"Always allow"</strong> for this site.
             </p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl shadow-black/40 w-full max-w-md transition-all hover:border-slate-600">
          
          <div className="mb-8">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner shadow-black/50">
              {completed ? (
                <CheckCircle2 size={40} className="text-emerald-500 animate-in zoom-in duration-300" />
              ) : (
                <FileDown size={40} className={`text-indigo-400 ${isProcessing ? 'animate-pulse' : ''}`} />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white">
              {completed ? 'Export Complete' : 'Ready to Export'}
            </h3>
            <p className="text-slate-400 mt-2">
               {isProcessing ? status : 'One click to download Bonus & Game stats'}
            </p>
          </div>

          <button 
             onClick={runExport}
             disabled={isProcessing}
             className={`
                w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-95
                ${isProcessing 
                   ? 'bg-slate-700 text-slate-400 cursor-wait' 
                   : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-900/40'}
             `}
          >
             {isProcessing ? (
               <>
                 <Loader2 className="animate-spin" /> Processing...
               </>
             ) : (
               <>
                 <Download size={24} /> Export Reports
               </>
             )}
          </button>
          
          <div className="mt-6 flex flex-col gap-2 text-xs text-slate-500 font-mono">
             <div className="flex justify-between border-b border-slate-700/50 pb-2">
                <span>TARGET</span>
                <span className="text-slate-300">admin-cur.techonlinecorp.com</span>
             </div>
             <div className="flex justify-between border-b border-slate-700/50 pb-2 pt-1">
                <span>FORMAT</span>
                <span className="text-slate-300">CSV (Standard)</span>
             </div>
             <div className="flex justify-between pt-1">
                <span>AUTH</span>
                <span className="text-slate-300">Browser Session (Cookies)</span>
             </div>
          </div>

      </div>
    </div>
  );
};

export default ReportExporter;
