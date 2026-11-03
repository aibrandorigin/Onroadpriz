import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').unique(),
  email: text('email'),
  phone: text('phone'),
  name: text('name'),
  role: text('role').default('Buyer'),
  status: text('status').default('Active'),
  city: text('city'),
  state: text('state'),
  data: text('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category'),
  brand: text('brand'),
  model: text('model'),
  variant: text('variant'),
  year: integer('year'),
  price: integer('price'),
  kmDriven: integer('km_driven').default(0),
  fuelType: text('fuel_type'),
  transmission: text('transmission'),
  city: text('city'),
  state: text('state'),
  registrationNumber: text('registration_number'),
  status: text('status').default('Published'),
  sellerId: text('seller_id'),
  isFeatured: integer('is_featured').default(0),
  viewsCount: integer('views_count').default(0),
  data: text('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Wishlists table
export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  vehicleId: text('vehicle_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Enquiries table
export const enquiries = pgTable('enquiries', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  sellerId: text('seller_id').notNull(),
  buyerId: text('buyer_id'),
  buyerPhone: text('buyer_phone').notNull(),
  buyerName: text('buyer_name'),
  message: text('message'),
  data: text('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders & Payments table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  planId: text('plan_id').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').notNull(),
  data: text('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Global Site Settings table
export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Blogs table
export const blogs = pgTable('blogs', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  data: text('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Promotional Banners table
export const banners = pgTable('banners', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
