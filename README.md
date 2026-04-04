# GeoDomain Scout - Next.js Application

This is a Next.js application for discovering geo-service domain opportunities and matching them with local businesses.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
- `src/pages/` - Page components (imported by app routes)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and helpers
- `src/types/` - TypeScript type definitions
- `src/data/` - Mock data and constants
- `src/services/` - API services and business logic
- `public/` - Static assets

## Features

- **Landing Page**: Marketing page showcasing the product
- **Dashboard**: Search for domain opportunities and business prospects
- **CRM Pipeline**: Drag-and-drop Kanban board for managing leads
- **Prospect Detail**: Detailed view of individual business prospects
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Animations**: Framer Motion for smooth transitions
- **Type Safety**: Full TypeScript support

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Context API
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Drag & Drop**: @hello-pangea/dnd
- **Forms**: React Hook Form + Zod

## Migration Notes

This project was migrated from Vite to Next.js while preserving:
- Exact visual appearance and styling
- All component functionality
- All page layouts and routing
- All animations and interactions
- All existing features and user flows

The migration maintains 100% visual and functional parity with the original Vite application.
