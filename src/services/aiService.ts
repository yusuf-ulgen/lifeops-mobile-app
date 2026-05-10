import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key .env dosyasından okunur (EXPO_PUBLIC_ prefix'i zorunludur)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeOrderScreenshot = async (base64Image: string, isSubscription: boolean = false) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = isSubscription
      ? "Analyze this screenshot of a subscription or payment. Extract: 1) Service Name, 2) Price (only number), 3) Billing Period (monthly or yearly). Return as JSON: { \"name\": \"...\", \"amount\": 0, \"period\": \"monthly|yearly\" }. Only return JSON."
      : "Analyze this order screenshot. Extract: 1) Product Name, 2) Store Name (e.g. Trendyol, Amazon), 3) Total Price (only number), 4) Purchase Date (YYYY-MM-DD), 5) Return Window (usually 14 or 30 days, just the number). Return as JSON: { \"product_name\": \"...\", \"store_name\": \"...\", \"price\": 0, \"purchase_date\": \"...\", \"return_window\": 14 }. Only return JSON.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // JSON'ı temizle (Bazen AI markdown içine koyabiliyor)
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};
