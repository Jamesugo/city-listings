# NaijaList

NaijaList is a modern, mobile-first business directory for Nigeria. Built with Next.js 16 (App Router), it prioritizes fast discovery, WhatsApp integration, and premium design aesthetics.

## Phase 1 Overview
This repository contains the Phase 1 MVP. It operates entirely on in-memory mock data to demonstrate the UI, routing, SEO structure, and component architecture.

### Features
- **App Router Architecture**: Full SSR and SSG (`generateStaticParams`) for maximum SEO.
- **WhatsApp Integration**: Primary CTA on all listings, instantly connecting customers to businesses.
- **Mobile-First Design**: Custom CSS module design system (`globals.css`) with modern gradients, micro-interactions, and accessibility.
- **Admin Dashboard**: A password-gated dashboard (`/admin`) demonstrating CRUD UI (currently in-memory).
- **SEO & Schema.org**: Fully populated `LocalBusiness` JSON-LD structured data and dynamic meta tags for every listing.

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `/src/app`: Next.js pages and layouts
- `/src/components`: Reusable UI components
- `/src/lib/data.ts`: Mock data and data access layer (ready to be swapped with Supabase calls)
- `/src/lib/types.ts`: TypeScript definitions
- `/supabase`: PostgreSQL schema for Phase 2

## Phase 2 (Upcoming)
- Connect to Supabase PostgreSQL (schema provided in `/supabase/schema.sql`)
- Wire up the Admin panel for persistent CRUD operations
- Implement real authentication for business owners
- Implement customer reviews system
