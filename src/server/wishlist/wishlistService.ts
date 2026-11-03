import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', '..', '..', 'data');
const WISHLISTS_FILE_PATH = path.resolve(dataDir, 'wishlists.json');

export class WishlistService {
  private static cache: Map<string, string[]> = new Map();
  private static isInitialized = false;

  private static ensureDataDir() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  public static init() {
    if (this.isInitialized) return;
    this.ensureDataDir();

    try {
      if (fs.existsSync(WISHLISTS_FILE_PATH)) {
        const raw = fs.readFileSync(WISHLISTS_FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          for (const [userId, items] of Object.entries(data)) {
            if (Array.isArray(items)) {
              this.cache.set(userId, items);
            }
          }
        }
      }
    } catch (err) {
      console.error('[WishlistService] Error reading wishlists.json:', err);
    }

    this.isInitialized = true;
  }

  private static persist() {
    try {
      this.ensureDataDir();
      const obj: Record<string, string[]> = {};
      for (const [userId, items] of this.cache.entries()) {
        obj[userId] = items;
      }
      const tempPath = `${WISHLISTS_FILE_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(obj, null, 2), 'utf-8');
      fs.renameSync(tempPath, WISHLISTS_FILE_PATH);
    } catch (err) {
      console.error('[WishlistService] Error persisting wishlists:', err);
    }
  }

  public static getUserWishlist(userId: string): string[] {
    if (!userId) return [];
    this.init();
    return this.cache.get(userId) || [];
  }

  public static toggleWishlistItem(userId: string, vehicleId: string): { wishlist: string[]; added: boolean } {
    if (!userId || !vehicleId) {
      return { wishlist: [], added: false };
    }
    this.init();

    const current = this.cache.get(userId) || [];
    const exists = current.includes(vehicleId);
    let updated: string[];
    let added = false;

    if (exists) {
      updated = current.filter(id => id !== vehicleId);
    } else {
      updated = [...current, vehicleId];
      added = true;
    }

    this.cache.set(userId, updated);
    this.persist();

    return { wishlist: updated, added };
  }

  public static clearWishlist(userId: string): string[] {
    if (!userId) return [];
    this.init();
    this.cache.set(userId, []);
    this.persist();
    return [];
  }
}
