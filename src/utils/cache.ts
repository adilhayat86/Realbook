import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@realbook_cache_';
const CACHE_EXPIRY_PREFIX = '@realbook_cache_expiry_';

export async function setCache(key: string, data: any, ttlInMinutes: number = 60) {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const expiryKey = CACHE_EXPIRY_PREFIX + key;
    const expiryTime = Date.now() + ttlInMinutes * 60 * 1000;
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    await AsyncStorage.setItem(expiryKey, expiryTime.toString());
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

export async function getCache(key: string) {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const expiryKey = CACHE_EXPIRY_PREFIX + key;
    
    const expiryTime = await AsyncStorage.getItem(expiryKey);
    if (!expiryTime) return null;
    
    if (Date.now() > parseInt(expiryTime, 10)) {
      // Cache expired
      await AsyncStorage.removeItem(cacheKey);
      await AsyncStorage.removeItem(expiryKey);
      return null;
    }
    
    const cachedData = await AsyncStorage.getItem(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

export async function clearCache(key: string) {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const expiryKey = CACHE_EXPIRY_PREFIX + key;
    
    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(expiryKey);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export async function clearAllCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_EXPIRY_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}
