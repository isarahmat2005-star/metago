import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // Mengambil API Key dari Environment Variables Vercel
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const { fileData, mimeType, prompt } = req.body;

  try {
    const result = await model.generateContent([
      prompt || "Generate metadata: Title, Description, and 50 Keywords for Microstock.",
      { inlineData: { data: fileData, mimeType } }
    ]);
    
    const response = await result.response;
    res.status(200).json({ result: response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
