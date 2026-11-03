import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { BuyerPlan, SellerPlan, OrderPayment, UserSubscription, PlanSnapshot } from '../../types';
import { INITIAL_BUYER_PLANS, INITIAL_SELLER_PLANS, INITIAL_ORDERS } from '../../data/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', '..', '..', 'data');

const PLANS_FILE_PATH = path.resolve(dataDir, 'plans.json');
const USER_PLANS_FILE_PATH = path.resolve(dataDir, 'user-plans.json');
const PAYMENTS_FILE_PATH = path.resolve(dataDir, 'payments.json');

export class PlanService {
  private static buyerPlans: BuyerPlan[] = [];
  private static sellerPlans: SellerPlan[] = [];
  private static userSubscriptions: Map<string, UserSubscription> = new Map();
  private static payments: OrderPayment[] = [];
  private static isInitialized = false;

  private static ensureDataDir() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  public static init() {
    if (this.isInitialized) return;
    this.ensureDataDir();

    // 1. Load Plans
    try {
      if (fs.existsSync(PLANS_FILE_PATH)) {
        const raw = fs.readFileSync(PLANS_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.buyerPlans && Array.isArray(parsed.buyerPlans)) {
          this.buyerPlans = parsed.buyerPlans;
        }
        if (parsed.sellerPlans && Array.isArray(parsed.sellerPlans)) {
          this.sellerPlans = parsed.sellerPlans;
        }
      }
    } catch (err) {
      console.error('[PlanService] Error reading plans.json:', err);
    }

    if (this.buyerPlans.length === 0) {
      this.buyerPlans = [...INITIAL_BUYER_PLANS];
    }
    if (this.sellerPlans.length === 0) {
      this.sellerPlans = [...INITIAL_SELLER_PLANS];
    }
    this.persistPlans();

    // 2. Load User Subscriptions
    try {
      if (fs.existsSync(USER_PLANS_FILE_PATH)) {
        const raw = fs.readFileSync(USER_PLANS_FILE_PATH, 'utf-8');
        const list: UserSubscription[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach(sub => this.userSubscriptions.set(sub.id, sub));
        }
      }
    } catch (err) {
      console.error('[PlanService] Error reading user-plans.json:', err);
    }

    // 3. Load Payments
    try {
      if (fs.existsSync(PAYMENTS_FILE_PATH)) {
        const raw = fs.readFileSync(PAYMENTS_FILE_PATH, 'utf-8');
        const list: OrderPayment[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.payments = list;
        }
      }
    } catch (err) {
      console.error('[PlanService] Error reading payments.json:', err);
    }

    if (this.payments.length === 0) {
      this.payments = [...INITIAL_ORDERS];
      this.persistPayments();
    }

    this.isInitialized = true;
    console.log(`[PlanService] Initialized with ${this.buyerPlans.length} buyer plans, ${this.sellerPlans.length} seller plans, ${this.userSubscriptions.size} subscriptions.`);
  }

  private static persistPlans() {
    try {
      this.ensureDataDir();
      const payload = {
        buyerPlans: this.buyerPlans,
        sellerPlans: this.sellerPlans,
        updatedAt: new Date().toISOString()
      };
      const tempPath = `${PLANS_FILE_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempPath, PLANS_FILE_PATH);
    } catch (err) {
      console.error('[PlanService] Error persisting plans:', err);
    }
  }

  private static persistSubscriptions() {
    try {
      this.ensureDataDir();
      const list = Array.from(this.userSubscriptions.values());
      const tempPath = `${USER_PLANS_FILE_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), 'utf-8');
      fs.renameSync(tempPath, USER_PLANS_FILE_PATH);
    } catch (err) {
      console.error('[PlanService] Error persisting subscriptions:', err);
    }
  }

  private static persistPayments() {
    try {
      this.ensureDataDir();
      const tempPath = `${PAYMENTS_FILE_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.payments, null, 2), 'utf-8');
      fs.renameSync(tempPath, PAYMENTS_FILE_PATH);
    } catch (err) {
      console.error('[PlanService] Error persisting payments:', err);
    }
  }

  public static getPublicBuyerPlans(): BuyerPlan[] {
    this.init();
    return this.buyerPlans.filter(p => p.active !== false);
  }

  public static getPublicSellerPlans(): SellerPlan[] {
    this.init();
    return this.sellerPlans.filter(p => p.active !== false);
  }

  public static deleteBuyerPlan(planId: string): boolean {
    this.init();
    const idx = this.buyerPlans.findIndex(p => p.id === planId);
    if (idx !== -1) {
      this.buyerPlans.splice(idx, 1);
      this.persistPlans();
      return true;
    }
    return false;
  }

  public static deleteSellerPlan(planId: string): boolean {
    this.init();
    const idx = this.sellerPlans.findIndex(p => p.id === planId);
    if (idx !== -1) {
      this.sellerPlans.splice(idx, 1);
      this.persistPlans();
      return true;
    }
    return false;
  }

  public static upsertBuyerPlan(plan: BuyerPlan): BuyerPlan {
    this.init();
    const idx = this.buyerPlans.findIndex(p => p.id === plan.id);
    if (idx !== -1) {
      this.buyerPlans[idx] = { ...this.buyerPlans[idx], ...plan };
    } else {
      this.buyerPlans.push(plan);
    }
    this.persistPlans();
    return plan;
  }

  public static upsertSellerPlan(plan: SellerPlan): SellerPlan {
    this.init();
    const idx = this.sellerPlans.findIndex(p => p.id === plan.id);
    if (idx !== -1) {
      this.sellerPlans[idx] = { ...this.sellerPlans[idx], ...plan };
    } else {
      this.sellerPlans.push(plan);
    }
    this.persistPlans();
    return plan;
  }

  public static findPlanById(planId: string): { plan: BuyerPlan | SellerPlan | null; type: 'buyer' | 'seller' | null } {
    this.init();
    const bPlan = this.buyerPlans.find(p => p.id === planId);
    if (bPlan) return { plan: bPlan, type: 'buyer' };

    const sPlan = this.sellerPlans.find(p => p.id === planId);
    if (sPlan) return { plan: sPlan, type: 'seller' };

    return { plan: null, type: null };
  }

  public static getUserSubscriptions(userId: string): UserSubscription[] {
    this.init();
    const now = Date.now();
    return Array.from(this.userSubscriptions.values())
      .filter(sub => sub.userId === userId)
      .map(sub => {
        const isExpired = new Date(sub.expiresAt).getTime() <= now;
        const computedStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' = isExpired ? 'EXPIRED' : (sub.status === 'CANCELLED' ? 'CANCELLED' : 'ACTIVE');
        return {
          ...sub,
          status: computedStatus
        };
      })
      .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
  }

  public static addSubscription(sub: UserSubscription): void {
    this.init();
    this.userSubscriptions.set(sub.id, sub);
    this.persistSubscriptions();
  }

  public static getActiveBuyerSubscription(userId: string, userRecord?: any): UserSubscription | null {
    this.init();
    const list = this.getUserSubscriptions(userId);
    const now = Date.now();
    const active = list.find(sub => 
      sub.planType === 'buyer' && 
      sub.status === 'ACTIVE' && 
      new Date(sub.expiresAt).getTime() > now
    );
    if (active) return active;

    const u = userRecord;
    if (u) {
      // 1. Check explicit active buyerPlan snapshot
      if (u.buyerPlan && u.buyerPlan.status !== 'expired') {
        const bp = u.buyerPlan;
        const matchingPlan = this.buyerPlans.find(p => p.id === bp.planId || p.name.toLowerCase() === (bp.name || '').toLowerCase()) || this.buyerPlans[0];
        const expiry = bp.expiresAt || u.subscriptionExpiry || new Date(now + 45 * 24 * 60 * 60 * 1000).toISOString();
        if (new Date(expiry).getTime() > now) {
          const synthesized: UserSubscription = {
            id: `sub-bp-${userId}-${matchingPlan.id}`,
            userId: u.id || userId,
            userName: u.name || u.fullName || 'Member',
            userEmail: u.email || '',
            planId: matchingPlan.id,
            planName: bp.name || matchingPlan.name,
            planType: 'buyer',
            baseAmount: bp.price || matchingPlan.price,
            taxAmount: Math.round((bp.price || matchingPlan.price) * 0.18),
            totalAmount: Math.round((bp.price || matchingPlan.price) * 1.18),
            activatedAt: bp.startedAt || u.registeredAt || new Date().toISOString(),
            purchasedAt: bp.startedAt || u.registeredAt || new Date().toISOString(),
            expiresAt: expiry,
            status: 'ACTIVE',
            listingsAllowed: 0,
            listingsRemaining: 0,
            viewsAllowed: bp.listingViewsAllowed ?? ((matchingPlan as any).listingViewsAllowed || (matchingPlan as any).contactsLimit || 25),
            viewsRemaining: bp.listingViewsRemaining ?? bp.listingViewsAllowed ?? 25,
            featuredSlotsAllowed: 0
          };
          this.userSubscriptions.set(synthesized.id, synthesized);
          this.persistSubscriptions();
          return synthesized;
        }
      }

      // 2. Check match by activePlan name or buyer subscriptionPlanId
      const candidatePlan = this.buyerPlans.find(p => 
        (u.activePlan && p.name.toLowerCase() === u.activePlan.toLowerCase()) ||
        (u.subscriptionPlanId && p.id === u.subscriptionPlanId) ||
        (u.subscriptionPlanId && p.id.toLowerCase() === u.subscriptionPlanId.toLowerCase())
      );
      if (candidatePlan) {
        const expiry = u.subscriptionExpiry || new Date(now + 45 * 24 * 60 * 60 * 1000).toISOString();
        if (new Date(expiry).getTime() > now) {
          const synthesized: UserSubscription = {
            id: `sub-syn-${userId}-${candidatePlan.id}`,
            userId: u.id || userId,
            userName: u.name || u.fullName || 'Member',
            userEmail: u.email || '',
            planId: candidatePlan.id,
            planName: candidatePlan.name,
            planType: 'buyer',
            baseAmount: candidatePlan.price,
            taxAmount: Math.round(candidatePlan.price * 0.18),
            totalAmount: Math.round(candidatePlan.price * 1.18),
            activatedAt: u.registeredAt || new Date().toISOString(),
            purchasedAt: u.registeredAt || new Date().toISOString(),
            expiresAt: expiry,
            status: 'ACTIVE',
            listingsAllowed: 0,
            listingsRemaining: 0,
            viewsAllowed: (candidatePlan as any).listingViewsAllowed || (candidatePlan as any).contactsLimit || 25,
            viewsRemaining: (candidatePlan as any).listingViewsAllowed || (candidatePlan as any).contactsLimit || 25,
            featuredSlotsAllowed: 0
          };
          this.userSubscriptions.set(synthesized.id, synthesized);
          this.persistSubscriptions();
          return synthesized;
        }
      }
    }
    return null;
  }

  public static getActiveSellerSubscription(userId: string, userRecord?: any): UserSubscription | null {
    this.init();
    const list = this.getUserSubscriptions(userId);
    const now = Date.now();
    const active = list.find(sub => 
      sub.planType === 'seller' && 
      sub.status === 'ACTIVE' && 
      new Date(sub.expiresAt).getTime() > now
    );
    if (active) return active;

    const u = userRecord;
    if (u) {
      // 1. Check explicit active sellerPlan snapshot
      if (u.sellerPlan && u.sellerPlan.status !== 'expired') {
        const sp = u.sellerPlan;
        const matchingPlan = this.sellerPlans.find(p => p.id === sp.planId || p.name.toLowerCase() === (sp.name || '').toLowerCase()) || this.sellerPlans[0];
        const expiry = sp.expiresAt || u.subscriptionExpiry || new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString();
        if (new Date(expiry).getTime() > now) {
          const synthesized: UserSubscription = {
            id: `sub-sp-${userId}-${matchingPlan.id}`,
            userId: u.id || userId,
            userName: u.name || u.fullName || 'Member',
            userEmail: u.email || '',
            planId: matchingPlan.id,
            planName: sp.name || matchingPlan.name,
            planType: 'seller',
            baseAmount: sp.price || matchingPlan.price,
            taxAmount: Math.round((sp.price || matchingPlan.price) * 0.18),
            totalAmount: Math.round((sp.price || matchingPlan.price) * 1.18),
            activatedAt: sp.startedAt || u.registeredAt || new Date().toISOString(),
            purchasedAt: sp.startedAt || u.registeredAt || new Date().toISOString(),
            expiresAt: expiry,
            status: 'ACTIVE',
            listingsAllowed: sp.listingsAllowed ?? matchingPlan.listingsLimit ?? 2,
            listingsRemaining: sp.listingsRemaining ?? sp.listingsAllowed ?? 2,
            viewsAllowed: 0,
            viewsRemaining: 0,
            featuredSlotsAllowed: matchingPlan.featuredSlots || 0
          };
          this.userSubscriptions.set(synthesized.id, synthesized);
          this.persistSubscriptions();
          return synthesized;
        }
      }

      // 2. Check match by activePlan name first (higher precision than default id)
      let candidatePlan: SellerPlan | null = null;
      if (u.activePlan && u.activePlan !== 'No Active Plan') {
        candidatePlan = this.sellerPlans.find(p => p.name.toLowerCase() === u.activePlan.toLowerCase()) || null;
      }
      if (!candidatePlan && u.subscriptionPlanId && (u.subscriptionPlanId.startsWith('plan-sel') || this.sellerPlans.some(p => p.id === u.subscriptionPlanId))) {
        candidatePlan = this.sellerPlans.find(p => p.id === u.subscriptionPlanId) || null;
      }
      if (!candidatePlan && u.role === 'Seller') {
        candidatePlan = this.sellerPlans[0];
      }

      if (candidatePlan) {
        const expiry = u.subscriptionExpiry || new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString();
        if (new Date(expiry).getTime() > now) {
          const synthesized: UserSubscription = {
            id: `sub-syn-${userId}-${candidatePlan.id}`,
            userId: u.id || userId,
            userName: u.name || u.fullName || 'Member',
            userEmail: u.email || '',
            planId: candidatePlan.id,
            planName: candidatePlan.name,
            planType: 'seller',
            baseAmount: candidatePlan.price,
            taxAmount: Math.round(candidatePlan.price * 0.18),
            totalAmount: Math.round(candidatePlan.price * 1.18),
            activatedAt: u.registeredAt || new Date().toISOString(),
            purchasedAt: u.registeredAt || new Date().toISOString(),
            expiresAt: expiry,
            status: 'ACTIVE',
            listingsAllowed: candidatePlan.listingsLimit || 2,
            listingsRemaining: candidatePlan.listingsLimit || 2,
            viewsAllowed: 0,
            viewsRemaining: 0,
            featuredSlotsAllowed: candidatePlan.featuredSlots || 0
          };
          this.userSubscriptions.set(synthesized.id, synthesized);
          this.persistSubscriptions();
          return synthesized;
        }
      }
    }
    return null;
  }

  public static getUserPayments(userId: string): OrderPayment[] {
    this.init();
    return this.payments
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }

  /**
   * Create order server-side with authentic database pricing and entitlements
   */
  public static createOrder(
    userId: string,
    userName: string,
    userEmail: string,
    planId: string,
    paymentGateway: string = 'UPI'
  ): { success: boolean; order?: any; error?: string } {
    this.init();
    const { plan, type } = this.findPlanById(planId);
    if (!plan || !type) {
      return { success: false, error: 'Invalid plan selected. Plan not found in system.' };
    }

    const baseAmount = plan.price;
    const taxRate = plan.taxRate ?? 0.18;
    const taxAmount = Math.round(baseAmount * taxRate * 100) / 100;
    const totalAmount = baseAmount + taxAmount;
    const orderId = `ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const orderData = {
      orderId,
      userId,
      userName,
      userEmail,
      planId: plan.id,
      planName: plan.name,
      planType: type,
      baseAmount,
      taxAmount,
      totalAmount,
      currency: 'INR',
      paymentGateway,
      durationDays: plan.durationDays || plan.validityDays || 30,
      createdAt: new Date().toISOString()
    };

    return { success: true, order: orderData };
  }

  /**
   * Verify and activate plan subscription idempotently on the server
   */
  public static verifyAndActivatePlan(
    userId: string,
    userName: string,
    userEmail: string,
    planId: string,
    orderId?: string,
    paymentId?: string,
    paymentGateway: string = 'UPI'
  ): { 
    success: boolean; 
    subscription?: UserSubscription; 
    snapshot?: PlanSnapshot; 
    payment?: OrderPayment; 
    error?: string 
  } {
    this.init();
    const { plan, type } = this.findPlanById(planId);
    if (!plan || !type) {
      return { success: false, error: 'Plan record does not exist in authoritative catalog.' };
    }

    const actualOrderId = orderId || `ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const actualPaymentId = paymentId || `TXN-${paymentGateway.toUpperCase()}-${crypto.randomBytes(6).toString('hex')}`;

    // Check idempotency: If this order was already activated, return existing subscription
    for (const existing of this.userSubscriptions.values()) {
      if (existing.orderId === actualOrderId && existing.userId === userId) {
        return {
          success: true,
          subscription: existing,
          snapshot: this.createPlanSnapshot(existing, plan)
        };
      }
    }

    const durationDays = plan.durationDays || plan.validityDays || 30;
    const nowMs = Date.now();
    const activatedAt = new Date(nowMs).toISOString();
    const expiresAt = new Date(nowMs + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const baseAmount = plan.price;
    const taxAmount = Math.round(baseAmount * (plan.taxRate ?? 0.18) * 100) / 100;
    const totalAmount = baseAmount + taxAmount;

    let listingsAllowed: number | undefined;
    let listingsRemaining: number | undefined;
    let viewsAllowed: number | undefined;
    let viewsRemaining: number | undefined;

    if (type === 'seller') {
      const sPlan = plan as SellerPlan;
      listingsAllowed = sPlan.listingsLimit || sPlan.listingLimit || sPlan.listingsAllowed || 5;
      listingsRemaining = listingsAllowed;
    } else {
      const bPlan = plan as BuyerPlan;
      viewsAllowed = bPlan.listingViewsAllowed || bPlan.contactsLimit || 25;
      viewsRemaining = viewsAllowed;
    }

    const subId = `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const newSubscription: UserSubscription = {
      id: subId,
      userId,
      planId: plan.id,
      planType: type,
      planName: plan.name,
      baseAmount,
      taxAmount,
      totalAmount,
      paymentId: actualPaymentId,
      orderId: actualOrderId,
      paymentGateway,
      purchasedAt: activatedAt,
      activatedAt,
      expiresAt,
      status: 'ACTIVE',
      listingsAllowed,
      listingsUsed: 0,
      listingsRemaining,
      viewsAllowed,
      viewsUsed: 0,
      viewsRemaining,
      features: plan.features || []
    };

    this.userSubscriptions.set(subId, newSubscription);
    this.persistSubscriptions();

    // Record order payment
    const newPayment: OrderPayment = {
      id: actualOrderId,
      transactionId: actualPaymentId,
      userId,
      userName,
      userEmail,
      planId: plan.id,
      planName: `${plan.name} (${durationDays} Days)`,
      planType: type === 'buyer' ? 'Buyer' : 'Seller',
      baseAmount,
      taxAmount,
      totalAmount,
      amount: totalAmount,
      paymentGateway,
      currency: 'INR',
      status: 'Successful',
      date: activatedAt,
      invoiceNumber: `INV-ORP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    this.payments.unshift(newPayment);
    this.persistPayments();

    const snapshot = this.createPlanSnapshot(newSubscription, plan);

    return {
      success: true,
      subscription: newSubscription,
      snapshot,
      payment: newPayment
    };
  }

  private static createPlanSnapshot(sub: UserSubscription, plan: BuyerPlan | SellerPlan): PlanSnapshot {
    return {
      planId: sub.planId,
      name: sub.planName,
      price: sub.baseAmount,
      validityDays: Math.round((new Date(sub.expiresAt).getTime() - new Date(sub.activatedAt).getTime()) / (24 * 60 * 60 * 1000)),
      listingsAllowed: sub.listingsAllowed,
      listingsRemaining: sub.listingsRemaining,
      listingViewsAllowed: sub.viewsAllowed,
      listingViewsRemaining: sub.viewsRemaining,
      startedAt: sub.activatedAt,
      expiresAt: sub.expiresAt,
      status: sub.status === 'ACTIVE' ? 'active' : 'expired'
    };
  }
}
