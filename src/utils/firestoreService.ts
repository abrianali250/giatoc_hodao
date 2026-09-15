import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { Member } from '../types';
import { INITIAL_MEMBERS } from '../data/initialGenealogy';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase & Firestore with configured databaseId
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const targetDatabaseId = (firebaseConfig as any)?.firestoreDatabaseId;
export const db = targetDatabaseId ? getFirestore(app, targetDatabaseId) : getFirestore(app);

/**
 * Validate connection to Firestore as required by system instructions
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'meta', 'status'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline, using cache/local state.');
      return false;
    }
    return true;
  }
}

/**
 * Sanitize member object so Firestore doesn't complain about `undefined` values.
 */
export function sanitizeMember(member: Member): Record<string, any> {
  const clean: Record<string, any> = {
    id: member.id,
    fullName: member.fullName.trim(),
    generation: Number(member.generation) || 1,
    gender: member.gender || 'male',
    sourceVerified: Boolean(member.sourceVerified),
    spouseIds: Array.isArray(member.spouseIds) ? member.spouseIds : [],
    childrenIds: Array.isArray(member.childrenIds) ? member.childrenIds : []
  };

  if (member.fatherId) clean.fatherId = member.fatherId;
  if (member.motherId) clean.motherId = member.motherId;
  if (member.birthDate) clean.birthDate = member.birthDate;
  if (member.deathDate) clean.deathDate = member.deathDate;
  if (member.alias) clean.alias = member.alias;
  if (member.branchName) clean.branchName = member.branchName;
  if (member.notes) clean.notes = member.notes;
  if (member.verificationNotes) clean.verificationNotes = member.verificationNotes;
  if (member.avatar) clean.avatar = member.avatar;
  if (typeof member.isAdopted === 'boolean') clean.isAdopted = member.isAdopted;
  if (typeof member.isAlive === 'boolean') clean.isAlive = member.isAlive;
  if (typeof member.orderInFamily === 'number') clean.orderInFamily = member.orderInFamily;

  return clean;
}

/**
 * Reconstruct a full Member object from a Firestore document
 */
export function parseFirestoreMember(data: any): Member {
  return {
    id: data.id,
    fullName: data.fullName || 'Chưa rõ tên',
    gender: data.gender || 'male',
    generation: data.generation || 1,
    birthDate: data.birthDate || undefined,
    deathDate: data.deathDate || undefined,
    avatar: data.avatar || null,
    fatherId: data.fatherId || null,
    motherId: data.motherId || null,
    spouseIds: Array.isArray(data.spouseIds) ? data.spouseIds : [],
    childrenIds: Array.isArray(data.childrenIds) ? data.childrenIds : [],
    notes: data.notes || undefined,
    alias: data.alias || undefined,
    branchName: data.branchName || undefined,
    sourceVerified: Boolean(data.sourceVerified),
    verificationNotes: data.verificationNotes || undefined,
    isAdopted: Boolean(data.isAdopted),
    isAlive: data.isAlive !== undefined ? Boolean(data.isAlive) : undefined,
    orderInFamily: typeof data.orderInFamily === 'number' ? data.orderInFamily : undefined
  };
}

/**
 * Upload multiple members to Firestore using batched writes (max 400 per batch)
 */
export async function bulkUploadMembersToFirestore(membersList: Member[]): Promise<void> {
  const BATCH_SIZE = 400;
  for (let i = 0; i < membersList.length; i += BATCH_SIZE) {
    const chunk = membersList.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    chunk.forEach((member) => {
      const docRef = doc(db, 'members', member.id);
      batch.set(docRef, sanitizeMember(member));
    });

    await batch.commit();
  }

  // Update metadata
  const metaRef = doc(db, 'meta', 'status');
  await setDoc(metaRef, {
    updatedAt: new Date().toISOString(),
    totalMembers: membersList.length
  });
}

/**
 * Save or update a single member in Firestore
 */
export async function saveMemberToFirestore(member: Member, allMembersCount?: number): Promise<void> {
  const memberRef = doc(db, 'members', member.id);
  await setDoc(memberRef, sanitizeMember(member), { merge: true });

  if (allMembersCount !== undefined) {
    const metaRef = doc(db, 'meta', 'status');
    await setDoc(
      metaRef,
      {
        updatedAt: new Date().toISOString(),
        totalMembers: allMembersCount
      },
      { merge: true }
    );
  }
}

/**
 * Delete a single member from Firestore
 */
export async function deleteMemberFromFirestore(memberId: string, remainingCount?: number): Promise<void> {
  const memberRef = doc(db, 'members', memberId);
  await deleteDoc(memberRef);

  if (remainingCount !== undefined) {
    const metaRef = doc(db, 'meta', 'status');
    await setDoc(
      metaRef,
      {
        updatedAt: new Date().toISOString(),
        totalMembers: remainingCount
      },
      { merge: true }
    );
  }
}

/**
 * Load members once from Firestore
 */
export async function loadMembersFromFirestore(): Promise<Member[] | null> {
  try {
    const membersColl = collection(db, 'members');
    const snapshot = await getDocs(membersColl);

    if (snapshot.empty) {
      return null;
    }

    const members: Member[] = [];
    const seenIds = new Set<string>();
    snapshot.forEach((docSnap) => {
      const m = parseFirestoreMember(docSnap.data());
      if (m && m.id && !seenIds.has(m.id)) {
        seenIds.add(m.id);
        members.push(m);
      }
    });
    return members;
  } catch (err) {
    console.error('Error fetching members from Firestore:', err);
    return null;
  }
}

/**
 * Subscribe to real-time updates from Firestore.
 * Automatically seeds the database if it is currently empty!
 */
export function subscribeToFirestore(
  onData: (members: Member[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const membersColl = collection(db, 'members');

  return onSnapshot(
    membersColl,
    async (snapshot) => {
      if (snapshot.empty) {
        console.log('Cơ sở dữ liệu đám mây chưa có dữ liệu. Đang khởi tạo dữ liệu ban đầu...');
        try {
          // Auto-seed initial members from initialGenealogy
          await bulkUploadMembersToFirestore(INITIAL_MEMBERS);
          onData(INITIAL_MEMBERS);
        } catch (seedErr) {
          console.error('Lỗi khởi tạo dữ liệu ban đầu lên Firestore:', seedErr);
          onData(INITIAL_MEMBERS);
        }
        return;
      }

      const list: Member[] = [];
      const seenIds = new Set<string>();
      snapshot.forEach((docSnap) => {
        const m = parseFirestoreMember(docSnap.data());
        if (m && m.id && !seenIds.has(m.id)) {
          seenIds.add(m.id);
          list.push(m);
        }
      });

      // Sort by generation ascending, then orderInFamily or fullName
      list.sort((a, b) => {
        if (a.generation !== b.generation) return a.generation - b.generation;
        if ((a.orderInFamily || 0) !== (b.orderInFamily || 0)) {
          return (a.orderInFamily || 0) - (b.orderInFamily || 0);
        }
        return a.fullName.localeCompare(b.fullName, 'vi');
      });

      onData(list);
    },
    (error) => {
      console.error('Lỗi lắng nghe Firestore:', error);
      if (onError) onError(error);
    }
  );
}
