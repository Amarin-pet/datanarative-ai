import { GoogleGenAI } from "@google/genai";
import { CSVAnalysis } from '../types';

const API_KEY = process.env.API_KEY || '';

export const generateStory = async (analysis: CSVAnalysis, userPrompt: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable in your .env file or deployment settings.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Construct a data-rich prompt context
  const context = `
Data Context:
- File: ${analysis.filename}
- Total Records: ${analysis.rowCount}
- Total Volume (${analysis.amountColumnName}): ${analysis.totalAmount.toLocaleString()}
- Date Range Covered: ${analysis.monthlyTrend.length > 0 ? `${analysis.monthlyTrend[0].month} to ${analysis.monthlyTrend[analysis.monthlyTrend.length - 1].month}` : 'Unknown'}

Top 5 Business Areas/Categories (${analysis.categoryColumnName}):
${analysis.topCategories.slice(0, 5).map(c => `- ${c.name}: ${c.value.toLocaleString()} (Count: ${c.count})`).join('\n')}

Monthly Trends (Sample):
${analysis.monthlyTrend.map(m => `- ${m.month}: ${m.amount.toLocaleString()}`).join('\n')}

User Instruction: ${userPrompt}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
      config: {
        systemInstruction: "You are an expert data storyteller and financial analyst. Your goal is to transform raw statistics into a compelling narrative. Do not just list numbers; explain the 'why' and the flow. Use Markdown for formatting.",
        temperature: 0.7, // Balance creativity and accuracy
      }
    });

    return response.text || "No response generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Improve error messaging for the UI
    let errorMessage = "Failed to communicate with Gemini API.";
    if (error.message?.includes('403') || error.message?.includes('API key')) {
      errorMessage = "Invalid or missing API Key. Please check your configuration.";
    } else if (error.message?.includes('429')) {
      errorMessage = "You are sending requests too quickly. Please wait a moment.";
    }
    
    throw new Error(errorMessage);
  }
};