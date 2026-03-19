import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, FONT, SPACING } from '../constants/theme';

const MENU_ITEMS = [
  { label: 'Rate UNHINGED GO ⭐', action: () => {} },
  { label: 'Share with Friends 📤', action: () => {} },
  { label: 'Privacy Policy', action: () => {} },
  { label: 'Restore Purchases', action: () => {} },
];

export default function SettingsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); item.action(); }}
          >
            <Text style={styles.menuText}>{item.label}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.version}>UNHINGED GO v1.0.0</Text>
          <Text style={styles.made}>Made with 🔥 by Vilmure Ventures</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, paddingTop: SPACING.xxl },
  title: { color: COLORS.text, fontSize: FONT.xxl, fontWeight: '900', marginBottom: SPACING.xl },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuText: { color: COLORS.text, fontSize: FONT.md, fontWeight: '600' },
  arrow: { color: COLORS.textSecondary, fontSize: FONT.xl },
  footer: { alignItems: 'center', marginTop: SPACING.xxl },
  version: { color: COLORS.textSecondary, fontSize: 12, marginBottom: SPACING.xs },
  made: { color: COLORS.textSecondary, fontSize: FONT.sm },
  back: { marginTop: SPACING.xl, alignItems: 'center' },
  backText: { color: COLORS.textSecondary, fontSize: FONT.sm },
});
