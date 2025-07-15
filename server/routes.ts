import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertProductSchema, insertCartItemSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    const user = (req as any).user;
    res.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    });
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const {
        categoryId,
        search,
        minPrice,
        maxPrice,
        brand,
        sortBy,
        sortOrder,
        limit = 12,
        offset = 0
      } = req.query;

      const filters: any = {};
      
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (search) filters.search = search as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (brand) filters.brand = brand as string;
      if (sortBy) filters.sortBy = sortBy as string;
      if (sortOrder) filters.sortOrder = sortOrder as string;
      filters.limit = parseInt(limit as string);
      filters.offset = parseInt(offset as string);

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Get featured products error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cart routes
  app.get("/api/cart", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const cartItems = await storage.getCartItems(user.id);
      res.json(cartItems);
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cart", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const itemData = insertCartItemSchema.parse({
        ...req.body,
        userId: user.id,
      });
      
      const cartItem = await storage.addToCart(itemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put("/api/cart/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      const updatedItem = await storage.updateCartItem(id, quantity);
      res.json(updatedItem);
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cart/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed" });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cart", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      await storage.clearCart(user.id);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Orders routes
  app.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const { shippingAddress } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => 
        sum + (parseFloat(item.product.price) * item.quantity), 0
      );
      const shipping = 9.99;
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + shipping + tax;

      const orderData = {
        userId: user.id,
        total: total.toFixed(2),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping.toFixed(2),
        shippingAddress,
        status: "pending",
      };

      const orderItemsData = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const order = await storage.createOrder(orderData, orderItemsData);
      
      // Clear cart after successful order
      await storage.clearCart(user.id);
      
      res.json(order);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const orders = await storage.getOrders(user.id);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders/:id", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id, user.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data route (for development)
  app.post("/api/seed", async (req, res) => {
    try {
      // Create categories
      const electronics = await storage.createCategory({
        name: "Electronics",
        slug: "electronics",
      });

      const clothing = await storage.createCategory({
        name: "Clothing",
        slug: "clothing",
      });

      // Create sample products
      const sampleProducts = [
        {
          name: "Premium Wireless Headphones",
          description: "High-quality wireless headphones with noise cancellation",
          price: "79.99",
          originalPrice: "99.99",
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          categoryId: electronics.id,
          brand: "AudioTech",
          rating: "4.5",
          reviewCount: 127,
          stock: 50,
          featured: true,
        },
        {
          name: "Latest Smartphone Pro",
          description: "Latest flagship smartphone with advanced features",
          price: "799.99",
          imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          categoryId: electronics.id,
          brand: "TechCorp",
          rating: "4.2",
          reviewCount: 89,
          stock: 30,
          featured: true,
        },
        {
          name: "Ultra-thin Laptop",
          description: "Lightweight laptop perfect for productivity",
          price: "1299.99",
          imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          categoryId: electronics.id,
          brand: "CompuTech",
          rating: "4.8",
          reviewCount: 203,
          stock: 25,
          featured: true,
        },
        {
          name: "Smart Fitness Watch",
          description: "Advanced fitness tracking with health monitoring",
          price: "299.99",
          imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          categoryId: electronics.id,
          brand: "FitTech",
          rating: "4.3",
          reviewCount: 56,
          stock: 40,
          featured: true,
        },
        {
          name: "Professional Camera",
          description: "High-resolution camera for professional photography",
          price: "899.99",
          imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          categoryId: electronics.id,
          brand: "PhotoPro",
          rating: "4.7",
          reviewCount: 142,
          stock: 15,
        },
        {
          name: "Gaming Controller Pro",
          description: "Professional gaming controller with customizable features",
          price: "149.99",
          imageUrl: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          categoryId: electronics.id,
          brand: "GameTech",
          rating: "4.4",
          reviewCount: 78,
          stock: 35,
        },
        {
          name: "Bluetooth Speaker",
          description: "Portable wireless speaker with premium sound quality",
          price: "89.99",
          imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          categoryId: electronics.id,
          brand: "SoundWave",
          rating: "4.6",
          reviewCount: 234,
          stock: 60,
          featured: true,
        },
        {
          name: "10\" Tablet Pro",
          description: "High-performance tablet for work and entertainment",
          price: "449.99",
          imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          categoryId: electronics.id,
          brand: "TabletCorp",
          rating: "4.1",
          reviewCount: 91,
          stock: 20,
        },
      ];

      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }

      res.json({ message: "Seed data created successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
