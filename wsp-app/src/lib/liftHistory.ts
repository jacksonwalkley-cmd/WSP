import { LiftLog } from '../types';

// liftLogs is append-only (one row per logged set), so "current" values are
// whichever row for that day+lift has the latest logged_at.
export function latestLift(liftLogs: LiftLog[], day: string, lift: string): LiftLog | undefined {
  return liftLogs
    .filter((l) => l.day_name === day && l.lift_name === lift)
    .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())[0];
}

export function liftHistory(liftLogs: LiftLog[], day: string, lift: string): LiftLog[] {
  return liftLogs
    .filter((l) => l.day_name === day && l.lift_name === lift)
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
}
