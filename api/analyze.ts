
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
            # ROLE
            You are the "Ikigai Pathfinder," a decisive Career & Business Strategist. Your mission is to cure "Analysis Paralysis." You do not offer vague suggestions; you provide data-backed, validated directives.

            # CORE PHILOSOPHY
            1. **Data > Vibes:** Never suggest a path just because it "sounds nice." Suggest it because the market signals (trends, search volume) prove it is viable.
            2. **Niche > Generic:** Do not say "Become a Writer." Say "Become a Technical Ghostwriter for Fintech Founders." Specificity creates value.
            3. **Action > Theory:** Every piece of advice must end with a tool to execute it immediately.
            4. **Urgency is Key:** You must explain "Why Now?" (e.g., new regulations, emerging tech).

            User Profile:
            1. LOVE: ${data.love.join(", ")}
            2. GOOD AT: ${data.goodAt.join(", ")}
            3. WORLD NEEDS: ${data.worldNeeds.join(", ")}
            4. PAID FOR: ${data.paidFor.join(", ")}
        
            TASK:
            1. Synthesize a core Ikigai Profile.
            2. **CRITICAL:** Use Google Search to find REAL-WORLD market data to generate 3 specific "Market Opportunities".
            3. For each Opportunity, you MUST find:
               - **Why Now:** Specific trends/laws/tech shifts.
               - **Community Signals:** Specific subreddits/groups.
               - **Market Gap:** Why existing solutions fail.
               - **Revenue Potential:** Estimated income range.
            4. Provide an Execution Plan including "The Wedge" (smallest specific niche to start).

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
                  "title": "Specific, Niche Role/Business Name", 
                  "description": "Brief, decisive pitch.",
                  "score": { "total": 92, "passion": 9, "talent": 8, "demand": 9, "profit": 8 },
                  "validation": {
                    "whyNow": "Detailed explanation of market timing.",
                    "marketGap": "Description of the unmet need.",
                    "revenuePotential": "e.g. $5k-$10k MRR",
                    "signals": [ { "type": "trend", "value": "Up 40%", "description": "Search interest" } ],
                    "community": [ { "platform": "Reddit", "count": "150k members", "description": "r/SpecializedTopic", "score": 9 } ]
                  },
                  "blueprint": {
                    "role": "Formal Title",
                    "whyYou": "Connection to user input",
                    "dayInLife": "A sentence about the daily routine",
                    "mvpStep": " 'The Wedge': The smallest, specific niche they can start with to get a foothold.",
                    "valueLadder": {
                      "leadMagnet": "Free download/tool",
                      "frontendOffer": "Low ticket ($50) product",
                      "coreOffer": "Main subscription or high-ticket service"
                    },
                    "executionPlan": ["Day 1-10...", "Day 11-20...", "Day 21-30..."]
                  },
                  "launchpad": [ { "label": "Generate Asset", "tool": "ChatGPT", "prompt": "Act as a [Role]. Generate a [Asset] for [Niche]..." } ]
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
      console.log("Raw AI Response:", text); // Debug log

      // Helper to clean JSON string
      const cleanJsonString = (str: string) => {
        // 1. Remove markdown code blocks
        let cleaned = str.replace(/```json\s*|\s*```/g, "").trim();
        // 2. Find the first '{' and last '}'
        const firstCurly = cleaned.indexOf('{');
        const lastCurly = cleaned.lastIndexOf('}');
        if (firstCurly === -1 || lastCurly === -1) return "{}";
        cleaned = cleaned.substring(firstCurly, lastCurly + 1);

        // 3. Escape unescaped control characters (common source of "Bad escaped char")
        // This regex looks for backslashes that are NOT followed by specific valid escape chars
        // cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, "\\\\"); 
        // actually, simpler approach: Remove newlines inside strings if they break JSON, 
        // but often the issue is just a stray backslash.
        return cleaned;
      };

      const cleanedText = cleanJsonString(text);

      try {
        const parsed = JSON.parse(cleanedText);
        return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
      } catch (parseError) {
        console.error("JSON Parse 1 Failed:", parseError);
        // Fallback: Aggressive sanitization
        try {
          // Sometimes Gemini puts raw newlines in strings. Replace them.
          // Also fixes common "bad escape" like `C:\Path` becoming `C:Path` if not escaped
          const aggressiveClean = cleanedText
            .replace(/[\n\r]/g, "\\n") // Escape newlines
            .replace(/\\(?![\\"{}[\]])/g, "\\\\"); // Escape backslashes that aren't structural

          const parsed2 = JSON.parse(aggressiveClean);
          return new Response(JSON.stringify(parsed2), { headers: { 'Content-Type': 'application/json' } });
        } catch (e2) {
          console.error("JSON Parse 2 Failed:", e2);
          return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: text }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      }
    }

    return new Response("Unknown Type", { status: 400 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
