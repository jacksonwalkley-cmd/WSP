import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, fonts, spacing } from '../theme';

export default function ConfigNeededScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.logo}>WSP</Text>
      <Text style={styles.title}>Backend not configured</Text>
      <Text style={styles.body}>
        Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to a .env file in wsp-app/, then restart
        the dev server. See README.md for step-by-step setup.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  logo: { fontFamily: fonts.heading, fontSize: 40, letterSpacing: 4, color: palette.text, marginBottom: 24 },
  title: { fontFamily: fonts.heading, fontSize: 18, color: palette.text, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 13, color: palette.dim, textAlign: 'center', lineHeight: 20, fontFamily: fonts.body },
});
