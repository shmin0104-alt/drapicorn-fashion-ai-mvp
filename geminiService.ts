
import { GoogleGenAI, Type } from "@google/genai";
import { ToolType, PreviewOptions, TechPackMeta, NewsArticle, ItemType, Variation, MarketReaction, ChatMessage } from "./types";

// Schema for technical production data (Expanded for detailed POMs)
const TECHPACK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    docs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          part: { type: Type.STRING, description: "TOP, BOTTOM, DRESS, or SETUP" },
          details: {
            type: Type.OBJECT,
            properties: {
              stitching: { type: Type.STRING },
              seamFinishing: { type: Type.STRING },
              pocketConstruction: { type: Type.STRING },
              neck: { type: Type.STRING },
              closure: { type: Type.STRING },
              hem: { type: Type.STRING },
              etc: { type: Type.STRING }
            }
          },
          measurement: {
            type: Type.OBJECT,
            description: "Finished garment measurements (Points of Measure)",
            properties: {
              // Common / Top
              totalLength: { type: Type.STRING },
              shoulderWidth: { type: Type.STRING },
              chestWidth: { type: Type.STRING },
              waistWidth: { type: Type.STRING },
              hemWidth: { type: Type.STRING },
              sleeveLength: { type: Type.STRING },
              armhole: { type: Type.STRING },
              cuffOpening: { type: Type.STRING },
              neckWidth: { type: Type.STRING },
              frontDrop: { type: Type.STRING },
              
              // Bottom
              hipWidth: { type: Type.STRING },
              thighWidth: { type: Type.STRING },
              kneeWidth: { type: Type.STRING },
              frontRise: { type: Type.STRING },
              backRise: { type: Type.STRING },
              inseam: { type: Type.STRING },
              outseam: { type: Type.STRING },
              legOpening: { type: Type.STRING }
            }
          },
          materials: {
            type: Type.OBJECT,
            properties: {
              mainFabric: { type: Type.STRING },
              composition: { type: Type.STRING },
              subMaterial: { type: Type.STRING }
            }
          },
          designSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
          factoryRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                location: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          },
          sourceMeasurements: {
            type: Type.OBJECT,
            properties: {
              height: { type: Type.STRING },
              chest: { type: Type.STRING },
              waist: { type: Type.STRING },
              shoulder: { type: Type.STRING }
            }
          }
        }
      }
    }
  }
};

const NEWS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    articles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING },
          source: { type: Type.STRING },
          date: { type: Type.STRING },
          summary: { type: Type.STRING, description: "A comprehensive 3-4 sentence professional intelligence report." },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          thumbnail: { type: Type.STRING, description: "A valid image URL for the product/article if found." }
        }
      }
    }
  }
};

const getTechPackUserPrompt = (options: PreviewOptions, meta?: TechPackMeta) => {
  return `Create a professional technical package for: ${meta?.itemName || 'this design'}. 
  Item Type: ${options.itemType}. Fit: ${options.fit}. Length: ${options.length}.
  
  [CRITICAL INPUTS]
  Body Measurements (Human): ${JSON.stringify(options.measurements)}
  
  [TASK]
  1. Analyze the body measurements.
  2. Calculate the "Finished Garment Measurements" (POM) by adding appropriate ease/allowance based on the "${options.fit}" fit (e.g., Oversized needs large chest allowance).
  3. Fill the measurement object with specific manufacturing specs (e.g. Front Rise, Thigh for bottoms; Armhole, Cuff for tops).
  
  Additional Notes: ${meta?.additionalNotes || 'None'}.`;
};

const getTechPackSystemPrompt = (lang: string) => {
  return `You are an expert Technical Designer and Pattern Maker. 
  Output strict JSON.
  Language: ${lang === 'KO' ? 'Korean' : 'English'}.
  Your goal is to provide ready-to-use factory specifications.
  Ensure 'measurement' values are numbers with units (e.g. "72cm") representing the CLOTHES, not the body.`;
};

const formatJsonToText = (data: any, meta?: TechPackMeta) => {
  if (!data || !data.docs) return "";
  return data.docs.map((doc: any) => {
    return `[${doc.part}] ${meta?.itemName || 'Item'}\nMain Fabric: ${doc.materials?.mainFabric || 'N/A'}\nConstruction: ${doc.details?.stitching || 'N/A'}`;
  }).join("\n\n");
};

export const geminiService = {
  async getRealtimeFashionNews(lang: 'KO' | 'EN', region: 'GLOBAL' | 'EUROPE' | 'USA' | 'KOREA' | 'NEW_DROPS'): Promise<NewsArticle[]> {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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

    const query = `
      Find top 4 most significant fashion industry news articles/products for today.
      Target Region/Topic: ${regionPrompt}
      
      [OUTPUT INSTRUCTION]
      For each article found, generate a JSON object matching the schema.
      
      **CRITICAL: The 'summary' field MUST be a detailed Intelligence Report (approx 80-100 words).**
      - Explain the context, key details, and strategic impact.
      - Language: ${lang === 'KO' ? 'Korean' : 'English'}.
      
      ${isNewDrops ? `
      [SPECIAL INSTRUCTION FOR NEW DROPS]
      1. 'title' should be the Product Name + Brand.
      2. 'features' array MUST include exactly these 3 elements in order if found:
         - "Price: [Amount]" (e.g. Price: $250 or Price: 320,000 KRW)
         - "Finishing: [Method]" (e.g. Finishing: Garment Dyed, Laser Cut, Raw Hem)
         - "Detail: [Key Feature]" (e.g. Detail: Hidden magnetic closure, Waterproof zippers)
      3. 'thumbnail': ONLY include if you find a valid, direct HTTP URL to an image. If uncertain or none found, leave empty or null. Do not hallucinate URLs.
      ` : ""}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: NEWS_SCHEMA,
        systemInstruction: `You are a Senior Fashion Market Intelligence Analyst. 
        Your goal is to provide deep, actionable insights.
        For 'New Drops', focus on product specifications (Price, Finishing, Material).
        Always output valid JSON.`,
      },
    });

    try {
        const json = JSON.parse(response.text || "{}");
        const articles: NewsArticle[] = json.articles || [];
        
        return articles.map(a => ({
            ...a,
            source: a.source || new URL(a.url || 'http://google.com').hostname.replace('www.', ''),
            date: a.date || new Date().toLocaleDateString(),
            summary: a.summary || "No analysis available.",
            thumbnail: a.thumbnail // Pass through the AI-found image URL
        }));
    } catch (e) {
        console.error("Failed to parse news JSON", e);
        return [];
    }
  },

  async generateVariations(
    baseImage: string,
    axes: string[],
    intensity: number,
    refImage?: string
  ): Promise<Variation[]> {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const variations: Variation[] = [];
    
    const generateOne = async (idx: number) => {
        const prompt = `Fashion Design Sketch Variation ${idx + 1}. 
        Based on the input sketch, creatively alter the following attributes: ${axes.join(', ')}. 
        Creativity Intensity: ${intensity}/5. 
        Keep the core identity but explore new possibilities. 
        Output a high-quality fashion sketch/render.`;

        const parts: any[] = [
            { text: prompt },
            { inlineData: { mimeType: 'image/png', data: baseImage } }
        ];
        
        if (refImage) {
            parts.push({ inlineData: { mimeType: 'image/png', data: refImage } });
            parts[0].text += " Incorporate style/texture from the reference image.";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ parts }],
            config: { imageConfig: { aspectRatio: "3:4" } }
        });

        const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imgPart?.inlineData?.data) {
             variations.push({
                 id: `var-${Date.now()}-${idx}`,
                 thumbnail: `data:image/png;base64,${imgPart.inlineData.data}`,
                 title: `Variation ${idx + 1}: ${axes[0]} Focus`,
                 tags: axes,
                 note: "AI Generated"
             });
        }
    };

    // Generate 3 variations in parallel
    await Promise.allSettled([generateOne(0), generateOne(1), generateOne(2)]);
    return variations;
  },

  async getFactoryResponse(history: ChatMessage[], meta: TechPackMeta, lang: 'KO' | 'EN'): Promise<string> {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Check if the last message was a QC report
    const lastMsg = history[history.length - 1];
    const isQC = lastMsg?.type === 'QC_REPORT';

    const prompt = `
      You are an experienced Garment Factory Manager in Seoul (Dongdaemun) or Vietnam.
      Your tone is professional but busy, practical, and helpful. You want to secure the order but are realistic about timelines and costs.
      
      [Current Tech Pack Context]
      Item: ${meta.itemName}
      Brand: ${meta.brandName}
      Quantity: ${meta.quantity}
      Due Date: ${meta.dueDate}
      Materials: Based on conversation.

      [Conversation History]
      ${history.map(m => {
          if (m.type === 'QC_REPORT') return `[USER SENT QC REPORT]: Round ${m.qcData?.sampleRound}, Corrections: ${m.qcData?.corrections.join(', ')}`;
          return `${m.sender}: ${m.text}`;
      }).join('\n')}

      [Task]
      Respond to the last USER message.
      ${isQC ? 
        `- THE USER JUST SENT A QC/CORRECTION REPORT. Acknowledge receipt immediately.
         - Confirm you will apply the corrections (mention specific corrections like "fixing the sleeve length" or "adjusting color").
         - Estimate when the NEXT sample (or final production) will be ready.` 
        : 
        `- If they ask about cost/MOQ, give realistic estimates.
         - If they ask about timeline, mention current busy season.`
      }
      - Keep response short (1-2 sentences), like a text message.
      - Language: ${lang === 'KO' ? 'Korean (Natural business messenger tone, e.g. "네 사장님," "수정해서 다시 올릴게요.")' : 'English (Business casual)'}.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });

    return response.text?.trim() || (lang === 'KO' ? "확인했습니다. 수정 진행하겠습니다." : "Received. Will proceed with corrections.");
  },

  async simulateMarketReaction(image: string, meta: TechPackMeta): Promise<MarketReaction> {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const schema = {
        type: Type.OBJECT,
        properties: {
            fundingRate: { type: Type.INTEGER, description: "Predicted funding/pre-order percentage goal reached (e.g. 120, 85)" },
            currentAmount: { type: Type.INTEGER, description: "Simulated sales amount in dollars" },
            targetAmount: { type: Type.INTEGER, description: "Target sales goal" },
            backers: { type: Type.INTEGER, description: "Number of people who pre-ordered" },
            chips: { type: Type.ARRAY, items: { type: Type.STRING } },
            feedback: {
                type: Type.OBJECT,
                properties: {
                    complaint: { type: Type.STRING },
                    praise: { type: Type.STRING }
                }
            },
            demographics: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        percent: { type: Type.INTEGER }
                    }
                }
            }
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ 
            parts: [
                { inlineData: { mimeType: 'image/png', data: image } }, 
                { text: `Simulate a Pre-order / Crowdfunding campaign for: ${meta.itemName}. 
                Target audience: Fashion forward Gen Z. 
                Predict funding success rate, backer count, and sales volume.
                Provide demographic breakdown.` }
            ] 
        }],
        config: { 
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    return JSON.parse(response.text || "{}");
  },

  async processFashionTask(
    tool: ToolType,
    imageBase64: string,
    options: PreviewOptions,
    topSwatches: string[] = [],
    bottomSwatches: string[] = [],
    meta?: TechPackMeta,
    action: 'GENERATE' | 'SEND_CONFIRMATION' = 'GENERATE'
  ) {
    if (action === 'SEND_CONFIRMATION') return { uiMessage: options.lang === 'KO' ? "발송 완료" : "Sent successfully" };
    if (!process.env.API_KEY) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const promises: Promise<{ type: 'TEXT' | 'FLAT' | 'FIT', data: any, error?: any }>[] = [];

    const extractImage = (res: any) => {
        const parts = res.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        return null;
    };

    if (tool === ToolType.AI_PACK || tool === ToolType.PRO_TECHPACK) {
      promises.push(
        ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ inlineData: { mimeType: 'image/png', data: imageBase64 } }, { text: getTechPackUserPrompt(options, meta) }] }],
          config: { 
            responseMimeType: "application/json",
            responseSchema: TECHPACK_SCHEMA,
            temperature: 0.1, 
            systemInstruction: getTechPackSystemPrompt(options.lang)
          }
        })
          .then(res => {
             try {
               const json = JSON.parse(res.text || "{}");
               return { type: 'TEXT' as const, data: json };
             } catch (e) {
               return { type: 'TEXT' as const, data: null, error: e };
             }
          })
          .catch(e => ({ type: 'TEXT' as const, data: null, error: e }))
      );
    }

    if (tool === ToolType.AI_PACK || tool === ToolType.REAL_FLAT || tool === ToolType.CLOTH_ONLY_FLAT) {
        // Enforce Front & Back view, technical style
        const prompt = options.lang === 'KO' 
          ? `전문 의류 도식화(Technical Flat). ${options.itemType}. 앞면(Front)과 뒷면(Back)을 나란히 배치. 흑백 라인 아트(Line art only). 명암 없음. 깨끗한 흰색 배경. 디테일한 봉제선 표시.` 
          : `Professional Fashion Technical Flat Sketch of ${options.itemType}. SHOW BOTH FRONT VIEW AND BACK VIEW SIDE-BY-SIDE. Black and white line art only. No shading. Clean white background. Detailed stitching lines.`;
        
        promises.push(
          ai.models.generateContent({ 
            model: 'gemini-2.5-flash-image',
            contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: 'image/png', data: imageBase64 } }] }],
            config: { imageConfig: { aspectRatio: "4:3" } }
          })
          .then(res => ({ type: 'FLAT' as const, data: extractImage(res) }))
          .catch(e => ({ type: 'FLAT' as const, data: null, error: e }))
        );
      }
  
      if (tool === ToolType.AI_PACK || tool === ToolType.FIT_PREVIEW || tool === ToolType.MATERIAL_ENHANCE) {
        let framing = "";
        if (options.itemType === ItemType.TOP) framing = "Upper body close-up fashion photography, focus on the top garment, professional studio lighting.";
        else if (options.itemType === ItemType.BOTTOM || options.itemType === ItemType.JEANS) framing = "Lower body fashion photography, waist down, focus on trousers/skirt.";
        else framing = "Full body fashion photography, professional studio lighting.";

        const prompt = options.lang === 'KO' 
          ? `리얼리스틱 스튜디오 패션 촬영물 생성. ${framing}` 
          : `Realistic studio fashion photography creation. ${framing}`;

        const parts: any[] = [{ text: prompt }, { inlineData: { mimeType: 'image/png', data: imageBase64 } }];
        if (topSwatches.length > 0) parts.push({ inlineData: { mimeType: 'image/png', data: topSwatches[0] } });
  
        promises.push(
          ai.models.generateContent({ 
            model: 'gemini-2.5-flash-image',
            contents: [{ parts }],
            config: { imageConfig: { aspectRatio: "3:4" } }
          })
          .then(res => ({ type: 'FIT' as const, data: extractImage(res) }))
          .catch(e => ({ type: 'FIT' as const, data: null, error: e }))
        );
      }
  
      const results = await Promise.allSettled(promises);
      let imageUrl: string | undefined;
      let imageUrl2: string | undefined;
      let textData: any = null;
  
      results.forEach(result => {
          if (result.status === 'fulfilled') {
              const val = result.value;
              if (val.type === 'FLAT' && val.data) imageUrl = `data:image/png;base64,${val.data}`;
              if (val.type === 'FIT' && val.data) imageUrl2 = `data:image/png;base64,${val.data}`;
              if (val.type === 'TEXT' && val.data) textData = val.data;
          }
      });
  
      return { imageUrl, imageUrl2, text: textData ? formatJsonToText(textData, meta) : undefined, techPackData: textData, uiMessage: options.lang === 'KO' ? "생성 완료" : "Complete" };
  },
};
