
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

export const generateIkigaiAnalysis = async (data: IkigaiState): Promise<IkigaiResult> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'analysis',
        ikigaiData: data
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText.substring(0, 100)}`);
    }
    const result = await response.json();

    // Normalize Result (ensure fields exist)
    return {
      statement: result.statement || "Your Ikigai",
      description: result.description || "Analysis generated.",
      intersectionPoints: result.intersectionPoints || {},
      marketIdeas: result.marketIdeas || [],
      roadmap: result.roadmap || [],
      sources: result.sources || []
    };
  } catch (error: any) {
    console.error("Error generating analysis", error);
    // Return empty fallback/error state
    return {
      statement: "Analysis Error",
      description: `Connection Failed: ${error.message || "Unknown error"}`,
      intersectionPoints: { passion: "", mission: "", profession: "", vocation: "" },
      marketIdeas: [], roadmap: [], sources: []
    }
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
