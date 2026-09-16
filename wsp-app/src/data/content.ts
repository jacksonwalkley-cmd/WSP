export type Stage = { dist: string; reps: number; time: boolean };

export const stages: Stage[] = [
  { dist: '10 YD', reps: 2, time: false },
  { dist: '12 YD', reps: 2, time: false },
  { dist: '14–15 YD', reps: 6, time: true },
];

export const warmups = ['Deep squat hold', 'Elephant walks', 'Knee sits', 'Squat jumps', '5 minute jog'];

export type WeekDay = {
  day: string;
  type: string;
  hasSnap: boolean;
  hasSprint: boolean;
  sprint?: string;
  lifts?: string[];
};

export const weekDays: WeekDay[] = [
  { day: 'Sunday', type: 'Rest', hasSnap: false, hasSprint: false },
  { day: 'Monday', type: 'Squat A + Acceleration + Snap', hasSnap: true, hasSprint: true, sprint: 'Accel', lifts: ['Back Squat', 'Front Squat', 'Leg Press', 'Calf Raise'] },
  { day: 'Tuesday', type: 'Push · Chest / Triceps / Shoulders', hasSnap: false, hasSprint: false, lifts: ['Bench Press', 'Incline DB Press', 'Overhead Press', 'Tricep Dip', 'Lateral Raise'] },
  { day: 'Wednesday', type: 'Squat B + Top Speed + Snap', hasSnap: true, hasSprint: true, sprint: 'Speed', lifts: ['Back Squat', 'Romanian Deadlift', 'Walking Lunge', 'Plank Hold'] },
  { day: 'Thursday', type: 'Pull · Back / Biceps / Forearms', hasSnap: false, hasSprint: false, lifts: ['Deadlift', 'Pull-Up', 'Barbell Row', 'Face Pull', 'Hammer Curl'] },
  { day: 'Friday', type: 'Upper + Snap Day', hasSnap: true, hasSprint: false, lifts: ['Bench Press', 'Row', 'Overhead Press', 'Pull-Up', 'Arm Circuit'] },
  { day: 'Saturday', type: 'Rest', hasSnap: false, hasSprint: false },
];

export const warmupsByDay: Record<string, string[]> = {
  'Squat A + Acceleration + Snap': ['Hip flexor stretch', 'Leg swings', 'Bodyweight squats', 'Empty bar ramp'],
  'Squat B + Top Speed + Snap': ['Hip flexor stretch', 'Leg swings', 'Bodyweight squats', 'Empty bar ramp'],
  'Push · Chest / Triceps / Shoulders': ['Band pull-aparts', 'Arm circles', 'Push-up ramp', 'Light DB press'],
  'Pull · Back / Biceps / Forearms': ['Dead hang', 'Scap pull', 'Light row', 'Forearm stretch'],
  'Upper + Snap Day': ['Band pull-aparts', 'Arm circles', 'Push-up ramp', 'Light DB press'],
};

export const drillData = [
  { title: 'Follow-Through Extension', duration: '2:30', category: 'Technique' },
  { title: 'Hip Rotation Drill', duration: '1:45', category: 'Power' },
  { title: 'Wrist Snap Drill', duration: '1:15', category: 'Speed' },
  { title: 'Balance Hold', duration: '2:00', category: 'Stability' },
];

export const compoundLifts = ['Back Squat', 'Bench Press', 'Deadlift', 'Front Squat', 'Overhead Press'];

export function suggestWeight(name: string, lastWeight?: string, lastReps?: string) {
  if (!lastWeight) return { target: '4×5', weight: '', reps: '' };
  const w = parseInt(lastWeight, 10);
  const r = parseInt(lastReps ?? '', 10);
  if (isNaN(w)) return { target: '4×5', weight: lastWeight, reps: lastReps ?? '' };
  const increment = compoundLifts.includes(name) ? 5 : 2.5;
  if (r >= 5) return { target: '4×5', weight: String(w + increment), reps: '5' };
  return { target: '4×5', weight: lastWeight, reps: lastReps ?? '' };
}

export type Article = { title: string; excerpt: string; meta: string; category: string };

export const articles: Article[] = [
  { category: 'Mentality', title: 'Playing After a Bad Snap', excerpt: 'The next rep starts fresh. How elite snappers reset mentally in under 10 seconds.', meta: '4 min read' },
  { category: 'Mentality', title: 'Building a Pregame Routine', excerpt: 'A repeatable sequence that locks in confidence before you step on the field.', meta: '6 min read' },
  { category: 'Mentality', title: 'Staying Confident After a Bad Rep', excerpt: 'One bad ball does not define a session. Mental reframes that actually work.', meta: '5 min read' },
  { category: 'Getting Recruited', title: 'Making Film Clips That Get Watched', excerpt: 'Coaches scroll fast. Front-load your best 3 snaps in the first 15 seconds.', meta: '5 min read' },
  { category: 'Getting Recruited', title: 'What Camps Are Worth Your Time', excerpt: 'Not all exposure events are equal. A breakdown of ROI by camp type.', meta: '7 min read' },
  { category: 'Getting Recruited', title: 'Talking to College Coaches', excerpt: 'What to say, what not to say, and when to reach out.', meta: '6 min read' },
  { category: 'Recovery & Injury Prevention', title: 'Sleep Is Part of Training', excerpt: 'If you are not getting 8+ hours, you are leaving strength on the table.', meta: '4 min read' },
  { category: 'Recovery & Injury Prevention', title: 'Common Long Snapper Injuries', excerpt: 'Lower back, hip flexor, and forearm issues — and how to avoid them.', meta: '8 min read' },
  { category: 'Weight Gain', title: 'Calorie Surplus 101', excerpt: 'How to eat enough without force-feeding. Practical guide for high school athletes.', meta: '6 min read' },
  { category: 'Weight Gain', title: 'Best Post-Workout Meals for Gains', excerpt: 'Protein + carb combos that are easy to pack and actually taste good.', meta: '5 min read' },
];
