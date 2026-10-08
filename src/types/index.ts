export type UserRole = 'admin' | 'member' | 'contributor';
export type ThemePreference = 'dark' | 'light' | 'system';
export type BrandColor = 'indigo' | 'emerald' | 'violet' | 'sky' | 'amber' | 'rose';

export type PromptCategory =
  | 'Engineering'
  | 'Product'
  | 'Marketing'
  | 'Sales'
  | 'Customer Support'
  | 'Legal'
  | 'Operations'
  | 'HR'
  | 'Design'
  | 'General';

export type TargetAiTool = 'ChatGPT' | 'Claude' | 'Gemini' | 'Midjourney' | 'DeepSeek' | 'All Tools';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  department: string;
  themePreference: ThemePreference;
  defaultAiTool: string;
  emailNotifications: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromptItem {
  id: string;
  title: string;
  description: string;
  promptText: string;
  category: PromptCategory;
  targetTools: string[];
  tags: string[];
  variables: string[];
  systemInstruction?: string;
  temperature?: number;
  exampleOutput?: string;
  tips?: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorPhotoURL?: string;
  isStaffPick?: boolean;
  isVerified?: boolean;
  ratingAverage: number;
  ratingCount: number;
  favoritesCount: number;
  copyCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ActivityAction =
  | 'create_prompt'
  | 'update_prompt'
  | 'delete_prompt'
  | 'favorite_prompt'
  | 'test_prompt'
  | 'optimize_prompt'
  | 'update_branding'
  | 'update_profile';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  action: ActivityAction;
  targetId?: string;
  targetTitle?: string;
  details?: string;
  timestamp: string;
}

export interface CompanyBranding {
  companyName: string;
  logoUrl?: string;
  tagline: string;
  allowedDomain?: string;
  primaryColor: BrandColor;
  welcomeMessage: string;
  updatedAt?: string;
  updatedBy?: string;
}
