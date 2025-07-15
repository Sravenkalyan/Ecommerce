import { db, pool } from '../server/db';
import { categories, products, orderItems, orders, cartItems } from '../shared/schema';

async function seed() {
  console.log('Starting database seed...');
  
  try {
    // Check if data already exists
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Clear existing data in correct order (child tables first)
    console.log('Clearing existing data...');
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(cartItems);
    await db.delete(products);
    await db.delete(categories);

    // Insert categories
  const categoryData = [
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
    { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
    { name: 'Books', slug: 'books', description: 'Books and literature' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and gardening' },
    { name: 'Sports', slug: 'sports', description: 'Sports and fitness equipment' }
  ];

  const insertedCategories = await db.insert(categories).values(categoryData).returning();
  console.log(`Inserted ${insertedCategories.length} categories`);

  // Insert products
  const productData = [
    // Electronics
    {
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced camera system and titanium design',
      price: '999.99',
      categoryId: insertedCategories[0].id,
      brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
      stock: 50,
      rating: 4.8,
      isFeatured: true
    },
    {
      name: 'MacBook Air M3',
      description: 'Lightweight laptop with M3 chip and all-day battery life',
      price: '1299.99',
      categoryId: insertedCategories[0].id,
      brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
      stock: 30,
      rating: 4.9,
      isFeatured: true
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Flagship Android smartphone with AI features',
      price: '899.99',
      categoryId: insertedCategories[0].id,
      brand: 'Samsung',
      imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400',
      stock: 25,
      rating: 4.7,
      isFeatured: false
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Premium noise-canceling wireless headphones',
      price: '399.99',
      categoryId: insertedCategories[0].id,
      brand: 'Sony',
      imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
      stock: 40,
      rating: 4.6,
      isFeatured: true
    },

    // Clothing
    {
      name: 'Nike Air Force 1',
      description: 'Classic white sneakers for everyday wear',
      price: '119.99',
      categoryId: insertedCategories[1].id,
      brand: 'Nike',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      stock: 100,
      rating: 4.5,
      isFeatured: false
    },
    {
      name: 'Levi\'s 501 Original Jeans',
      description: 'Iconic straight-leg jeans in classic blue',
      price: '89.99',
      categoryId: insertedCategories[1].id,
      brand: 'Levi\'s',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      stock: 60,
      rating: 4.4,
      isFeatured: false
    },
    {
      name: 'Patagonia Better Sweater',
      description: 'Sustainable fleece jacket for outdoor activities',
      price: '149.99',
      categoryId: insertedCategories[1].id,
      brand: 'Patagonia',
      imageUrl: 'https://images.unsplash.com/photo-1521498542256-5aeb47ba2d36?w=400',
      stock: 35,
      rating: 4.7,
      isFeatured: true
    },

    // Books
    {
      name: 'The Design of Everyday Things',
      description: 'Classic book on user experience and design principles',
      price: '19.99',
      categoryId: insertedCategories[2].id,
      brand: 'Basic Books',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      stock: 80,
      rating: 4.6,
      isFeatured: false
    },
    {
      name: 'Clean Code',
      description: 'A handbook of agile software craftsmanship',
      price: '24.99',
      categoryId: insertedCategories[2].id,
      brand: 'Prentice Hall',
      imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
      stock: 45,
      rating: 4.8,
      isFeatured: true
    },

    // Home & Garden
    {
      name: 'Instant Pot Duo',
      description: '7-in-1 electric pressure cooker for quick meals',
      price: '79.99',
      categoryId: insertedCategories[3].id,
      brand: 'Instant Pot',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      stock: 70,
      rating: 4.5,
      isFeatured: false
    },
    {
      name: 'Dyson V15 Detect',
      description: 'Cordless vacuum with laser dust detection',
      price: '649.99',
      categoryId: insertedCategories[3].id,
      brand: 'Dyson',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      stock: 20,
      rating: 4.7,
      isFeatured: true
    },

    // Sports
    {
      name: 'Peloton Bike+',
      description: 'Premium exercise bike with live classes',
      price: '2495.00',
      categoryId: insertedCategories[4].id,
      brand: 'Peloton',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      stock: 15,
      rating: 4.6,
      isFeatured: true
    },
    {
      name: 'Hydro Flask Water Bottle',
      description: 'Insulated stainless steel water bottle 32oz',
      price: '39.99',
      categoryId: insertedCategories[4].id,
      brand: 'Hydro Flask',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
      stock: 200,
      rating: 4.4,
      isFeatured: false
    }
  ];

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});