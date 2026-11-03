# Firebase Firestore Security Specification & Invariants

## Target App: OnRoadPriz Used Vehicle Marketplace

### 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created or modified if `request.auth.uid == userId`.
2. **Role Elevation Prevention**: Normal users cannot self-assign role `Admin` or `Super Admin`.
3. **Vehicle Ownership Invariant**: A vehicle listing `/vehicles/{vehicleId}` can only be created by an authenticated user matching `incoming().sellerId == request.auth.uid`.
4. **Vehicle Immutability Invariant**: On vehicle updates, the `sellerId` cannot be changed (`incoming().sellerId == existing().sellerId`).
5. **Listing State Lock**: A vehicle marked as `Sold` or `Rejected` cannot be updated by sellers without administrative review.
6. **Wishlist Boundary**: A user can only create, list, and delete their own wishlist records (`resource.data.userId == request.auth.uid`).
7. **Enquiry Authenticity**: An enquiry must contain a valid `buyerPhone` and cannot forge another buyer's ID if authenticated.
8. **Order Security**: Orders can only be read or written by the purchasing user (`userId == request.auth.uid`) or platform admins.
9. **Settings Integrity**: Site settings (`/site_settings/{settingsId}`) can only be written by authenticated administrators.
10. **Sanitization & Boundary Guards**: All IDs, string fields, and numeric values must conform to strict length and boundary constraints.
11. **Catch-All Default Deny**: All unmatched collections or sub-paths default to `allow read, write: if false;`.
12. **Heartbeat Test**: The `/test/{testId}` document allows read access for connection probing.

---

### 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: User Profile Impersonation**
   - Attempt to write `/users/target_user_123` with `auth.uid = attacker_456`.
   - Expected Result: `PERMISSION_DENIED`.

2. **Payload 2: Role Escalation Attack**
   - Attempt to update `/users/attacker_456` with `{ role: "Admin" }`.
   - Expected Result: `PERMISSION_DENIED`.

3. **Payload 3: Vehicle Hijack (Seller ID Tampering)**
   - Attempt to update `/vehicles/veh_101` owned by `victim_111` by changing `sellerId` to `attacker_456`.
   - Expected Result: `PERMISSION_DENIED`.

4. **Payload 4: Ghost Field Injection ("Shadow Update")**
   - Attempt to update `/vehicles/veh_101` with unknown field `{ __backdoorRole: "root" }`.
   - Expected Result: `PERMISSION_DENIED`.

5. **Payload 5: Negative / Arbitrary Price Overflow ("Denial of Wallet")**
   - Attempt to create vehicle with `price: -500000` or huge string instead of number.
   - Expected Result: `PERMISSION_DENIED`.

6. **Payload 6: Unauthenticated Vehicle Listing Creation**
   - Attempt to create `/vehicles/veh_999` with `auth = null`.
   - Expected Result: `PERMISSION_DENIED`.

7. **Payload 7: Wishlist Scraping & Snooping**
   - Attempt to read `/wishlists/item_789` belonging to `user_abc` as `user_xyz`.
   - Expected Result: `PERMISSION_DENIED`.

8. **Payload 8: Terminal State Bypass**
   - Attempt to reactivate a `Sold` or `Rejected` vehicle listing without admin authorization.
   - Expected Result: `PERMISSION_DENIED`.

9. **Payload 9: Path Poisoning Attack**
   - Attempt to write with a 2KB garbage document ID `a`.repeat(2000).
   - Expected Result: `PERMISSION_DENIED`.

10. **Payload 10: Fake Enquiry / Forged Buyer ID**
    - Submitting an enquiry claiming `buyerId: victim_uid` when authenticated as `attacker_uid`.
    - Expected Result: `PERMISSION_DENIED`.

11. **Payload 11: Unauthorized Site Settings Modification**
    - Non-admin attempting to overwrite `/site_settings/site_settings_global`.
    - Expected Result: `PERMISSION_DENIED`.

12. **Payload 12: Order Forgery / Free Purchase Injection**
    - Submitting `/orders/fake_order` with `amount: 0` and `status: "Success"` for another user.
    - Expected Result: `PERMISSION_DENIED`.

---

### 3. Test Runner Definition
See `firestore.rules.test.ts` for automated security assertion suite verifying all Dirty Dozen payloads fail with `PERMISSION_DENIED`.
