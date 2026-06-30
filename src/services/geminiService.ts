// We replace the direct GoogleGenAI instantiation with a proxy to our backend.
// This ensures that the frontend code does not try to use process.env or the raw API key.
export const ai = {
  models: {
    generateContent: async (params: { model: string, contents: any, config?: any }) => {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to generate content: ${response.status} ${response.statusText}. Details: ${text}`);
      }

      return await response.json();
    }
  }
} as any;

