# Security Specification: PromptVault Security TDD

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be read and written by the authenticated user whose `request.auth.uid == userId` (or an admin). Users cannot elevate their own role to `admin`.
2. **Prompt Authorship Invariant**: When creating a prompt at `/prompts/{promptId}`, `incoming().authorId` must strictly equal `request.auth.uid`. A prompt's `authorId` and `createdAt` cannot be modified after creation.
3. **Prompt Update Tiering**: Only the original author or an admin can update a prompt's title, description, content, or metadata. Non-admins cannot alter `isVerified` or `isStaffPick`.
4. **Prompt Deletion Invariant**: Only the author or an admin can delete a prompt.
5. **Branding Access Invariant**: Any authenticated member can read `/settings/branding`, but only admins can create or update organization branding.
6. **Activity Log Append-Only Invariant**: Activity logs at `/activityLogs/{logId}` can only be created with `incoming().userId == request.auth.uid` and valid action enums. Activity logs can never be updated or deleted.
7. **Favorites Isolation**: A user's favorites at `/users/{userId}/favorites/{promptId}` can only be accessed and mutated by that specific user.
8. **Size & Type Safety**: Every string field is strictly bounded by max-length checks to defend against denial-of-wallet resource attacks.

---

## 2. The "Dirty Dozen" Malicious Payloads

### Payload 1: Identity Spoofing in Prompt Creation
Attempting to author a prompt attributed to the CEO (`user_ceo_999`).
```json
{
  "title": "Confidential Board Summary",
  "promptText": "Summarize private board notes",
  "category": "Operations",
  "authorId": "user_ceo_999",
  "authorName": "CEO",
  "targetTools": ["ChatGPT"],
  "tags": ["exec"],
  "variables": []
}
```
*Expected: PERMISSION_DENIED (authorId must match request.auth.uid)*

### Payload 2: Privilege Escalation in User Document
A normal member attempting to grant themselves the `admin` role.
```json
{
  "uid": "victim_user_123",
  "email": "employee@company.com",
  "displayName": "John Doe",
  "role": "admin"
}
```
*Expected: PERMISSION_DENIED (Users cannot self-assign role: 'admin')*

### Payload 3: Shadow Update / Ghost Field Injection
Attempting to inject a hidden malicious field `__internalPrivileges` on prompt update.
```json
{
  "title": "Updated Title",
  "promptText": "Updated valid text",
  "__internalPrivileges": { "sudo": true }
}
```
*Expected: PERMISSION_DENIED (affectedKeys().hasOnly() rejects undeclared fields)*

### Payload 4: Denial-of-Wallet (1MB String Attack)
Attempting to flood storage with an excessive 1MB prompt text payload.
```json
{
  "title": "Massive Prompt",
  "promptText": "<1,000,000 character string>",
  "category": "Engineering",
  "authorId": "user_attacker_001"
}
```
*Expected: PERMISSION_DENIED (promptText.size() <= 10000 constraint violated)*

### Payload 5: Immortal Field Tampering (Modifying `createdAt`)
Attempting to backdate an existing prompt's `createdAt` timestamp.
```json
{
  "title": "Valid Title",
  "createdAt": "2020-01-01T00:00:00Z"
}
```
*Expected: PERMISSION_DENIED (incoming().createdAt == existing().createdAt violated)*

### Payload 6: Unauthorized Organization Branding Tampering
A regular member attempting to update corporate branding and allowed domains.
```json
{
  "companyName": "Hacked Organization",
  "primaryColor": "rose",
  "allowedDomain": "evil-domain.com"
}
```
*Expected: PERMISSION_DENIED (isAdmin() required for /settings/branding writes)*

### Payload 7: Cross-User Profile Snooping and Tampering
User A attempting to overwrite User B's `/users/{userB_id}` document.
```json
{
  "displayName": "Impersonated Name",
  "department": "Compromised"
}
```
*Expected: PERMISSION_DENIED (isOwner() required)*

### Payload 8: Staff Pick / Verification Spoofing
A normal team member attempting to mark their own prompt as `isVerified: true` and `isStaffPick: true`.
```json
{
  "title": "My Super Prompt",
  "isVerified": true,
  "isStaffPick": true
}
```
*Expected: PERMISSION_DENIED (Only admins can modify verification flags)*

### Payload 9: Path Traversal / Poisoned Document ID
Injecting a malicious document ID containing path traversal characters into prompts.
```
Path: /prompts/../../../etc/passwd
```
*Expected: PERMISSION_DENIED (isValidId() regex '^[a-zA-Z0-9_-]+$' blocks invalid IDs)*

### Payload 10: Activity Audit Log Deletion
An employee attempting to delete activity audit logs to hide previous prompt actions.
```
DELETE /activityLogs/log_abc_123
```
*Expected: PERMISSION_DENIED (allow delete: if false)*

### Payload 11: Activity Log Mutation
An employee attempting to modify an already committed audit log.
```json
{
  "action": "fake_action",
  "details": "Tampered record"
}
```
*Expected: PERMISSION_DENIED (allow update: if false)*

### Payload 12: Hostile Prompt Deletion
User A attempting to delete User B's popular prompt.
```
DELETE /prompts/prompt_owned_by_user_b
```
*Expected: PERMISSION_DENIED (Only authorId == request.auth.uid or admin can delete)*
