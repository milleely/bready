# Bready 🍞

**Track your spending and watch your dough rise**

Bready is a warm and welcoming multi-user expense tracker designed for households and roommates to collaboratively manage shared and personal finances. With its bread-themed interface and intuitive design, managing your household's "dough" has never been easier.

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

---

## Features

### 💰 Smart Expense Tracking
- **Multi-User Support:** Track expenses for up to 4 household members
- **Shared Expenses:** Mark expenses as "shared" to automatically split costs
- **Personal Expenses:** Keep track of individual spending separately
- **Category Organization:** Organize expenses into 7 predefined categories

### 📊 Visual Analytics
- **Real-Time Dashboard:** See total spending, shared expenses, and per-person averages at a glance
- **Category Breakdown:** Interactive pie chart showing spending by category
- **User Comparison:** Stacked bar chart comparing personal vs shared spending per person
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

3. **Set up the database:**
   ```bash
   npx prisma migrate dev
   ```

4. **Seed with sample data:**
   ```bash
   npm run seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

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
- **Database:** SQLite (via Prisma)
- **ORM:** [Prisma](https://www.prisma.io/) 6.17.0

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

Bready comes with 7 predefined categories:

| Category | Color | Description |
|----------|-------|-------------|
| 🛒 Groceries | Green | Food and household supplies |
| 💡 Utilities | Blue | Electricity, water, internet |
| 📱 Subscriptions | Purple | Netflix, Spotify, etc. |
| 🍽️ Dining Out | Orange | Restaurants and takeout |
| 🚗 Transportation | Red | Gas, transit, rideshares |
| 🎮 Entertainment | Pink | Movies, games, hobbies |
| 📦 Other | Gray | Miscellaneous expenses |

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

## Documentation

- **[PRD.md](./PRD.md)** - Product vision, roadmap, and requirements
- **[CLAUDE.md](./CLAUDE.md)** - Technical guide for AI-assisted development
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes

---

## Roadmap

### v1.1 (Planned)
- Date range filtering
- Monthly spending trends
- CSV/PDF export
- Advanced search & filters

### v1.2 (Planned)
- Budget alerts
- Recurring expenses
- AI spending insights

### v2.0 (Future)
- User authentication
- Multi-household support
- Mobile app

*See [PRD.md](./PRD.md) for detailed roadmap*

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
