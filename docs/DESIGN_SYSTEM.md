# Bready Design System

**Version:** 1.0
**Last Updated:** October 2025
**Theme:** Golden Crust (Bread-inspired)

---

## 🎨 Design Philosophy

Bready follows a warm, inviting design aesthetic inspired by freshly baked bread. The interface uses golden amber tones, rounded corners, and playful bread-themed elements to create a delightful expense tracking experience.

### Core Principles
1. **Warmth & Approachability** - Bread-themed colors and friendly UI
2. **Clarity & Readability** - High contrast, clean typography
3. **Consistency** - Unified design language across all components
4. **Delight** - Subtle animations and playful touches

---

## 🎨 Color Palette

### Primary Colors (Bread Theme)
```css
/* Golden Crust Gradient */
Amber 50:   #fffbeb  /* Background base */
Amber 100:  #fef3c7  /* Light accents */
Amber 300:  #fcd34d  /* Borders */
Amber 600:  #d97706  /* Primary actions */
Amber 700:  #b45309  /* Primary hover */
Amber 800:  #92400e  /* Dark text */
Amber 900:  #78350f  /* Darkest text */

Orange 50:  #fff7ed  /* Secondary background */
Orange 500: #f97316  /* Secondary actions */
Orange 600: #ea580c  /* Gradient mid-point */
```

### Functional Colors
```css
/* Status Colors */
Success (Green):   #10b981 → #059669
Warning (Amber):   #f59e0b → #d97706
Error (Red):       #ef4444 → #dc2626
Info (Blue):       #3b82f6 → #2563eb

/* Neutrals */
Gray 50:   #f9fafb  /* Lightest background */
Gray 100:  #f3f4f6  /* Card backgrounds */
Gray 600:  #4b5563  /* Secondary text */
Gray 700:  #374151  /* Body text */
Gray 900:  #111827  /* Headings */
White:     #ffffff  /* Pure white */
```

---

## 🔤 Typography

### Font Families
```css
/* System fonts for performance */
font-sans: ui-sans-serif, system-ui, sans-serif
font-mono: ui-monospace, 'JetBrains Mono', monospace
```

### Type Scale
```css
/* Headings */
h1: 2.25rem (36px) - Bold - Logo/Main title
h2: 1.875rem (30px) - Semibold - Page sections
h3: 1.5rem (24px) - Semibold - Card titles
h4: 1.25rem (20px) - Semibold - Subsections

/* Body Text */
Base: 1rem (16px) - Regular
Small: 0.875rem (14px) - Regular - Secondary info
XS: 0.75rem (12px) - Medium - Labels, metadata
```

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## 🏗️ Layout & Spacing

### Container
```css
max-width: 1280px (7xl)
padding: 1rem (mobile), 1.5rem (tablet), 2rem (desktop)
```

### Spacing Scale
```css
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
6: 1.5rem (24px)
8: 2rem (32px)
12: 3rem (48px)
```

### Grid System
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 4 columns

---

## 🧩 Components

### Buttons

#### Primary Button (Amber)
```jsx
className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700
  hover:from-amber-700 hover:via-orange-600 hover:to-amber-800
  text-white font-semibold shadow-lg
  transform hover:scale-105 transition-all duration-200"
```

**Usage:** Main actions (Add Expense, Set Budget, Add User)

#### Secondary Button
```jsx
className="border-amber-400 text-amber-800 hover:bg-amber-100"
```

**Usage:** Less prominent actions (Cancel, Today)

#### Icon Button
```jsx
className="h-7 w-7 hover:bg-amber-100"
```

**Usage:** Navigation controls, calendar toggle

### Cards

#### Standard Card
```jsx
<Card className="bg-gradient-to-br from-amber-100 to-orange-100
  border-0 shadow-md">
```

**Usage:** Budget tracker, user management, charts

#### Elevated Card (Budget Progress Items)
```jsx
<div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
```

**Usage:** Individual budget items, standalone content cards

#### Metrics Card
```jsx
<Card style={{
  background: 'linear-gradient(135deg, #e3c462 0%, #fdf885 100%)'
}} className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
```

**Usage:** Total spent, shared expenses, active users, avg per person

### Progress Bars

```jsx
/* Container */
<div className="h-6 bg-gray-100 rounded-full overflow-hidden">
  /* Fill */
  <div className="h-full transition-all duration-500 rounded-full"
    style={{
      width: `${percentage}%`,
      backgroundColor: categoryColor
    }}
  />
</div>
```

**States:**
- On Track: Category color
- Over Budget: Red (#ef4444)

### Icons

#### Category Icons
```javascript
{
  groceries: '🥖',
  utilities: '⚡',
  subscriptions: '📱',
  dining: '🍽️',
  transportation: '🚗',
  entertainment: '🎬',
  other: '📦'
}
```

#### UI Icons (Lucide React)
- Croissant: Budget/dough theme
- Wallet: Loading state
- Calendar: Date selection
- ChevronLeft/Right: Navigation
- Info: Tooltips

---

## 🎭 Interactions & Animations

### Hover States
```css
/* Buttons */
transform: scale(1.05)
transition: all 200ms

/* Cards */
transform: translateY(-4px)
box-shadow: xl
transition: all 300ms

/* Progress Bars */
transition: width 500ms ease-out
```

### Loading State
```jsx
<Wallet className="h-12 w-12 animate-pulse" />
```

### Modal/Dialog Overlays
```css
backdrop: rgba(0, 0, 0, 0.5)
animation: fadeIn 200ms
```

---

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Responsive Patterns
- **Metrics Cards:** 1 col (mobile) → 2 cols (md) → 4 cols (lg)
- **Budget Items:** Stack vertically on all sizes
- **Header:** Logo + Title | Controls (stack on mobile)

---

## 🎯 Component Specifications

### Header
```jsx
<div className="flex items-start gap-3">
  <BreadyLogo size={56} />
  <div>
    <h1>Bready</h1>
    <p className="text-sm">Track your dough</p>
  </div>
</div>
```

### Month Selector
- Width: Auto-sized with 140px center display
- Padding: px-2 py-1.5
- Gap: 1 (4px between elements)
- Border: 2px amber-300

### Hover Cards (Tooltips)
```jsx
<HoverCardContent
  className="w-80 bg-white border-gray-200 shadow-xl z-[100]"
  side="bottom"
  sideOffset={8}
>
```

### Calendar Picker (Month/Year)
- Grid: 3 columns for months
- Selected: Amber background, white text
- Current month: Amber ring
- Year navigation: Up/down arrows

---

## 🍞 Brand Elements

### Logo (BreadyLogo)
- Size: 56px (header), 48px (default)
- Style: SVG with golden gradient bread loaf
- Features: Scoring marks, steam wisps, glossy highlight
- Animation: Scale on hover (1.1x)

### Tagline
"Track your dough"

### Voice & Tone
- Friendly and approachable
- Playful bread/baking puns
- Clear and helpful
- Encouraging but not pushy

---

## ♿ Accessibility

### Contrast Ratios
- Headings: 4.5:1 minimum (WCAG AA)
- Body text: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- Hover cards: White background for maximum contrast

### Interactive Elements
- All buttons have aria-labels
- Focus states visible (ring-2 ring-amber-400)
- Keyboard navigation supported
- Screen reader friendly

### Color Usage
- Never rely on color alone
- Use icons + text for status
- Provide alternative indicators (rings, borders)

---

## 🎨 Shadows & Depth

### Elevation Scale
```css
sm: 0 1px 2px rgba(0, 0, 0, 0.05)
md: 0 4px 6px rgba(0, 0, 0, 0.1)
lg: 0 10px 15px rgba(0, 0, 0, 0.1)
xl: 0 20px 25px rgba(0, 0, 0, 0.15)
```

### Usage
- Cards: shadow-md
- Buttons: shadow-lg
- Hover cards: shadow-xl
- Month selector: shadow-sm

---

## 📏 Border Radius

```css
sm: 0.125rem (2px)
DEFAULT: 0.25rem (4px)
md: 0.375rem (6px)
lg: 0.5rem (8px)
xl: 0.75rem (12px)
full: 9999px (circles)
```

### Usage
- Buttons: rounded-lg
- Cards: rounded-xl
- Progress bars: rounded-full
- Inputs: rounded-md

---

## 🔄 State Management

### Button States
1. **Default:** Gradient background
2. **Hover:** Darker gradient + scale
3. **Active:** Slightly darker
4. **Disabled:** Opacity 50%, pointer-events-none

### Card States
1. **Default:** Subtle shadow
2. **Hover:** Larger shadow + translate up
3. **Active:** No special state
4. **Loading:** Pulse animation

---

## 📋 Usage Guidelines

### DO ✅
- Use bread/baking themed icons where appropriate
- Maintain warm color palette throughout
- Provide clear visual feedback for interactions
- Use consistent spacing and sizing
- Keep text readable with high contrast

### DON'T ❌
- Mix cold colors (blues, purples) unless for data visualization
- Use harsh shadows or borders
- Over-animate (keep it subtle)
- Sacrifice readability for aesthetics
- Break the bread theme without good reason

---

## 🔮 Future Considerations

### Potential Additions
- Dark mode variant with toasted bread theme
- Additional bread-themed illustrations
- Animated bread loading states
- Seasonal themes (holiday bread, sourdough, etc.)
- More category icons in bread style

### Scalability
- Color system supports theme variants
- Component library ready for expansion
- Typography scale can accommodate new content
- Layout grid flexible for new features

---

## 📚 References

**Color Tools:**
- [Adobe Color](https://color.adobe.com) for palette generation
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Icon Libraries:**
- Lucide React (primary)
- Emoji for categories

**Inspiration:**
- Warm, artisanal bakery aesthetics
- Modern financial apps (for clarity)
- Playful SaaS interfaces (for delight)

---

*This design system ensures consistency across all Bready interfaces and provides a foundation for future development. All new features should align with these guidelines.*
