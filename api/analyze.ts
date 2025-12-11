
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

export default async function handler(req: any, res: any) {
  // Helper to clean JSON string
  // Helper to clean JSON string
  const cleanJsonString = (str: string) => {
    if (!str) return "{}";
    let text = String(str);

    // 1. Remove Markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "");

    // 2. Find first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1) return "{}"; // No JSON object found

    // 3. Extract purely the JSON part
    return text.substring(start, end + 1);
  };

  if (req.method !== 'POST') {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { ikigaiData, type } = req.body;
    const ai = getAI();

    // 1. SUGGESTIONS MODE
    if (type === 'suggestions') {
      const { category, currentItems, context } = ikigaiData;
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
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(JSON.parse(response.text || "[]")));
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
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(cleanedText);
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
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(cleanedText);
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

      RULES:
      1. RETURN ONLY VALID JSON. 
      2. ESCAPE ALL DOUBLE QUOTES INSIDE STRINGS (e.g. \"text with \\\"quotes\\\"\"). 
      3. NO MARKDOWN. NO COMMENTS.
      4. DO NOT APPEND TEXT AFTER THE JSON.
      `;


      // TIERED GENERATION STRATEGY
      // Attempt 1: Deep Search (High Latency)
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }]
          }
        });
        const cleanedText = cleanJsonString(response.text || "{}");
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(cleanedText);

      } catch (searchError) {
        console.warn("Deep Search Failed, falling back to Logical Inference:", searchError);

        // Attempt 2: Logical Inference (Low Latency)
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt + "\n\nNOTE: Search is unavailable. Generate best-effort realistic hypothetical data based on your knowledge of the industry.",
          config: {
            responseMimeType: "application/json"
            // NO TOOLS
          }
        });

        const cleanedText = cleanJsonString(fallbackResponse.text || "{}");
        res.setHeader('Content-Type', 'application/json');
        // Start with 200 OK so client uses this data
        return res.status(200).send(cleanedText);
      }
    }

    return res.status(400).send("Unknown Type");

  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: error.message,
      _version: "2.6-node-runtime",
      tip: "Check server logs."
    });
  }
}
