
export interface IkigaiState {
  love: string[];
  goodAt: string[];
  worldNeeds: string[];
  paidFor: string[];
}

export interface User {
  name: string;
  email: string;
  photoUrl: string;
}

export enum Step {
  WELCOME = 'WELCOME',
  LOVE = 'LOVE',
  GOOD_AT = 'GOOD_AT',
  WORLD_NEEDS = 'WORLD_NEEDS',
  PAID_FOR = 'PAID_FOR',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS'
}

export interface SuggestionResponse {
  suggestions: string[];
  insight: string;
}

export interface MarketSignal {
  source: string; // e.g., "Reddit", "Glimpse", "Market Report"
  context: string; // e.g., "r/saas", "Search Volume"
  signal: string; // e.g., "Complaints about X", "+155% Growth"
  sentiment: "Positive" | "Negative" | "Neutral"; // For color coding
}

export interface LaunchpadAction {
  label: string;
  tool: string; // e.g. "ChatGPT", "Cursor", "LinkedIn"
  prompt: string;
}

export interface CommunitySignal {
  platform: 'Reddit' | 'Facebook' | 'YouTube' | 'Other';
  count: string; // e.g. "2.5M members"
  description: string; // e.g. "5 subreddits discussing this"
  score: number; // 1-10 intensity
}

export interface Score {
  total: number; // 0-100
  passion: number; // 0-10
  talent: number; // 0-10
  demand: number; // 0-10
  profit: number; // 0-10
  complexity: number; // 0-10
  explanations?: {
    demand: string;
    profit: string;
    talent: string;
    complexity: string;
  };
}

export interface ValidationData {
  whyNow: string;
  marketGap: string;
  signals: MarketSignal[];
  community: CommunitySignal[];
  competitors: { name: string; weakness: string; price: string; url?: string }[];
  revenuePotential: string; // "$$$" or "$1M-$5M ARR"
}

export interface MarketOpportunity {
  title: string;
  description: string;
  score: Score;
  validation?: ValidationData;
  blueprint?: {
    role: string;
    whyYou: string;
    dayInLife: string;
    theWedge: string; // Renamed from mvpStep to emphasize "Entry Point"
    valueLadder: {
      leadMagnet: string;
      frontendOffer: string;
      coreOffer: string;
    };
    executionPlan: string[]; // List of specific steps
  };
  launchpad?: LaunchpadAction[];
  analysisStatus?: string; // e.g. "Waiting...", "Analyzing...", "Deep Scan Complete"
}

export interface IkigaiResult {
  statement: string;
  description: string;
  intersectionPoints: {
    passion: string;
    mission: string;
    profession: string;
    vocation: string;
  };
  roadmap: Array<{
    phase: string;
    action: string;
    details: string;
  }>;
  marketIdeas: MarketOpportunity[];
  sources?: {
    title: string;
    uri: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  quadrant?: string;
  due_date?: string;
  ai_generated: boolean;
  created_at: string;
}

export interface UserUsage {
  user_id: string;
  chat_count: number;
  generation_count: number;
  cycle_start_date: string;
}
