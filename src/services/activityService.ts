import { collection, doc, setDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseError';
import { ActivityAction, ActivityLog } from '../types';

const ACTIVITY_COLLECTION = 'activityLogs';

export async function logUserActivity(
  action: ActivityAction,
  details: string,
  targetId?: string,
  targetTitle?: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `${ACTIVITY_COLLECTION}/${logId}`;

  try {
    const docRef = doc(db, ACTIVITY_COLLECTION, logId);
    await setDoc(docRef, {
      id: logId,
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Team Member',
      userEmail: user.email || '',
      action,
      targetId: targetId || '',
      targetTitle: targetTitle || '',
      details: details.slice(0, 1000),
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Audit logs non-blocking for UX, but log via error handler
    console.warn('Activity logging issue:', err);
  }
}

export async function fetchRecentActivities(limitCount = 20): Promise<ActivityLog[]> {
  try {
    const colRef = collection(db, ACTIVITY_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);

    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId || '',
        userName: data.userName || 'Team Member',
        userEmail: data.userEmail || '',
        action: data.action,
        targetId: data.targetId || '',
        targetTitle: data.targetTitle || '',
        details: data.details || '',
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
      } as ActivityLog;
    });
  } catch (err) {
    console.warn('Could not fetch activity logs:', err);
    return [];
  }
}
