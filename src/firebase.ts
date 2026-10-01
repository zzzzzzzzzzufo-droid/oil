import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs,
  Firestore,
  addDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Vehicle, AuditLog } from './types';
import { INITIAL_FLEET_DATA } from './initialData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust multi-tab offline persistence & cache
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  console.warn('Persistent cache initialization note:', e);
  firestoreInstance = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);

// Error Handling conforming to Firebase Integration Skill specifications
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test at boot time
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore running in offline-first cached mode.");
      return false;
    }
    return true;
  }
}

// Seed initial authentic dataset if collection is empty
export async function seedInitialVehiclesIfEmpty(): Promise<void> {
  const path = 'fleet_vehicles';
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      console.log('Seeding initial 16 authentic fleet vehicles into Firestore...');
      for (const item of INITIAL_FLEET_DATA) {
        // Use deterministic slug for vehicle ID
        const docId = `car-${item.order}`;
        await setDoc(doc(db, path, docId), {
          ...item,
          updatedAt: new Date().toISOString(),
          updatedBy: 'System Auto-Seed'
        });
      }
      console.log('Fleet database seeded successfully.');
    }
  } catch (error) {
    console.warn('Initial seeding handled offline or error:', error);
  }
}

// Real-time listener for fleet vehicles
export function subscribeToFleetVehicles(
  onUpdate: (vehicles: Vehicle[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'fleet_vehicles';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        // Fallback to initial data if snapshot empty during initial boot
        const initialWithIds: Vehicle[] = INITIAL_FLEET_DATA.map((item) => ({
          ...item,
          id: `car-${item.order}`
        }));
        onUpdate(initialWithIds);
        seedInitialVehiclesIfEmpty();
        return;
      }

      const list: Vehicle[] = [];
      snapshot.forEach((d) => {
        list.push({
          ...(d.data() as Omit<Vehicle, 'id'>),
          id: d.id
        });
      });
      // Sort by order ascending
      list.sort((a, b) => a.order - b.order);
      onUpdate(list);
    },
    (error) => {
      console.warn("Firestore onSnapshot error (continuing with local cache):", error);
      if (onError) onError(error);
    }
  );
}

// Update single vehicle in Firestore
export async function updateVehicleData(
  id: string,
  updatedFields: Partial<Vehicle>,
  reason?: string
): Promise<void> {
  const path = `fleet_vehicles/${id}`;
  try {
    const docRef = doc(db, 'fleet_vehicles', id);
    const payload = {
      ...updatedFields,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'Fleet Manager'
    };
    await updateDoc(docRef, payload);

    // Also record audit log for enterprise accountability
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action: 'UPDATE_VEHICLE',
        vehiclePlate: updatedFields.plate || id,
        details: reason || `Updated operational fields: ${Object.keys(updatedFields).join(', ')}`,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid || 'anonymous-pro'
      });
    } catch {
      // Non-blocking audit log
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Reset data back to default authentic state
export async function resetFleetToDefault(): Promise<void> {
  const path = 'fleet_vehicles';
  for (const item of INITIAL_FLEET_DATA) {
    const docId = `car-${item.order}`;
    await setDoc(doc(db, path, docId), {
      ...item,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin Reset'
    });
  }
}
