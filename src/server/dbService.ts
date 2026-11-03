import { db } from '../db/index.ts';
import { 
  users, 
  vehicles, 
  wishlists, 
  enquiries, 
  orders, 
  siteSettings, 
  blogs, 
  banners 
} from '../db/schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { 
  INITIAL_VEHICLES, 
  INITIAL_USERS, 
  INITIAL_SETTINGS, 
  INITIAL_BLOGS, 
  INITIAL_BANNERS 
} from '../data/initialData.ts';
import { Vehicle, User } from '../types.ts';

export class DbService {
  private static isInitialized = false;

  /**
   * Automatically bootstrap Cloud SQL database with initial catalog and settings if empty
   */
  public static async seedIfEmpty(): Promise<void> {
    if (this.isInitialized) return;
    try {
      // 1. Seed Vehicles only if vehicles table is empty
      const existingVehicles = await db.select({ id: vehicles.id }).from(vehicles).limit(1);
      if (existingVehicles.length === 0) {
        console.log('[CloudSQL] Seeding initial vehicles...');
        for (const v of INITIAL_VEHICLES) {
          try {
            await db.insert(vehicles).values({
              id: v.id,
              title: v.title,
              category: String(v.category),
              brand: v.brand,
              model: v.model,
              variant: v.variant || null,
              year: v.year,
              price: v.price,
              kmDriven: v.kmDriven || 0,
              fuelType: v.fuelType,
              transmission: v.transmission,
              city: v.location?.city || 'All India',
              state: v.location?.state || '',
              registrationNumber: v.registrationNumber || null,
              status: v.status || 'Published',
              sellerId: v.seller?.id || v.sellerId || null,
              isFeatured: v.isFeatured || v.featured ? 1 : 0,
              viewsCount: v.viewsCount || 0,
              data: JSON.stringify(v),
            }).onConflictDoNothing();
          } catch (e) {
            console.error(`[CloudSQL] Error seeding vehicle ${v.id}:`, e);
          }
        }
      }

      // 2. Seed Users only if users table is empty (NEVER overwrite updated admin/user details!)
      const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
      if (existingUsers.length === 0) {
        console.log('[CloudSQL] Seeding initial users...');
        for (const u of INITIAL_USERS) {
          try {
            await db.insert(users).values({
              id: u.id,
              uid: (u as any).uid || null,
              email: u.email || null,
              phone: u.phone || null,
              name: u.name || u.fullName || '',
              role: u.role || 'Buyer',
              status: u.status || 'Active',
              city: u.city || null,
              state: u.state || null,
              data: JSON.stringify(u),
            }).onConflictDoNothing();
          } catch (e) {
            console.error(`[CloudSQL] Error seeding user ${u.id}:`, e);
          }
        }
      }

      // 3. Seed Site Settings only if 'global' row does not exist
      const existingSettings = await db.select({ id: siteSettings.id }).from(siteSettings).where(eq(siteSettings.id, 'global')).limit(1);
      if (existingSettings.length === 0) {
        try {
          await db.insert(siteSettings).values({
            id: 'global',
            data: JSON.stringify(INITIAL_SETTINGS),
          }).onConflictDoNothing();
        } catch (e) {
          console.error('[CloudSQL] Error seeding site settings:', e);
        }
      }

      // 4. Seed Blogs only if blogs table is empty
      const existingBlogs = await db.select({ id: blogs.id }).from(blogs).limit(1);
      if (existingBlogs.length === 0) {
        for (const b of INITIAL_BLOGS) {
          try {
            await db.insert(blogs).values({
              id: b.id,
              slug: b.slug,
              title: b.title,
              data: JSON.stringify(b),
            }).onConflictDoNothing();
          } catch (e) {
            console.error(`[CloudSQL] Error seeding blog ${b.id}:`, e);
          }
        }
      }

      // 5. Seed Banners only if banners table is empty
      const existingBanners = await db.select({ id: banners.id }).from(banners).limit(1);
      if (existingBanners.length === 0) {
        for (const ban of INITIAL_BANNERS) {
          try {
            await db.insert(banners).values({
              id: ban.id,
              data: JSON.stringify(ban),
            }).onConflictDoNothing();
          } catch (e) {
            console.error(`[CloudSQL] Error seeding banner ${ban.id}:`, e);
          }
        }
      }

      this.isInitialized = true;
    } catch (err) {
      console.error('[CloudSQL] Error checking or seeding initial data:', err);
    }
  }

  // -------------------------------------------------------------
  // VEHICLES
  // -------------------------------------------------------------

  public static async getVehicles(): Promise<Vehicle[]> {
    try {
      await this.seedIfEmpty();
      const rows = await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
      return rows.map(r => {
        try {
          const parsed = JSON.parse(r.data);
          return {
            ...parsed,
            id: r.id,
            title: r.title,
            category: r.category || parsed.category,
            brand: r.brand || parsed.brand,
            model: r.model || parsed.model,
            variant: r.variant || parsed.variant,
            year: r.year || parsed.year,
            price: r.price || parsed.price,
            kmDriven: r.kmDriven || parsed.kmDriven,
            fuelType: r.fuelType || parsed.fuelType,
            transmission: r.transmission || parsed.transmission,
            status: r.status || parsed.status,
            isFeatured: r.isFeatured === 1,
            featured: r.isFeatured === 1,
            viewsCount: r.viewsCount || parsed.viewsCount || 0,
            registrationNumber: r.registrationNumber || parsed.registrationNumber,
          };
        } catch {
          return null as any;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('[CloudSQL] Failed to fetch vehicles:', error);
      throw new Error('Database query failed for vehicles.', { cause: error });
    }
  }

  public static async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      await this.seedIfEmpty();
      const rows = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
      if (rows.length === 0) return null;
      const r = rows[0];
      try {
        const parsed = JSON.parse(r.data);
        return {
          ...parsed,
          id: r.id,
          title: r.title,
          status: r.status,
          price: r.price,
        };
      } catch {
        return null;
      }
    } catch (error) {
      console.error(`[CloudSQL] Failed to fetch vehicle ${id}:`, error);
      throw new Error(`Database query failed for vehicle ${id}.`, { cause: error });
    }
  }

  public static async upsertVehicle(vehicle: Vehicle): Promise<Vehicle> {
    try {
      await this.seedIfEmpty();
      const v = { ...vehicle };
      const serialized = JSON.stringify(v);

      await db.insert(vehicles).values({
        id: v.id,
        title: v.title || 'Untitled Listing',
        category: String(v.category || ''),
        brand: v.brand || '',
        model: v.model || '',
        variant: v.variant || null,
        year: v.year || new Date().getFullYear(),
        price: v.price || 0,
        kmDriven: v.kmDriven || 0,
        fuelType: v.fuelType || 'Petrol',
        transmission: v.transmission || 'Manual',
        city: v.location?.city || 'All India',
        state: v.location?.state || '',
        registrationNumber: v.registrationNumber || null,
        status: v.status || 'Published',
        sellerId: v.seller?.id || v.sellerId || null,
        isFeatured: v.isFeatured || v.featured ? 1 : 0,
        viewsCount: v.viewsCount || 0,
        data: serialized,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: vehicles.id,
        set: {
          title: v.title || 'Untitled Listing',
          category: String(v.category || ''),
          brand: v.brand || '',
          model: v.model || '',
          variant: v.variant || null,
          year: v.year || new Date().getFullYear(),
          price: v.price || 0,
          kmDriven: v.kmDriven || 0,
          fuelType: v.fuelType || 'Petrol',
          transmission: v.transmission || 'Manual',
          city: v.location?.city || 'All India',
          state: v.location?.state || '',
          registrationNumber: v.registrationNumber || null,
          status: v.status || 'Published',
          sellerId: v.seller?.id || v.sellerId || null,
          isFeatured: v.isFeatured || v.featured ? 1 : 0,
          viewsCount: v.viewsCount || 0,
          data: serialized,
          updatedAt: new Date(),
        },
      });

      return v;
    } catch (error) {
      console.error(`[CloudSQL] Failed to upsert vehicle ${vehicle.id}:`, error);
      throw new Error(`Database upsert failed for vehicle ${vehicle.id}.`, { cause: error });
    }
  }

  public static async deleteVehicle(id: string): Promise<boolean> {
    try {
      await db.delete(wishlists).where(eq(wishlists.vehicleId, id)).catch(() => {});
      await db.delete(enquiries).where(eq(enquiries.vehicleId, id)).catch(() => {});
      await db.delete(vehicles).where(eq(vehicles.id, id));
      return true;
    } catch (error) {
      console.error(`[CloudSQL] Failed to delete vehicle ${id}:`, error);
      throw new Error(`Database delete failed for vehicle ${id}.`, { cause: error });
    }
  }

  // -------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------

  public static async getUsers(): Promise<User[]> {
    try {
      await this.seedIfEmpty();
      const rows = await db.select().from(users).orderBy(desc(users.createdAt));
      return rows.map(r => {
        try {
          const parsed = JSON.parse(r.data);
          return {
            ...parsed,
            id: r.id,
            name: r.name || parsed.name,
            email: r.email || parsed.email,
            phone: r.phone || parsed.phone,
            role: r.role || parsed.role,
            status: r.status || parsed.status,
            city: r.city || parsed.city,
            state: r.state || parsed.state,
          };
        } catch {
          return null as any;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('[CloudSQL] Failed to fetch users:', error);
      throw new Error('Database query failed for users.', { cause: error });
    }
  }

  public static async getUserById(id: string): Promise<User | null> {
    try {
      await this.seedIfEmpty();
      const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (rows.length === 0) return null;
      try {
        return JSON.parse(rows[0].data);
      } catch {
        return null;
      }
    } catch (error) {
      console.error(`[CloudSQL] Failed to fetch user ${id}:`, error);
      throw new Error(`Database query failed for user ${id}.`, { cause: error });
    }
  }

  public static async getUserByEmail(email: string): Promise<User | null> {
    try {
      await this.seedIfEmpty();
      const clean = (email || '').trim().toLowerCase();
      if (!clean) return null;

      // 1. Check exact email match on column
      const rows = await db.select().from(users).where(eq(users.email, clean)).limit(1);
      if (rows.length > 0) {
        try {
          const parsed = JSON.parse(rows[0].data);
          return {
            ...parsed,
            id: rows[0].id,
            name: rows[0].name || parsed.name,
            email: rows[0].email || parsed.email,
            phone: rows[0].phone || parsed.phone,
            role: rows[0].role || parsed.role,
            status: rows[0].status || parsed.status,
          };
        } catch {
          return null;
        }
      }

      // 2. Fallback check across all users in Cloud SQL
      const allUsers = await this.getUsers();
      const matched = allUsers.find(u => u.email && u.email.trim().toLowerCase() === clean);
      return matched || null;
    } catch (error) {
      console.error(`[CloudSQL] Failed to fetch user by email ${email}:`, error);
      return null;
    }
  }

  public static async upsertUser(user: User): Promise<User> {
    try {
      await this.seedIfEmpty();
      const u = { ...user };
      const serialized = JSON.stringify(u);

      await db.insert(users).values({
        id: u.id,
        uid: (u as any).uid || null,
        email: u.email || null,
        phone: u.phone || (u as any).mobile || null,
        name: u.name || u.fullName || '',
        role: u.role || 'Buyer',
        status: u.status || 'Active',
        city: u.city || null,
        state: u.state || null,
        data: serialized,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          uid: (u as any).uid || null,
          email: u.email || null,
          phone: u.phone || (u as any).mobile || null,
          name: u.name || u.fullName || '',
          role: u.role || 'Buyer',
          status: u.status || 'Active',
          city: u.city || null,
          state: u.state || null,
          data: serialized,
          updatedAt: new Date(),
        },
      });

      return u;
    } catch (error) {
      console.error(`[CloudSQL] Failed to upsert user ${user.id}:`, error);
      throw new Error(`Database upsert failed for user ${user.id}.`, { cause: error });
    }
  }

  public static async deleteUser(id: string): Promise<boolean> {
    try {
      await db.delete(wishlists).where(eq(wishlists.userId, id)).catch(() => {});
      await db.delete(enquiries).where(eq(enquiries.buyerId, id)).catch(() => {});
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error(`[CloudSQL] Failed to delete user ${id}:`, error);
      throw new Error(`Database delete failed for user ${id}.`, { cause: error });
    }
  }

  // -------------------------------------------------------------
  // WISHLIST
  // -------------------------------------------------------------

  public static async getUserWishlist(userId: string): Promise<string[]> {
    try {
      const rows = await db.select({ vehicleId: wishlists.vehicleId })
        .from(wishlists)
        .where(eq(wishlists.userId, userId));
      return rows.map(r => r.vehicleId);
    } catch (error) {
      console.error(`[CloudSQL] Failed to fetch wishlist for ${userId}:`, error);
      throw new Error('Database query failed for wishlist.', { cause: error });
    }
  }

  public static async toggleWishlist(userId: string, vehicleId: string): Promise<string[]> {
    try {
      const existing = await db.select().from(wishlists)
        .where(and(eq(wishlists.userId, userId), eq(wishlists.vehicleId, vehicleId)))
        .limit(1);

      if (existing.length > 0) {
        await db.delete(wishlists)
          .where(and(eq(wishlists.userId, userId), eq(wishlists.vehicleId, vehicleId)));
      } else {
        await db.insert(wishlists).values({
          userId,
          vehicleId,
        });
      }

      return await this.getUserWishlist(userId);
    } catch (error) {
      console.error(`[CloudSQL] Failed to toggle wishlist for ${userId}, ${vehicleId}:`, error);
      throw new Error('Database toggle failed for wishlist.', { cause: error });
    }
  }

  // -------------------------------------------------------------
  // ENQUIRIES / LEADS
  // -------------------------------------------------------------

  public static async getEnquiries(sellerId?: string, buyerId?: string): Promise<any[]> {
    try {
      let rows;
      if (sellerId) {
        rows = await db.select().from(enquiries).where(eq(enquiries.sellerId, sellerId)).orderBy(desc(enquiries.createdAt));
      } else if (buyerId) {
        rows = await db.select().from(enquiries).where(eq(enquiries.buyerId, buyerId)).orderBy(desc(enquiries.createdAt));
      } else {
        rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
      }

      return rows.map(r => {
        try {
          return { ...JSON.parse(r.data), id: r.id, createdAt: r.createdAt };
        } catch {
          return r;
        }
      });
    } catch (error) {
      console.error('[CloudSQL] Failed to fetch enquiries:', error);
      throw new Error('Database query failed for enquiries.', { cause: error });
    }
  }

  public static async createEnquiry(enquiry: any): Promise<any> {
    try {
      const id = enquiry.id || `ENQ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const serialized = JSON.stringify({ ...enquiry, id });

      await db.insert(enquiries).values({
        id,
        vehicleId: enquiry.vehicleId || '',
        sellerId: enquiry.sellerId || '',
        buyerId: enquiry.buyerId || null,
        buyerPhone: enquiry.buyerPhone || '',
        buyerName: enquiry.buyerName || null,
        message: enquiry.message || null,
        data: serialized,
      });

      return { ...enquiry, id };
    } catch (error) {
      console.error('[CloudSQL] Failed to create enquiry:', error);
      throw new Error('Database insert failed for enquiry.', { cause: error });
    }
  }

  // -------------------------------------------------------------
  // SITE SETTINGS
  // -------------------------------------------------------------

  public static async getSiteSettings(): Promise<any> {
    try {
      await this.seedIfEmpty();
      const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, 'global')).limit(1);
      if (rows.length > 0) {
        return JSON.parse(rows[0].data);
      }
      return INITIAL_SETTINGS;
    } catch (error) {
      console.error('[CloudSQL] Failed to fetch site settings:', error);
      return INITIAL_SETTINGS;
    }
  }

  public static async saveSiteSettings(settings: any): Promise<any> {
    try {
      await this.seedIfEmpty();
      const serialized = JSON.stringify(settings);
      await db.insert(siteSettings).values({
        id: 'global',
        data: serialized,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: siteSettings.id,
        set: {
          data: serialized,
          updatedAt: new Date(),
        },
      });
      return settings;
    } catch (error) {
      console.error('[CloudSQL] Failed to save site settings:', error);
      throw new Error('Database save failed for site settings.', { cause: error });
    }
  }

  public static async getSessions(): Promise<any[]> {
    try {
      const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, 'auth_sessions')).limit(1);
      if (rows.length > 0 && rows[0].data) {
        const parsed = JSON.parse(rows[0].data);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }

  public static async saveSessions(sessions: any[]): Promise<void> {
    try {
      const serialized = JSON.stringify(sessions);
      await db.insert(siteSettings).values({
        id: 'auth_sessions',
        data: serialized,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: siteSettings.id,
        set: {
          data: serialized,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.warn('[CloudSQL] Failed to save auth sessions:', err);
    }
  }

  public static async getContactSubmissions(): Promise<any[] | null> {
    try {
      const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, 'contact_submissions')).limit(1);
      if (rows.length > 0 && rows[0].data) {
        const parsed = JSON.parse(rows[0].data);
        if (Array.isArray(parsed)) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  public static async saveContactSubmissions(submissions: any[]): Promise<void> {
    try {
      const serialized = JSON.stringify(submissions);
      await db.insert(siteSettings).values({
        id: 'contact_submissions',
        data: serialized,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: siteSettings.id,
        set: {
          data: serialized,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.warn('[CloudSQL] Failed to save contact submissions:', err);
    }
  }

  public static async saveBrandingAsset(filename: string, base64Data: string): Promise<void> {
    try {
      const existing = await this.getBrandingAssets();
      const updated = { ...existing, [filename]: base64Data };
      const serialized = JSON.stringify(updated);
      await db.insert(siteSettings).values({
        id: 'branding_assets',
        data: serialized,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: siteSettings.id,
        set: {
          data: serialized,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.warn('[CloudSQL] Failed to save branding asset:', err);
    }
  }

  public static async getBrandingAssets(): Promise<Record<string, string>> {
    try {
      const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, 'branding_assets')).limit(1);
      if (rows.length > 0 && rows[0].data) {
        const parsed = JSON.parse(rows[0].data);
        if (parsed && typeof parsed === 'object') return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }

  // -------------------------------------------------------------
  // BLOGS
  // -------------------------------------------------------------

  public static async getBlogs(): Promise<any[]> {
    try {
      await this.seedIfEmpty();
      const rows = await db.select().from(blogs).orderBy(desc(blogs.createdAt));
      return rows.map(r => {
        try {
          return { ...JSON.parse(r.data), id: r.id, slug: r.slug, title: r.title };
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('[CloudSQL] Failed to fetch blogs:', error);
      return INITIAL_BLOGS;
    }
  }

  public static async upsertBlog(blog: any): Promise<any> {
    try {
      await this.seedIfEmpty();
      const id = blog.id || `blog-${Date.now()}`;
      const slug = blog.slug || id;
      const serialized = JSON.stringify({ ...blog, id, slug });

      await db.insert(blogs).values({
        id,
        slug,
        title: blog.title || 'Untitled Article',
        data: serialized,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: blogs.id,
        set: {
          slug,
          title: blog.title || 'Untitled Article',
          data: serialized,
          updatedAt: new Date(),
        },
      });

      return { ...blog, id, slug };
    } catch (error) {
      console.error(`[CloudSQL] Failed to upsert blog ${blog.id}:`, error);
      throw new Error('Database upsert failed for blog.', { cause: error });
    }
  }

  public static async deleteBlog(id: string): Promise<boolean> {
    try {
      await db.delete(blogs).where(eq(blogs.id, id));
      return true;
    } catch (error) {
      console.error(`[CloudSQL] Failed to delete blog ${id}:`, error);
      throw new Error(`Database delete failed for blog ${id}.`, { cause: error });
    }
  }

  // -------------------------------------------------------------
  // BANNERS
  // -------------------------------------------------------------

  public static async getBanners(): Promise<any[]> {
    try {
      await this.seedIfEmpty();
      const rows = await db.select().from(banners).orderBy(desc(banners.createdAt));
      return rows.map(r => {
        try {
          return { ...JSON.parse(r.data), id: r.id };
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('[CloudSQL] Failed to fetch banners:', error);
      return INITIAL_BANNERS;
    }
  }

  public static async upsertBanner(banner: any): Promise<any> {
    try {
      await this.seedIfEmpty();
      const id = banner.id || `ban-${Date.now()}`;
      const serialized = JSON.stringify({ ...banner, id });

      await db.insert(banners).values({
        id,
        data: serialized,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: banners.id,
        set: {
          data: serialized,
          updatedAt: new Date(),
        },
      });

      return { ...banner, id };
    } catch (error) {
      console.error(`[CloudSQL] Failed to upsert banner ${banner.id}:`, error);
      throw new Error('Database upsert failed for banner.', { cause: error });
    }
  }

  public static async deleteBanner(id: string): Promise<boolean> {
    try {
      await db.delete(banners).where(eq(banners.id, id));
      return true;
    } catch (error) {
      console.error(`[CloudSQL] Failed to delete banner ${id}:`, error);
      throw new Error(`Database delete failed for banner ${id}.`, { cause: error });
    }
  }

  // -------------------------------------------------------------
  // ORDERS / PAYMENTS
  // -------------------------------------------------------------

  public static async getOrders(userId?: string): Promise<any[]> {
    try {
      let rows;
      if (userId) {
        rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
      } else {
        rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
      }

      return rows.map(r => {
        try {
          return { ...JSON.parse(r.data), id: r.id, status: r.status, amount: r.amount };
        } catch {
          return r;
        }
      });
    } catch (error) {
      console.error('[CloudSQL] Failed to fetch orders:', error);
      return [];
    }
  }

  public static async createOrder(order: any): Promise<any> {
    try {
      const id = order.id || `ORD-${Date.now()}`;
      const serialized = JSON.stringify({ ...order, id });

      await db.insert(orders).values({
        id,
        userId: order.userId || '',
        planId: order.planId || '',
        amount: Math.round(order.amount || 0),
        status: order.status || 'Pending',
        data: serialized,
      }).onConflictDoUpdate({
        target: orders.id,
        set: {
          status: order.status || 'Pending',
          data: serialized,
        }
      });

      return { ...order, id };
    } catch (error) {
      console.error('[CloudSQL] Failed to create order:', error);
      throw new Error('Database insert failed for order.', { cause: error });
    }
  }
}
