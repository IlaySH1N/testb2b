import {
  users,
  companies,
  orders,
  orderResponses,
  reviews,
  tariffs,
  payments,
  type User,
  type UpsertUser,
  type InsertCompany,
  type Company,
  type CompanyWithTariff,
  type InsertOrder,
  type Order,
  type OrderWithCustomer,
  type OrderWithResponses,
  type InsertOrderResponse,
  type OrderResponse,
  type InsertReview,
  type Review,
  type InsertTariff,
  type Tariff,
  type Payment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Company operations
  createCompany(company: InsertCompany): Promise<Company>;
  getCompany(id: number): Promise<CompanyWithTariff | undefined>;
  getCompanyByUserId(userId: string): Promise<CompanyWithTariff | undefined>;
  updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company | undefined>;
  searchCompanies(filters: {
    category?: string;
    region?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ companies: CompanyWithTariff[]; total: number }>;
  getFeaturedCompanies(limit?: number): Promise<CompanyWithTariff[]>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<OrderWithCustomer | undefined>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  searchOrders(filters: {
    category?: string;
    region?: string;
    budgetMin?: number;
    budgetMax?: number;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: OrderWithCustomer[]; total: number }>;
  getFeaturedOrders(limit?: number): Promise<OrderWithCustomer[]>;
  getUserOrders(userId: string): Promise<OrderWithCustomer[]>;

  // Order response operations
  createOrderResponse(response: InsertOrderResponse): Promise<OrderResponse>;
  getOrderResponses(orderId: number): Promise<(OrderResponse & { company: Company })[]>;
  getCompanyResponses(companyId: number): Promise<(OrderResponse & { order: Order })[]>;
  updateOrderResponseStatus(id: number, status: string): Promise<OrderResponse | undefined>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getCompanyReviews(companyId: number): Promise<(Review & { customer: User })[]>;

  // Tariff operations
  getTariffs(): Promise<Tariff[]>;
  getTariff(id: number): Promise<Tariff | undefined>;

  // Analytics
  getStats(): Promise<{
    totalCompanies: number;
    totalOrders: number;
    totalRegions: number;
    totalVolume: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getCompany(id: number): Promise<CompanyWithTariff | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .leftJoin(tariffs, eq(companies.tariffId, tariffs.id))
      .where(eq(companies.id, id));
    
    if (!company) return undefined;
    
    return {
      ...company.companies,
      tariff: company.tariffs,
    };
  }

  async getCompanyByUserId(userId: string): Promise<CompanyWithTariff | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .leftJoin(tariffs, eq(companies.tariffId, tariffs.id))
      .where(eq(companies.userId, userId));
    
    if (!company) return undefined;
    
    return {
      ...company.companies,
      tariff: company.tariffs,
    };
  }

  async updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async searchCompanies(filters: {
    category?: string;
    region?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ companies: CompanyWithTariff[]; total: number }> {
    const { category, region, search, limit = 20, offset = 0 } = filters;

    let whereConditions = [];
    
    if (category) {
      whereConditions.push(eq(companies.category, category));
    }
    
    if (region) {
      whereConditions.push(eq(companies.region, region));
    }
    
    if (search) {
      whereConditions.push(
        or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.description, `%${search}%`)
        )
      );
    }

    whereConditions.push(eq(companies.isActive, true));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [companiesResult, totalResult] = await Promise.all([
      db
        .select()
        .from(companies)
        .leftJoin(tariffs, eq(companies.tariffId, tariffs.id))
        .where(whereClause)
        .orderBy(desc(companies.rating), desc(companies.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(companies)
        .where(whereClause),
    ]);

    return {
      companies: companiesResult.map(row => ({
        ...row.companies,
        tariff: row.tariffs,
      })),
      total: totalResult[0]?.count || 0,
    };
  }

  async getFeaturedCompanies(limit = 6): Promise<CompanyWithTariff[]> {
    const result = await db
      .select()
      .from(companies)
      .leftJoin(tariffs, eq(companies.tariffId, tariffs.id))
      .where(and(eq(companies.isActive, true), eq(companies.isVerified, true)))
      .orderBy(desc(companies.rating), desc(companies.reviewCount))
      .limit(limit);

    return result.map(row => ({
      ...row.companies,
      tariff: row.tariffs,
    }));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<OrderWithCustomer | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .innerJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.id, id));
    
    if (!order) return undefined;
    
    return {
      ...order.orders,
      customer: order.users,
    };
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async searchOrders(filters: {
    category?: string;
    region?: string;
    budgetMin?: number;
    budgetMax?: number;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: OrderWithCustomer[]; total: number }> {
    const { category, region, budgetMin, budgetMax, search, status = "active", limit = 20, offset = 0 } = filters;

    let whereConditions = [eq(orders.status, status)];
    
    if (category) {
      whereConditions.push(eq(orders.category, category));
    }
    
    if (region) {
      whereConditions.push(eq(orders.region, region));
    }
    
    if (budgetMin) {
      whereConditions.push(gte(orders.budget, budgetMin.toString()));
    }
    
    if (budgetMax) {
      whereConditions.push(lte(orders.budget, budgetMax.toString()));
    }
    
    if (search) {
      whereConditions.push(
        or(
          ilike(orders.title, `%${search}%`),
          ilike(orders.description, `%${search}%`)
        )
      );
    }

    const whereClause = and(...whereConditions);

    const [ordersResult, totalResult] = await Promise.all([
      db
        .select()
        .from(orders)
        .innerJoin(users, eq(orders.customerId, users.id))
        .where(whereClause)
        .orderBy(desc(orders.isUrgent), desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(orders)
        .where(whereClause),
    ]);

    return {
      orders: ordersResult.map(row => ({
        ...row.orders,
        customer: row.users,
      })),
      total: totalResult[0]?.count || 0,
    };
  }

  async getFeaturedOrders(limit = 6): Promise<OrderWithCustomer[]> {
    const result = await db
      .select()
      .from(orders)
      .innerJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.status, "active"))
      .orderBy(desc(orders.isUrgent), desc(orders.budget), desc(orders.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.orders,
      customer: row.users,
    }));
  }

  async getUserOrders(userId: string): Promise<OrderWithCustomer[]> {
    const result = await db
      .select()
      .from(orders)
      .innerJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.customerId, userId))
      .orderBy(desc(orders.createdAt));

    return result.map(row => ({
      ...row.orders,
      customer: row.users,
    }));
  }

  // Order response operations
  async createOrderResponse(response: InsertOrderResponse): Promise<OrderResponse> {
    const [newResponse] = await db.insert(orderResponses).values(response).returning();
    
    // Update order response count
    await db
      .update(orders)
      .set({ 
        responseCount: sql`${orders.responseCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, response.orderId));

    return newResponse;
  }

  async getOrderResponses(orderId: number): Promise<(OrderResponse & { company: Company })[]> {
    const result = await db
      .select()
      .from(orderResponses)
      .innerJoin(companies, eq(orderResponses.companyId, companies.id))
      .where(eq(orderResponses.orderId, orderId))
      .orderBy(desc(orderResponses.createdAt));

    return result.map(row => ({
      ...row.order_responses,
      company: row.companies,
    }));
  }

  async getCompanyResponses(companyId: number): Promise<(OrderResponse & { order: Order })[]> {
    const result = await db
      .select()
      .from(orderResponses)
      .innerJoin(orders, eq(orderResponses.orderId, orders.id))
      .where(eq(orderResponses.companyId, companyId))
      .orderBy(desc(orderResponses.createdAt));

    return result.map(row => ({
      ...row.order_responses,
      order: row.orders,
    }));
  }

  async updateOrderResponseStatus(id: number, status: string): Promise<OrderResponse | undefined> {
    const [response] = await db
      .update(orderResponses)
      .set({ status })
      .where(eq(orderResponses.id, id))
      .returning();
    return response;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update company rating and review count
    const avgRating = await db
      .select({ avg: sql<number>`AVG(${reviews.rating})`, count: count() })
      .from(reviews)
      .where(eq(reviews.companyId, review.companyId));

    if (avgRating[0]) {
      await db
        .update(companies)
        .set({
          rating: avgRating[0].avg.toFixed(2),
          reviewCount: avgRating[0].count,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, review.companyId));
    }

    return newReview;
  }

  async getCompanyReviews(companyId: number): Promise<(Review & { customer: User })[]> {
    const result = await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.customerId, users.id))
      .where(eq(reviews.companyId, companyId))
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      ...row.reviews,
      customer: row.users,
    }));
  }

  // Tariff operations
  async getTariffs(): Promise<Tariff[]> {
    return await db.select().from(tariffs).where(eq(tariffs.isActive, true)).orderBy(tariffs.price);
  }

  async getTariff(id: number): Promise<Tariff | undefined> {
    const [tariff] = await db.select().from(tariffs).where(eq(tariffs.id, id));
    return tariff;
  }

  // Analytics
  async getStats(): Promise<{
    totalCompanies: number;
    totalOrders: number;
    totalRegions: number;
    totalVolume: number;
  }> {
    const [companiesCount] = await db.select({ count: count() }).from(companies).where(eq(companies.isActive, true));
    const [ordersCount] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "active"));
    const [regionsCount] = await db.select({ count: sql<number>`COUNT(DISTINCT ${companies.region})` }).from(companies).where(eq(companies.isActive, true));
    const [volumeSum] = await db.select({ sum: sql<number>`COALESCE(SUM(${orders.budget}), 0)` }).from(orders).where(eq(orders.status, "active"));

    return {
      totalCompanies: companiesCount?.count || 0,
      totalOrders: ordersCount?.count || 0,
      totalRegions: regionsCount?.count || 0,
      totalVolume: Math.round((volumeSum?.sum || 0) / 1000000), // в миллионах
    };
  }
}

export const storage = new DatabaseStorage();
