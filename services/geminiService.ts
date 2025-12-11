
import { IkigaiState, IkigaiResult } from "../types";

// --- API PROXY METHODS ---

export const getSuggestions = async (
  category: "love" | "goodAt" | "worldNeeds" | "paidFor",
  currentItems: string[],
  context?: IkigaiState
): Promise<string[]> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'suggestions',
        ikigaiData: { category, currentItems, context }
      })
    });

    if (!response.ok) throw new Error("Failed to fetch suggestions");
    return await response.json();
  } catch (error) {
    console.error("Error fetching suggestions", error);
    return [];
  }
};

export const generateStructure = async (data: IkigaiState): Promise<Partial<IkigaiResult>> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'analysis_structure', ikigaiData: data })
    });
    if (!response.ok) throw new Error("Failed to fetch structure");
    return await response.json();
  } catch (error) {
    console.error("Error generating structure", error);
    return { statement: "Analysis Pending...", description: "AI is thinking...", roadmap: [] };
  }
};

export const generateIdeaTitles = async (data: IkigaiState): Promise<Partial<IkigaiResult>> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'analysis_ideas_core', ikigaiData: data })
    });
    if (!response.ok) throw new Error("Failed to fetch ideas");
    return await response.json();
  } catch (error) {
    console.error("Error generating ideas", error);
    return { marketIdeas: [] };
  }
};

export const enrichIdea = async (idea: any, ikigaiData: IkigaiState): Promise<any> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'analysis_enrich',
        ikigaiData: { ...ikigaiData, idea }
      })
    });

    if (!response.ok) throw new Error("Failed to enrich idea");

    // SAFE PARSING: Handle potential markdown/garbage from server
    const rawText = await response.text();
    try {
      // 1. Try normal parse
      return JSON.parse(rawText);
    } catch (e) {
      // 2. Fallback: Manually extract JSON object
      console.warn("Standard JSON parse failed, attempting extraction:", e);
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        let cleanText = rawText.substring(start, end + 1);
        try {
          return JSON.parse(cleanText);
        } catch (e2) {
          console.warn("Bounds extraction failed, attempting Brute Force Rewind...");
          // Strategy B: Brute Force Rewind
          // Try removing chars from the end one by one (up to 500 chars)
          for (let i = 0; i < 500; i++) {
            try {
              const sub = cleanText.substring(0, cleanText.length - i);
              return JSON.parse(sub);
            } catch (ignore) { }
          }
        }
      }
      throw new Error("Could not extract valid JSON");
    }
  } catch (error) {
    console.error("Error enriching idea", error);
    return null; // Return null on failure so UI can handle it gracefully
  }
};

export const chatWithCopilot = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  ikigaiContext: IkigaiResult,
  rawInput: IkigaiState,
  userName?: string
): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message, ikigaiContext, rawInput, userName })
    });

    const data = await response.json();
    return data.text || "No response received.";
  } catch (e) {
    return "I am having trouble connecting to the server.";
  }
};
