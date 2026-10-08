import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseError';
import { CompanyBranding } from '../types';

export const DEFAULT_BRANDING: CompanyBranding = {
  companyName: 'PromptVault Enterprise',
  logoUrl: '',
  tagline: 'Private, self-hosted AI prompt library • Powered by Apex Web Studio India',
  allowedDomain: '',
  primaryColor: 'indigo',
  welcomeMessage: 'Discover, benchmark, and share verified AI prompts across Engineering, Product, Sales, and Operations. Powered by Apex Web Studio India.',
};

const BRANDING_DOC_PATH = 'settings/branding';

export async function getCompanyBranding(): Promise<CompanyBranding> {
  try {
    const docRef = doc(db, 'settings', 'branding');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_BRANDING, ...(snap.data() as CompanyBranding) };
    }
    return DEFAULT_BRANDING;
  } catch (err) {
    console.warn('Could not fetch remote branding, falling back to defaults:', err);
    return DEFAULT_BRANDING;
  }
}

export async function updateCompanyBranding(
  branding: Partial<CompanyBranding>,
  adminUid: string
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'branding');
    await setDoc(
      docRef,
      {
        ...branding,
        updatedAt: serverTimestamp(),
        updatedBy: adminUid,
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, BRANDING_DOC_PATH);
  }
}
