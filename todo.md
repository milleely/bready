**Phase 1: Budget & Goals System**

     1. Database Schema - Add Budget model with category, amount, month, 
     userId
     2. API Routes - Create /api/budgets endpoints (CRUD)
     3. UI Components - Budget setting dialog, progress bars on metrics 
     cards
     4. Logic - Calculate spend vs budget per category, show warnings 
     when over

     Phase 2: Recurring Expenses

     1. Database Schema - Add RecurringExpense model with frequency, 
     nextDate, template data
     2. API Routes - Create /api/recurring-expenses endpoints
     3. Background Job - Add cron-like system to auto-create expenses 
     (simple date check on load)
     4. UI Components - Manage recurring expenses dialog, visual 
     indicator on expense list

     Phase 3: Enhanced Filtering & Search

     1. Update API - Enhance /api/expenses with robust query params (date
      range, multi-category, multi-user)
     2. UI Components - Filter panel with date pickers, category 
     multi-select, user multi-select
     3. State Management - Add filter state to main page, refetch on 
     filter changes
     4. Visual Feedback - Active filter badges, clear all button

     Phase 4: Receipt Upload System

     1. File Storage - Add local file storage setup (public/uploads 
     directory)
     2. Database Schema - Add receiptUrl field to Expense model
     3. API Route - Create upload endpoint with file validation
     4. UI Components - Image upload in expense form, thumbnail preview, 
     lightbox viewer

     Phase 5: Debt Tracking (Shared Expense Settlement)

     1. Logic Layer - Calculate who owes whom based on shared expenses
     2. API Route - Create /api/settlements to calculate balances
     3. UI Components - Debt summary card, "settle up" action buttons
     4. Database - Add Settlement model to track payments between users

     Phase 6: Mobile Responsive Design

     1. Layout Updates - Convert grid layouts to responsive flex/grid
     2. Component Updates - Collapse charts on mobile, hamburger menu
     3. Touch Optimization - Larger tap targets, swipe actions
     4. Testing - Test on various screen sizes

     Each phase is independent and can be built sequentially with commits
      between phases.