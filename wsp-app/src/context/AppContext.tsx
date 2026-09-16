import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, SnapLog, LiftLog, Recovery, ChatMessage, DraftRep } from '../types';
import { stages } from '../data/content';
import { generateCoachReply, initialCoachMessage } from '../coach/replyEngine';

type AppState = {
  session: Session | null;
  authLoading: boolean;
  profile: Profile | null;
  logs: SnapLog[];
  liftLogs: LiftLog[];
  recovery: Recovery | null;
  chat: ChatMessage[];
  dataLoading: boolean;
};

type AppContextValue = AppState & {
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  saveOnboardingProfile: (fields: Partial<Profile>) => Promise<void>;
  updateProfile: (fields: Partial<Profile>) => Promise<void>;
  addTag: (kind: 'strengths' | 'flaws', tag: string) => Promise<void>;
  removeTag: (kind: 'strengths' | 'flaws', tag: string) => Promise<void>;
  setThemeColor: (color: string) => Promise<void>;
  commitSnapStage: (stageIdx: number, reps: DraftRep[]) => Promise<void>;
  finishSession: () => Promise<void>;
  logLift: (day: string, lift: string, weight: string, reps: string) => Promise<void>;
  saveRecovery: (r: Omit<Recovery, 'logged_at'>) => Promise<void>;
  sendChatMessage: (text: string) => Promise<void>;
  resetTrainingData: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  uploadMedia: (localUri: string, folder: string) => Promise<string | null>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<SnapLog[]>([]);
  const [liftLogs, setLiftLogs] = useState<LiftLog[]>([]);
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadAll = useCallback(async (userId: string) => {
    setDataLoading(true);
    const [profileRes, logsRes, liftRes, recoveryRes, chatRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('snap_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: true }),
      supabase.from('lift_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: true }),
      supabase.from('recovery_checkins').select('*').eq('user_id', userId).order('logged_at', { ascending: false }).limit(1),
      supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    ]);

    if (profileRes.data) setProfile(profileRes.data as Profile);
    if (logsRes.data) setLogs(logsRes.data as SnapLog[]);
    if (liftRes.data) setLiftLogs(liftRes.data as LiftLog[]);
    if (recoveryRes.data && recoveryRes.data.length > 0) {
      const r = recoveryRes.data[0];
      const isToday = new Date(r.logged_at).toDateString() === new Date().toDateString();
      setRecovery(isToday ? (r as Recovery) : null);
    } else {
      setRecovery(null);
    }
    if (chatRes.data) {
      if (chatRes.data.length === 0) {
        const { data: inserted } = await supabase
          .from('chat_messages')
          .insert({ user_id: userId, sender: 'ai', text: initialCoachMessage })
          .select()
          .single();
        setChat(inserted ? [inserted as ChatMessage] : []);
      } else {
        setChat(chatRes.data as ChatMessage[]);
      }
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      loadAll(session.user.id);
    } else {
      setProfile(null);
      setLogs([]);
      setLiftLogs([]);
      setRecovery(null);
      setChat([]);
    }
  }, [session?.user?.id, loadAll]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(
    async (fields: Partial<Profile>) => {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', session.user.id)
        .select()
        .single();
      if (!error && data) setProfile(data as Profile);
    },
    [session?.user?.id]
  );

  const saveOnboardingProfile = useCallback(
    async (fields: Partial<Profile>) => {
      await updateProfile(fields);
    },
    [updateProfile]
  );

  const addTag = useCallback(
    async (kind: 'strengths' | 'flaws', tag: string) => {
      if (!profile) return;
      const next = Array.from(new Set([...profile[kind], tag]));
      await updateProfile({ [kind]: next } as Partial<Profile>);
    },
    [profile, updateProfile]
  );

  const removeTag = useCallback(
    async (kind: 'strengths' | 'flaws', tag: string) => {
      if (!profile) return;
      const next = profile[kind].filter((t) => t !== tag);
      await updateProfile({ [kind]: next } as Partial<Profile>);
    },
    [profile, updateProfile]
  );

  const setThemeColor = useCallback(
    async (color: string) => {
      await updateProfile({ theme: color });
    },
    [updateProfile]
  );

  const uploadMedia = useCallback(
    async (localUri: string, folder: string): Promise<string | null> => {
      if (!session?.user?.id) return null;
      const ext = localUri.split('.').pop() ?? 'mp4';
      const path = `${session.user.id}/${folder}/${Date.now()}.${ext}`;
      const response = await fetch(localUri);
      const blob = await response.blob();
      const { error } = await supabase.storage.from('wsp-media').upload(path, blob, {
        contentType: blob.type || undefined,
        upsert: true,
      });
      if (error) {
        console.warn('upload failed', error.message);
        return null;
      }
      return path;
    },
    [session?.user?.id]
  );

  const commitSnapStage = useCallback(
    async (stageIdx: number, reps: DraftRep[]) => {
      if (!session?.user?.id) return;
      const stage = stages[stageIdx];
      const rows = [];
      for (let i = 0; i < reps.length; i++) {
        const r = reps[i];
        if (!r || (!r.spiral && !r.videoUri && !r.time)) continue;
        let videoPath: string | null = null;
        if (r.videoUri) {
          videoPath = await uploadMedia(r.videoUri, 'snaps');
        }
        rows.push({
          user_id: session.user.id,
          stage: stageIdx,
          distance: stage.dist,
          rep: i + 1,
          spiral: r.spiral ?? null,
          time_seconds: r.time ? parseFloat(r.time) : null,
          video_path: videoPath,
        });
      }
      if (rows.length > 0) {
        const { data } = await supabase.from('snap_logs').insert(rows).select();
        if (data) setLogs((prev) => [...prev, ...(data as SnapLog[])]);
      }
    },
    [session?.user?.id, uploadMedia]
  );

  const finishSession = useCallback(async () => {
    if (!profile) return;
    const nextCount = Math.min(profile.snap_day_count + 1, 3);
    await updateProfile({ snap_day_count: nextCount, streak: profile.streak + 1 });
  }, [profile, updateProfile]);

  const logLift = useCallback(
    async (day: string, lift: string, weight: string, reps: string) => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('lift_logs')
        .insert({ user_id: session.user.id, day_name: day, lift_name: lift, weight, reps, logged_at: new Date().toISOString() })
        .select()
        .single();
      if (data) setLiftLogs((prev) => [...prev, data as LiftLog]);
    },
    [session?.user?.id]
  );

  const saveRecovery = useCallback(
    async (r: Omit<Recovery, 'logged_at'>) => {
      if (!session?.user?.id) return;
      const row = { ...r, user_id: session.user.id, logged_at: new Date().toISOString() };
      const { data } = await supabase.from('recovery_checkins').insert(row).select().single();
      if (data) setRecovery(data as Recovery);
    },
    [session?.user?.id]
  );

  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!session?.user?.id || !profile) return;
      const { data: userMsg } = await supabase
        .from('chat_messages')
        .insert({ user_id: session.user.id, sender: 'user', text })
        .select()
        .single();
      if (userMsg) setChat((prev) => [...prev, userMsg as ChatMessage]);

      const reply = generateCoachReply(text, profile, logs, liftLogs);
      const { data: aiMsg } = await supabase
        .from('chat_messages')
        .insert({ user_id: session.user.id, sender: 'ai', text: reply })
        .select()
        .single();
      if (aiMsg) setChat((prev) => [...prev, aiMsg as ChatMessage]);
    },
    [session?.user?.id, profile, logs, liftLogs]
  );

  const resetTrainingData = useCallback(async () => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    await Promise.all([
      supabase.from('snap_logs').delete().eq('user_id', uid),
      supabase.from('lift_logs').delete().eq('user_id', uid),
      supabase.from('recovery_checkins').delete().eq('user_id', uid),
      supabase.from('chat_messages').delete().eq('user_id', uid),
    ]);
    await updateProfile({ streak: 0, snap_day_count: 1 });
    setLogs([]);
    setLiftLogs([]);
    setRecovery(null);
    const { data: inserted } = await supabase
      .from('chat_messages')
      .insert({ user_id: uid, sender: 'ai', text: initialCoachMessage })
      .select()
      .single();
    setChat(inserted ? [inserted as ChatMessage] : []);
  }, [session?.user?.id, updateProfile]);

  const deleteAccount = useCallback(async () => {
    // Deleting the auth.users row (which cascades to every table above) requires
    // the service role key, which never belongs on-device. Ship a Supabase Edge
    // Function ("delete-account") that verifies the caller's JWT and runs
    // supabase.auth.admin.deleteUser(uid) server-side, then call it here.
    await resetTrainingData();
    await signOut();
  }, [resetTrainingData, signOut]);

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      authLoading,
      profile,
      logs,
      liftLogs,
      recovery,
      chat,
      dataLoading,
      signUp,
      signIn,
      signOut,
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
      deleteAccount,
      uploadMedia,
    }),
    [
      session,
      authLoading,
      profile,
      logs,
      liftLogs,
      recovery,
      chat,
      dataLoading,
      signUp,
      signIn,
      signOut,
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
      deleteAccount,
      uploadMedia,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
