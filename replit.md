# Warranty Manager

## Overview

Warranty Manager is a full-stack web application that helps users register, track, and manage warranties for their electronic products and appliances. The system enables users to organize product information, monitor warranty expiration dates, submit support requests directly to manufacturers, and review their products. Built with a modern React frontend and Express backend, the application uses PostgreSQL for data persistence and focuses on utility-driven design for efficient product management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, configured for fast HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing (instead of React Router)
- **TanStack Query** (React Query) for server state management, data fetching, and caching

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- **New York style** variant from shadcn/ui configuration
- Custom theme system supporting light/dark modes via CSS variables
- Design inspiration from productivity tools (Notion, Airtable, Linear) for clean data organization

**State Management**
- Server state managed through TanStack Query with aggressive caching (`staleTime: Infinity`)
- Local UI state handled with React hooks
- Theme state persisted to localStorage

**Form Handling**
- **React Hook Form** for performant form state management
- **Zod** schemas for runtime validation (shared between client and server)
- **@hookform/resolvers** for integrating Zod with React Hook Form

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- Separate entry points for development (`index-dev.ts`) and production (`index-prod.ts`)
- Development mode integrates Vite middleware for SSR and HMR
- Production mode serves pre-built static assets from `dist/public`

**API Design**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- File upload support via **Multer** for receipts and product photos (JPEG, PNG, PDF)
- Custom request logging middleware for API performance monitoring

**File Upload Strategy**
- Local file storage in `uploads/` directory
- 10MB file size limit per upload
- Unique filename generation using timestamp + random suffix
- Validation for allowed MIME types (images and PDFs only)

**Email Generation**
- Server-side template generation for warranty claim emails
- Formatted in Portuguese (pt-PT locale) for target market
- Includes product details, purchase date, and issue description

### Database Architecture

**ORM & Schema**
- **Drizzle ORM** for type-safe database queries
- **PostgreSQL** as the primary database (via Neon serverless driver `@neondatabase/serverless`)
- Schema defined in `shared/schema.ts` and shared between client/server for type consistency
- **Zod schemas** generated from Drizzle tables via `drizzle-zod` for validation

**Database Tables**

1. **brands** - Pre-populated manufacturer database
   - Stores manufacturer contact information (support email, phone, website)
   - Product categorization
   - Logo URLs for brand display

2. **products** - User-registered products
   - Links to brands table via foreign key
   - Warranty tracking (purchase date, expiration date)
   - Photo storage (array of URLs)
   - Receipt document storage
   - Serial numbers and model information

3. **reviews** - Product ratings and feedback
   - 1-5 star rating system
   - Pros/cons lists stored as arrays
   - Recommendation boolean flag
   - Cascading delete on product removal

4. **supportRequests** - Warranty claims and support history
   - Issue categorization (malfunction, defect, damage, other)
   - Severity levels
   - Status tracking
   - Cascading delete on product removal

**Data Layer Abstraction**
- `IStorage` interface defines storage contract
- `MemStorage` class provides in-memory implementation for development/testing
- Database credentials configured via environment variable `DATABASE_URL`
- Migration system via Drizzle Kit (`drizzle.config.ts`)

### External Dependencies

**Database Service**
- **Neon PostgreSQL** - Serverless PostgreSQL database
- Connection managed via `@neondatabase/serverless` driver
- Requires `DATABASE_URL` environment variable

**Third-Party UI Libraries**
- **Radix UI** - Headless component primitives (40+ components)
- **Lucide React** - Icon library
- **date-fns** - Date manipulation and formatting
- **cmdk** - Command menu component
- **class-variance-authority** - Variant-based component styling
- **tailwind-merge** & **clsx** - Conditional className utilities

**Development Tools**
- **Replit-specific plugins** - Cartographer, dev banner, runtime error overlay (development only)
- **tsx** - TypeScript execution for development server
- **esbuild** - Server bundling for production builds
- **drizzle-kit** - Database migration management

**Form & Validation**
- **Zod** - Runtime schema validation (shared schemas between client/server)
- **zod-validation-error** - User-friendly validation error messages

**Session Management**
- **connect-pg-simple** - PostgreSQL-backed session store (imported but usage not visible in provided files)