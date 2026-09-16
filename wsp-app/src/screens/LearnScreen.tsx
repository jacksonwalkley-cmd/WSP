import React from 'react';
import { Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, Heading, SectionTitle } from '../components/ui';
import { palette, fonts } from '../theme';
import { articles } from '../data/content';

export default function LearnScreen() {
  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <Screen>
      <Heading size={22} style={{ marginBottom: 4 }}>Learn</Heading>
      {categories.map((cat) => (
        <React.Fragment key={cat}>
          <SectionTitle>{cat}</SectionTitle>
          {articles
            .filter((a) => a.category === cat)
            .map((a) => (
              <TouchableOpacity key={a.title} onPress={() => Alert.alert(a.title, a.excerpt)}>
                <Card>
                  <Text style={styles.title}>{a.title}</Text>
                  <Text style={styles.excerpt}>{a.excerpt}</Text>
                  <Text style={styles.meta}>{a.meta}</Text>
                </Card>
              </TouchableOpacity>
            ))}
        </React.Fragment>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontFamily: fonts.bodyMedium, color: palette.text, marginBottom: 4 },
  excerpt: { fontSize: 13, color: palette.dim, lineHeight: 18, fontFamily: fonts.body },
  meta: { fontSize: 11, color: palette.dim, marginTop: 10, fontFamily: fonts.mono },
});
