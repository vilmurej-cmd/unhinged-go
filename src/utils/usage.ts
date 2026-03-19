import AsyncStorage from '@react-native-async-storage/async-storage';

const FREE_LIMIT = 3;

function getTodayKey(tool: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `usage_${tool}_${date}`;
}

export async function getUsageCount(tool: string): Promise<number> {
  const key = getTodayKey(tool);
  const val = await AsyncStorage.getItem(key);
  return val ? parseInt(val, 10) : 0;
}

export async function incrementUsage(tool: string): Promise<void> {
  const key = getTodayKey(tool);
  const current = await getUsageCount(tool);
  await AsyncStorage.setItem(key, String(current + 1));
}

export async function canUse(tool: string): Promise<boolean> {
  const count = await getUsageCount(tool);
  return count < FREE_LIMIT;
}

export function getRemainingUses(count: number): number {
  return Math.max(0, FREE_LIMIT - count);
}
