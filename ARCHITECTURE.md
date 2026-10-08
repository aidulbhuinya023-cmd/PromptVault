# PromptVault: Architecture & Maintenance Guide

## Database Schema (Firestore)

### 1. `/users/{userId}`
- `uid`: string (matches `request.auth.uid`)
- `email`: string
- `displayName`: string
- `photoURL`: string
- `role`: 'admin' | 'contributor' | 'member'
- `department`: string
- `themePreference`: 'dark' | 'light' | 'system'
- `defaultAiTool`: string
- `emailNotifications`: boolean
- `createdAt`: serverTimestamp
- `updatedAt`: serverTimestamp

### 2. `/prompts/{promptId}`
- `id`: string
- `title`: string
- `description`: string
- `promptText`: string (supports `{{variable}}` placeholders)
- `category`: string ('Engineering', 'Product', 'Marketing', 'Sales', etc.)
- `targetTools`: string[] (['ChatGPT', 'Claude', 'Gemini'])
- `tags`: string[]
- `variables`: string[] (auto-extracted from promptText)
- `systemInstruction`: string
- `temperature`: number
- `exampleOutput`: string
- `tips`: string
- `authorId`: string
- `authorName`: string
- `authorEmail`: string
- `isStaffPick`: boolean (admin-controlled)
- `isVerified`: boolean (admin-controlled)
- `ratingAverage`: number
- `ratingCount`: number
- `favoritesCount`: number
- `copyCount`: number
- `createdAt`: serverTimestamp
- `updatedAt`: serverTimestamp

### 3. `/activityLogs/{logId}`
- `id`: string
- `userId`: string
- `userName`: string
- `userEmail`: string
- `action`: 'create_prompt' | 'update_prompt' | 'delete_prompt' | 'favorite_prompt' | 'test_prompt' | 'optimize_prompt' | 'update_branding' | 'update_profile'
- `targetId`: string
- `targetTitle`: string
- `details`: string
- `timestamp`: serverTimestamp
*Immutable append-only audit stream.*

### 4. `/settings/branding`
- `companyName`: string
- `logoUrl`: string
- `tagline`: string
- `allowedDomain`: string
- `primaryColor`: 'indigo' | 'emerald' | 'violet' | 'sky' | 'amber' | 'rose'
- `welcomeMessage`: string
- `updatedAt`: serverTimestamp
- `updatedBy`: string

---

## Security Model & Hardened ABAC Rules
1. **Master Gate & Identity Integrity**: Users can only write prompts where `incoming().authorId == request.auth.uid`.
2. **Action-Based Update Partitioning**:
   - Author edits can only affect content fields and cannot touch metrics or verification flags.
   - Community interactions (favorites, copy count) are constrained via `affectedKeys().hasOnly(['copyCount', 'favoritesCount', ...])`.
   - Admin overrides allow curation of `isStaffPick` and `isVerified`.
3. **Audit Immutability**: `activityLogs` are strictly append-only; update and delete are rejected at rule level (`allow update, delete: if false`).
4. **Denial-of-Wallet Guard**: All strings and collections enforce bounded lengths (`title.size() <= 150`, `promptText.size() <= 10000`).
