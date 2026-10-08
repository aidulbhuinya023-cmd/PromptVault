import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseError';
import { UserProfile } from '../types';

const USERS_COLLECTION = 'users';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `${USERS_COLLECTION}/${uid}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName || 'Team Member',
      photoURL: data.photoURL || '',
      role: data.role || 'member',
      department: data.department || 'General',
      themePreference: data.themePreference || 'dark',
      defaultAiTool: data.defaultAiTool || 'All Tools',
      emailNotifications: data.emailNotifications ?? true,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function upsertUserProfile(profile: Partial<UserProfile> & { uid: string; email: string }): Promise<UserProfile> {
  const path = `${USERS_COLLECTION}/${profile.uid}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, profile.uid);
    const snap = await getDoc(docRef);

    const isSystemAdminEmail = profile.email === 'aidulbhuinya023@gmail.com';
    const finalRole = isSystemAdminEmail ? 'admin' : (profile.role || 'member');

    const updatedProfile: UserProfile = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName || profile.email.split('@')[0],
      photoURL: profile.photoURL || '',
      role: finalRole,
      department: profile.department || 'Engineering',
      themePreference: profile.themePreference || 'dark',
      defaultAiTool: profile.defaultAiTool || 'All Tools',
      emailNotifications: profile.emailNotifications ?? true,
    };

    if (!snap.exists()) {
      await setDoc(docRef, {
        ...updatedProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        docRef,
        {
          ...updatedProfile,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return updatedProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
