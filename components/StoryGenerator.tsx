import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Edit3 } from 'lucide-react';
import { DEFAULT_PROMPT } from '../constants';
import clsx from 'clsx';

interface StoryGeneratorProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  generatedStory: string | null;
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onGenerate, isGenerating, generatedStory }) => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [hasModifiedPrompt, setHasModifiedPrompt] = useState(false);

  // Auto-generate on first load if no story exists
  useEffect(() => {
    if (!generatedStory && !isGenerating && !hasModifiedPrompt) {
       onGenerate(DEFAULT_PROMPT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasModifiedPrompt(true);
    onGenerate(prompt);
  };

  return (
    <div className="flex flex-col flex-grow h-full">
      {/* Output Area */}
      <div className="flex-grow bg-slate-50 rounded-lg border border-slate-200 p-6 mb-6 overflow-y-auto min-h-[300px]">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="animate-pulse">Drafting your narrative...</p>
          </div>
        ) : generatedStory ? (
          <div className="prose prose-slate prose-headings:text-slate-800 prose-a:text-primary max-w-none">
            <ReactMarkdown>{generatedStory}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <p>Ready to generate report.</p>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="bg-slate-100 p-4 rounded-lg">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Customize Prompt
            </label>
          </div>
          <div className="relative">
            <textarea
                className="w-full p-3 pr-12 text-sm text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Gemini a specific question about the data..."
                disabled={isGenerating}
            />
            <button
                type="submit"
                disabled={isGenerating}
                className={clsx(
                    "absolute bottom-3 right-3 p-1.5 rounded-md transition-colors",
                    isGenerating 
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                        : "bg-primary text-white hover:bg-blue-700 shadow-sm"
                )}
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryGenerator;