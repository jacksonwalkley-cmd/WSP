import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../components/Screen';
import { Card, CardTitle, Heading, Btn, Tag, SectionTitle, useAccent } from '../components/ui';
import { RecoveryModal } from '../components/RecoveryModal';
import { palette, fonts, spacing, radius, themeOptions } from '../theme';
import { useApp } from '../context/AppContext';

export default function ProfileScreen() {
  const { profile, updateProfile, addTag, removeTag, setThemeColor, resetTrainingData, resetEverything } = useApp();
  const accent = useAccent();
  const [name, setName] = useState(profile.name);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [strengthInput, setStrengthInput] = useState('');
  const [flawInput, setFlawInput] = useState('');
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled && res.assets[0]) updateProfile({ photoUri: res.assets[0].uri });
  }

  function save() {
    updateProfile({ name: name.trim() || profile.name, height, weight });
    Alert.alert('Saved', 'Profile updated.');
  }

  function confirmReset() {
    Alert.alert(
      'Reset training data?',
      'This clears all snap logs, lift logs, recovery check-ins, and chat history. Your profile stays.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetTrainingData() },
      ]
    );
  }

  function confirmStartOver() {
    Alert.alert(
      'Start over?',
      'This clears everything, including your profile, and takes you back to onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Over', style: 'destructive', onPress: () => resetEverything() },
      ]
    );
  }

  return (
    <Screen>
      <Heading size={22} style={{ marginBottom: spacing.xl }}>Profile</Heading>

      <TouchableOpacity style={[styles.avatarLg, { borderColor: accent + '55' }]} onPress={pickPhoto}>
        {profile.photoUri ? (
          <Image source={{ uri: profile.photoUri }} style={styles.avatarImg} />
        ) : (
          <Text style={{ color: palette.dim, fontSize: 13 }}>
            {profile.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={palette.dim} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Height</Text>
          <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholderTextColor={palette.dim} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Weight</Text>
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholderTextColor={palette.dim} />
        </View>
      </View>
      <Btn title="Save Changes" onPress={save} />

      <SectionTitle>Strengths</SectionTitle>
      <View style={styles.tagWrap}>
        {profile.strengths.map((s) => (
          <Tag key={s} label={s} onRemove={() => removeTag('strengths', s)} />
        ))}
        <TextInput
          style={styles.tagInput}
          value={strengthInput}
          onChangeText={setStrengthInput}
          placeholder="+ Add tag"
          placeholderTextColor={palette.dim}
          onSubmitEditing={() => {
            if (strengthInput.trim()) {
              addTag('strengths', strengthInput.trim());
              setStrengthInput('');
            }
          }}
        />
      </View>

      <SectionTitle>Flaws</SectionTitle>
      <View style={styles.tagWrap}>
        {profile.flaws.map((f) => (
          <Tag key={f} label={f} onRemove={() => removeTag('flaws', f)} />
        ))}
        <TextInput
          style={styles.tagInput}
          value={flawInput}
          onChangeText={setFlawInput}
          placeholder="+ Add tag"
          placeholderTextColor={palette.dim}
          onSubmitEditing={() => {
            if (flawInput.trim()) {
              addTag('flaws', flawInput.trim());
              setFlawInput('');
            }
          }}
        />
      </View>

      <SectionTitle>Accent Color</SectionTitle>
      <View style={styles.colorRow}>
        {themeOptions.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, profile.theme === c && styles.colorDotActive]}
            onPress={() => setThemeColor(c)}
          />
        ))}
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <CardTitle>Recovery</CardTitle>
        <Btn secondary title="Open Recovery Check-In" onPress={() => setRecoveryOpen(true)} />
      </Card>

      <SectionTitle>Data</SectionTitle>
      <Btn secondary title="Reset Training Data" onPress={confirmReset} style={{ borderColor: palette.danger }} />
      <TouchableOpacity onPress={confirmStartOver} style={styles.deleteLink}>
        <Text style={styles.deleteLinkText}>Start Over (wipe everything)</Text>
      </TouchableOpacity>

      <RecoveryModal visible={recoveryOpen} onClose={() => setRecoveryOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarLg: { width: 90, height: 90, borderRadius: 45, backgroundColor: palette.card, borderWidth: 2, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  label: { fontSize: 12, color: palette.dim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body },
  input: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, padding: 12, color: palette.text, fontSize: 15, marginBottom: 16, fontFamily: fonts.body },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  tagInput: { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.border, borderStyle: 'dashed', borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 10, color: palette.text, fontSize: 12, width: 110, fontFamily: fonts.body },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: palette.text },
  deleteLink: { alignItems: 'center', marginTop: 16 },
  deleteLinkText: { color: palette.danger, fontSize: 13, fontFamily: fonts.body },
});
