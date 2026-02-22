import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  // MENGGUNAKAN MODEL TERBARU (Gemini 2.0 Flash)
  // Ini jauh lebih cepat dan akurat untuk deteksi objek/metadata
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const { fileData, mimeType } = req.body;

  try {
    const prompt = "Analyze this visual content and generate professional microstock metadata: 1. A concise SEO-friendly Title. 2. A detailed Description. 3. Exactly 50 relevant keywords separated by commas.";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: fileData, mimeType } }
    ]);
    
    const response = await result.response;
    res.status(200).json({ result: response.text() });
  } catch (error) {
    res.status(500).json({ error: "Gemini Model Error: " + error.message });
  }
}
