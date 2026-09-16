import { Profile, SnapLog, LiftLog } from '../types';
import { latestLift } from '../lib/liftHistory';

// Rule-based coach reply, ported from the original prototype. Kept as a pure
// function of (message, athlete data) so swapping this out for a real Claude
// API call later is a one-file change — see README.md "Turning on the real AI coach".
export function generateCoachReply(
  userText: string,
  profile: Profile,
  recentLogs: SnapLog[],
  liftLogs: LiftLog[]
): string {
  const lower = userText.toLowerCase();
  const firstName = profile.name.split(' ')[0] || 'there';

  if (lower.includes('weight') || lower.includes('squat') || lower.includes('lift')) {
    const lastSquat = latestLift(liftLogs, 'Wednesday', 'Back Squat') ?? { weight: '285', reps: '5' };
    const nextWeight = (parseInt(lastSquat.weight ?? '285', 10) || 285) + 5;
    return `${firstName}, your Back Squat is at ${lastSquat.weight} lbs for ${lastSquat.reps} reps. If you hit all sets next session, we will bump to ${nextWeight} lbs. Trust the progression.`;
  }

  if (lower.includes('spiral') || lower.includes('wobble') || lower.includes('tight')) {
    const recent = recentLogs.slice(-5);
    const tight = recent.filter((l) => l.spiral === 'Tight').length;
    if (tight >= 3) {
      return `Your spiral consistency is trending up — ${tight} of your last 5 reps at 14–15 YD were Tight. The follow-through work is paying off.`;
    }
    return 'I see some inconsistency in your recent 14–15 YD reps. Let us revisit the Follow-Through Extension drill before your next session. Film one rep slow-motion so we can check hip rotation.';
  }

  if (lower.includes('drill') || lower.includes('fix') || lower.includes('help')) {
    if (profile.flaws.length > 0) {
      return `Based on your profile flaws (${profile.flaws.join(', ')}), I recommend starting with the Hip Rotation Drill and Follow-Through Extension. Do 2 slow reps of each before every snap day.`;
    }
    return 'Let us diagnose. Film a 14–15 YD rep and tell me what feels off — I will match it to a drill.';
  }

  if (lower.includes('recruit') || lower.includes('camp') || lower.includes('coach') || lower.includes('film')) {
    return 'For recruiting, your film should lead with 3 consecutive tight spirals at 14–15 YD under 0.75s. Check the Learn section for "Making Film Clips That Get Watched." Coaches want to see consistency first, speed second.';
  }

  if (lower.includes('streak') || lower.includes('motivation')) {
    return `You are on a ${profile.streak}-day streak. That discipline compounds — not just physically, but mentally. Show up again tomorrow. The work is the reward.`;
  }

  return `Got it, ${firstName}. I am tracking that. Keep logging your sessions and I will spot patterns across your block. Consistency over intensity — that is how you get recruited.`;
}

export const initialCoachMessage =
  'Hey! Log a few snap sessions and tell me what feels off in your reps — I\'ll match it to a drill and start spotting patterns across your block.';
