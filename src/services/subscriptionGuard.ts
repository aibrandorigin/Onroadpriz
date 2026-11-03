import { User, Vehicle, VehicleCategory } from '../types';

export interface EntitlementCheckResult {
  hasAccess: boolean;
  reason?: 'AUTH_REQUIRED' | 'NO_PLAN' | 'PLAN_EXPIRED' | 'LIMIT_EXHAUSTED' | 'CATEGORY_RESTRICTED' | 'ALLOWED';
  message?: string;
  redirectTo?: string;
  remainingEntitlement?: number;
}

/**
 * Validates if customer is permitted to unlock/view protected vehicle details
 */
export function checkBuyerEntitlement(
  user: User | null, 
  vehicle: Vehicle | null
): EntitlementCheckResult {
  // 1. Authentication Check
  if (!user) {
    return {
      hasAccess: false,
      reason: 'AUTH_REQUIRED',
      message: 'Please sign in to access vehicle details and owner contact.',
      redirectTo: '/login',
    };
  }

  // Admins & staff bypass buyer paywall for moderation purposes
  if (user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Moderator') {
    return { hasAccess: true, reason: 'ALLOWED' };
  }

  // If vehicle is owned by current user
  if (vehicle && vehicle.seller?.id === user.id) {
    return { hasAccess: true, reason: 'ALLOWED' };
  }

  // 2. Buyer Plan Presence Check
  const plan = user.buyerPlan;
  if (!plan) {
    const returnTarget = vehicle ? `/buy/${vehicle.id}` : '/buy';
    return {
      hasAccess: false,
      reason: 'NO_PLAN',
      message: 'Choose a Buyer Plan to access this vehicle and connect directly with the owner.',
      redirectTo: `/plans/buyer?returnTo=${encodeURIComponent(returnTarget)}`,
      remainingEntitlement: 0,
    };
  }

  // 3. Expiry Date Check
  const now = new Date();
  const expiry = new Date(plan.expiresAt);
  if (now > expiry || plan.status === 'expired') {
    const returnTarget = vehicle ? `/buy/${vehicle.id}` : '/buy';
    return {
      hasAccess: false,
      reason: 'PLAN_EXPIRED',
      message: `Your Buyer Plan expired on ${expiry.toLocaleDateString('en-IN')}. Please renew to continue viewing vehicles.`,
      redirectTo: `/plans/buyer?returnTo=${encodeURIComponent(returnTarget)}`,
      remainingEntitlement: 0,
    };
  }

  // 4. Remaining Unlocks / Views Limit Check
  const remaining = plan.listingViewsRemaining ?? (plan.listingViewsAllowed || 10);
  // Check if vehicle was already unlocked previously
  const alreadyUnlocked = vehicle && user.accessedOwnershipVehicles?.includes(vehicle.id);

  if (!alreadyUnlocked && remaining <= 0) {
    const returnTarget = vehicle ? `/buy/${vehicle.id}` : '/buy';
    return {
      hasAccess: false,
      reason: 'LIMIT_EXHAUSTED',
      message: 'You have used all vehicle unlocks available in your current Buyer Plan.',
      redirectTo: `/plans/buyer?returnTo=${encodeURIComponent(returnTarget)}`,
      remainingEntitlement: 0,
    };
  }

  // 5. Category Entitlement Check (if restricted)
  if (vehicle && plan.categoriesAllowed && plan.categoriesAllowed.length > 0) {
    const catAllowed = plan.categoriesAllowed.some(c => 
      c.toLowerCase() === (vehicle.category || '').toLowerCase()
    );
    if (!catAllowed) {
      const returnTarget = `/buy/${vehicle.id}`;
      return {
        hasAccess: false,
        reason: 'CATEGORY_RESTRICTED',
        message: `Your Buyer Plan does not cover "${vehicle.category}". Please upgrade your plan.`,
        redirectTo: `/plans/buyer?returnTo=${encodeURIComponent(returnTarget)}`,
      };
    }
  }

  return {
    hasAccess: true,
    reason: 'ALLOWED',
    remainingEntitlement: remaining,
  };
}

/**
 * Validates if seller is permitted to list a vehicle in the specified category
 */
export function checkSellerEntitlement(
  user: User | null,
  category?: VehicleCategory,
  activeListingsCount: number = 0
): EntitlementCheckResult {
  // 1. Authentication Check
  if (!user) {
    return {
      hasAccess: false,
      reason: 'AUTH_REQUIRED',
      message: 'Please sign in with your OnRoadPriz seller account to list a vehicle.',
      redirectTo: '/login?returnTo=/sell',
    };
  }

  // Admins & staff bypass seller limits for administration/testing
  if (user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Moderator') {
    return { hasAccess: true, reason: 'ALLOWED' };
  }

  // 2. Seller Plan Presence Check
  const plan = user.sellerPlan;
  if (!plan) {
    return {
      hasAccess: false,
      reason: 'NO_PLAN',
      message: 'Choose a Seller Plan to list your vehicle on OnRoadPriz.',
      redirectTo: '/plans/seller?returnTo=/sell',
      remainingEntitlement: 0,
    };
  }

  // 3. Expiry Date Check
  const now = new Date();
  const expiry = new Date(plan.expiresAt);
  if (now > expiry || plan.status === 'expired') {
    return {
      hasAccess: false,
      reason: 'PLAN_EXPIRED',
      message: `Your Seller Plan expired on ${expiry.toLocaleDateString('en-IN')}. Please renew to list new vehicles.`,
      redirectTo: '/plans/seller?returnTo=/sell',
      remainingEntitlement: 0,
    };
  }

  // 4. Listing Count Limit Check
  const allowed = plan.listingsAllowed || 2;
  const remaining = plan.listingsRemaining ?? Math.max(0, allowed - activeListingsCount);

  if (remaining <= 0) {
    return {
      hasAccess: false,
      reason: 'LIMIT_EXHAUSTED',
      message: `You have used all ${allowed} vehicle listings available in your current ${plan.name}.`,
      redirectTo: '/plans/seller?returnTo=/sell',
      remainingEntitlement: 0,
    };
  }

  // 5. Category Restriction Check
  if (category && plan.categoriesAllowed && plan.categoriesAllowed.length > 0) {
    const isCatAllowed = plan.categoriesAllowed.some(c => 
      c.toLowerCase() === category.toLowerCase()
    );
    if (!isCatAllowed) {
      return {
        hasAccess: false,
        reason: 'CATEGORY_RESTRICTED',
        message: `Your current plan does not cover the "${category}" category. Please choose an applicable plan.`,
        redirectTo: '/plans/seller?returnTo=/sell',
      };
    }
  }

  return {
    hasAccess: true,
    reason: 'ALLOWED',
    remainingEntitlement: remaining,
  };
}
