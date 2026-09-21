import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../components/Screen';
import { Btn, Tag, SectionTitle, useAccent } from '../components/ui';
import { palette, fonts, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';

export default function OnboardingScreen() {
  const { profile, saveOnboardingProfile } = useApp();
  const accent = useAccent();
  const [name, setName] = useState(profile.name);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [strengths, setStrengths] = useState<string[]>(profile.strengths.length ? profile.strengths : ['Ball Speed', 'Consistency']);
  const [flaws, setFlaws] = useState<string[]>(profile.flaws.length ? profile.flaws : ['Spiral Wobble', 'Short Follow-Through']);
  const [strengthInput, setStrengthInput] = useState('');
  const [flawInput, setFlawInput] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(profile.photoUri);

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  }

  function save() {
    saveOnboardingProfile({
      name: name.trim() || 'Athlete',
      height,
      weight,
      strengths,
      flaws,
      photoUri,
    });
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <Text style={styles.logo}>WSP</Text>
        <Text style={styles.sub}>Create your athlete profile</Text>
      </View>

      <TouchableOpacity style={[styles.avatarLg, { borderColor: accent + '55' }]} onPress={pickPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatarImg} />
        ) : (
          <Text style={{ color: palette.dim, fontSize: 13 }}>Add Photo</Text>
        )}
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Height</Text>
          <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder={'6\'2"'} placeholderTextColor={palette.dim} />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Weight</Text>
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="215 lbs" placeholderTextColor={palette.dim} />
        </View>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jake Williams" placeholderTextColor={palette.dim} />

      <SectionTitle>Strengths</SectionTitle>
      <View style={styles.tagWrap}>
        {strengths.map((s) => (
          <Tag key={s} label={s} onRemove={() => setStrengths(strengths.filter((t) => t !== s))} />
        ))}
        <TextInput
          style={styles.tagInput}
          value={strengthInput}
          onChangeText={setStrengthInput}
          placeholder="+ Add tag"
          placeholderTextColor={palette.dim}
          onSubmitEditing={() => {
            if (strengthInput.trim()) {
              setStrengths([...strengths, strengthInput.trim()]);
              setStrengthInput('');
            }
          }}
        />
      </View>

      <SectionTitle>Flaws</SectionTitle>
      <View style={styles.tagWrap}>
        {flaws.map((f) => (
          <Tag key={f} label={f} onRemove={() => setFlaws(flaws.filter((t) => t !== f))} />
        ))}
        <TextInput
          style={styles.tagInput}
          value={flawInput}
          onChangeText={setFlawInput}
          placeholder="+ Add tag"
          placeholderTextColor={palette.dim}
          onSubmitEditing={() => {
            if (flawInput.trim()) {
              setFlaws([...flaws, flawInput.trim()]);
              setFlawInput('');
            }
          }}
        />
      </View>

      <Btn title="Create Profile" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { fontFamily: fonts.heading, fontSize: 32, letterSpacing: 4, color: palette.text },
  sub: { fontSize: 13, color: palette.dim, marginTop: 4, fontFamily: fonts.body },
  avatarLg: { width: 90, height: 90, borderRadius: 45, backgroundColor: palette.card, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 20, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  label: { fontSize: 12, color: palette.dim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body },
  input: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, padding: 12, color: palette.text, fontSize: 15, marginBottom: 16, fontFamily: fonts.body },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  tagInput: { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.border, borderStyle: 'dashed', borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 10, color: palette.text, fontSize: 12, width: 110, fontFamily: fonts.body },
});
