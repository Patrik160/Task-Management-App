# Security Specification for TaskFlow

## Data Invariants
1. A Board must have an owner.
2. A Task must belong to a Board.
3. Access to a Task is granted only if the user is a member or owner of the parent Board.
4. User profiles can only be modified by the owner of the profile.
5. `createdAt` fields are immutable.
6. `updatedAt` must always be the server time.

## The Dirty Dozen Payloads

### Identity Spoofing
1. **Payload 01: Hostile Ownership Takeover** (Create board with someone else as owner)
   `{ "name": "Evil Board", "ownerId": "attacker_uid", "createdAt": request.time }` -> Should fail if user tries to set `ownerId` to someone else's UID or if they are not the authenticated user.
2. **Payload 02: Impersonate Board Creator** (Update board ownerId)
   `{ "ownerId": "new_attacker_uid" }` -> Should fail.

### Integrity Violations
3. **Payload 03: Orphaned Task** (Create task with non-existent boardId)
   `{ "title": "Ghost Task", "boardId": "non_existent_id", ... }` -> Should fail validation.
4. **Payload 04: Shadow Fields** (Inject hidden metadata into task)
   `{ "title": "Task", "isAdmin": true, ... }` -> Should fail strict key check.
5. **Payload 05: Backdated Records** (Manually setting createdAt to past)
   `{ "title": "Old Task", "createdAt": timestamp.date(2000, 1, 1), ... }` -> Should fail (must match request.time).

### State Shortcutting
6. **Payload 06: Terminal State Loophole** (Re-opening a completed task without permission or skipping steps) - *App doesn't have complex state transitions yet, but if it did.*
7. **Payload 07: Priority Poisoning** (Setting priority to 1MB string)
   `{ "priority": "A".repeat(1024 * 1024) }` -> Should fail size check.

### Resource Exhaustion
8. **Payload 08: ID Poisoning** (Using a 2KB string as Board ID)
   `boards/VERY_LONG_ID...` -> Should fail `isValidId`.

### PII Leakage
9. **Payload 09: Global User Scraper** (Listing all users without filter)
   `firestore.collection('users').get()` -> Should fail unless filtered.

### Unauthorized Access
10. **Payload 10: Side-Load Task into Private Board** (Attacker writes task into a board they don't belong to)
11. **Payload 11: Member Elevation** (A member tries to change board members list)
12. **Payload 12: Profile Spoofing** (Updating someone else's email in `users` collection)

## The Test Runner (firestore.rules.test.ts)

```typescript
// Skeleton for validation (would be implemented with @firebase/rules-unit-testing)
// This is generated as part of the spec to define the security boundaries.
```
