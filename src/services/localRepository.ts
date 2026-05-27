import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportAppError } from '@/store/appErrorStore';

const STORAGE_PREFIX = 'realbook:v1:';

export interface StoredValueResult<T> {
  data: T;
  recovered: boolean;
}

export class LocalStorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LocalStorageError';
  }
}

function storageKeyFor(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

function cloneSeed<T>(seed: T): T {
  return JSON.parse(JSON.stringify(seed)) as T;
}

function makeStorageError(message: string, cause?: unknown) {
  const error = new LocalStorageError(message, cause);
  reportAppError(error, message);
  return error;
}

async function seedStoredValue<T>(storageKey: string, seed: T): Promise<T> {
  const seededValue = cloneSeed(seed);
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(seededValue));
  } catch (error) {
    throw makeStorageError(`Realbook could not initialize local storage for ${storageKey}.`, error);
  }
  return seededValue;
}

export async function getStoredValue<T>(key: string, seed: T): Promise<T> {
  const storageKey = storageKeyFor(key);
  let raw: string | null = null;

  try {
    raw = await AsyncStorage.getItem(storageKey);
  } catch (error) {
    reportAppError(error, `Realbook could not read saved ${key}. Using fallback data.`);
    console.warn(`Realbook storage read failed for ${storageKey}`, error);
    return cloneSeed(seed);
  }

  if (!raw) {
    return seedStoredValue(storageKey, seed);
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    reportAppError(error, `Saved ${key} data was damaged. Realbook reset that section.`);
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
  } catch (error) {
    reportAppError(error, `Realbook could not read saved ${key}. Using fallback data.`);
    return { data: cloneSeed(seed), recovered: true };
  }

  if (!raw) {
    return { data: await seedStoredValue(storageKey, seed), recovered: true };
  }

  try {
    return { data: JSON.parse(raw) as T, recovered: false };
  } catch (error) {
    reportAppError(error, `Saved ${key} data was damaged. Realbook reset that section.`);
    return { data: await seedStoredValue(storageKey, seed), recovered: true };
  }
}

export async function setStoredValue<T>(key: string, value: T): Promise<T> {
  try {
    await AsyncStorage.setItem(storageKeyFor(key), JSON.stringify(value));
  } catch (error) {
    throw makeStorageError(`Realbook could not save ${key}. Please try again.`, error);
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
