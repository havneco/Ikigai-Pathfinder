
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'edge',
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
                  "score": { "total": 92, "passion": 9, "talent": 8, "demand": 9, "profit": 8 },
                  "validation": {
                    "whyNow": "Detailed explanation of market timing and urgency.",
                    "marketGap": "Description of the unmet need in the market.",
                    "revenuePotential": "e.g. $5k-$10k MRR or $120k Salary",
                    "signals": [ { "type": "trend", "value": "Up 40%", "description": "Search interest in past 12mo" } ],
                    "community": [ { "platform": "Reddit", "count": "150k members", "description": "r/SpecializedTopic", "score": 9 } ]
                  },
                  "blueprint": {
                    "role": "Formal Title",
                    "whyYou": "Connection to user input",
                    "dayInLife": "A sentence about the daily routine",
                    "mvpStep": "The absolute first tiny step to take today",
                    "executionPlan": ["Step 1...", "Step 2...", "Step 3..."]
                  },
                  "launchpad": [ { "label": "Generate Resume", "tool": "ChatGPT", "prompt": "Write a resume..." } ]
                }
              ],
              "roadmap": [ { "phase": "Phase 1: Discovery", "action": "Short title", "details": "Specific step" } ]
            }
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

      // STRICT JSON EXTRACTION
      // Find the first '{' and the last '}'
      const firstCurly = text.indexOf('{');
      const lastCurly = text.lastIndexOf('}');

      if (firstCurly === -1 || lastCurly === -1) {
        throw new Error("No JSON object found in response");
      }

      const cleanedText = text.substring(firstCurly, lastCurly + 1);

      return new Response(cleanedText, { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response("Unknown Type", { status: 400 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
