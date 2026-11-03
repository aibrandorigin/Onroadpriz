/**
 * Firestore Security Rules Test Suite
 * Validating the Dirty Dozen Payloads for OnRoadPriz
 */

export interface TestPayload {
  name: string;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string } | null;
  data?: any;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: TestPayload[] = [
  {
    name: 'Payload 1: User Profile Impersonation',
    path: '/users/target_user_123',
    operation: 'create',
    auth: { uid: 'attacker_456' },
    data: { id: 'target_user_123', phone: '9876543210', role: 'Buyer' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 2: Role Escalation Attack',
    path: '/users/attacker_456',
    operation: 'update',
    auth: { uid: 'attacker_456' },
    data: { role: 'Admin' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 3: Vehicle Hijack (Seller ID Tampering)',
    path: '/vehicles/veh_101',
    operation: 'update',
    auth: { uid: 'attacker_456' },
    data: { sellerId: 'attacker_456' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 4: Ghost Field Injection (Shadow Update)',
    path: '/vehicles/veh_101',
    operation: 'update',
    auth: { uid: 'seller_101' },
    data: { __backdoorRole: 'root' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 5: Negative / Arbitrary Price Overflow',
    path: '/vehicles/veh_malicious',
    operation: 'create',
    auth: { uid: 'seller_101' },
    data: { id: 'veh_malicious', title: 'Malicious', price: -50000, sellerId: 'seller_101', status: 'Published' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 6: Unauthenticated Vehicle Listing Creation',
    path: '/vehicles/veh_999',
    operation: 'create',
    auth: null,
    data: { id: 'veh_999', title: 'Car', price: 200000, sellerId: 'anon', status: 'Published' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 7: Wishlist Scraping & Snooping',
    path: '/wishlists/item_789',
    operation: 'get',
    auth: { uid: 'user_xyz' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 8: Terminal State Bypass',
    path: '/vehicles/veh_sold',
    operation: 'update',
    auth: { uid: 'seller_sold' },
    data: { status: 'Published' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 9: Path Poisoning Attack',
    path: `/vehicles/${'a'.repeat(500)}`,
    operation: 'create',
    auth: { uid: 'seller_101' },
    data: { id: 'a'.repeat(500), title: 'Attack', price: 1000, sellerId: 'seller_101', status: 'Draft' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 10: Fake Enquiry / Forged Buyer ID',
    path: '/enquiries/enq_123',
    operation: 'create',
    auth: { uid: 'attacker_uid' },
    data: { id: 'enq_123', vehicleId: 'veh_101', sellerId: 'seller_101', buyerId: 'victim_uid', buyerPhone: '9000000000' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 11: Unauthorized Site Settings Modification',
    path: '/site_settings/site_settings_global',
    operation: 'update',
    auth: { uid: 'attacker_uid' },
    data: { siteName: 'Hacked Site' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    name: 'Payload 12: Order Forgery / Free Purchase Injection',
    path: '/orders/fake_order',
    operation: 'create',
    auth: { uid: 'attacker_uid' },
    data: { id: 'fake_order', userId: 'other_user', planId: 'pro', amount: 0, status: 'Success' },
    expectedResult: 'PERMISSION_DENIED'
  }
];
