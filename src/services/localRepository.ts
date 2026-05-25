import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'realbook:v1:';

export async function getStoredValue<T>(key: string, seed: T): Promise<T> {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const raw = await AsyncStorage.getItem(storageKey);

  if (!raw) {
    await AsyncStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    await AsyncStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  }
}

export async function setStoredValue<T>(key: string, value: T): Promise<T> {
  await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  return value;
}

export async function updateStoredValue<T>(
  key: string,
  seed: T,
  updater: (current: T) => T
): Promise<T> {
  const current = await getStoredValue(key, seed);
  const next = updater(current);
  return setStoredValue(key, next);
}
