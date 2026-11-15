# Noël Royale — Firestore Security Specification

## 1. Data Invariants
1. **Identity Isolation (`users/{userId}`)**: Only the authenticated, email-verified user whose `request.auth.uid == userId` may read, create, or update their `users/{userId}` document. No user can list all users.
2. **Immutable Ledger (`users/{userId}/spins/{spinId}`)**: Spin records belong strictly to the verified parent `users/{userId}` document (checked via `exists()` on create and `get()`/`uid` alignment). Spin records are append-only (`allow update, delete: if false`).
3. **Zero PII on Public Leaderboard (`leaderboard/{userId}`)**: `leaderboard` entries store only `uid`, `displayName`, `biggestWin`, `peakBalance`, `totalSpins`, and `updatedAt` (zero emails or private data). Only the verified owner (`request.auth.uid == userId`) can create or update their own leaderboard row.
4. **Server Timestamps & Strict Bounds**: All `createdAt` / `updatedAt` fields must equal `request.time`. All numeric fields (`balance`, `activeLines`, `betPerLine`, `biggestWin`, etc.) are bounded (`activeLines` in `1..20`, `betPerLine` in `0.10..25.00`, non-negative counts/amounts). No shadow/ghost fields are permitted (`hasOnly()`).

## 2. Adversarial "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Cross-User Profile Read**: User B attempts `get(/users/userA)`.
2. **Cross-User Profile Write**: User B attempts `set(/users/userA, { uid: "userA", ... })`.
3. **UID Spoofing on Create**: User A attempts `set(/users/userA, { uid: "userB", ... })`.
4. **Shadow Field Injection on Create**: User A sends `{ ..., isAdmin: true }` to `/users/userA`.
5. **Shadow Field Injection on Update**: User A updates `/users/userA` with `{ balance: 3000, role: "vip" }`.
6. **Immutable `createdAt` Tampering**: User A attempts to alter `createdAt` during an update on `/users/userA`.
7. **Client-Forged Timestamp**: User A sends `createdAt: new Date("2020-01-01")` instead of `serverTimestamp()`.
8. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to write `/users/{uid}` or `/leaderboard/{uid}`.
9. **ID Poisoning**: User attempts to write `/users/` + `"a".repeat(200)` or ID containing `$` / spaces.
10. **Out-of-Bounds Bet Manipulation**: User A writes `activeLines: 500` or `betPerLine: -10` to `/users/userA`.
11. **Spin Ledger Tampering**: User A attempts `update` or `delete` on `/users/userA/spins/spin1`.
12. **Orphaned Spin Record**: User A attempts to create `/users/userA/spins/spin1` before `/users/userA` exists.
