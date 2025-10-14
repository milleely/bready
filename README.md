# Bready 🍞

**Track your spending and watch your dough rise**

Bready is a warm and welcoming multi-user expense tracker designed for households and roommates to collaboratively manage shared and personal finances. With its bread-themed interface and intuitive design, managing your household's "dough" has never been easier.

![Version](https://img.shields.io/badge/version-1.1.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

---

## Features

### 🔐 Secure Authentication
- **User Accounts:** Secure authentication powered by Clerk
- **Household Model:** Each account manages a household with up to 4 members
- **Data Isolation:** Complete privacy - households can only access their own data
- **Easy Sign-In:** Social logins and email authentication supported

### 💰 Smart Expense Tracking
- **Multi-User Support:** Track expenses for up to 4 household members
- **Shared Expenses:** Mark expenses as "shared" to automatically split costs
- **Personal Expenses:** Keep track of individual spending separately
- **Category Organization:** Organize expenses into 15 predefined categories
- **Receipt Upload:** Snap photos of receipts with AI-powered OCR validation
- **Month Filtering:** Filter expenses by month for better organization

### 📊 Visual Analytics & Budgeting
- **Real-Time Dashboard:** See total spending, shared expenses, and per-person averages at a glance
- **Category Breakdown:** Interactive pie chart showing spending by category
- **User Comparison:** Stacked bar chart comparing personal vs shared spending per person
- **Budget Tracker:** Set monthly budgets per category (household or user-specific)
- **Budget Progress:** Visual progress bars with remaining amounts and over-budget alerts
- **Settlement Calculations:** Automatic calculation of who owes whom
- **Color-Coded Users:** Each household member has a unique color for easy identification

### 🎨 Beautiful Design
- **Warm Color Palette:** Bread-themed design with amber, orange, and golden tones
- **Dark/Light Mode:** Full theme support with automatic system detection
- **Responsive:** Works seamlessly on mobile, tablet, and desktop
- **Modern UI:** Built with shadcn/ui components and Tailwind CSS v4

### ⚡ Developer Experience
- **Next.js 15:** Lightning-fast with Turbopack
- **TypeScript:** Fully type-safe codebase
- **Prisma ORM:** Type-safe database operations
- **Easy Setup:** Get started in minutes with seed data

---

## Quick Start

### Prerequisites
- Node.js 20+ installed
- npm, yarn, pnpm, or bun package manager
- [Clerk Account](https://clerk.com) (free tier available)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd cursor-tutorial
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Clerk Authentication:**
   - Create a free account at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your API keys

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Clerk keys:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   # (other Clerk URLs are pre-configured)
   ```

5. **Set up the database:**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) and sign up!

---

## Tech Stack

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Themes:** [next-themes](https://github.com/pacocoursey/next-themes)

### Backend
- **Runtime:** Next.js API Routes
- **Database:** PostgreSQL (via Prisma) - SQLite for local dev
- **ORM:** [Prisma](https://www.prisma.io/) 6.17.0
- **Authentication:** [Clerk](https://clerk.com/) - Secure user authentication
- **Deployment:** [Vercel](https://vercel.com/) with Postgres

### Development
- **Bundler:** Turbopack (Next.js 15 default)
- **Package Manager:** npm
- **Type Checking:** TypeScript 5

---

## Project Structure

```
bready/
├── app/                      # Next.js 15 App Router
│   ├── api/                 # API routes
│   │   ├── expenses/       # Expense CRUD endpoints
│   │   ├── stats/          # Analytics endpoint
│   │   └── users/          # User endpoints
│   ├── globals.css         # Tailwind v4 theme (@theme directives)
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main dashboard page
├── components/              # React components
│   ├── ui/                 # shadcn/ui base components
│   ├── expense-form.tsx    # Add/Edit expense dialog
│   ├── metrics-cards.tsx   # Dashboard stat cards
│   ├── recent-expenses.tsx # Expense table
│   ├── spending-charts.tsx # Analytics visualizations
│   └── theme-toggle.tsx    # Dark/light mode switcher
├── lib/                     # Utilities
│   ├── db.ts               # Prisma client singleton
│   └── utils.ts            # Helper functions & categories
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration history
│   └── seed.ts             # Sample data generator
├── CLAUDE.md               # AI development guide
├── PRD.md                  # Product requirements document
├── CHANGELOG.md            # Version history
└── README.md               # This file
```

---

## Available Scripts

### Development
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm start            # Start production server
```

### Database
```bash
npm run seed                                    # Seed with sample data
npx prisma migrate dev --name <migration_name>  # Create migration
npx prisma studio                                # Open database GUI
npx prisma generate                              # Regenerate Prisma client
```

---

## Expense Categories

Bready comes with 15 predefined categories:

| Icon | Category | Color | Description |
|------|----------|-------|-------------|
| 🥖 | Groceries | Amber | Food and household supplies |
| ⚡ | Utilities | Gray | Electricity, water, internet |
| 📱 | Subscriptions | Indigo | Netflix, Spotify, streaming |
| 🍽️ | Dining Out | Orange-Red | Restaurants and takeout |
| 🚗 | Transportation | Red | Gas, transit, rideshares |
| 🎬 | Entertainment | Purple | Movies, games, hobbies |
| 💊 | Healthcare | Green | Medical, pharmacy, insurance |
| 🏠 | Household Items | Cyan | Furniture, appliances, home goods |
| ✨ | Personal Care | Pink | Beauty, grooming, self-care |
| 👕 | Shopping | Violet | Clothing, accessories, retail |
| 🐾 | Pets | Yellow | Pet food, vet, supplies |
| 🎁 | Gifts | Rose | Presents, special occasions |
| ✈️ | Travel | Sky Blue | Flights, hotels, vacation |
| 🔧 | Home Maintenance | Slate | Repairs, tools, maintenance |
| 📦 | Other | Brown | Miscellaneous expenses |

*Categories can be customized in `lib/utils.ts`*

---

## API Routes

### Expenses
- `GET /api/expenses` - List all expenses (supports filtering)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Users
- `GET /api/users` - List all users

### Stats
- `GET /api/stats` - Get computed statistics (totals, breakdowns)

*See [CLAUDE.md](./CLAUDE.md) for detailed API documentation*

---

## Database Schema

### User Model
- `id` (String, UUID)
- `name` (String)
- `email` (String, unique)
- `color` (String) - Hex color for UI theming
- `expenses` (Relation) - One-to-many with Expense

### Expense Model
- `id` (String, UUID)
- `amount` (Float)
- `category` (String)
- `description` (String)
- `date` (DateTime)
- `isShared` (Boolean)
- `userId` (String, FK to User)
- `user` (Relation) - Many-to-one with User

*Full schema in `prisma/schema.prisma`*

---

## Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
```

### Tailwind CSS v4
Theme customization uses `@theme` directives in `app/globals.css`. Note: This is different from Tailwind v3's `tailwind.config.js` approach.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Deployment

Ready to deploy to production?

### Vercel + PostgreSQL (Recommended)

See our comprehensive deployment guides:

- **[📋 Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[🚀 Vercel Deployment Guide](./docs/VERCEL_DEPLOYMENT.md)** - Complete deployment walkthrough

**Quick Deploy:**
1. Push code to GitHub
2. Import to Vercel
3. Add Vercel Postgres
4. Configure Clerk production keys
5. Deploy!

Your app will be live with automatic HTTPS, global CDN, and managed database.

---

## Documentation

- **[DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)** - Production deployment checklist
- **[VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)** - Vercel deployment guide
- **[CLERK_SETUP.md](./docs/CLERK_SETUP.md)** - Clerk authentication setup
- **[CLAUDE.md](./CLAUDE.md)** - Technical guide for AI-assisted development

---

## Roadmap

### ✅ v1.0 (Complete)
- ✅ User authentication with Clerk
- ✅ Multi-household support
- ✅ Secure API routes
- ✅ Production deployment ready

### ✅ v1.1 (Complete)
- ✅ Budget tracking with user-specific and household budgets
- ✅ Settlement calculations
- ✅ Month filtering for expenses
- ✅ 15 expense categories with optimized colors
- ✅ Receipt upload with AI-powered OCR validation
- ✅ Receipt storage on Vercel Blob

### v1.2 (In Progress)
- CSV export functionality
- Monthly trends visualization
- Recurring expenses
- Advanced filtering and search

### v2.0 (Planned)
- Advanced analytics dashboard
- Mobile optimization
- AI spending insights
- Bank integration
- Multi-currency support

---

## Support

Have questions or found a bug?

- **Issues:** [GitHub Issues](https://github.com/yourusername/bready/issues)
- **Documentation:** Check [CLAUDE.md](./CLAUDE.md) for technical details
- **PRD:** See [PRD.md](./PRD.md) for product information

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) by Vercel
- [shadcn/ui](https://ui.shadcn.com/) by shadcn
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs
- [Prisma](https://www.prisma.io/) by Prisma
- [Recharts](https://recharts.org/) by Recharts Team

---

**Made with ☕ and 🍞 by your team**
