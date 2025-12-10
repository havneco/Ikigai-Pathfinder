
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

    // 2. FULL ANALYSIS MODE
    if (type === 'analysis') {
      const data = ikigaiData;
      const model = "gemini-2.5-flash"; // Using fast model for demo, or switch to pro-preview if defined

      const prompt = `
  CONTEXT:
  1. "love": ${JSON.stringify(ikigaiData.love)}
  2. "goodAt": ${JSON.stringify(ikigaiData.goodAt)}
  3. "worldNeeds": ${JSON.stringify(ikigaiData.worldNeeds)}
  4. "paidFor": ${JSON.stringify(ikigaiData.paidFor)}

  Generate a JSON analysis for the "Ikigai Pathfinder" persona.
  
  OUTPUT FORMAT (JSON ONLY, NO MARKDOWN):
  {
    "statement": "1-sentence 'I help X do Y' statement.",
    "description": "2-sentence why fit.",
    "intersectionPoints": {
       "passion": "Synthesis",
       "mission": "Synthesis",
       "profession": "Synthesis",
       "vocation": "Synthesis"
    },
    "marketIdeas": [
      {
        "title": "Niche Title",
        "description": "2-sentence pitch.",
        "score": 95,
        "revenuePotential": "$Xk/mo",
        "whyNow": "Market trend.",
        "validation": { 
            "signals": [ 
                { "source": "Reddit", "context": "r/saas", "signal": "Complaints about X", "sentiment": "Negative" },
                { "source": "Market", "context": "Google Trends", "signal": "+200% Search Vol", "sentiment": "Positive" }
            ],
            "whyNow": "Specific timing."
        },
        "valueLadder": {
           "leadMagnet": "Free tool",
           "frontendOffer": "Low-ticket",
           "coreOffer": "High-ticket"
        },
        "blueprint": {
            "theWedge": "THE ENTRY POINT. Do not describe a product. Describe the first transaction (e.g. 'Sell a $50 audit').",
            "launchpad": "System prompt."
        }
      }
    ],
    "roadmap": [
       { "phase": "Validation", "action": "First Sale", "details": "How." }
    ]
  }

  RULES:
  - Generate 3 Market Ideas.
  - BE DECISIVE. Data > Vibes.
  - "theWedge" MUST be a specific, tiny service/product to start THIS WEEKEND.
  - NO MARKDOWN (\`\`\`json). RAW JSON ONLY.
  `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        } // Force JSON
      });

      const text = response.text || "{}";
      console.log("Raw AI Response:", text); // Debug log

      // Helper to clean JSON string
      const cleanJsonString = (str: string) => {
        if (!str) return "{}";

        // 1. Convert to string and basic trim
        let text = String(str);

        // 2. Remove markdown code blocks if present (start and end)
        // Detect ```json or ``` at start
        const markdownStart = text.match(/^\s*```(?:json)?\s*/i);
        if (markdownStart) {
          text = text.replace(/^\s*```(?:json)?\s*/i, "");
        }
        // Detect trailing ``` 
        const markdownEnd = text.match(/\s*```\s*$/);
        if (markdownEnd) {
          text = text.replace(/\s*```\s*$/, "");
        }

        // 3. Find the FIRST '{' and LAST '}' to isolate the object strictly
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');

        if (start === -1 || end === -1) {
          // Fallback: If no braces found, return original (will likely fail parse but provides useful error)
          return text.trim();
        }

        let cleaning = text.substring(start, end + 1);

        // 4. Remove comments
        cleaning = cleaning.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

        // 5. Handle Truncation (Auto-close)
        const openCount = (cleaning.match(/{/g) || []).length;
        const closeCount = (cleaning.match(/}/g) || []).length;
        if (openCount > closeCount) {
          cleaning += "}".repeat(openCount - closeCount);
        }

        return cleaning;
      };



      const cleanedText = cleanJsonString(text);

      try {
        const parsed = JSON.parse(cleanedText);
        return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
      } catch (parseError) {
        console.error("JSON Parse 1 Failed:", parseError);
        // Fallback: Aggressive sanitization
        try {
          const aggressiveClean = cleanedText
            .replace(/\\(?![\\"{}[\]])/g, "\\\\");

          const parsed2 = JSON.parse(aggressiveClean);
          return new Response(JSON.stringify(parsed2), { headers: { 'Content-Type': 'application/json' } });
        } catch (e2) {
          return new Response(JSON.stringify({
            error: "Failed to parse AI response",
            raw: text,
            cleaned: cleanedText
          }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      }
    }

    return new Response("Unknown Type", { status: 400 });

  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message,
      _version: "2.4-fix-parsing",
      tip: "If you see this, the new parser is live but failing."
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
