import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, fonts } from '../theme';
import { useAccent } from './ui';

export function BarChart({ values, labels, valueFormat }: { values: number[]; labels: string[]; valueFormat?: (v: number) => string }) {
  const accent = useAccent();
  const max = Math.max(...values, 1);
  return (
    <View style={styles.wrap}>
      {values.map((v, i) => {
        const h = Math.max((v / max) * 100, 4);
        return (
          <View key={i} style={styles.barCol}>
            <Text style={[styles.val, { color: accent }]}>{valueFormat ? valueFormat(v) : v}</Text>
            <View style={[styles.bar, { height: `${h}%`, backgroundColor: accent }]} />
            <Text style={styles.label}>{labels[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 6, borderBottomWidth: 1, borderBottomColor: palette.border, paddingBottom: 4 },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: { width: '70%', borderTopLeftRadius: 4, borderTopRightRadius: 4, opacity: 0.8, minHeight: 4 },
  val: { fontSize: 10, fontFamily: fonts.monoBold, marginBottom: 4 },
  label: { fontSize: 10, color: palette.dim, marginTop: 6, fontFamily: fonts.mono },
});
