import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { palette, fonts, radius, spacing } from '../theme';
import { Btn, useAccent } from './ui';
import { useApp } from '../context/AppContext';

const fields: Array<{ key: 'sleep' | 'soreness' | 'energy' | 'mood'; label: string }> = [
  { key: 'sleep', label: 'Sleep Quality' },
  { key: 'soreness', label: 'Soreness' },
  { key: 'energy', label: 'Energy' },
  { key: 'mood', label: 'Mood' },
];

export function RecoveryModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { recovery, saveRecovery } = useApp();
  const accent = useAccent();
  const [values, setValues] = useState({
    sleep: recovery?.sleep ?? 5,
    soreness: recovery?.soreness ?? 5,
    energy: recovery?.energy ?? 5,
    mood: recovery?.mood ?? 5,
  });
  const [notes, setNotes] = useState(recovery?.notes ?? '');

  async function submit() {
    await saveRecovery({ ...values, notes });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Daily Recovery Check-In</Text>
          {fields.map((f) => (
            <View key={f.key} style={{ marginBottom: 14 }}>
              <View style={styles.sliderLabelRow}>
                <Text style={styles.sliderLabel}>{f.label}</Text>
                <Text style={[styles.sliderVal, { color: accent }]}>{values[f.key]}</Text>
              </View>
              <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={values[f.key]}
                onValueChange={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
                minimumTrackTintColor={accent}
                maximumTrackTintColor={palette.border}
                thumbTintColor={accent}
              />
            </View>
          ))}
          <Text style={styles.sliderLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything sore, tight, or off today?"
            placeholderTextColor={palette.dim}
            multiline
          />
          <Btn title="Save Check-In" onPress={submit} />
          <Btn secondary title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  title: { fontFamily: fonts.heading, fontSize: 18, color: palette.text, textTransform: 'uppercase', marginBottom: 16 },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { color: palette.dim, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body, marginBottom: 6 },
  sliderVal: { fontFamily: fonts.monoBold, fontSize: 13 },
  notesInput: { backgroundColor: palette.bg, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, padding: 12, color: palette.text, minHeight: 70, textAlignVertical: 'top', fontFamily: fonts.body, marginBottom: 8 },
});
