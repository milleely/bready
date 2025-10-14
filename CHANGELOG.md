# Changelog

All notable changes to Bready will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2025-10-14

### Added - Budget Tracking & Receipt Upload

- **Budget Tracker System:**
  - Monthly budget tracking per category
  - User-specific budgets (personal) and household budgets (shared)
  - Visual progress bars showing budget usage with percentage
  - Over-budget alerts with red warning indicators
  - Budget edit functionality with pencil icon
  - User/shared indicators on budget cards
  - Budget deletion with confirmation

- **Receipt Upload & OCR:**
  - Receipt photo upload for expenses
  - AI-powered OCR for automatic expense extraction
  - Receipt validation (rejects non-receipt images)
  - Vercel Blob Storage integration for receipt storage
  - Mobile-optimized receipt capture with fixed dimensions
  - Receipt lightbox for viewing uploaded receipts

- **Settlement Calculations:**
  - Automatic calculation of who owes whom
  - Settlement status card showing pending payments
  - Mark settlements as paid functionality
  - Color-coded settlement indicators

- **Category Expansion:**
  - Expanded from 7 to 15 expense categories:
    - Healthcare 💊 (Medical, pharmacy, insurance)
    - Household Items 🏠 (Furniture, appliances)
    - Personal Care ✨ (Beauty, grooming)
    - Shopping 👕 (Clothing, accessories)
    - Pets 🐾 (Pet food, vet, supplies)
    - Gifts 🎁 (Presents, occasions)
    - Travel ✈️ (Flights, hotels, vacation)
    - Home Maintenance 🔧 (Repairs, tools)
  - Optimized category colors for better visual differentiation
  - Semantic color choices matching category themes

- **Month Filtering:**
  - Month selector in header for filtering expenses
  - Defaults to current month
  - Stats and budgets automatically filter by selected month
  - Clean URL-based navigation

### Improved - UI/UX Enhancements

- **Category Dropdown:**
  - Made scrollable with max height of ~6 items
  - Removed auto-scroll buttons for better control
  - Native mouse wheel/trackpad scrolling

- **Receipt Lightbox:**
  - Fixed duplicate close button issue
  - Centered X icon in close button
  - Dark translucent background for better focus
  - Support for both images and PDF receipts

- **Budget Cards:**
  - Enhanced visual design with category colors
  - Progress bars with smooth animations
  - Clear "remaining" vs "over budget" messaging
  - Responsive layout for mobile

### Changed
- Budget tracker now differentiates between personal and household spending
- Receipt uploads stored in Vercel Blob instead of local storage
- Category colors updated for better contrast and semantic meaning

### Fixed
- Personal budgets now correctly filter expenses by user
- Receipt lightbox close button properly centered
- Category dropdown scrolling on mobile
- Budget edit mode properly populates form data

---

## [1.0.0] - 2025-10-09

### Added - Bready Rebrand
- **Brand Identity:** Renamed application from "Expense Tracker" to "Bready"
  - New tagline: "Track your spending and watch your dough rise"
  - Bread-themed color palette with warm tones (amber, orange, yellow, brown)
  - Updated page title and metadata

- **Design System Overhaul:**
  - Implemented warm color palette across all components
  - Updated Tailwind CSS v4 theme with bread-inspired colors:
    - Light mode: Cream backgrounds, sienna browns, golden ambers
    - Dark mode: Deep chocolate browns with warm orange accents
  - Increased border radius to 1rem for softer, rounder appearance
  - Added subtle gradient overlays for depth

- **Component Updates:**
  - Metrics cards redesigned with bread-themed gradients:
    - Total Spent: Amber-yellow gradient
    - Shared Expenses: Orange-amber gradient
    - Active Users: Amber-orange gradient
    - Avg Per Person: Yellow-amber gradient
  - Chart colors updated to warm palette (amber/orange for bar charts)
  - Background gradients use warm overlays

- **Documentation:**
  - Created comprehensive PRD.md (Product Requirements Document)
  - Created CHANGELOG.md (this file)
  - Updated README.md with Bready branding and features

### Changed
- Header title gradient now uses amber-orange-amber instead of purple-pink
- Default border radius increased from 0.5rem to 1rem
- Background uses warm gradient overlays instead of neutral tones

---

## [0.2.0] - 2025-10-07

### Added - Multi-User Expense Tracker (Initial Version)
- **Core Functionality:**
  - Multi-user expense tracking (up to 4 users)
  - User color-coding for visual identification
  - Full CRUD operations for expenses (Create, Read, Update, Delete)
  - Expense categorization (Groceries, Utilities, Subscriptions, Dining, Transportation, Entertainment, Other)
  - Date tracking for all expenses

- **Shared Expense Feature:**
  - Toggle to mark expenses as "shared"
  - Automatic cost splitting among all users
  - Visual indicator (green badge) for shared expenses
  - Per-person breakdown includes shared expense attribution

- **Analytics Dashboard:**
  - Metric cards showing:
    - Total Spent (all expenses combined)
    - Shared Expenses (total shared amount)
    - Active Users (contributing members count)
    - Avg Per Person (average spending)
  - Pie chart for spending by category with percentages
  - Stacked bar chart for spending per person (Personal + Shared)

- **UI/UX Features:**
  - Dark/light mode toggle with system theme detection
  - Dialog-based expense form (Add/Edit)
  - Inline edit/delete actions in expense table
  - Responsive design (mobile, tablet, desktop)
  - Loading states with animated wallet icon
  - Confirmation dialogs for destructive actions

- **Database & Backend:**
  - Prisma ORM with SQLite database
  - Database schema with User and Expense models
  - RESTful API routes:
    - GET /api/users
    - GET /api/expenses (with optional filters)
    - POST /api/expenses
    - PUT /api/expenses/[id]
    - DELETE /api/expenses/[id]
    - GET /api/stats (computed statistics)
  - Seed script for sample data generation

- **Tech Stack:**
  - Next.js 15 with App Router
  - React 19
  - TypeScript 5
  - Tailwind CSS v4 (with @theme directive syntax)
  - Prisma 6.17.0
  - shadcn/ui components
  - Recharts for data visualization
  - next-themes for theme management

### Technical Details
- Repository initialized with Next.js 15 and Turbopack
- Component architecture separating presentation and logic
- API routes following Next.js 15 conventions
- Type-safe Prisma client integration
- Singleton pattern for Prisma client (prevents multiple instances)

---

## [0.1.0] - 2025-10-07

### Added - Initial Setup
- Project bootstrapped with `create-next-app`
- Next.js 15 with Turbopack enabled
- TypeScript configuration
- Basic file structure
- Git repository initialization

---

## Version Naming Convention

- **Major version (X.0.0):** Breaking changes, major feature releases, rebrandings
- **Minor version (0.X.0):** New features, enhancements (backward compatible)
- **Patch version (0.0.X):** Bug fixes, minor improvements

---

## Upcoming Releases

### [1.1.0] - Planned
- Date range filtering for expenses
- Monthly trends visualization
- Export functionality (CSV/PDF)
- Search and advanced filtering

### [1.2.0] - Planned
- Budget alerts and spending limits
- Recurring expense management
- AI-generated spending insights

### [2.0.0] - Planned
- User authentication system
- Multi-household support
- Notifications (email/push)
- Receipt upload feature

---

**Note:** This changelog starts from v0.2.0 (first functional version). Earlier development iterations are not documented.
