export type Profile = {
  id: string;
  name: string;
  height: string;
  weight: string;
  photo_url: string | null;
  strengths: string[];
  flaws: string[];
  theme: string;
  streak: number;
  current_block: number;
  current_week: number;
  snap_day_count: number;
};

export type SnapLog = {
  id: string;
  logged_at: string;
  stage: number;
  distance: string;
  rep: number;
  spiral: string | null;
  time_seconds: number | null;
  video_path: string | null;
};

export type LiftLog = {
  day_name: string;
  lift_name: string;
  weight: string | null;
  reps: string | null;
  logged_at: string;
};

export type Recovery = {
  sleep: number;
  soreness: number;
  energy: number;
  mood: number;
  notes: string;
  logged_at: string;
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: string;
};

// In-progress rep data while a Log Snap session is being filled out,
// before it's committed to snap_logs rows.
export type DraftRep = {
  spiral?: 'Wobble' | 'Tight' | 'Flat';
  time?: string;
  videoUri?: string;
};
