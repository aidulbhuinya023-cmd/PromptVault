import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseError';
import { PromptItem } from '../types';
import { INITIAL_SEED_PROMPTS } from './seedData';
import { logUserActivity } from './activityService';

const PROMPTS_COLLECTION = 'prompts';

export function extractVariables(promptText: string): string[] {
  const matches = promptText.match(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g) || [];
  const vars = matches.map(m => m.replace(/[{}]/g, '').trim());
  return Array.from(new Set(vars));
}

export async function fetchAllPrompts(): Promise<PromptItem[]> {
  try {
    const colRef = collection(db, PROMPTS_COLLECTION);
    const snap = await getDocs(query(colRef, orderBy('createdAt', 'desc')));

    if (snap.empty) {
      // Return initial seed prompts
      return INITIAL_SEED_PROMPTS.map((p, idx) => ({
        ...p,
        id: `seed_prompt_${idx + 1}`,
        createdAt: new Date(Date.now() - (idx * 3600000 * 24)).toISOString(),
        updatedAt: new Date(Date.now() - (idx * 3600000 * 24)).toISOString(),
      }));
    }

    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        description: data.description || '',
        promptText: data.promptText || '',
        category: data.category || 'General',
        targetTools: data.targetTools || ['ChatGPT'],
        tags: data.tags || [],
        variables: data.variables || [],
        systemInstruction: data.systemInstruction || '',
        temperature: data.temperature ?? 0.7,
        exampleOutput: data.exampleOutput || '',
        tips: data.tips || '',
        authorId: data.authorId || '',
        authorName: data.authorName || 'Team Member',
        authorEmail: data.authorEmail || '',
        authorPhotoURL: data.authorPhotoURL || '',
        isStaffPick: Boolean(data.isStaffPick),
        isVerified: Boolean(data.isVerified),
        ratingAverage: data.ratingAverage || 5.0,
        ratingCount: data.ratingCount || 1,
        favoritesCount: data.favoritesCount || 0,
        copyCount: data.copyCount || 0,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      } as PromptItem;
    });
  } catch (err) {
    console.warn('Error reading prompts collection, returning seed fallback:', err);
    return INITIAL_SEED_PROMPTS.map((p, idx) => ({
      ...p,
      id: `seed_prompt_${idx + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

export async function createPrompt(
  promptData: Omit<PromptItem, 'id' | 'createdAt' | 'updatedAt' | 'favoritesCount' | 'copyCount' | 'ratingAverage' | 'ratingCount'>
): Promise<PromptItem> {
  const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `${PROMPTS_COLLECTION}/${promptId}`;

  const detectedVariables = extractVariables(promptData.promptText);

  try {
    const docRef = doc(db, PROMPTS_COLLECTION, promptId);
    const newDoc = {
      ...promptData,
      id: promptId,
      variables: detectedVariables,
      isStaffPick: Boolean(promptData.isStaffPick),
      isVerified: Boolean(promptData.isVerified),
      ratingAverage: 5.0,
      ratingCount: 1,
      favoritesCount: 0,
      copyCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, newDoc);

    await logUserActivity('create_prompt', `Created prompt: ${promptData.title}`, promptId, promptData.title);

    return {
      ...promptData,
      id: promptId,
      variables: detectedVariables,
      isStaffPick: Boolean(promptData.isStaffPick),
      isVerified: Boolean(promptData.isVerified),
      ratingAverage: 5.0,
      ratingCount: 1,
      favoritesCount: 0,
      copyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updatePrompt(
  promptId: string,
  updates: Partial<PromptItem>
): Promise<void> {
  const path = `${PROMPTS_COLLECTION}/${promptId}`;
  try {
    const docRef = doc(db, PROMPTS_COLLECTION, promptId);

    const safeUpdates: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.promptText) {
      safeUpdates.variables = extractVariables(updates.promptText);
    }

    // Protect immutable fields
    delete safeUpdates.id;
    delete safeUpdates.createdAt;
    delete safeUpdates.authorId;

    await updateDoc(docRef, safeUpdates);

    await logUserActivity('update_prompt', `Updated prompt`, promptId, updates.title);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deletePrompt(promptId: string, promptTitle: string): Promise<void> {
  const path = `${PROMPTS_COLLECTION}/${promptId}`;
  try {
    const docRef = doc(db, PROMPTS_COLLECTION, promptId);
    await deleteDoc(docRef);
    await logUserActivity('delete_prompt', `Deleted prompt`, promptId, promptTitle);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function recordPromptCopy(promptId: string): Promise<void> {
  const path = `${PROMPTS_COLLECTION}/${promptId}`;
  try {
    const docRef = doc(db, PROMPTS_COLLECTION, promptId);
    await updateDoc(docRef, {
      copyCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-blocking counter
  }
}

export async function toggleFavoritePrompt(
  userId: string,
  promptId: string,
  isCurrentlyFavorited: boolean
): Promise<boolean> {
  const favPath = `users/${userId}/favorites/${promptId}`;
  const promptPath = `${PROMPTS_COLLECTION}/${promptId}`;

  try {
    const favDocRef = doc(db, 'users', userId, 'favorites', promptId);
    const promptDocRef = doc(db, PROMPTS_COLLECTION, promptId);

    if (isCurrentlyFavorited) {
      await deleteDoc(favDocRef);
      await updateDoc(promptDocRef, {
        favoritesCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
      return false;
    } else {
      await setDoc(favDocRef, {
        userId,
        promptId,
        createdAt: serverTimestamp(),
      });
      await updateDoc(promptDocRef, {
        favoritesCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      await logUserActivity('favorite_prompt', 'Favorited prompt', promptId);
      return true;
    }
  } catch (err) {
    console.warn('Favorite toggle error:', err);
    return !isCurrentlyFavorited;
  }
}

export async function fetchUserFavoriteIds(userId: string): Promise<Set<string>> {
  try {
    const favsRef = collection(db, 'users', userId, 'favorites');
    const snap = await getDocs(favsRef);
    const ids = new Set<string>();
    snap.forEach(d => ids.add(d.id));
    return ids;
  } catch {
    return new Set<string>();
  }
}
