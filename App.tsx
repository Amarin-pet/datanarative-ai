import React, { useState, useCallback } from 'react';
import { FileUp, FileText, Sparkles, BarChart3, AlertCircle, RefreshCcw } from 'lucide-react';
import { CSVAnalysis } from './types';
import { parseAndAnalyzeCSV } from './services/csvService';
import { generateStory } from './services/geminiService';
import FileUpload from './components/FileUpload';
import StatsDashboard from './components/StatsDashboard';
import StoryGenerator from './components/StoryGenerator';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<CSVAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setAnalysis(null);
    setGeneratedStory(null);

    try {
      const result = await parseAndAnalyzeCSV(file);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Failed to parse CSV file.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleGenerateStory = useCallback(async (customPrompt: string) => {
    if (!analysis) return;

    setIsGenerating(true);
    setError(null);

    try {
      const story = await generateStory(analysis, customPrompt);
      setGeneratedStory(story);
    } catch (err: any) {
      setError(err.message || "Failed to generate story from Gemini API.");
    } finally {
      setIsGenerating(false);
    }
  }, [analysis]);

  const resetApp = () => {
    setAnalysis(null);
    setGeneratedStory(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-primary">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">DataNarrative AI</h1>
          </div>
          {analysis && (
            <button 
              onClick={resetApp}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <RefreshCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: File Upload */}
        {!analysis && (
          <section className="max-w-2xl mx-auto text-center space-y-6 animate-slide-up">
             <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Tell the story behind your numbers</h2>
                <p className="text-slate-600">Upload your <code className="bg-slate-100 px-1 py-0.5 rounded">.csv</code> file (e.g., H_ZCSR181H) and let Gemini find the insights.</p>
             </div>
             <FileUpload onFileSelect={handleFileUpload} isProcessing={isProcessing} />
          </section>
        )}

        {/* Step 2: Dashboard & Generation */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left Col: Stats Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center space-x-2 mb-4 text-slate-800">
                   <BarChart3 className="w-5 h-5 text-primary" />
                   <h3 className="font-semibold text-lg">Data Overview</h3>
                </div>
                <StatsDashboard analysis={analysis} />
              </div>
            </div>

            {/* Right Col: Story Generator */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px] flex flex-col">
                <div className="flex items-center space-x-2 mb-6 text-slate-800">
                   <FileText className="w-5 h-5 text-primary" />
                   <h3 className="font-semibold text-lg">Narrative Report</h3>
                </div>

                <StoryGenerator 
                  onGenerate={handleGenerateStory}
                  isGenerating={isGenerating}
                  generatedStory={generatedStory}
                />
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;