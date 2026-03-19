import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export async function copyText(text: string) {
  await Clipboard.setStringAsync(text);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  Alert.alert('Copied!', 'Text copied to clipboard');
}

export async function shareText(text: string) {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    await copyText(text);
    return;
  }
  // expo-sharing requires a file URI, so we fall back to clipboard + alert
  await copyText(text);
}

export function buildCookedShareText(score: number, roast: string): string {
  return `🔥 My Cooked Score: ${score}/10\n\n${roast}\n\nFind out yours → UNHINGED GO`;
}

export function buildVibeShareText(vibeName: string, color: string, reading: string): string {
  return `🔮 My Vibe: ${vibeName} (${color} aura)\n\n${reading}\n\nCheck your vibe → UNHINGED GO`;
}

export function buildHypeShareText(speech: string): string {
  return `⚡ My Hype Speech:\n\n${speech}\n\nGet hyped → UNHINGED GO`;
}
