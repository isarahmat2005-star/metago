import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  // Menerima file, format, dan nama model dari frontend
  const { fileData, mimeType, requestedModel } = req.body;

  // Jika user tidak memilih, standarnya tetap ke 2.5-flash agar hemat kuota
  const modelName = requestedModel || "gemini-2.5-flash"; 
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    const prompt = "Act as a microstock expert. Analyze this visual content and generate: 1. A professional SEO Title. 2. A detailed Description. 3. Exactly 50 relevant keywords separated by commas.";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: fileData, mimeType } }
    ]);
    
    const response = await result.response;
    res.status(200).json({ result: response.text(), usedModel: modelName });
  } catch (error) {
    res.status(500).json({ error: "API Error: " + error.message });
  }
}
