
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Server Missing API Key");
  return new GoogleGenAI({ apiKey });
};

export default async function handler(req: Request) {
  // Helper to clean JSON string
  const cleanJsonString = (str: string) => {
    if (!str) return "{}";
    let text = String(str);
    // Remove markdown code blocks
    const markdownStart = text.match(/^\s*```(?:json)?\s*/i);
    if (markdownStart) text = text.replace(/^\s*```(?:json)?\s*/i, "");
    const markdownEnd = text.match(/\s*```\s*$/);
    if (markdownEnd) text = text.replace(/\s*```\s*$/, "");

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return text.trim();

    let cleaning = text.substring(start, end + 1);
    cleaning = cleaning.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

    const openCount = (cleaning.match(/{/g) || []).length;
    const closeCount = (cleaning.match(/}/g) || []).length;
    if (openCount > closeCount) cleaning += "}".repeat(openCount - closeCount);

    return cleaning;
  };

  if (req.method !== 'POST') {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { ikigaiData, type } = await req.json();
    const ai = getAI();

    // 1. SUGGESTIONS MODE
    if (type === 'suggestions') {
      const { category, currentItems, context } = ikigaiData;
      // Reusing prompt logic from service
      const model = "gemini-2.0-flash-exp";
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

      const response = await ai.models.generateContent({
        model, contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
      });
      return new Response(JSON.stringify(JSON.parse(response.text || "[]")), { headers: { 'Content-Type': 'application/json' } });
    }

    // 2a. STRUCTURE MODE (Instant, Header Data)
    if (type === 'analysis_structure') {
      const prompt = `
  CONTEXT:
  1. "love": ${JSON.stringify(ikigaiData.love)}
  2. "goodAt": ${JSON.stringify(ikigaiData.goodAt)}
  3. "worldNeeds": ${JSON.stringify(ikigaiData.worldNeeds)}
  4. "paidFor": ${JSON.stringify(ikigaiData.paidFor)}

  Generate the HIGH-LEVEL STRATEGY for the "Ikigai Pathfinder".
  
  OUTPUT FORMAT (JSON ONLY):
  {
    "statement": "1-sentence 'I help X do Y' statement.",
    "description": "2-sentence why fit.",
    "intersectionPoints": { "passion": "...", "mission": "...", "profession": "...", "vocation": "..." }
  }

  RULES:
  - Model: gemini-2.0-flash-exp.
  - NO MARKDOWN.
  `;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const cleanedText = cleanJsonString(response.text || "{}");
      return new Response(cleanedText, { headers: { 'Content-Type': 'application/json' } });
    }

    // 2b. IDEAS MODE (Core Titles)
    if (type === 'analysis_ideas_core') {
      const prompt = `
  CONTEXT:
  1. "love": ${JSON.stringify(ikigaiData.love)}
  2. "goodAt": ${JSON.stringify(ikigaiData.goodAt)}
  3. "worldNeeds": ${JSON.stringify(ikigaiData.worldNeeds)}
  4. "paidFor": ${JSON.stringify(ikigaiData.paidFor)}

  Generate 3 BUSINESS IDEAS based on this Ikigai.

  OUTPUT FORMAT (JSON ONLY):
  {
    "marketIdeas": [
      {
        "title": "Niche Title",
        "description": "2-sentence pitch.",
        "score": { "total": 85, "passion": 8, "talent": 9, "demand": 8, "profit": 9 },
        "revenuePotential": "$Xk/mo",
        "whyNow": "Brief trend."
      }
    ]
  }

  RULES:
  - Generate 3 Ideas.
  - OMIT 'validation', 'blueprint', and 'launchpad' (fetched later).
  - NO MARKDOWN.
  `;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const cleanedText = cleanJsonString(response.text || "{}");
      return new Response(cleanedText, { headers: { 'Content-Type': 'application/json' } });
    }

    // 3. ENRICH MODE (Deep, Per Idea)
    if (type === 'analysis_enrich') {
      const { idea } = ikigaiData; // Passed from frontend loop
      const prompt = `
      Analyze this specific business idea:
      TITLE: ${idea.title}
      DESC: ${idea.description}

      Generate the DEEP DATA (Validation, Blueprint, Launchpad).
      Use Google Search if needed to find REAL signals.

      OUTPUT FORMAT (JSON ONLY):
      {
        "validation": {
          "whyNow": "Detailed timing analysis.",
          "marketGap": "The missing piece.",
          "signals": [
            { "source": "Reddit", "context": "r/saas", "signal": "Specific complaint", "sentiment": "Negative" },
            { "source": "Google Trends", "context": "Keyword", "signal": "Rising trend", "sentiment": "Positive" }
          ],
          "community": [ { "platform": "Reddit", "count": "10k", "description": "r/niche", "score": 9 } ],
          "revenuePotential": "Detailed calculation"
        },
        "blueprint": {
          "role": "Founder Role",
          "whyYou": "Fit check",
          "dayInLife": "Routine",
          "theWedge": "The specific $50-$500 first transaction/service.",
          "valueLadder": { "leadMagnet": "...", "frontendOffer": "...", "coreOffer": "..." },
          "executionPlan": ["Step 1", "Step 2", "Step 3"]
        },
        "launchpad": [
           { "label": "Analyze Competitors", "tool": "Perplexity", "prompt": "..." }
        ]
      }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }] // Tools ENABLED for this step
        }
      });

      const cleanedText = cleanJsonString(response.text || "{}");
      return new Response(cleanedText, { headers: { 'Content-Type': 'application/json' } });
    }

    // The original parsing logic for 'analysis' is now removed
    // and cleanJsonString is hoisted.

    return new Response("Unknown Type", { status: 400 });

  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message,
      _version: "2.6-revert-2.0",
      tip: "Reverted to 2.0-flash-exp per user request. If timeout, plan upgrade needed."
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
