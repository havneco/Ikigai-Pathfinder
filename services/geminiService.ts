
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
      // 2. Fallback: Surgical Extraction
      console.warn("Standard JSON parse failed, attempting surgical extraction:", e);

      // Find the absolute first '{'
      const start = rawText.indexOf('{');
      if (start === -1) throw new Error("No JSON object found in response");

      // Iterate forward to find the matching '}'
      let openBraces = 0;
      let inString = false;
      let escaped = false;

      for (let i = start; i < rawText.length; i++) {
        const char = rawText[i];

        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === '\\') {
          escaped = true;
          continue;
        }

        if (char === '"' && !escaped) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') {
            openBraces++;
          } else if (char === '}') {
            openBraces--;
            if (openBraces === 0) {
              // Found the end of the first object
              const potentialJson = rawText.substring(start, i + 1);
              try {
                return JSON.parse(potentialJson);
              } catch (parseError) {
                console.error("Surgical extraction found candidate but failed parse:", parseError);
                // If this specific surgical extraction failed, we might have bad characters *inside*
                // But we won't give up? No, usually this means the JSON is internally broken.
                // We can try to continue searching? Likely futile if the first object is broken.
                break;
              }
            }
          }
        }
      }

      // If surgical failed, try the brute-force rewind as a last resort on the whole string
      console.warn("Surgical extraction failed, attempting Brute Force Rewind as Hail Mary...");
      for (let i = 0; i < 500; i++) {
        try {
          const sub = rawText.substring(start, rawText.length - i);
          return JSON.parse(sub);
        } catch (ignore) { }
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
