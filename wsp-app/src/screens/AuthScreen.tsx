import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { palette, fonts, spacing, radius } from '../theme';
import { Btn } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function AuthScreen() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error: err } = await fn(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.wrap}>
        <Text style={styles.logo}>WSP</Text>
        <Text style={styles.tag}>Long Snapper Training</Text>

        <View style={{ marginTop: 40 }}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={palette.dim}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={palette.dim}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Btn title={busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'} onPress={submit} disabled={busy} />
          <Btn
            secondary
            title={mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.bg },
  wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  logo: { fontFamily: fonts.heading, fontSize: 56, letterSpacing: 6, color: palette.text, textAlign: 'center' },
  tag: { fontFamily: fonts.headingMedium, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: palette.dim, textAlign: 'center', marginTop: 8 },
  label: { fontSize: 12, color: palette.dim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body },
  input: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, padding: 12, color: palette.text, fontSize: 15, marginBottom: 16, fontFamily: fonts.body },
  error: { color: palette.danger, fontSize: 13, marginBottom: 8, fontFamily: fonts.body },
});
