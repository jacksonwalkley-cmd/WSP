import { Profile, SnapLog, Recovery } from '../types';

export function coachHomeNote(profile: Profile, recentLogs: SnapLog[], recovery: Recovery | null): string {
  const recent = recentLogs.slice(-3);
  const tightCount = recent.filter((l) => l.spiral === 'Tight').length;

  let note =
    'Your 14–15 YD spiral has been tight three sessions in a row. That follow-through fix is sticking — keep driving through.';
  if (tightCount === 0 && recent.length > 0) {
    note = "Your last few sessions show wobble at distance. Let's revisit the follow-through drill before your next snap day.";
  } else if (profile.flaws.includes('Spiral Wobble') && tightCount >= 2) {
    note = 'Spiral wobble is clearing up. The hip rotation work is showing in your 14–15 YD reps. Keep it consistent.';
  }

  if (recovery) {
    if (recovery.soreness >= 8) {
      note = 'Your soreness is high today. Drop the accessory work, do the main lift only, and spend 10 extra minutes on hip mobility.';
    } else if (recovery.sleep <= 4) {
      note = 'Sleep was rough last night. Keep the weight the same — do not chase PRs today. Focus on bar speed and call it after your main sets.';
    } else if (recovery.energy <= 4) {
      note = 'Energy is low. This is a grind day — lower the volume by one set across all lifts and prioritize the snap warmup.';
    } else if (recovery.soreness <= 3 && recovery.energy >= 8 && recovery.sleep >= 8) {
      note = 'You are recovered and ready. Today is a good day to push for a weight PR or extra snap reps at 14–15 YD.';
    }
  }

  return note;
}

export function recoveryStatusLabel(recovery: Recovery | null): string {
  if (!recovery) return 'No check-in yet today — tap to log how you feel.';
  const avg = Math.round((recovery.sleep + recovery.energy + recovery.mood + (10 - recovery.soreness)) / 4);
  let status = 'Ready to work';
  if (avg >= 8) status = 'Fully recovered — push day';
  else if (avg >= 6) status = 'Good to go';
  else if (avg >= 4) status = 'Moderate — watch volume';
  else status = 'Low recovery — take it easy';
  return `${status} (${avg}/10)`;
}
