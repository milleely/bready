# Recent Expenses Table

Design a data table showing recent expenses with full details and actions.

## Table Structure

A card with gradient background containing the expense table.

### Header
- Left: "Recent Expenses" title (bold)
- Right: "Export CSV" button (outlined style)

### Table Columns
1. **Date** - "Oct 9", "Oct 8", etc.
2. **Description** - Text with optional recurring icon (🔁) in purple
3. **Category** - Colored badge (e.g., "Groceries" with green background)
4. **User** - Colored dot + name (e.g., ● John)
5. **Type** - "Shared" (green) or "Personal" (blue)
6. **Amount** - Right-aligned dollar amount
7. **Actions** - Edit ✏️ and Delete 🗑️ buttons

### Sample Rows

**Row 1:**
- Date: Oct 9
- Description: 🔁 Netflix Subscription
- Category: Subscriptions (purple badge)
- User: ● John (blue dot)
- Type: Shared (green text)
- Amount: $15.99
- Actions: Edit, Delete buttons

**Row 2:**
- Date: Oct 8
- Description: Whole Foods Groceries
- Category: Groceries (green badge)
- User: ● Sarah (pink dot)
- Type: Personal (blue text)
- Amount: $87.45
- Actions: Edit, Delete buttons

**Row 3:**
- Date: Oct 7
- Description: Electric Bill
- Category: Utilities (yellow badge)
- User: ● Alex (purple dot)
- Type: Shared (green text)
- Amount: $125.00
- Actions: Edit, Delete buttons

## Design Details

**Container:**
- Gradient background: orange-50 to amber-100
- Rounded corners (16px)
- Padding: 24px

**Table:**
- Clean borders between rows
- Hover effect on rows (subtle background change)
- Alternating row backgrounds for better readability

**Category Badges:**
- Rounded pill shape (full border radius)
- Background: category color at 20% opacity
- Text: full category color
- Small font size (12px)
- Padding: 4px 10px

**User Indicators:**
- 12px colored circle
- User's assigned color
- Name next to circle

**Type Badges:**
- No background
- Color-coded text (green for Shared, blue for Personal)
- Small font (12px)
- Medium weight

**Action Buttons:**
- Icon-only buttons
- Ghost style (no background by default)
- Hover: light gray background
- Delete button: red icon color

**Recurring Icon:**
- Purple color (#9333ea)
- 16px size
- Appears before description text

The table should be scannable and easy to read, with clear visual distinctions between different data types.
