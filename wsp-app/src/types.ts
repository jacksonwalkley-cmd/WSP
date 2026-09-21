export type Profile = {
  name: string;
  height: string;
  weight: string;
  photoUri: string | null;
  strengths: string[];
  flaws: string[];
  theme: string;
  streak: number;
  currentBlock: number;
  currentWeek: number;
  snapDayCount: number;
  created: boolean;
};

export type SnapLog = {
  id: string;
  loggedAt: string;
  stage: number;
  distance: string;
  rep: number;
  spiral: string | null;
  timeSeconds: number | null;
  videoUri: string | null;
};

export type LiftLog = {
  id: string;
  dayName: string;
  liftName: string;
  weight: string | null;
  reps: string | null;
  loggedAt: string;
};

export type Recovery = {
  sleep: number;
  soreness: number;
  energy: number;
  mood: number;
  notes: string;
  loggedAt: string;
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
};

// In-progress rep data while a Log Snap session is being filled out,
// before it's committed to the logs array.
export type DraftRep = {
  spiral?: 'Wobble' | 'Tight' | 'Flat';
  time?: string;
  videoUri?: string;
};
