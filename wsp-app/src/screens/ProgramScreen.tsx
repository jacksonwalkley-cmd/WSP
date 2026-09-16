import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, CardTitle, Heading, CheckRow, Btn, useAccent } from '../components/ui';
import { palette, fonts, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';
import { weekDays, warmupsByDay, drillData, suggestWeight } from '../data/content';
import { latestLift } from '../lib/liftHistory';

export default function ProgramScreen() {
  const { profile, liftLogs, logLift } = useApp();
  const accent = useAccent();
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [dayWarmupDone, setDayWarmupDone] = useState<boolean[]>([]);
  const [inputs, setInputs] = useState<Record<string, { weight: string; reps: string }>>({});

  const today = new Date().getDay();

  if (openDay === null) {
    return (
      <Screen>
        <View style={styles.header}>
          <Heading size={22}>Program</Heading>
          <Text style={styles.blockLabel}>
            Block {profile.currentBlock} · Week {profile.currentWeek}
          </Text>
        </View>
        {weekDays.map((d, i) => (
          <TouchableOpacity
            key={d.day}
            style={[styles.dayRow, i === today && { backgroundColor: palette.card, borderColor: palette.border }]}
            onPress={() => {
              setOpenDay(i);
              setDayWarmupDone((warmupsByDay[d.type] ?? ['General warmup']).map(() => false));
            }}
          >
            <View>
              <Text style={styles.dayName}>{d.day}</Text>
              <Text style={styles.dayType}>{d.type}</Text>
            </View>
            {i === today ? (
              <View style={[styles.badge, { backgroundColor: accent + '20' }]}>
                <Text style={[styles.badgeText, { color: accent }]}>Today</Text>
              </View>
            ) : d.type === 'Rest' ? (
              <View style={styles.badgeRest}>
                <Text style={styles.badgeRestText}>Rest</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </Screen>
    );
  }

  const day = weekDays[openDay];
  const wuList = warmupsByDay[day.type] ?? ['General warmup'];

  return (
    <Screen>
      <Text style={styles.detailTitle}>
        {day.day} — {day.type}
      </Text>
      <Card>
        <CardTitle>Warmup</CardTitle>
        {wuList.map((w, i) => (
          <CheckRow
            key={w}
            label={w}
            done={dayWarmupDone[i] ?? false}
            onToggle={() => setDayWarmupDone((prev) => prev.map((d2, j) => (j === i ? !d2 : d2)))}
          />
        ))}
      </Card>

      {day.lifts ? (
        <Card>
          <CardTitle>Lifts</CardTitle>
          {day.lifts.map((lift) => {
            const key = `${day.day}_${lift}`;
            const last = latestLift(liftLogs, day.day, lift);
            const suggested = suggestWeight(lift, last?.weight ?? undefined, last?.reps ?? undefined);
            const draft = inputs[key] ?? { weight: suggested.weight, reps: suggested.reps };
            return (
              <View key={lift} style={styles.liftRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.liftName}>{lift}</Text>
                  <Text style={styles.liftMeta}>
                    {suggested.target} · Last: {last?.weight ?? '—'}×{last?.reps ?? '—'}
                  </Text>
                </View>
                <View style={styles.liftInputs}>
                  <TextInput
                    style={styles.liftInput}
                    value={draft.weight}
                    onChangeText={(v) => setInputs((prev) => ({ ...prev, [key]: { ...draft, weight: v } }))}
                    keyboardType="numeric"
                    placeholder="wt"
                    placeholderTextColor={palette.dim}
                  />
                  <TextInput
                    style={styles.liftInput}
                    value={draft.reps}
                    onChangeText={(v) => setInputs((prev) => ({ ...prev, [key]: { ...draft, reps: v } }))}
                    keyboardType="numeric"
                    placeholder="reps"
                    placeholderTextColor={palette.dim}
                  />
                  <TouchableOpacity
                    style={[styles.logBtn, { backgroundColor: accent }]}
                    onPress={() => {
                      logLift(day.day, lift, draft.weight, draft.reps);
                      Alert.alert('Logged', `${lift}: ${draft.weight} lbs × ${draft.reps} reps`);
                    }}
                  >
                    <Text style={styles.logBtnText}>Log</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </Card>
      ) : (
        <Card>
          <Text style={{ color: palette.dim, textAlign: 'center', fontFamily: fonts.body }}>Rest day — no lifts scheduled.</Text>
        </Card>
      )}

      {day.hasSnap && (
        <>
          <Text style={styles.sectionTitle}>Snap Drills</Text>
          {drillData.map((d) => (
            <TouchableOpacity key={d.title} onPress={() => Alert.alert('Playing drill', d.title)}>
              <Card style={styles.drillCard}>
                <View>
                  <Text style={styles.drillTitle}>{d.title}</Text>
                  <Text style={styles.drillMeta}>
                    {d.duration} · {d.category}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Btn secondary title="← Back to Week" onPress={() => setOpenDay(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  blockLabel: { fontSize: 13, color: palette.dim, fontFamily: fonts.body },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: radius.md, marginBottom: 6, borderWidth: 1, borderColor: 'transparent' },
  dayName: { fontSize: 15, fontFamily: fonts.bodyMedium, color: palette.text },
  dayType: { fontSize: 13, color: palette.dim, marginTop: 2, fontFamily: fonts.body },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 4 },
  badgeText: { fontSize: 11, fontFamily: fonts.heading, textTransform: 'uppercase' },
  badgeRest: { backgroundColor: 'rgba(143,139,132,0.12)', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 4 },
  badgeRestText: { fontSize: 11, color: palette.dim, fontFamily: fonts.heading, textTransform: 'uppercase' },
  detailTitle: { fontSize: 11, color: palette.dim, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontFamily: fonts.bodyMedium },
  liftRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: palette.border },
  liftName: { fontSize: 15, fontFamily: fonts.bodyMedium, color: palette.text },
  liftMeta: { fontSize: 12, color: palette.dim, marginTop: 3, fontFamily: fonts.mono },
  liftInputs: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  liftInput: { width: 50, backgroundColor: palette.bg, borderWidth: 1, borderColor: palette.border, borderRadius: 8, padding: 8, color: palette.text, textAlign: 'center', fontFamily: fonts.mono },
  logBtn: { borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  logBtnText: { color: palette.bg, fontFamily: fonts.heading, fontSize: 11, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 11, color: palette.dim, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 20, marginBottom: 10, fontFamily: fonts.bodyMedium },
  drillCard: { flexDirection: 'row', alignItems: 'center' },
  drillTitle: { fontSize: 14, fontFamily: fonts.bodyMedium, color: palette.text },
  drillMeta: { fontSize: 12, color: palette.dim, marginTop: 2, fontFamily: fonts.mono },
});
