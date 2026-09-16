import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, SnapLog, LiftLog, Recovery, ChatMessage, DraftRep } from '../types';
import { stages } from '../data/content';
import { palette } from '../theme';
import { generateCoachReply, initialCoachMessage } from '../coach/replyEngine';

const STORAGE_KEY = 'wsp_state_v1';

type StoredState = {
  profile: Profile;
  logs: SnapLog[];
  liftLogs: LiftLog[];
  recovery: Recovery | null;
  chat: ChatMessage[];
};

const defaultProfile: Profile = {
  name: '',
  height: '',
  weight: '',
  photoUri: null,
  strengths: [],
  flaws: [],
  theme: palette.accent,
  streak: 0,
  currentBlock: 1,
  currentWeek: 1,
  snapDayCount: 1,
  created: false,
};

function makeDefaultState(): StoredState {
  return {
    profile: { ...defaultProfile },
    logs: [],
    liftLogs: [],
    recovery: null,
    chat: [{ id: 'seed', sender: 'ai', text: initialCoachMessage, createdAt: new Date().toISOString() }],
  };
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type AppContextValue = {
  loading: boolean;
  profile: Profile;
  logs: SnapLog[];
  liftLogs: LiftLog[];
  recovery: Recovery | null;
  chat: ChatMessage[];
  saveOnboardingProfile: (fields: Partial<Profile>) => void;
  updateProfile: (fields: Partial<Profile>) => void;
  addTag: (kind: 'strengths' | 'flaws', tag: string) => void;
  removeTag: (kind: 'strengths' | 'flaws', tag: string) => void;
  setThemeColor: (color: string) => void;
  commitSnapStage: (stageIdx: number, reps: DraftRep[]) => void;
  finishSession: () => void;
  logLift: (day: string, lift: string, weight: string, reps: string) => void;
  saveRecovery: (r: Omit<Recovery, 'loggedAt'>) => void;
  sendChatMessage: (text: string) => void;
  resetTrainingData: () => void;
  resetEverything: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(makeDefaultState());
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as StoredState;
            setState({ ...makeDefaultState(), ...parsed, profile: { ...defaultProfile, ...parsed.profile } });
          } catch {
            // corrupted local state — fall back to defaults rather than crash
          }
        }
      })
      .finally(() => {
        loaded.current = true;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const updateProfile = useCallback((fields: Partial<Profile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...fields } }));
  }, []);

  const saveOnboardingProfile = useCallback((fields: Partial<Profile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...fields, created: true } }));
  }, []);

  const addTag = useCallback((kind: 'strengths' | 'flaws', tag: string) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, [kind]: Array.from(new Set([...prev.profile[kind], tag])) },
    }));
  }, []);

  const removeTag = useCallback((kind: 'strengths' | 'flaws', tag: string) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, [kind]: prev.profile[kind].filter((t) => t !== tag) },
    }));
  }, []);

  const setThemeColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, theme: color } }));
  }, []);

  const commitSnapStage = useCallback((stageIdx: number, reps: DraftRep[]) => {
    const stage = stages[stageIdx];
    const rows: SnapLog[] = [];
    reps.forEach((r, i) => {
      if (!r || (!r.spiral && !r.videoUri && !r.time)) return;
      rows.push({
        id: newId(),
        loggedAt: new Date().toISOString(),
        stage: stageIdx,
        distance: stage.dist,
        rep: i + 1,
        spiral: r.spiral ?? null,
        timeSeconds: r.time ? parseFloat(r.time) : null,
        videoUri: r.videoUri ?? null,
      });
    });
    if (rows.length > 0) setState((prev) => ({ ...prev, logs: [...prev.logs, ...rows] }));
  }, []);

  const finishSession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        snapDayCount: Math.min(prev.profile.snapDayCount + 1, 3),
        streak: prev.profile.streak + 1,
      },
    }));
  }, []);

  const logLift = useCallback((day: string, lift: string, weight: string, reps: string) => {
    const row: LiftLog = { id: newId(), dayName: day, liftName: lift, weight, reps, loggedAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, liftLogs: [...prev.liftLogs, row] }));
  }, []);

  const saveRecovery = useCallback((r: Omit<Recovery, 'loggedAt'>) => {
    setState((prev) => ({ ...prev, recovery: { ...r, loggedAt: new Date().toISOString() } }));
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    setState((prev) => {
      const userMsg: ChatMessage = { id: newId(), sender: 'user', text, createdAt: new Date().toISOString() };
      const reply = generateCoachReply(text, prev.profile, prev.logs, prev.liftLogs);
      const aiMsg: ChatMessage = { id: newId(), sender: 'ai', text: reply, createdAt: new Date().toISOString() };
      return { ...prev, chat: [...prev.chat, userMsg, aiMsg] };
    });
  }, []);

  const resetTrainingData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, streak: 0, snapDayCount: 1 },
      logs: [],
      liftLogs: [],
      recovery: null,
      chat: [{ id: newId(), sender: 'ai', text: initialCoachMessage, createdAt: new Date().toISOString() }],
    }));
  }, []);

  const resetEverything = useCallback(() => {
    const fresh = makeDefaultState();
    setState(fresh);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)).catch(() => {});
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      loading,
      profile: state.profile,
      logs: state.logs,
      liftLogs: state.liftLogs,
      recovery: state.recovery,
      chat: state.chat,
      saveOnboardingProfile,
      updateProfile,
      addTag,
      removeTag,
      setThemeColor,
      commitSnapStage,
      finishSession,
      logLift,
      saveRecovery,
      sendChatMessage,
      resetTrainingData,
      resetEverything,
    }),
    [
      loading,
      state,
      saveOnboardingProfile,
      updateProfile,
      addTag,
      removeTag,
      setThemeColor,
      commitSnapStage,
      finishSession,
      logLift,
      saveRecovery,
      sendChatMessage,
      resetTrainingData,
      resetEverything,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
