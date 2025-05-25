import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("client"), // client, company, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tariff plans
export const tariffs = pgTable("tariffs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  price: integer("price").notNull(), // в рублях
  features: jsonb("features").notNull(), // ["unlimited_responses", "top_placement", "analytics", "banner_ads"]
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Companies
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  website: varchar("website"),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  region: varchar("region", { length: 100 }),
  category: varchar("category", { length: 100 }), // металлообработка, пищевое производство, etc.
  tags: jsonb("tags").default([]), // array of specializations
  tariffId: integer("tariff_id").references(() => tariffs.id),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  budgetMin: decimal("budget_min", { precision: 12, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 12, scale: 2 }),
  deadline: date("deadline"),
  region: varchar("region", { length: 100 }),
  requirements: text("requirements"),
  attachments: jsonb("attachments").default([]), // array of file URLs
  status: varchar("status", { length: 50 }).default("active"), // active, completed, cancelled
  responseCount: integer("response_count").default(0),
  isUrgent: boolean("is_urgent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order responses
export const orderResponses = pgTable("order_responses", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  companyId: integer("company_id").notNull(),
  message: text("message"),
  proposedPrice: decimal("proposed_price", { precision: 12, scale: 2 }),
  proposedDeadline: date("proposed_deadline"),
  attachments: jsonb("attachments").default([]),
  status: varchar("status", { length: 50 }).default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// Company reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  orderId: integer("order_id"),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  tariffId: integer("tariff_id").notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed, failed
  paymentDate: timestamp("payment_date").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
  orders: many(orders),
  reviews: many(reviews),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  tariff: one(tariffs, {
    fields: [companies.tariffId],
    references: [tariffs.id],
  }),
  orderResponses: many(orderResponses),
  reviews: many(reviews),
  payments: many(payments),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  responses: many(orderResponses),
}));

export const orderResponsesRelations = relations(orderResponses, ({ one }) => ({
  order: one(orders, {
    fields: [orderResponses.orderId],
    references: [orders.id],
  }),
  company: one(companies, {
    fields: [orderResponses.companyId],
    references: [companies.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  company: one(companies, {
    fields: [reviews.companyId],
    references: [companies.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  company: one(companies, {
    fields: [payments.companyId],
    references: [companies.id],
  }),
  tariff: one(tariffs, {
    fields: [payments.tariffId],
    references: [tariffs.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  responseCount: true,
});

export const insertOrderResponseSchema = createInsertSchema(orderResponses).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertTariffSchema = createInsertSchema(tariffs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderResponse = z.infer<typeof insertOrderResponseSchema>;
export type OrderResponse = typeof orderResponses.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertTariff = z.infer<typeof insertTariffSchema>;
export type Tariff = typeof tariffs.$inferSelect;
export type Payment = typeof payments.$inferSelect;

// Extended types with relations
export type CompanyWithTariff = Company & { tariff: Tariff | null };
export type OrderWithCustomer = Order & { customer: User };
export type OrderWithResponses = Order & { responses: (OrderResponse & { company: Company })[] };
export type CompanyWithReviews = Company & { reviews: (Review & { customer: User })[] };
