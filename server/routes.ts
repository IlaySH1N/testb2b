import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCompanySchema, 
  insertOrderSchema, 
  insertOrderResponseSchema,
  insertReviewSchema 
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has a company
      const company = await storage.getCompanyByUserId(userId);
      
      res.json({ ...user, company });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes - Stats
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Public routes - Featured content
  app.get('/api/featured/orders', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const orders = await storage.getFeaturedOrders(limit);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching featured orders:", error);
      res.status(500).json({ message: "Failed to fetch featured orders" });
    }
  });

  app.get('/api/featured/companies', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const companies = await storage.getFeaturedCompanies(limit);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching featured companies:", error);
      res.status(500).json({ message: "Failed to fetch featured companies" });
    }
  });

  // Orders routes
  app.get('/api/orders', async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        region: req.query.region as string,
        budgetMin: req.query.budgetMin ? parseInt(req.query.budgetMin as string) : undefined,
        budgetMax: req.query.budgetMax ? parseInt(req.query.budgetMax as string) : undefined,
        search: req.query.search as string,
        status: req.query.status as string || "active",
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
      };

      const result = await storage.searchOrders(filters);
      res.json(result);
    } catch (error) {
      console.error("Error searching orders:", error);
      res.status(500).json({ message: "Failed to search orders" });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Get order responses
      const responses = await storage.getOrderResponses(id);
      
      res.json({ ...order, responses });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({ ...req.body, customerId: userId });
      
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existingOrder = await storage.getOrder(id);
      if (!existingOrder || existingOrder.customerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = req.body;
      const order = await storage.updateOrder(id, updates);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Companies routes
  app.get('/api/companies', async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        region: req.query.region as string,
        search: req.query.search as string,
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
      };

      const result = await storage.searchCompanies(filters);
      res.json(result);
    } catch (error) {
      console.error("Error searching companies:", error);
      res.status(500).json({ message: "Failed to search companies" });
    }
  });

  app.get('/api/companies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompany(id);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Get company reviews
      const reviews = await storage.getCompanyReviews(id);
      
      res.json({ ...company, reviews });
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user already has a company
      const existingCompany = await storage.getCompanyByUserId(userId);
      if (existingCompany) {
        return res.status(400).json({ message: "User already has a company" });
      }

      const companyData = insertCompanySchema.parse({ ...req.body, userId });
      
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.patch('/api/companies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existingCompany = await storage.getCompany(id);
      if (!existingCompany || existingCompany.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = req.body;
      const company = await storage.updateCompany(id, updates);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // Order responses routes
  app.post('/api/orders/:orderId/responses', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user.claims.sub;
      
      // Get user's company
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(400).json({ message: "User must have a company to respond to orders" });
      }

      const responseData = insertOrderResponseSchema.parse({
        ...req.body,
        orderId,
        companyId: company.id,
      });
      
      const response = await storage.createOrderResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      console.error("Error creating order response:", error);
      res.status(500).json({ message: "Failed to create order response" });
    }
  });

  app.patch('/api/order-responses/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.user.claims.sub;

      // Verify ownership - either order owner or company owner can update status
      // This would need more complex verification logic in a real app
      
      const response = await storage.updateOrderResponseStatus(id, status);
      
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }

      res.json(response);
    } catch (error) {
      console.error("Error updating response status:", error);
      res.status(500).json({ message: "Failed to update response status" });
    }
  });

  // Reviews routes
  app.post('/api/companies/:companyId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const userId = req.user.claims.sub;
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        companyId,
        customerId: userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Tariffs routes
  app.get('/api/tariffs', async (req, res) => {
    try {
      const tariffs = await storage.getTariffs();
      res.json(tariffs);
    } catch (error) {
      console.error("Error fetching tariffs:", error);
      res.status(500).json({ message: "Failed to fetch tariffs" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/my-orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch user orders" });
    }
  });

  app.get('/api/dashboard/my-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.json([]);
      }

      const responses = await storage.getCompanyResponses(company.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching company responses:", error);
      res.status(500).json({ message: "Failed to fetch company responses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
