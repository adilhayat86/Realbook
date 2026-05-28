import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  WhereFilterOp,
} from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { hasFirebaseEnv } from './status';

interface FirebaseEnvConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface CloudWhereClause {
  field: string;
  operator: WhereFilterOp;
  value: unknown;
}

export interface CloudQueryOptions {
  where?: CloudWhereClause[];
  orderBy?: {
    field: string;
    direction?: 'asc' | 'desc';
  };
}

function getFirebaseEnvConfig(): FirebaseEnvConfig | null {
  if (!hasFirebaseEnv()) return null;

  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  };
}

export function isCloudReady() {
  return hasFirebaseEnv();
}

function getCloudDb() {
  const config = getFirebaseEnvConfig();
  if (!config) return null;

  const app = getApps().length ? getApp() : initializeApp(config);
  return getFirestore(app);
}

function buildCollectionQuery(collectionName: string, options?: CloudQueryOptions) {
  const db = getCloudDb();
  if (!db) return null;

  const constraints = [
    ...(options?.where ?? []).map((clause) => where(clause.field, clause.operator, clause.value)),
    ...(options?.orderBy ? [orderBy(options.orderBy.field, options.orderBy.direction ?? 'desc')] : []),
  ];

  const collectionRef = collection(db, collectionName);
  return constraints.length ? query(collectionRef, ...constraints) : collectionRef;
}

export async function getCloudDocuments<T extends { id?: string }>(
  collectionName: string,
  options?: CloudQueryOptions
): Promise<T[] | null> {
  const collectionQuery = buildCollectionQuery(collectionName, options);
  if (!collectionQuery) return null;

  const snapshot = await getDocs(collectionQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
}

export async function setCloudDocument<T extends object>(
  collectionName: string,
  documentId: string,
  value: T
): Promise<T | null> {
  const db = getCloudDb();
  if (!db) return null;

  await setDoc(doc(db, collectionName, documentId), value, { merge: true });
  return value;
}

export async function addCloudDocument<T extends object>(
  collectionName: string,
  value: T
): Promise<(T & { id: string }) | null> {
  const db = getCloudDb();
  if (!db) return null;

  const ref = await addDoc(collection(db, collectionName), value);
  return { id: ref.id, ...value };
}

export async function updateCloudDocument<T extends object>(
  collectionName: string,
  documentId: string,
  value: Partial<T>
): Promise<Partial<T> | null> {
  const db = getCloudDb();
  if (!db) return null;

  await updateDoc(doc(db, collectionName, documentId), value as Record<string, unknown>);
  return value;
}

export async function deleteCloudDocument(
  collectionName: string,
  documentId: string
): Promise<boolean> {
  const db = getCloudDb();
  if (!db) return false;

  await deleteDoc(doc(db, collectionName, documentId));
  return true;
}
