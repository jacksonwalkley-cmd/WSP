import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../components/Screen';
import { Card, CardTitle, Heading, Sub, Btn, CheckRow, QualityPicker, Feedback, useAccent } from '../components/ui';
import { palette, fonts, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';
import { stages, warmups } from '../data/content';
import { DraftRep } from '../types';

export default function LogScreen() {
  const { profile, commitSnapStage, finishSession } = useApp();
  const accent = useAccent();
  const [warmupDone, setWarmupDone] = useState<boolean[]>(warmups.map(() => false));
  const [currentStage, setCurrentStage] = useState(0);
  const [stageReps, setStageReps] = useState<Record<number, DraftRep[]>>({ 0: [], 1: [], 2: [] });
  const [lastStageResult, setLastStageResult] = useState<{ dist: string; needWork: number; total: number } | null>(null);

  const stage = stages[currentStage];
  const reps = stageReps[currentStage] ?? [];

  function updateRep(idx: number, patch: Partial<DraftRep>) {
    setStageReps((prev) => {
      const arr = [...(prev[currentStage] ?? [])];
      arr[idx] = { ...(arr[idx] ?? {}), ...patch };
      return { ...prev, [currentStage]: arr };
    });
  }

  async function pickVideo(idx: number) {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 0.5 });
    if (!res.canceled && res.assets[0]) updateRep(idx, { videoUri: res.assets[0].uri });
  }

  function saveStage() {
    const currentReps = stageReps[currentStage] ?? [];
    commitSnapStage(currentStage, currentReps);
    const total = currentReps.filter((r) => r && (r.spiral || r.videoUri)).length;
    const tight = currentReps.filter((r) => r?.spiral === 'Tight').length;
    setLastStageResult({ dist: stage.dist, needWork: total - tight, total });
    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      finishSession();
      setWarmupDone(warmups.map(() => false));
      setCurrentStage(0);
      setStageReps({ 0: [], 1: [], 2: [] });
      setLastStageResult(null);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Sub>Snap Day {profile.snapDayCount} of 3</Sub>
          <Heading size={22}>Log Session</Heading>
        </View>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
      </View>

      <Card>
        <CardTitle>Snap Warmup (Barefoot)</CardTitle>
        {warmups.map((w, i) => (
          <CheckRow
            key={w}
            label={w}
            done={warmupDone[i]}
            onToggle={() => setWarmupDone((prev) => prev.map((d, j) => (j === i ? !d : d)))}
          />
        ))}
      </Card>

      <View style={styles.stageRow}>
        {stages.map((s, i) => {
          const done = (stageReps[i]?.length ?? 0) >= s.reps;
          const active = i === currentStage;
          return (
            <TouchableOpacity
              key={s.dist}
              style={[
                styles.stageItem,
                active && { borderColor: accent, backgroundColor: accent + '10' },
                done && !active && { opacity: 0.6 },
              ]}
              onPress={() => setCurrentStage(i)}
            >
              <Text style={styles.stageDist}>{s.dist}</Text>
              <Text style={styles.stageReps}>
                {(stageReps[i]?.length ?? 0)}/{s.reps} reps{done ? ' ✓' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {Array.from({ length: stage.reps }).map((_, i) => {
        const rep = reps[i] ?? {};
        return (
          <Card key={i}>
            <Text style={styles.repHeader}>
              Rep {i + 1} · {stage.dist}
            </Text>
            <TouchableOpacity
              style={[styles.videoBox, rep.videoUri && { borderColor: accent, borderStyle: 'solid' }]}
              onPress={() => pickVideo(i)}
            >
              <Text style={{ color: rep.videoUri ? accent : palette.dim, fontSize: 13 }}>
                {rep.videoUri ? '🎥 Video attached — tap to replace' : '🎥 Upload video'}
              </Text>
            </TouchableOpacity>
            <QualityPicker value={rep.spiral} onChange={(q) => updateRep(i, { spiral: q })} />
            {stage.time && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.timeLabel}>Time (seconds)</Text>
                <TextInput
                  style={styles.timeInput}
                  value={rep.time ?? ''}
                  onChangeText={(v) => updateRep(i, { time: v })}
                  placeholder="0.75"
                  placeholderTextColor={palette.dim}
                  keyboardType="decimal-pad"
                />
              </View>
            )}
          </Card>
        );
      })}

      {lastStageResult && (
        <Feedback
          negative={lastStageResult.needWork > 0}
          text={
            lastStageResult.needWork > 0
              ? `${lastStageResult.dist} complete: ${lastStageResult.needWork} reps need work. Check the drill videos.`
              : `${lastStageResult.dist} complete: all reps rated Tight. Clean stage.`
          }
        />
      )}

      <Btn
        title={currentStage >= stages.length - 1 ? 'Save & Finish Session' : `Save & Continue to ${stages[currentStage + 1].dist}`}
        onPress={saveStage}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  date: { fontSize: 13, color: palette.dim, fontFamily: fonts.body },
  stageRow: { flexDirection: 'row', gap: 8, marginVertical: 16 },
  stageItem: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6, borderRadius: radius.md, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.card },
  stageDist: { fontFamily: fonts.heading, fontSize: 18, color: palette.text },
  stageReps: { fontSize: 11, color: palette.dim, marginTop: 4, fontFamily: fonts.mono },
  repHeader: { fontSize: 14, fontFamily: fonts.bodyMedium, color: palette.text, marginBottom: 10 },
  videoBox: { borderWidth: 1, borderStyle: 'dashed', borderColor: palette.border, borderRadius: radius.sm, padding: 20, alignItems: 'center', marginBottom: 10 },
  timeLabel: { fontSize: 12, color: palette.dim, marginBottom: 4, fontFamily: fonts.body },
  timeInput: { backgroundColor: palette.bg, borderWidth: 1, borderColor: palette.border, borderRadius: radius.sm, padding: 10, color: palette.text, fontFamily: fonts.mono },
});
