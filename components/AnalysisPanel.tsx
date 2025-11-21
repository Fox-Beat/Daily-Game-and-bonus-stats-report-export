import React, { useState } from 'react';
import { analyzeCsvReport } from '../services/geminiService';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AnalysisPanel: React.FC = () => {
  const [csvContent, setCsvContent] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!csvContent) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeCsvReport(csvContent);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Error running analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Upload size={20} className="text-purple-400" />
          Import CSV Report
        </h3>
        
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:bg-slate-700/50 transition-colors">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="hidden" 
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer block w-full h-full">
            <div className="text-slate-300 mb-2">Click to upload or drag CSV here</div>
            <div className="text-slate-500 text-sm">Supports exported reports</div>
          </label>
        </div>

        {csvContent && (
          <div className="mt-4">
             <div className="bg-slate-900 p-3 rounded text-xs text-slate-400 font-mono h-32 overflow-hidden relative">
                {csvContent}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900 to-transparent"></div>
             </div>
             
             <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all"
             >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {loading ? 'Analyzing with Gemini...' : 'Analyze Report'}
             </button>
          </div>
        )}
      </div>

      {analysis && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 animate-fade-in">
           <h3 className="text-xl font-semibold text-white mb-4">Gemini Insights</h3>
           <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
           </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;