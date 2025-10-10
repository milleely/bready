# Bready UI Design Specification

**Version:** 1.0
**Date:** October 2025
**For:** Superdesign Canvas Preview

---

## Design System

### Color Palette

#### Primary Colors (Bread Theme)
```css
/* Amber/Orange Gradient */
--amber-50: #fffbeb
--amber-100: #fef3c7
--amber-300: #fcd34d
--amber-600: #d97706
--amber-700: #b45309
--amber-900: #78350f

--orange-50: #fff7ed
--orange-500: #f97316
--orange-600: #ea580c

--yellow-50: #fefce8

/* Accent Gradients */
--purple-600: #9333ea
--purple-700: #7e22ce
--blue-600: #2563eb
--blue-700: #1d4ed8

--green-600: #16a34a
--green-700: #15803d
--teal-600: #0d9488
--teal-700: #0f766e
```

#### Neutral Colors
```css
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-300: #d1d5db
--gray-600: #4b5563
--gray-700: #374151
--gray-900: #111827

--white: #ffffff
--black: #000000
```

#### Semantic Colors
```css
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### Typography

#### Font Family
```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

#### Font Sizes
```css
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */
```

#### Font Weights
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing Scale
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
```

### Border Radius
```css
--radius-sm: 0.375rem   /* 6px */
--radius-md: 0.5rem     /* 8px */
--radius-lg: 1rem       /* 16px */
--radius-full: 9999px
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

---

## Layout Structure

### Page Grid
```
┌─────────────────────────────────────────────────┐
│ Header (Fixed)                                  │
│ - Logo/Title                                    │
│ - Month Selector                                │
│ - Action Buttons                                │
├─────────────────────────────────────────────────┤
│ Main Content Area                               │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Metrics Cards (Grid: 4 columns)         │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Budget Progress Bars                     │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌───────────────┬─────────────────────────┐   │
│ │ Pie Chart     │ Bar Chart               │   │
│ │ (Categories)  │ (Per Person)            │   │
│ └───────────────┴─────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ User Management                          │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Recent Expenses Table                    │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Container
```css
max-width: 1280px (7xl)
padding: 1rem (mobile) → 2rem (desktop)
margin: 0 auto
```

---

## Component Specifications

### 1. Header

**Dimensions:**
- Height: ~120px
- Padding: 2rem vertical

**Layout:**
```
┌────────────────────────────────────────────────┐
│ [Bready Logo]              [Month Selector]    │
│ Tagline                    [Set Budget]        │
│                            [Add Recurring]     │
│                            [Add Expense]       │
└────────────────────────────────────────────────┘
```

**Logo/Title:**
- Font size: 2.25rem (36px)
- Font weight: 700 (bold)
- Gradient: amber-600 → orange-500 → amber-700
- Text gradient effect

**Tagline:**
- Font size: 0.875rem (14px)
- Color: gray-600
- "Track your spending and watch your dough rise"

**Action Buttons:**
```css
/* Set Budget Button */
background: linear-gradient(to right, purple-600, blue-600)
color: white
padding: 0.5rem 1rem
border-radius: 0.5rem
font-weight: 600
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1)

/* Add Recurring Button */
background: linear-gradient(to right, green-600, teal-600)
/* Same styling as above */

/* Add Expense Button */
background: linear-gradient(to right, amber-600, orange-600)
/* Same styling as above */
```

---

### 2. Month Selector

**Dimensions:**
- Width: ~300px
- Height: 40px
- Padding: 0.5rem 1rem

**Layout:**
```
┌─────────────────────────────────┐
│ [<] October 2025 [>] [Today] │
└─────────────────────────────────┘
```

**Border:**
- 2px solid amber-300
- Border radius: 0.5rem
- Background: white

**Buttons:**
- Arrow buttons: Square, 32px
- Today button: Amber gradient
- All buttons have hover states

---

### 3. Metrics Cards

**Grid:**
- 4 columns on desktop
- 2 columns on tablet
- 1 column on mobile
- Gap: 1.5rem

**Single Card Dimensions:**
- Height: ~120px
- Padding: 1.5rem
- Border radius: 1rem

**Card Styles:**
```css
/* Total Spent Card */
background: linear-gradient(135deg, amber-100, orange-100)
border: none
box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)

/* Shared Expenses Card */
background: linear-gradient(135deg, green-50, emerald-100)

/* Active Users Card */
background: linear-gradient(135deg, blue-50, indigo-100)

/* Avg Per Person Card */
background: linear-gradient(135deg, purple-50, pink-100)
```

**Content Layout:**
```
┌─────────────────────┐
│ [Icon] Total Spent  │ ← Title (gray-600, text-sm)
│                     │
│ $1,234.56          │ ← Value (text-3xl, font-bold)
└─────────────────────┘
```

---

### 4. Budget Progress Bars

**Container:**
- Background: gradient from orange-50 to amber-100
- Border radius: 1rem
- Padding: 1.5rem

**Single Progress Bar:**
```
┌──────────────────────────────────────┐
│ 🍞 Groceries                         │
│ $450 / $500                          │
│ ████████████████░░░░ 90%            │ ← Color-coded
│                                      │
│ [Budget bar shows fill percentage]  │
└──────────────────────────────────────┘
```

**Color Coding:**
- Green: 0-80% spent (on track)
- Yellow: 80-100% spent (warning)
- Red: >100% spent (over budget)

**Progress Bar:**
- Height: 12px
- Border radius: 9999px (full)
- Background: gray-200
- Animated transition: 0.3s ease

---

### 5. Charts Section

**Layout:**
- 2 columns on desktop
- 1 column on mobile
- Gap: 1.5rem

#### Pie Chart Card
```
┌────────────────────────┐
│ Spending by Category   │
│                        │
│     [Pie Chart]        │
│  With Legend Below     │
│                        │
│ • Groceries (35%)      │
│ • Utilities (20%)      │
│ • Dining (15%)         │
└────────────────────────┘
```

**Card Style:**
- Background: gradient amber-50 to orange-100
- Border radius: 1rem
- Padding: 1.5rem

**Chart:**
- Size: 300px × 300px
- Category colors from design system
- Hover tooltips show exact amounts

#### Bar Chart Card
```
┌────────────────────────┐
│ Spending per Person    │
│                        │
│     [Bar Chart]        │
│  Stacked Bars          │
│  (Personal/Shared)     │
│                        │
│ John  ████████         │
│ Sarah ██████           │
│ Alex  █████            │
└────────────────────────┘
```

**Bars:**
- Personal: User's color
- Shared: Green overlay
- Bar height: 40px
- Gap: 12px

---

### 6. User Management Card

**Container:**
- Background: gradient purple-50 to blue-100
- Border radius: 1rem
- Padding: 1.5rem

**User Row Layout:**
```
┌─────────────────────────────────────────────┐
│ [●] John Doe                    [Edit] [×]  │
│     john@example.com                        │
└─────────────────────────────────────────────┘
```

**User Color Dot:**
- Size: 12px
- Border radius: 50%
- User's assigned color

**Action Buttons:**
- Edit: Pencil icon, ghost button
- Delete: X icon, ghost button
- Hover: gray-100 background

---

### 7. Recent Expenses Table

**Container:**
- Background: gradient orange-50 to amber-100
- Border radius: 1rem
- Padding: 1.5rem

**Header:**
```
┌──────────────────────────────────────────────┐
│ Recent Expenses            [Export CSV]      │
└──────────────────────────────────────────────┘
```

**Table Layout:**
```
┌────────┬──────────────┬─────────┬──────┬──────┬────────┬─────────┐
│ Date   │ Description  │ Category│ User │ Type │ Amount │ Actions │
├────────┼──────────────┼─────────┼──────┼──────┼────────┼─────────┤
│ Oct 9  │ 🔁 Netflix  │ [Subs]  │ [●J] │Shared│ $15.99 │ [✏][🗑] │
│ Oct 8  │ Groceries   │ [Food]  │ [●S] │Persnl│ $87.45 │ [✏][🗑] │
└────────┴──────────────┴─────────┴──────┴──────┴────────┴─────────┘
```

**Category Badge:**
- Background: Category color at 20% opacity
- Text: Category color
- Padding: 0.25rem 0.625rem
- Border radius: 9999px
- Font size: 0.75rem

**Type Badge:**
- Shared: Green text
- Personal: Blue text
- Font size: 0.75rem

**Recurring Icon:**
- Purple color (#9333ea)
- 16px × 16px
- Appears before description

---

### 8. Dialogs

**Overlay:**
- Background: rgba(0, 0, 0, 0.5)
- Backdrop blur: 4px

**Dialog Container:**
```
┌───────────────────────────────────┐
│ Set Monthly Budget              [×]│
├───────────────────────────────────┤
│                                   │
│ Set a budget goal for Oct 2025   │
│                                   │
│ Category: [Dropdown ▼]           │
│                                   │
│ Budget Amount: [$______]         │
│                                   │
│ Apply To: [Shared (All Users) ▼] │
│                                   │
│              [Set Budget]         │
└───────────────────────────────────┘
```

**Dialog Style:**
- Background: white
- Border: 2px solid amber-300
- Border radius: 1rem
- Max width: 425px (budget), 500px (recurring)
- Padding: 1.5rem
- Box shadow: large

**Form Inputs:**
```css
/* Text Input / Number Input */
background: white
border: 2px solid amber-300
border-radius: 0.5rem
padding: 0.5rem 0.75rem
color: amber-900

/* Dropdown (Select) */
background: white
border: 2px solid amber-300
border-radius: 0.5rem
padding: 0.5rem 0.75rem
color: amber-900

/* Dropdown Content */
background: white
border: 2px solid amber-300
border-radius: 0.5rem
box-shadow: large
```

**Submit Button:**
```css
background: linear-gradient(to right, amber-600, orange-600)
color: white
padding: 0.5rem 1rem
border-radius: 0.5rem
font-weight: 600
box-shadow: large
```

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  - Single column layout
  - Stack all cards vertically
  - Full-width components
  - Smaller font sizes
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  - 2 column grid for metrics
  - Side-by-side charts
  - Moderate spacing
}

/* Desktop */
@media (min-width: 1025px) {
  - 4 column grid for metrics
  - Full layout as specified
  - Maximum spacing
}
```

---

## Animations & Transitions

```css
/* Button Hover */
transition: all 150ms ease-in-out
transform: scale(1.02) on hover
box-shadow: Enhanced on hover

/* Card Hover */
transition: transform 200ms ease
transform: translateY(-2px) on hover

/* Progress Bar Fill */
transition: width 300ms ease-in-out

/* Dialog */
animation: fade-in 200ms ease-in-out
animation: slide-up 200ms ease-in-out

/* Chart Tooltips */
animation: fade-in 150ms ease
```

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text

### Interactive Elements
- All buttons have min 44×44px touch target
- Focus indicators: 2px solid amber-600 outline
- Keyboard navigation supported
- ARIA labels on all interactive elements

### Screen Readers
- Semantic HTML5 elements
- Descriptive alt text for icons
- Proper heading hierarchy (h1 → h2 → h3)
- Table headers properly associated

---

## Dark Mode (Future)

```css
/* Background Colors */
--bg-primary: #111827 (gray-900)
--bg-secondary: #1f2937 (gray-800)
--bg-tertiary: #374151 (gray-700)

/* Text Colors */
--text-primary: #f9fafb (gray-50)
--text-secondary: #d1d5db (gray-300)

/* Accent Colors */
Keep gradient colors but adjust opacity for dark background
```

---

## Component States

### Buttons
```
Default → background gradient
Hover → enhanced shadow + scale(1.02)
Active → scale(0.98)
Disabled → opacity 50%, cursor not-allowed
Loading → spinner icon, disabled state
```

### Inputs
```
Default → amber-300 border
Focus → amber-600 border, ring effect
Error → red-500 border
Disabled → gray-300 border, gray-100 background
```

### Cards
```
Default → subtle shadow
Hover → translateY(-2px), enhanced shadow
Active → no special state
```

---

## Icon System

**Icons:** Use Lucide React icons

**Sizes:**
- Small: 16px (text-sm contexts)
- Medium: 20px (buttons, inline)
- Large: 24px (headers, standalone)

**Common Icons:**
- Wallet: Main logo/loading
- Target: Budget setting
- Repeat: Recurring expenses
- Download: Export CSV
- Plus: Add expense
- Pencil: Edit
- Trash: Delete
- Calendar: Date picker
- Users: User management
- ChevronLeft/Right: Month navigation

---

## Sample Component Code

```tsx
// Metrics Card Example
<Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-sm rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
    <Wallet className="h-4 w-4" />
    <span>Total Spent</span>
  </div>
  <div className="text-3xl font-bold text-gray-900">
    $1,234.56
  </div>
</Card>

// Button Example
<Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transition-all duration-150 hover:scale-102">
  <Target className="h-4 w-4" />
  Set Budget
</Button>

// Input Example
<Input
  type="number"
  className="bg-white border-2 border-amber-300 text-amber-900 rounded-lg focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
  placeholder="500.00"
/>
```

---

## Design Files Export Format

For Superdesign Canvas, export as:
- **Format:** Figma-compatible JSON
- **Artboards:** Desktop (1440px), Tablet (768px), Mobile (375px)
- **Components:** All components as separate frames
- **Color Palette:** Saved as styles
- **Typography:** Saved as text styles
- **Spacing:** 8px grid system

---

**End of Specification**
