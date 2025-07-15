<<<<<<< HEAD
# E-commerce Application

A full-stack e-commerce web application built with React, Express.js, TypeScript, and PostgreSQL.

## Features

- 🛍️ **Product Catalog**: Browse products with search, filtering, and categorization
- 🛒 **Shopping Cart**: Add, update, and remove items from cart with persistence
- 👤 **User Authentication**: Secure JWT-based registration and login
- 💳 **Checkout Process**: Complete order placement with shipping details
- 📱 **Responsive Design**: Mobile-friendly interface built with TailwindCSS
- 🎨 **Modern UI**: Clean interface using shadcn/ui components
- 📊 **Order Management**: View order history and details

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **TanStack React Query** for state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database with Neon serverless
- **Drizzle ORM** for type-safe database operations
- **JWT** authentication with bcrypt password hashing
- **RESTful API** design

## Getting Started

### Option 1: Docker (Recommended)

The easiest way to run the application with all dependencies:

**Prerequisites:**
- Docker and Docker Compose

**Steps:**
```bash
# Clone the repository
git clone <your-repo-url>
cd ecommerce-app

# Start with Docker Compose
docker-compose up --build
```

This will:
- Start PostgreSQL database in a container
- Build and start the application
- Automatically set up the database schema
- Seed with sample data
- Make the app available at `http://localhost:5000`

**Docker Commands:**
```bash
# Start the application
docker-compose up

# Start in background
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs app

# Rebuild after code changes
docker-compose up --build
```

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+ 
- PostgreSQL database (or Neon account)

**Steps:**
1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ecommerce-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database with sample data**
   ```bash
   npx tsx scripts/seed.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express.js backend
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── index.ts          # Server entry point
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schema and types
├── scripts/              # Utility scripts
│   └── seed.ts           # Database seeding script
└── dist/                 # Build output
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/user` - Get current user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order

## Database Schema

The application uses the following main entities:

- **Users**: User accounts with authentication
- **Categories**: Product categories (Electronics, Clothing, etc.)
- **Products**: Product catalog with pricing and inventory
- **Cart Items**: Shopping cart persistence
- **Orders**: Order records with status tracking
- **Order Items**: Individual items within orders

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run preview` - Preview production build

### Adding New Features

1. **Database Changes**: Update `shared/schema.ts` and run `npm run db:push`
2. **API Endpoints**: Add routes in `server/routes.ts`
3. **Frontend Pages**: Create components in `client/src/pages/`
4. **UI Components**: Add reusable components in `client/src/components/`

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   DATABASE_URL=your_production_db_url
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## Sample Data

The application comes with sample data including:

- **Categories**: Electronics, Clothing, Books, Home & Garden, Sports
- **Products**: 13 sample products with real images and descriptions
- **Featured Items**: iPhone 15 Pro, MacBook Air, Sony headphones, etc.

To reset the database with fresh sample data:
```bash
npx tsx scripts/seed.ts
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support or questions, please open an issue in the repository.
=======
# Ecommerce
Ecommerce
>>>>>>> 8259bd66afb5a8f85857c076c3938a76d477473c
