import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Initialize the SDK server-side. It automatically picks up GEMINI_API_KEY from the environment.
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AI_STUDIO_PLACEHOLDER_KEY",
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, contents, config } = req.body;

    if (!model || !contents) {
      return res.status(400).json({ error: 'Model and contents are required' });
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const jsonResponse = JSON.parse(JSON.stringify(response));
    try {
      jsonResponse.text = response.text;
    } catch(e) {}

    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error("Error generating proxy content:", error);
    return res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
}
