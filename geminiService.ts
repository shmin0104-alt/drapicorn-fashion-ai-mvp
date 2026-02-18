
import { GoogleGenAI, Type } from "@google/genai";
import { ToolType, PreviewOptions, TechPackMeta, NewsArticle, ItemType, Variation, MarketReaction, ChatMessage } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Schemas (TECHPACK_SCHEMA, NEWS_SCHEMA) remain unchanged...
const TECHPACK_SCHEMA = { type: Type.OBJECT, properties: { /* ... */ } };
const NEWS_SCHEMA = { type: Type.OBJECT, properties: { /* ... */ } };

const getTechPackUserPrompt = (options: PreviewOptions, meta?: TechPackMeta) => { /* ... */ };
const getTechPackSystemPrompt = (lang: string) => { /* ... */ };
const formatJsonToText = (data: any, meta?: TechPackMeta) => { /* ... */ };

export const geminiService = {
  async getRealtimeFashionNews(lang: 'KO' | 'EN', region: 'GLOBAL' | 'EUROPE' | 'USA' | 'KOREA' | 'NEW_DROPS'): Promise<NewsArticle[]> {
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    // ... rest of the function logic is the same
    let regionPrompt = "";
    let isNewDrops = false;

    switch(region) {
      case 'EUROPE': regionPrompt = "Focus on European fashion luxury markets (Paris, Milan, London, Berlin)."; break;
      case 'USA': regionPrompt = "Focus on the US fashion market (NYC, LA, Streetwear, Techwear innovations)."; break;
      case 'KOREA': regionPrompt = "Focus on South Korean fashion (K-Fashion trends, Dongdaemun industry, KR designers)."; break;
      case 'NEW_DROPS': 
        regionPrompt = "Focus EXCLUSIVELY on specific NEW PRODUCT RELEASES (Drops) from famous brands (e.g. Balenciaga, Nike, Supreme, Gentle Monster, Arc'teryx) released in the last 7 days. Find 4 distinct items."; 
        isNewDrops = true;
        break;
      default: regionPrompt = "Provide global fashion industry trends and major announcements.";
    }
    const query = `...`; // Query remains the same
    const response = await ai.models.generateContent({ /* ... */ });
    // ... rest of try/catch is the same
    try {
        const json = JSON.parse(response.text || "{}");
        return (json.articles || []).map((a:any) => ({...a}));
    } catch (e) {
        console.error("Failed to parse news JSON", e);
        return [];
    }
  },

  async generateVariations(baseImage: string, axes: string[], intensity: number, refImage?: string): Promise<Variation[]> {
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    // ... rest of the function is the same
    const variations: Variation[] = [];
    const generateOne = async (idx: number) => { /* ... */ };
    await Promise.allSettled([generateOne(0), generateOne(1), generateOne(2)]);
    return variations;
  },

  async getFactoryResponse(history: ChatMessage[], meta: TechPackMeta, lang: 'KO' | 'EN'): Promise<string> {
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    // ... rest of the function is the same
    const prompt = `...`; // Prompt remains the same
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text?.trim() || "Error";
  },

  async simulateMarketReaction(image: string, meta: TechPackMeta): Promise<MarketReaction> {
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    // ... rest of the function is the same
    const schema = { type: Type.OBJECT, properties: { /* ... */ } };
    const response = await ai.models.generateContent({ /* ... */ });
    return JSON.parse(response.text || "{}");
  },

  async processFashionTask(tool: ToolType, imageBase64: string, options: PreviewOptions, topSwatches: string[] = [], bottomSwatches: string[] = [], meta?: TechPackMeta, action: 'GENERATE' | 'SEND_CONFIRMATION' = 'GENERATE') {
    if (action === 'SEND_CONFIRMATION') return { uiMessage: "Sent" };
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    // ... rest of the function is the same
    const promises: any[] = [];
    const extractImage = (res: any) => res.candidates?.[0]?.content?.parts?.find((p:any) => p.inlineData)?.inlineData?.data || null;
    
    // Logic for pushing promises...
    
    const results = await Promise.allSettled(promises);
    // Logic for processing results...
    return { imageUrl: undefined, imageUrl2: undefined, text: undefined, techPackData: null, uiMessage: "Complete" };
  },
};
