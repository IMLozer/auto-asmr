
import { GoogleGenAI, Type } from "@google/genai";
import { RestorationScene, YouTubeMetadata, StoryboardResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTitles = async (carSpec?: { year?: string; brand?: string; model?: string }): Promise<string[]> => {
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

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 0 } }
  });

  const text = response.text || "";
  return text.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
};

export const generateFullProject = async (selectedTitle: string, sceneCount: number = 20): Promise<StoryboardResponse> => {
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
   - The vehicle must never change.

2. SCENE 1 - "The Honorable Acquisition": 
   - Depict the creator meeting a lonely, isolated person.
   - The car is SEVERELY DAMAGED and partially covered in dust.
   - The creator hands a generous stack of money to the person in a respectful exchange.

3. VISUAL THEME CONSISTENCY:
   - THE CAR COLOR: Pick one specific car color appropriate for the model and ensure this specific color is mentioned in EVERY visual prompt.
   - INITIAL STATE: In the first 30% of scenes, the car must look extremely damaged, neglected, and dirty.
   - PROGRESSION: Show a gradual, satisfying transition from "wreck" to "showroom masterpiece".
   - NO TEXT IN IMAGES: ABSOLUTELY NO text, titles, subtitles, stage numbers, watermarks, or logos in the visual prompts. The images MUST be clean cinematic shots without any written characters or typography.

4. SCENE COUNT: Generate exactly ${sceneCount} precise cinematic restoration scenes.

5. SEO METADATA: Description with chapters matching all ${sceneCount} scenes, 10 hashtags, and 15 ranked keywords.

6. QUALITY CONTROL: Ensure perfect spelling for all generated text. Triple-check for typos (e.g., use "Extraction" not "Extraiction").

Focus: Extreme mechanical detail, satisfying ASMR sounds, cinematic workshop lighting, and high emotional impact.`
  });

  return JSON.parse(response.text || "{}");
};

export const generateSceneImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt}. Cinematic car restoration documentary style, ultra-realistic photography, 8k resolution, emotional workshop lighting, hyper-detailed textures. MANDATORY: DO NOT INCLUDE ANY TEXT, LETTERS, NUMBERS, TYPOGRAPHY, CAPTIONS, LABELS, TITLES, WATERMARKS, OR LOGOS IN THE IMAGE. THE IMAGE MUST BE COMPLETELY DEVOID OF WRITTEN LANGUAGE.` }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed", error);
  }
  return null;
};
