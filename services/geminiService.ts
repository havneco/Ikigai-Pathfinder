
import { GoogleGenAI, Type } from "@google/genai";
import { IkigaiState, IkigaiResult } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  // SAFELY ACCESS API KEY: Checks if 'process' exists before accessing it to prevent browser crashes
  let apiKey = '';
  try {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("process.env access failed");
  }

  if (!apiKey) {
    // Fallback: If your build system injects it differently or if it's missing
    console.error("API Key is missing. Please ensure process.env.API_KEY is defined in your build configuration.");
    throw new Error("API Key not found");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const getSuggestions = async (
  category: "love" | "goodAt" | "worldNeeds" | "paidFor",
  currentItems: string[],
  context?: IkigaiState
): Promise<string[]> => {
  const ai = getAI();
  const model = "gemini-2.5-flash";

  let prompt = "";
  if (category === "love") {
    prompt = `The user lists these things they love: ${currentItems.join(", ")}. Suggest 5 more related concepts, hobbies, or fields they might enjoy. Return only a JSON array of strings.`;
  } else if (category === "goodAt") {
    prompt = `The user loves: ${context?.love.join(", ")}. The user is good at: ${currentItems.join(", ")}. Suggest 5 more skills they might possess or could easily develop. Return only a JSON array of strings.`;
  } else if (category === "worldNeeds") {
    prompt = `Based on current global trends, suggest 5 problems or needs the world has right now that relate to: ${context?.love.join(", ")} and skills: ${context?.goodAt.join(", ")}. Return only a JSON array of strings.`;
  } else {
    prompt = `Based on skills: ${context?.goodAt.join(", ")} and market needs: ${context?.worldNeeds.join(", ")}, suggest 5 specific roles, business models, or services people will pay for. Return only a JSON array of strings.`;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching suggestions", error);
    return [];
  }
};

// --- FALLBACK ANALYSIS (No Search, Strict JSON) ---
const generateFallbackAnalysis = async (data: IkigaiState): Promise<IkigaiResult> => {
  const ai = getAI();
  const model = "gemini-2.5-flash"; 

  const prompt = `
    You are an expert Career Strategist. Generate a structured Ikigai report with deep market validation.
    
    User Profile:
    Love: ${data.love.join(", ")}
    Good At: ${data.goodAt.join(", ")}
    Needs: ${data.worldNeeds.join(", ")}
    Paid: ${data.paidFor.join(", ")}

    Return a JSON object exactly matching this schema. Do not use Markdown.
    {
      "statement": "string",
      "description": "string",
      "intersectionPoints": {
        "passion": "string",
        "mission": "string",
        "profession": "string",
        "vocation": "string"
      },
      "marketIdeas": [
        {
          "title": "string",
          "description": "string",
          "score": { "total": 90, "passion": 9, "talent": 9, "demand": 9, "profit": 9 },
          "validation": {
            "whyNow": "string",
            "marketGap": "string",
            "revenuePotential": "$$$",
            "signals": [ { "type": "trend", "value": "string", "description": "string" } ],
            "community": [ { "platform": "Reddit", "count": "10k members", "description": "r/example", "score": 8 } ]
          },
          "blueprint": {
             "role": "string",
             "whyYou": "string",
             "dayInLife": "string",
             "mvpStep": "string",
             "executionPlan": ["Step 1", "Step 2", "Step 3"]
          },
          "launchpad": [ { "label": "string", "tool": "string", "prompt": "string" } ]
        }
      ],
      "roadmap": [
        { "phase": "string", "action": "string", "details": "string" }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  if (!response.text) throw new Error("Fallback analysis failed");
  const parsed = JSON.parse(response.text);

  return {
    statement: parsed.statement,
    description: parsed.description,
    intersectionPoints: parsed.intersectionPoints,
    roadmap: parsed.roadmap || [],
    marketIdeas: parsed.marketIdeas || [],
    sources: []
  };
};

// --- MAIN ANALYSIS (Pro Model + Search) ---
export const generateIkigaiAnalysis = async (data: IkigaiState): Promise<IkigaiResult> => {
  const ai = getAI();
  const model = "gemini-3-pro-preview";

  const prompt = `
    You are an expert Career Strategist and Market Analyst. Your goal is to find the user's Ikigai AND validate it with deep market data, similar to "IdeaBrowser".

    User Profile:
    1. LOVE: ${data.love.join(", ")}
    2. GOOD AT: ${data.goodAt.join(", ")}
    3. WORLD NEEDS: ${data.worldNeeds.join(", ")}
    4. PAID FOR: ${data.paidFor.join(", ")}

    TASK:
    1. Synthesize a core Ikigai Profile.
    2. **CRITICAL:** Use Google Search to find REAL-WORLD market data to generate 3 specific "Market Opportunities" (Jobs or Businesses).
    3. For each Opportunity, you MUST find:
       - **Why Now:** Specific trends, laws, or tech shifts (e.g. "AI Regulation").
       - **Community Signals:** Find specific Reddit communities, FB groups, or YouTube channels and their member counts.
       - **Market Gap:** Why existing solutions/roles are failing.
       - **Revenue Potential:** Estimated income/revenue range.
    4. Provide an Execution Plan (3-step list).

    **IMPORTANT OUTPUT RULES:**
    - Return ONLY the raw JSON object. 
    - Do NOT wrap in \`\`\`json markdown blocks.
    - Ensure valid JSON syntax.

    OUTPUT JSON STRUCTURE:
    {
      "statement": "Inspiring 1-sentence Ikigai statement.",
      "description": "Why this fits them.",
      "intersectionPoints": {
        "passion": "Intersection of Love & Good At",
        "mission": "Intersection of Love & World Needs",
        "profession": "Intersection of Good At & Paid For",
        "vocation": "Intersection of World Needs & Paid For"
      },
      "marketIdeas": [
        { 
          "title": "Specific Role/Business Name", 
          "description": "Brief pitch.",
          "score": {
            "total": 92,
            "passion": 9,
            "talent": 8,
            "demand": 9,
            "profit": 8
          },
          "validation": {
            "whyNow": "Detailed explanation of market timing and urgency.",
            "marketGap": "Description of the unmet need in the market.",
            "revenuePotential": "e.g. $5k-$10k MRR or $120k Salary",
            "signals": [
              { "type": "trend", "value": "Up 40%", "description": "Search interest in past 12mo" }
            ],
            "community": [
               { "platform": "Reddit", "count": "150k members", "description": "r/SpecializedTopic", "score": 9 },
               { "platform": "YouTube", "count": "2M views", "description": "Trending tutorials", "score": 8 }
            ]
          },
          "blueprint": {
            "role": "Formal Title",
            "whyYou": "Connection to user input",
            "dayInLife": "A sentence about the daily routine",
            "mvpStep": "The absolute first tiny step to take today",
            "executionPlan": [
               "Step 1: Specific action...",
               "Step 2: Specific action...",
               "Step 3: Specific action..."
            ]
          },
          "launchpad": [
             { "label": "Generate Resume", "tool": "ChatGPT", "prompt": "Write a resume for [Role] emphasizing my skills..." }
          ]
        }
      ],
      "roadmap": [
        { "phase": "Phase 1: Discovery", "action": "Short title", "details": "Specific step" }
      ]
    }
  `;

  const attemptAnalysis = async (retries = 1): Promise<IkigaiResult> => {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Analysis Timed Out")), 90000)
      );

      const generationPromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const response = await Promise.race([generationPromise, timeoutPromise]) as any;
      const text = response.text;
      
      if (!text) throw new Error("No text response from Pro model");

      let cleanedText = text.replace(/```json\n?|```/g, "").trim();
      const startIdx = cleanedText.indexOf('{');
      const endIdx = cleanedText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        cleanedText = cleanedText.substring(startIdx, endIdx + 1);
      }

      let parsed: any;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (e) {
        throw new Error("JSON Parse Error");
      }

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => {
          const web = chunk.web;
          return web ? { title: web.title, uri: web.uri } : null;
        })
        .filter((item: any) => item !== null) as { title: string; uri: string }[] || [];

      return {
        statement: parsed.statement || "Your Ikigai",
        description: parsed.description || "Description unavailable",
        intersectionPoints: {
          passion: parsed.intersectionPoints?.passion || "N/A",
          mission: parsed.intersectionPoints?.mission || "N/A",
          profession: parsed.intersectionPoints?.profession || "N/A",
          vocation: parsed.intersectionPoints?.vocation || "N/A",
        },
        roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap : [],
        marketIdeas: Array.isArray(parsed.marketIdeas) ? parsed.marketIdeas : [],
        sources
      };
    } catch (err) {
      if (retries > 0) {
        console.warn(`Analysis failed. Retrying... (${retries} attempts left)`);
        return attemptAnalysis(retries - 1);
      }
      throw err;
    }
  };

  try {
    return await attemptAnalysis();
  } catch (err) {
    console.warn("Pro Analysis Failed after retries. Falling back to Flash.", err);
    return await generateFallbackAnalysis(data);
  }
};

export const chatWithCopilot = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  ikigaiContext: IkigaiResult,
  rawInput: IkigaiState,
  userName?: string
): Promise<string> => {
  const ai = getAI();
  const model = "gemini-2.5-flash"; 

  const systemInstruction = `You are a specialized Ikigai Co-pilot${userName ? ` for ${userName}` : ''}. 
  
  **USER CONTEXT:**
  - LOVES: ${rawInput.love.join(", ")}
  - SKILLS: ${rawInput.goodAt.join(", ")}
  - WORLD NEEDS: ${rawInput.worldNeeds.join(", ")}
  - PAID FOR: ${rawInput.paidFor.join(", ")}

  **ANALYSIS RESULT:**
  - Core Ikigai: "${ikigaiContext.statement}"
  - Market Opportunities: ${JSON.stringify(ikigaiContext.marketIdeas)}
  
  **MISSION:**
  Help them execute this plan. Be encouraging, practical, and strategic.
  `;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
    history: history,
  });

  const result = await chat.sendMessage({ message });
  return result.text || "I'm not sure how to respond to that.";
};
