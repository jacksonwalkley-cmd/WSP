import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, fonts } from '../theme';

export default function SplashScreen({ message = 'Loading your program' }: { message?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.logo}>WSP</Text>
      <Text style={styles.sub}>Long Snapper Training</Text>
      <Text style={styles.msg}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { fontFamily: fonts.heading, fontSize: 56, letterSpacing: 6, color: palette.text },
  sub: { fontFamily: fonts.headingMedium, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: palette.dim, marginTop: 8 },
  msg: { fontSize: 13, color: palette.dim, marginTop: 32, fontFamily: fonts.body },
});
