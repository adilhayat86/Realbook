import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'realbook:v1:';

export interface StoredValueResult<T> {
  data: T;
  recovered: boolean;
}

function storageKeyFor(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

function cloneSeed<T>(seed: T): T {
  return JSON.parse(JSON.stringify(seed)) as T;
}

async function seedStoredValue<T>(storageKey: string, seed: T): Promise<T> {
  const seededValue = cloneSeed(seed);
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(seededValue));
  } catch (error) {
    console.warn(`Realbook storage seed failed for ${storageKey}`, error);
  }
  return seededValue;
}

export async function getStoredValue<T>(key: string, seed: T): Promise<T> {
  const storageKey = storageKeyFor(key);
  let raw: string | null = null;

  try {
    raw = await AsyncStorage.getItem(storageKey);
  } catch (error) {
    console.warn(`Realbook storage read failed for ${storageKey}`, error);
    return cloneSeed(seed);
  }

  if (!raw) {
    return seedStoredValue(storageKey, seed);
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Realbook storage parse failed for ${storageKey}; reseeding`, error);
    return seedStoredValue(storageKey, seed);
  }
}

export async function getStoredValueResult<T>(
  key: string,
  seed: T
): Promise<StoredValueResult<T>> {
  const storageKey = storageKeyFor(key);
  let raw: string | null = null;

  try {
    raw = await AsyncStorage.getItem(storageKey);
  } catch {
    return { data: cloneSeed(seed), recovered: true };
  }

  if (!raw) {
    return { data: await seedStoredValue(storageKey, seed), recovered: true };
  }

  try {
    return { data: JSON.parse(raw) as T, recovered: false };
  } catch {
    return { data: await seedStoredValue(storageKey, seed), recovered: true };
  }
}

export async function setStoredValue<T>(key: string, value: T): Promise<T> {
  try {
    await AsyncStorage.setItem(storageKeyFor(key), JSON.stringify(value));
  } catch (error) {
    console.warn(`Realbook storage write failed for ${key}`, error);
  }
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

export async function resetStoredValue<T>(key: string, seed: T): Promise<T> {
  return seedStoredValue(storageKeyFor(key), seed);
}
