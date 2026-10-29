import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import { auth } from './authService';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Account,
  AssetItem,
  Budget,
  DebtItem,
  EmergencyFund,
  FinancialGoal,
  HouseholdCollaboration,
  InvestmentAsset,
  RecurringBill,
  Transaction,
  AILeakAnalysis
} from '../types/finance';

// Re-use or init app instance cleanly in ESM
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Ensure firestoreDatabaseId is passed as required by the Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test per skill directive
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline.');
      return false;
    }
    // Permission denied or other is fine as long as network connected
    return true;
  }
}

export interface SyncedHouseholdPayload {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  emergencyFund: EmergencyFund;
  goals: FinancialGoal[];
  investments: InvestmentAsset[];
  debts: DebtItem[];
  assets: AssetItem[];
  bills: RecurringBill[];
  collaboration: HouseholdCollaboration;
  leakReport?: AILeakAnalysis;
  lastSyncedAt?: string;
  deviceLabel?: string;
}

// Save household data to Firestore (cross-device sync)
export async function saveHouseholdToFirestore(
  userId: string,
  payload: SyncedHouseholdPayload
): Promise<string> {
  const path = `users/${userId}/household/main`;
  try {
    const now = new Date().toISOString();
    const docData = {
      userId,
      accounts: JSON.stringify(payload.accounts),
      transactions: JSON.stringify(payload.transactions),
      budgets: JSON.stringify(payload.budgets),
      emergencyFund: JSON.stringify(payload.emergencyFund),
      goals: JSON.stringify(payload.goals),
      investments: JSON.stringify(payload.investments),
      debts: JSON.stringify(payload.debts),
      assets: JSON.stringify(payload.assets),
      bills: JSON.stringify(payload.bills),
      collaboration: JSON.stringify(payload.collaboration),
      leakReport: payload.leakReport ? JSON.stringify(payload.leakReport) : '',
      lastSyncedAt: now,
      deviceLabel: navigator.userAgent.includes('Mobile') ? 'Smartphone' : 'Komputer / Laptop',
    };

    await setDoc(doc(db, 'users', userId, 'household', 'main'), docData, { merge: true });
    return now;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return new Date().toISOString();
  }
}

// Subscribe to real-time changes on Firestore across devices
export function subscribeHouseholdFromFirestore(
  userId: string,
  onDataReceived: (data: SyncedHouseholdPayload, lastSyncedAt: string) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = `users/${userId}/household/main`;
  const docRef = doc(db, 'users', userId, 'household', 'main');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.data();
        try {
          const parsed: SyncedHouseholdPayload = {
            accounts: raw.accounts ? JSON.parse(raw.accounts) : [],
            transactions: raw.transactions ? JSON.parse(raw.transactions) : [],
            budgets: raw.budgets ? JSON.parse(raw.budgets) : [],
            emergencyFund: raw.emergencyFund ? JSON.parse(raw.emergencyFund) : undefined,
            goals: raw.goals ? JSON.parse(raw.goals) : [],
            investments: raw.investments ? JSON.parse(raw.investments) : [],
            debts: raw.debts ? JSON.parse(raw.debts) : [],
            assets: raw.assets ? JSON.parse(raw.assets) : [],
            bills: raw.bills ? JSON.parse(raw.bills) : [],
            collaboration: raw.collaboration ? JSON.parse(raw.collaboration) : undefined,
            leakReport: raw.leakReport ? JSON.parse(raw.leakReport) : undefined,
            lastSyncedAt: raw.lastSyncedAt,
            deviceLabel: raw.deviceLabel,
          };
          onDataReceived(parsed, raw.lastSyncedAt || new Date().toISOString());
        } catch (parseErr) {
          console.error('Error parsing synced household data:', parseErr);
        }
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Fetch single snapshot
export async function fetchHouseholdFromFirestore(
  userId: string
): Promise<SyncedHouseholdPayload | null> {
  const path = `users/${userId}/household/main`;
  try {
    const docRef = doc(db, 'users', userId, 'household', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const raw = snap.data();
      return {
        accounts: raw.accounts ? JSON.parse(raw.accounts) : [],
        transactions: raw.transactions ? JSON.parse(raw.transactions) : [],
        budgets: raw.budgets ? JSON.parse(raw.budgets) : [],
        emergencyFund: raw.emergencyFund ? JSON.parse(raw.emergencyFund) : undefined,
        goals: raw.goals ? JSON.parse(raw.goals) : [],
        investments: raw.investments ? JSON.parse(raw.investments) : [],
        debts: raw.debts ? JSON.parse(raw.debts) : [],
        assets: raw.assets ? JSON.parse(raw.assets) : [],
        bills: raw.bills ? JSON.parse(raw.bills) : [],
        collaboration: raw.collaboration ? JSON.parse(raw.collaboration) : undefined,
        leakReport: raw.leakReport ? JSON.parse(raw.leakReport) : undefined,
        lastSyncedAt: raw.lastSyncedAt,
        deviceLabel: raw.deviceLabel,
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
