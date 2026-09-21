import { LiftLog } from '../types';

// liftLogs is append-only (one entry per logged set), so "current" values are
// whichever entry for that day+lift has the latest loggedAt.
export function latestLift(liftLogs: LiftLog[], day: string, lift: string): LiftLog | undefined {
  return liftLogs
    .filter((l) => l.dayName === day && l.liftName === lift)
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())[0];
}

export function liftHistory(liftLogs: LiftLog[], day: string, lift: string): LiftLog[] {
  return liftLogs
    .filter((l) => l.dayName === day && l.liftName === lift)
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
}
