import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, CardTitle, Heading, StatBox } from '../components/ui';
import { BarChart } from '../components/BarChart';
import { palette, fonts, spacing } from '../theme';
import { useApp } from '../context/AppContext';

export default function ProgressScreen() {
  const { profile, logs, liftLogs } = useApp();

  const squatEntries = liftLogs
    .filter((l) => l.liftName === 'Back Squat' && l.weight)
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
  const squatPR = squatEntries.reduce((max, l) => Math.max(max, parseInt(l.weight ?? '0', 10) || 0), 0);
  const recentSquats = squatEntries.slice(-6);

  const snapReps = logs.filter((l) => l.stage === 2);
  const bestTime = snapReps.reduce<number | null>((min, l) => {
    if (l.timeSeconds == null) return min;
    return min === null ? l.timeSeconds : Math.min(min, l.timeSeconds);
  }, null);
  const recentReps = snapReps.slice(-6);

  return (
    <Screen>
      <Heading size={22} style={{ marginBottom: spacing.xl }}>Progress</Heading>

      <View style={styles.statRow}>
        <StatBox num={squatPR ? String(squatPR) : '—'} label="Squat PR" />
        <StatBox num={bestTime != null ? `${bestTime.toFixed(2)}s` : '—'} label="Best 14–15 YD" />
        <StatBox num={String(profile.streak)} label="Day Streak" />
      </View>

      <Card>
        <CardTitle>Back Squat · Progress</CardTitle>
        {recentSquats.length > 0 ? (
          <BarChart
            values={recentSquats.map((l) => parseInt(l.weight ?? '0', 10) || 0)}
            labels={recentSquats.map((_, i) => `S${i + 1}`)}
          />
        ) : (
          <Text style={styles.empty}>Log a Back Squat set on Program to start tracking this.</Text>
        )}
      </Card>

      <Card>
        <CardTitle>Spiral Consistency · 14–15 YD</CardTitle>
        {recentReps.length > 0 ? (
          <BarChart
            values={recentReps.map((l) => (l.spiral === 'Tight' ? 100 : l.spiral === 'Flat' ? 50 : 15))}
            labels={recentReps.map((_, i) => `R${i + 1}`)}
            valueFormat={() => ''}
          />
        ) : (
          <Text style={styles.empty}>Log 14–15 YD reps to see your spiral trend here.</Text>
        )}
      </Card>

      <Card>
        <CardTitle>Sprint Times</CardTitle>
        <Text style={styles.empty}>Sprint timing isn't wired up yet — this is next on the roadmap.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg },
  empty: { color: palette.dim, fontSize: 13, lineHeight: 18, fontFamily: fonts.body },
});
