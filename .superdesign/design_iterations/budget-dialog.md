# Budget Setting Dialog

Design a modal dialog for setting monthly budgets in Bready.

## Dialog Structure

A centered modal overlay with white background and amber border.

### Header
- Title "Set Monthly Budget"
- Close button (×) in top right
- Subtitle: "Set a budget goal for October 2025"

### Form Fields (vertical stack)

1. **Category Dropdown**
   - Label: "Category" (amber-900 color, bold)
   - Dropdown with amber border
   - Options: Groceries 🍞, Utilities 🔌, Subscriptions 📱, Dining Out 🍽️, Transportation 🚗, Entertainment 🎮, Other

2. **Budget Amount Input**
   - Label: "Budget Amount" (amber-900 color, bold)
   - Number input with dollar placeholder "500.00"
   - Amber border, white background

3. **Apply To Dropdown**
   - Label: "Apply To" (amber-900 color, bold)
   - Dropdown with amber border
   - Options: "Shared (All Users)", John, Sarah, Alex, Emma

### Footer
- Full-width button
- Gradient from amber to orange
- White text saying "Set Budget"
- Shadow effect

## Design Details

**Dialog Container:**
- White background
- 2px solid amber (#fcd34d) border
- Rounded corners (16px)
- Drop shadow
- Max width: 425px
- Padding: 24px

**Form Inputs:**
- White background
- 2px solid amber border
- Rounded corners (8px)
- Padding: 8px 12px
- Amber-900 text color

**Spacing:**
- 16px gap between form fields
- 24px margin before submit button

**Overlay:**
- Semi-transparent dark background (rgba(0,0,0,0.5))
- Blur effect

The dialog should feel warm and inviting, matching the bread theme while being highly functional.
