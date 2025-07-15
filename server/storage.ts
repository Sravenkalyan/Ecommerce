import { 
  users, products, categories, cartItems, orders, orderItems,
  type User, type InsertUser, type Product, type InsertProduct,
  type Category, type InsertCategory, type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type CartItemWithProduct, type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, or, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(filters?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    sortBy?: 'name' | 'price' | 'rating' | 'created';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  getFeaturedProducts(): Promise<Product[]>;

  // Cart
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;

  // Orders
  createOrder(order: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]): Promise<Order>;
  getOrders(userId: number): Promise<OrderWithItems[]>;
  getOrder(id: number, userId?: number): Promise<OrderWithItems | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async getProducts(filters: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    sortBy?: 'name' | 'price' | 'rating' | 'created';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  } = {}): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters.search) {
      conditions.push(
        or(
          like(products.name, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`)
        )
      );
    }
    
    if (filters.minPrice) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }
    
    if (filters.maxPrice) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }
    
    if (filters.brand) {
      conditions.push(eq(products.brand, filters.brand));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    // Sorting
    if (filters.sortBy) {
      if (filters.sortBy === 'created') {
        if (filters.sortOrder === 'desc') {
          query = query.orderBy(desc(products.createdAt)) as any;
        } else {
          query = query.orderBy(products.createdAt) as any;
        }
      } else if (filters.sortBy === 'name') {
        if (filters.sortOrder === 'desc') {
          query = query.orderBy(desc(products.name)) as any;
        } else {
          query = query.orderBy(products.name) as any;
        }
      } else if (filters.sortBy === 'price') {
        if (filters.sortOrder === 'desc') {
          query = query.orderBy(desc(products.price)) as any;
        } else {
          query = query.orderBy(products.price) as any;
        }
      } else if (filters.sortBy === 'rating') {
        if (filters.sortOrder === 'desc') {
          query = query.orderBy(desc(products.rating)) as any;
        } else {
          query = query.orderBy(products.rating) as any;
        }
      }
    } else {
      query = query.orderBy(desc(products.createdAt)) as any;
    }
    
    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit) as any;
    }
    
    if (filters.offset) {
      query = query.offset(filters.offset) as any;
    }
    
    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true)).limit(8);
  }

  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity! + item.quantity! })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new cart item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, id));
      return undefined;
    }
    
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async createOrder(order: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Add order items
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    return newOrder;
  }

  async getOrders(userId: number): Promise<OrderWithItems[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            product: products,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: number, userId?: number): Promise<OrderWithItems | undefined> {
    const conditions = [eq(orders.id, id)];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(and(...conditions));

    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      orderItems: items,
    };
  }
}

export const storage = new DatabaseStorage();
