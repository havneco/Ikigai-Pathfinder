
import { GoogleGenAI } from "@google/genai";

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') return new Response("Method Not Allowed", { status: 405 });

    try {
        const { history, message, ikigaiContext, rawInput, userName } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing Server Key");
        const ai = new GoogleGenAI({ apiKey });

        const model = "gemini-2.0-flash-exp";

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
            config: { systemInstruction },
            history: history,
        });

        const result = await chat.sendMessage({ message });

        return new Response(JSON.stringify({ text: result.text }), { headers: { 'Content-Type': 'application/json' } });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
