export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // Sekarang kita menangkap 'accessToken' dari frontend (jika user sudah login)
  const { fileData, mimeType, requestedModel, accessToken } = req.body;

  // Standar model
  const modelName = requestedModel || "gemini-2.5-flash";
  const prompt = "Act as a microstock expert. Analyze this visual content and generate: 1. A professional SEO Title. 2. A detailed Description. 3. Exactly 50 relevant keywords separated by commas.";

  try {
    let responseText = "";

    // ==========================================
    // JALUR 1: JIKA USER SUDAH LOGIN (PAKAI KUOTA EMAIL)
    // ==========================================
    if (accessToken) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Ini kunci rahasianya!
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: mimeType, data: fileData } }
            ]
          }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Google OAuth API Error");
      }

      responseText = data.candidates[0].content.parts[0].text;
    } 
    // ==========================================
    // JALUR 2: CADANGAN (PAKAI API KEY JIKA BELUM LOGIN)
    // ==========================================
    else {
      if (!process.env.GOOGLE_API_KEY) {
         throw new Error("Sistem menolak: Anda belum Login dan tidak ada API Key cadangan.");
      }
      
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: fileData, mimeType } }
      ]);
      
      responseText = await result.response.text();
    }

    // Mengirim hasil kembali ke frontend
    res.status(200).json({ result: responseText, usedModel: modelName });

  } catch (error) {
    res.status(500).json({ error: "Gagal memproses: " + error.message });
  }
}
