import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Card, CardTitle, Heading, Sub, Btn, useAccent } from '../components/ui';
import { RecoveryModal } from '../components/RecoveryModal';
import { palette, fonts, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';
import { weekDays } from '../data/content';
import { coachHomeNote, recoveryStatusLabel } from '../coach/homeNote';
import { useSignedUrl } from '../lib/media';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function HomeScreen() {
  const { profile, logs, recovery } = useApp();
  const accent = useAccent();
  const navigation = useNavigation<any>();
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const photoUrl = useSignedUrl(profile?.photo_url);

  if (!profile) return null;

  const today = new Date().getDay();
  const todayProgram = weekDays[today];
  const firstName = profile.name.split(' ')[0];
  const initials = profile.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  const note = coachHomeNote(profile, logs, recovery);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Sub>{dayNames[today]}</Sub>
          <Heading size={22}>Welcome back, {firstName}</Heading>
        </View>
        <TouchableOpacity style={[styles.avatar, { backgroundColor: accent }]} onPress={() => navigation.navigate('Profile')}>
          {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.avatarImg} /> : <Text style={styles.avatarText}>{initials}</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.streak}>
        <Text style={{ color: accent }}>🔥</Text>
        <Text style={styles.streakText}>{profile.streak} day streak</Text>
      </View>

      <Card>
        <CardTitle>Today's Session</CardTitle>
        <Text style={styles.sessionTitle}>{todayProgram.type}</Text>
        <Sub style={{ marginTop: 6 }}>
          Week {profile.current_week}, Block {profile.current_block}
          {todayProgram.hasSnap ? ' · Snap day' : ''}
        </Sub>
        <Btn title="Start Today's Session" onPress={() => navigation.navigate('Log')} />
      </Card>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Log')}>
          <Text style={[styles.quickIcon, { color: accent }]}>＋</Text>
          <Text style={styles.quickLabel}>Log Snap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Program')}>
          <Text style={[styles.quickIcon, { color: accent }]}>📋</Text>
          <Text style={styles.quickLabel}>Program</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Coach')}>
          <Text style={[styles.quickIcon, { color: accent }]}>💬</Text>
          <Text style={styles.quickLabel}>Coach</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setRecoveryOpen(true)}>
        <Card>
          <CardTitle>Recovery</CardTitle>
          <Text style={styles.recoveryStatus}>{recoveryStatusLabel(recovery)}</Text>
        </Card>
      </TouchableOpacity>

      <Card style={[styles.coachNote, { borderLeftColor: accent }]}>
        <Text style={[styles.coachNoteLabel, { color: accent }]}>Coach Note</Text>
        <Text style={styles.coachNoteText}>{note}</Text>
      </Card>

      <RecoveryModal visible={recoveryOpen} onClose={() => setRecoveryOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: palette.bg, fontFamily: fonts.heading, fontSize: 14 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  streakText: { color: palette.text, fontSize: 13, fontFamily: fonts.bodyMedium },
  sessionTitle: { fontFamily: fonts.heading, fontSize: 20, color: palette.text, textTransform: 'uppercase' },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickAction: { flex: 1, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
  quickIcon: { fontSize: 20, marginBottom: 6 },
  quickLabel: { color: palette.text, fontSize: 12, fontFamily: fonts.bodyMedium },
  recoveryStatus: { color: palette.text, fontSize: 14, fontFamily: fonts.body },
  coachNote: { borderLeftWidth: 3 },
  coachNoteLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, marginBottom: 4 },
  coachNoteText: { color: palette.dim, fontSize: 13, lineHeight: 19, fontFamily: fonts.body },
});
