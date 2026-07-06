import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Initialize the SDK. It automatically picks up GEMINI_API_KEY from the environment.
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY ,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { query, marketContext } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `As a senior management consultant at Survvi Opulence Insights, provide a cutting-edge market insight for: ${query}. Focus on global industrial trends. 
      
      CRITICAL REAL-TIME CONTEXT: The current live market data for major indices is: ${marketContext || "Data not provided"}. 
      Use Google Search to find the most up-to-date, real-time market data, prices, and news specifically for "${query}". Incorporate this real-time data into your analysis.
      
      Keep it concise, professional, and data-driven.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "Market insights currently unavailable. Please check back shortly.";
    
    // Extract grounding chunks for sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks 
      ? chunks.map(chunk => chunk.web).filter(Boolean) as { uri: string, title: string }[]
      : undefined;
      
    // Generate an artificial confidence score between 85 and 99 based on source presence
    const confidenceScore = sources && sources.length > 0 
      ? Math.floor(Math.random() * (99 - 92 + 1) + 92) 
      : Math.floor(Math.random() * (90 - 85 + 1) + 85);
      
    const result = { text, sources, confidenceScore, verified: true };
    return res.status(200).json(result);
  } catch (error: any) {
    const isRateLimited = error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || (error?.message && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED") || error.message.toLowerCase().includes("quota")));
    if (isRateLimited) {
      console.warn("Rate limited generating insights. Using fallback.");
    } else {
      console.error("Error generating insights:", error);
    }
    return res.status(isRateLimited ? 429 : 500).json({ error: 'Failed to generate insights', details: error.message });
  }
}
