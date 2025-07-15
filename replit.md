# E-commerce Application Architecture

## Overview

This is a full-stack e-commerce web application built with React (frontend) and Express.js (backend). The application features user authentication, product catalog browsing, shopping cart functionality, and order management. It uses a modern tech stack with TypeScript, Tailwind CSS for styling, shadcn/ui components, and PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API endpoints with JSON responses

### Project Structure
The application follows a monorepo structure with clear separation:
- `client/`: React frontend application
- `server/`: Express.js backend API
- `shared/`: Shared TypeScript types and database schema
- Root configuration files for build tools and deployment

## Key Components

### Database Layer
- **Schema**: Defined in `shared/schema.ts` using Drizzle ORM
- **Tables**: Users, categories, products, cart items, orders, and order items
- **Relationships**: Proper foreign key relationships between entities
- **Types**: Auto-generated TypeScript types from database schema

### Authentication System
- **Registration/Login**: JWT token-based authentication
- **Password Security**: bcrypt hashing for password storage
- **Authorization**: Middleware for protecting authenticated routes
- **Session Management**: Client-side token storage with automatic refresh

### Product Management
- **Catalog**: Product listing with search, filtering, and sorting
- **Categories**: Hierarchical product categorization
- **Features**: Product ratings, reviews, stock management, and featured products

### Shopping Cart
- **Persistence**: Database-backed cart for authenticated users
- **Operations**: Add, update quantity, remove items
- **UI**: Sliding sidebar cart with real-time updates

### Order Processing
- **Checkout**: Multi-step checkout process with shipping and payment info
- **Order Creation**: Atomic order creation with order items
- **Order History**: User can view past orders with detailed information

## Data Flow

### Client-Server Communication
1. Frontend makes HTTP requests to `/api/*` endpoints
2. Express server handles routing and business logic
3. Server queries PostgreSQL database via Drizzle ORM
4. JSON responses sent back to client
5. React Query manages caching and state synchronization

### Authentication Flow
1. User submits login/register form
2. Server validates credentials and generates JWT
3. Token stored in localStorage on client
4. Subsequent requests include Authorization header
5. Server middleware validates token on protected routes

### Shopping Flow
1. User browses products with optional filters
2. Add to cart triggers authenticated API call
3. Cart state updated in database and UI
4. Checkout process collects shipping/payment info
5. Order creation atomically processes cart items

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Query
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Forms**: React Hook Form with Zod validation
- **Database**: Drizzle ORM, Neon serverless PostgreSQL
- **Authentication**: JWT, bcrypt
- **Date Handling**: date-fns

### Development Tools
- **TypeScript**: Full type safety across the stack
- **Vite**: Fast development server and build tool
- **ESBuild**: Production build optimization
- **PostCSS**: CSS processing with Tailwind

### Replit Integration
- Runtime error overlay for development
- Cartographer plugin for enhanced debugging
- Development banner for external access

## Deployment Strategy

### Build Process
1. Frontend: Vite builds React app to `dist/public`
2. Backend: ESBuild bundles server code to `dist/index.js`
3. Static assets served by Express in production
4. Environment variables configure database connection

### Development vs Production
- **Development**: Vite dev server with HMR and Express API
- **Production**: Single Express server serving bundled frontend and API
- **Database**: Neon PostgreSQL with connection pooling
- **Environment**: NODE_ENV determines build configuration

### Scalability Considerations
- Database connection pooling for concurrent requests
- JWT stateless authentication for horizontal scaling
- API response caching via React Query
- Optimized bundle splitting and code splitting ready for CDN deployment