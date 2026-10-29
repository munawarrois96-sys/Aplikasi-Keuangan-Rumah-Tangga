# Security Specification for Firestore Security Rules

## 1. Data Invariants
1. A user can only read and write their own documents under `/users/{userId}`.
2. Cross-user reading or updating of financial data is strictly forbidden.
3. Every write operation requires an authenticated user with `request.auth.uid == userId`.
4. User IDs must adhere to safe format regex `^[a-zA-Z0-9_\-]+$` and length <= 128.
5. All collection lists or single gets without valid authentication must be denied.

## 2. The Dirty Dozen Payloads (Forbidden Actions)
1. Unauthenticated read on `/users/{userId}` -> PERMISSION_DENIED.
2. Unauthenticated write on `/users/{userId}` -> PERMISSION_DENIED.
3. Authenticated user A writing to `/users/{userIdB}` -> PERMISSION_DENIED.
4. Authenticated user A reading from `/users/{userIdB}` -> PERMISSION_DENIED.
5. Injected path ID with malicious characters (e.g., `../../hack`) -> PERMISSION_DENIED.
6. Payload exceeding string boundary limits (> 1MB or oversized field) -> PERMISSION_DENIED.
7. Spoofed `userId` in `HouseholdData` payload where `incoming().userId != request.auth.uid` -> PERMISSION_DENIED.
8. Unauthenticated read on subcollection `/users/{userId}/household/main` -> PERMISSION_DENIED.
9. Ghost field injection on arbitrary collections (`match /{document=**}`) -> PERMISSION_DENIED.
10. Blanket query on `/users` collection without scoping to owner -> PERMISSION_DENIED.
11. Unauthenticated delete operation on financial record -> PERMISSION_DENIED.
12. Attempt to write with non-string data in mandatory string fields -> PERMISSION_DENIED.
