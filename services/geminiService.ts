import { GoogleGenAI } from "@google/genai";

export const analyzeCsvReport = async (csvData: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a data analyst for an online gaming platform.
    Analyze the following CSV data. It is either a "Bonus Statistics" report or a "Game Statistics" report.
    
    First, identify the type of report based on the headers (e.g., 'gamename' vs 'bonus_type').

    If it is **Bonus Statistics**:
    1. Summarize total bonus costs.
    2. Identify top VIP players or "Whales" taking the most bonuses.
    3. Flag anomalies (high win rates, massive cancellations).

    If it is **Game Statistics**:
    1. Identify top performing games by 'totalincome' or 'totalbets'.
    2. Calculate overall RTP (Return to Player) if possible (wins/bets).
    3. Identify any games with negative income (players winning more than betting).
    4. Highlight top providers.
    
    Please provide a structured Markdown summary with key metrics in a table.

    Here is the CSV Data:
    \`\`\`csv
    ${csvData.substring(0, 30000)} 
    \`\`\`
    (Note: Data may be truncated if too large).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze the report. The dataset might be too large or the API key is invalid.";
  }
};
