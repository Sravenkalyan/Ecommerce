import { db, pool } from '../server/db';
import { categories, products, orderItems, orders, cartItems, users } from '../shared/schema';

async function resetDatabase() {
  console.log('🗑️  Resetting database...');
  
  try {
    // Drop all data in correct order (child tables first)
    console.log('Clearing order items...');
    await db.delete(orderItems);
    
    console.log('Clearing orders...');
    await db.delete(orders);
    
    console.log('Clearing cart items...');
    await db.delete(cartItems);
    
    console.log('Clearing products...');
    await db.delete(products);
    
    console.log('Clearing categories...');
    await db.delete(categories);
    
    console.log('Clearing users...');
    await db.delete(users);

    console.log('✅ Database reset complete!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

resetDatabase().catch((error) => {
  console.error('Failed to reset database:', error);
  process.exit(1);
});