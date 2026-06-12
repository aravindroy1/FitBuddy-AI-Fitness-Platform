import React, { useState } from 'react';
import {
  FileText, Upload, CheckCircle2, AlertTriangle, Sparkles, Clipboard, ArrowRight
} from 'lucide-react';

interface Biomarker {
  name: string;
  value: number;
  unit: string;
  reference: string;
  status: 'normal' | 'low' | 'high';
}

interface InsightsResult {
  biomarkers: Biomarker[];
  recommendations: string[];
}

export const MedicalReports: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InsightsResult | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setError('');

    // Simulate Document Intelligence processing
    setTimeout(() => {
      setResult({
        biomarkers: [
          { name: 'Vitamin D (25-OH)', value: 18.2, unit: 'ng/mL', reference: '30.0 - 100.0', status: 'low' },
          { name: 'Fasting Blood Glucose', value: 92, unit: 'mg/dL', reference: '70 - 100', status: 'normal' },
          { name: 'Total Cholesterol', value: 215, unit: 'mg/dL', reference: '< 200', status: 'high' },
          { name: 'Hemoglobin', value: 14.8, unit: 'g/dL', reference: '13.8 - 17.2', status: 'normal' },
          { name: 'Vitamin B12', value: 340, unit: 'pg/mL', reference: '200 - 900', status: 'normal' }
        ],
        recommendations: [
          "Vitamin D is deficient (18.2 ng/mL). Supplement with 2000-5000 IU of Vitamin D3 daily with a fat-containing meal to boost levels.",
          "Total Cholesterol is elevated (215 mg/dL). Increase daily soluble fiber (oats, beans, psyllium husk) and prioritize omega-3 fats (salmon, walnuts, flaxseed) to lower LDL.",
          "Fasting Glucose looks healthy at 92 mg/dL. Keep maintaining a moderate carbohydrate split with fibers.",
          "Ensure regular cardiovascular exercise (at least 150 minutes of zone 2 weekly) to raise HDL cholesterol levels."
        ]
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" /> Medical Reports Analyzer
        </h1>
        <p className="text-slate-400 text-sm mt-1">Upload blood work or health diagnostics to retrieve AI diet corrections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form Panel */}
        <div className="glass-panel p-5 space-y-4 lg:col-span-1">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> Report Upload
          </h3>
          <p className="text-xs text-slate-400">Supported formats: PDF, JPEG, PNG. Analyzed via Azure AI Document Intelligence OCR.</p>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border border-dashed border-white/10 hover:border-primary/50 transition-colors rounded-xl p-6 text-center cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileText className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <span className="text-xs text-slate-400 block font-medium">
                {selectedFile ? selectedFile.name : 'Choose report file'}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50 shadow-md shadow-primary/15"
            >
              <Sparkles className="h-4 w-4" /> {loading ? 'Extracting Biomarkers...' : 'Analyze Report'}
            </button>
          </form>
        </div>

        {/* OCR & AI Insights Output Panel */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-5">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-accent-cyan" /> Laboratory Biomarkers & Insights
          </h3>

          {result ? (
            <div className="space-y-6">
              {/* Biomarkers Table */}
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/10">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-semibold text-xs uppercase">
                      <th className="p-3">Biomarker</th>
                      <th className="p-3 text-center">Your Value</th>
                      <th className="p-3 text-center">Reference Range</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.biomarkers.map((bio, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3 font-semibold text-slate-200">{bio.name}</td>
                        <td className="p-3 text-center text-white font-bold">{bio.value} {bio.unit}</td>
                        <td className="p-3 text-center text-slate-400 font-mono text-xs">{bio.reference}</td>
                        <td className="p-3 flex justify-center">
                          {bio.status === 'normal' && (
                            <span className="flex items-center gap-1 text-xs font-bold text-secondary bg-secondary/15 px-2.5 py-1 rounded-full border border-secondary/10">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Optimal
                            </span>
                          )}
                          {bio.status === 'low' && (
                            <span className="flex items-center gap-1 text-xs font-bold text-accent-cyan bg-accent-cyan/15 px-2.5 py-1 rounded-full border border-accent-cyan/10">
                              <AlertTriangle className="h-3.5 w-3.5" /> Deficient
                            </span>
                          )}
                          {bio.status === 'high' && (
                            <span className="flex items-center gap-1 text-xs font-bold text-accent-rose bg-accent-rose/15 px-2.5 py-1 rounded-full border border-accent-rose/10">
                              <AlertTriangle className="h-3.5 w-3.5" /> Elevated
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recommendations list */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-primary" /> AI Dietary Recommendations
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-sm text-slate-300 p-3 bg-white/5 border border-white/5 rounded-xl">
                      <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col justify-center items-center text-slate-500 text-sm border border-dashed border-white/5 rounded-xl">
              <FileText className="h-10 w-10 text-slate-600 mb-2" />
              <span>No health files processed. Submit lab reports on the left.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
