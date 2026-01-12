
import { GoogleGenAI, Type } from "@google/genai";
import { RestorationScene, YouTubeMetadata, StoryboardResponse } from "../types";

// Always initialize with process.env.API_KEY as per guidelines.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateTitles = async (carSpec?: { year?: string; brand?: string; model?: string }): Promise<string[]> => {
  const ai = getAI();
  let specContext = "";
  if (carSpec && (carSpec.year !== "any" || carSpec.brand !== "any" || carSpec.model !== "any")) {
    specContext = `Specifically for a: ${carSpec.year !== "any" ? carSpec.year : "any year"} ${carSpec.brand !== "any" ? carSpec.brand : "any brand"} ${carSpec.model !== "any" ? carSpec.model : "any model"}.`;
  }

  const prompt = `Generate 5 high-impact, extremely diverse YouTube video titles for ASMR car restoration.
    ${specContext}
    
    Rules for Variety (if no specific car is provided):
    - Era: Include a mix of Vintage (1950s-70s), Neo-Classics (80s-90s), and Modern (2010s-2024).
    - Car Type: Include Supercars, Hypercars, Electric Vehicles (EVs), JDM Legends, American Muscle, European Luxury, and Rugged Off-Roaders.
    - Brand: Use a mix of iconic and modern brands (e.g., Porsche, Toyota, Tesla, Ferrari, Lamborghini, Rivian, BMW, Nissan, Ford, Rolls-Royce).
    - Model Examples: Select specific, recognizable models like 911 GT3 RS, Supra MKV, Cybertruck, F40, Aventador, R34 Skyline, Mustang Dark Horse, or Cullinan.
    
    Format Requirements:
    - Format: “ASMR Car Restoration | [Year] [Brand] [Model] | [Condition] [Transformation Type]”
    - Rules: Professional, cinematic, no emojis, one per line. Focus on extreme restoration conditions and high-end detailing.
    - Spelling: Ensure perfect spelling and no typos.`;

  // Use ai.models.generateContent to query the Gemini model.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 0 } }
  });

  // Extract the response text directly via the .text property.
  const text = response.text || "";
  return text.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
};

export const generateFullProject = async (selectedTitle: string, sceneCount: number = 20): Promise<StoryboardResponse> => {
  const ai = getAI();
  // Using responseSchema for structured JSON output as recommended.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              keywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    rank: { type: Type.INTEGER },
                    volume: { type: Type.STRING }
                  },
                  required: ['term', 'rank', 'volume']
                }
              }
            },
            required: ['title', 'description', 'hashtags', 'keywords']
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stageNumber: { type: Type.INTEGER },
                stageTitle: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                animationPrompt: { type: Type.STRING }
              },
              required: ['stageNumber', 'stageTitle', 'visualPrompt', 'animationPrompt']
            }
          }
        },
        required: ['metadata', 'scenes']
      }
    },
    contents: `Create a comprehensive YouTube project for: "${selectedTitle}".

STRICT NARRATIVE & VISUAL RULES:
1. VEHICLE CONSISTENCY (CRITICAL):
   - You MUST extract the YEAR, BRAND, and MODEL from the title: "${selectedTitle}".
   - EVERY SINGLE ONE of the ${sceneCount} visual prompts MUST explicitly mention this specific YEAR, BRAND, and MODEL.
2. SCENE 1: Depict the creator meeting a person to buy the car. It is damaged and dusty. 
3. PROGRESSION: Show a gradual transition from "wreck" to "showroom masterpiece".
4. NO TEXT IN IMAGES: NO text, titles, watermarks, or logos in visual prompts.
5. QUALITY: Perfect spelling for all metadata. Triple-check for typos.`
  });

  // Trim and parse the JSON string from response.text property.
  const jsonStr = (response.text || "").trim();
  return JSON.parse(jsonStr || "{}");
};

export const generateSceneImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    // Image generation with gemini-2.5-flash-image (nano banana).
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt}. Cinematic car restoration photography, 8k, ultra-realistic. NO TEXT, NO LOGOS, NO WATERMARKS.` }]
      }
    });

    // Iterate through all parts of the response candidates to find the image part.
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error) {
    console.error("Image generation failed", error);
  }
  return null;
};
