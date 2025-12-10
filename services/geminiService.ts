
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
    return await response.json();
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
