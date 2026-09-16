import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { palette, fonts, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';

export function useAccent() {
  const { profile } = useApp();
  return profile?.theme || palette.accent;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.cardTitle}>{children}</Text>;
}

export function Heading({ children, size = 22, style }: { children: React.ReactNode; size?: number; style?: TextStyle }) {
  return <Text style={[styles.heading, { fontSize: size }, style]}>{children}</Text>;
}

export function Sub({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.sub, style]}>{children}</Text>;
}

export function Btn({
  title,
  onPress,
  secondary,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const accent = useAccent();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        secondary ? styles.btnSecondary : { backgroundColor: accent },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.btnText, secondary && { color: palette.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Tag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  const accent = useAccent();
  return (
    <View style={[styles.tag, { backgroundColor: accent + '20' }]}>
      <Text style={[styles.tagText, { color: accent }]}>{label}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={8}>
          <Text style={[styles.tagRemove, { color: accent }]}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function CheckRow({ label, done, onToggle }: { label: string; done: boolean; onToggle: () => void }) {
  const accent = useAccent();
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle}>
      <View
        style={[
          styles.checkBox,
          done && { backgroundColor: accent, borderColor: accent },
        ]}
      >
        {done && <Text style={{ color: palette.bg, fontWeight: '700', fontSize: 12 }}>✓</Text>}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function StatBox({ num, label }: { num: string; label: string }) {
  const accent = useAccent();
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statNum, { color: accent }]}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function QualityPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (q: 'Wobble' | 'Tight' | 'Flat') => void;
}) {
  const accent = useAccent();
  const options: Array<'Wobble' | 'Tight' | 'Flat'> = ['Wobble', 'Tight', 'Flat'];
  return (
    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.qualityBtn,
              active && { backgroundColor: accent + '26', borderColor: accent },
            ]}
          >
            <Text style={[styles.qualityText, active && { color: accent }]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function Feedback({ text, negative }: { text: string; negative?: boolean }) {
  return (
    <View
      style={[
        styles.feedback,
        negative
          ? { borderLeftColor: palette.danger, backgroundColor: 'rgba(196,90,90,0.08)' }
          : { borderLeftColor: palette.positive, backgroundColor: 'rgba(106,183,138,0.08)' },
      ]}
    >
      <Text style={[styles.feedbackText, { color: negative ? palette.danger : palette.positive }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardTitle: { fontSize: 13, color: palette.dim, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.bodyMedium },
  heading: { fontFamily: fonts.heading, color: palette.text, textTransform: 'uppercase', letterSpacing: 1 },
  sub: { fontFamily: fonts.body, color: palette.dim, fontSize: 12 },
  btn: { borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', marginTop: 14 },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.border },
  btnText: { fontFamily: fonts.heading, color: palette.bg, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 15 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.sm, marginRight: 6, marginBottom: 6 },
  tagText: { fontSize: 12, fontFamily: fonts.body },
  tagRemove: { fontSize: 14, fontWeight: '700', opacity: 0.8 },
  sectionTitle: { fontSize: 11, color: palette.dim, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 20, marginBottom: 10, fontFamily: fonts.bodyMedium },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: palette.border },
  checkBox: { width: 20, height: 20, borderWidth: 2, borderColor: palette.dim, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  checkLabel: { color: palette.text, fontSize: 14, fontFamily: fonts.body },
  statBox: { flex: 1, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center' },
  statNum: { fontSize: 26, fontFamily: fonts.heading },
  statLabel: { fontSize: 10, color: palette.dim, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: fonts.bodyMedium },
  qualityBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.sm, borderWidth: 1, borderColor: palette.border },
  qualityText: { color: palette.dim, fontSize: 12, fontFamily: fonts.body },
  feedback: { borderLeftWidth: 3, padding: 12, borderRadius: 8, marginVertical: 12 },
  feedbackText: { fontSize: 13, lineHeight: 18, fontFamily: fonts.body },
});
