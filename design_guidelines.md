# Warranty Manager - Design Guidelines

## Design Approach

**System Selected:** Productivity-Focused Design System  
Drawing inspiration from **Notion** (clean data organization), **Airtable** (database views), and **Linear** (status indicators and modern UI)

**Rationale:** This utility-focused application prioritizes data clarity, efficient workflows, and intuitive product management. Users need quick access to warranty status, easy product registration, and streamlined claim submission.

---

## Typography

**Font Stack:** Inter (primary), SF Pro Display (headings)
- **Headings:** 
  - H1: 2.5rem (40px), semibold - Dashboard title
  - H2: 1.875rem (30px), semibold - Section headers
  - H3: 1.5rem (24px), medium - Product names, card titles
- **Body Text:**
  - Large: 1.125rem (18px), regular - Primary content
  - Base: 1rem (16px), regular - Form labels, descriptions
  - Small: 0.875rem (14px), regular - Metadata, dates, helper text
- **UI Elements:**
  - Buttons: 0.9375rem (15px), medium
  - Labels/Badges: 0.75rem (12px), semibold, uppercase tracking

---

## Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 8, 12, 16** (e.g., p-4, gap-8, mt-12)
- Component spacing: 4-8 units
- Section spacing: 12-16 units
- Container max-width: `max-w-7xl` for main content, `max-w-2xl` for forms

**Grid System:**
- Product Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-6`
- Dashboard Stats: `grid-cols-2 md:grid-cols-4` with `gap-4`
- Form layouts: Single column `max-w-2xl` for optimal readability

---

## Core Components

### 1. Navigation & Header
- **Top Navigation Bar:** Fixed header with logo (left), main nav links (center), user profile/notifications (right)
- **Breadcrumbs:** On product detail pages for easy navigation back to dashboard
- **Mobile:** Hamburger menu with slide-out drawer

### 2. Dashboard View
- **Stats Cards Row:** 4-column grid displaying:
  - Total Products Registered
  - Active Warranties
  - Expiring Soon (< 90 days)
  - Expired Warranties
  - Each card: Icon, number (large), label (small)
- **Product Grid/List Toggle:** Switch between card view and compact list view
- **Filters/Search:** Sticky toolbar with search bar, brand filter dropdown, warranty status filter (chips), sort options

### 3. Product Cards
- **Card Structure:**
  - Product image (4:3 ratio) with fallback icon for no image
  - Brand logo badge (top-left overlay)
  - Warranty status indicator (top-right): Green dot (valid), Yellow (< 90 days), Red (expired)
  - Product name (H3)
  - Model/Serial number (small, muted)
  - Purchase date + Days remaining badge
  - Star rating (5-star display, read-only)
  - Quick actions: View Details, Report Issue buttons
- **Hover State:** Subtle lift (shadow increase), smooth transition

### 4. Product Registration Form
- **Multi-Step Form:**
  - Step 1: Brand selection (searchable dropdown with logos)
  - Step 2: Product details (model, category, serial/IMEI, purchase date)
  - Step 3: Receipt upload (drag-drop zone with image preview)
  - Step 4: Photos upload (multiple images, grid preview)
- **Progress Indicator:** Horizontal step tracker at top
- **Field Groups:** Clear visual separation with background tint
- **Validation:** Inline error messages, success states

### 5. Product Detail Page
- **Hero Section:** 
  - Large product image carousel (uploaded photos)
  - Warranty status card (prominent, right column)
    - Days remaining / Expired indicator
    - Purchase date
    - Warranty expiration date
    - Visual progress bar
- **Tabs Navigation:** Details, Receipt, Support History, Reviews
- **Action Buttons:** 
  - Primary: "Report Issue" (large, prominent)
  - Secondary: Edit Product, Download Receipt
  - Tertiary: Delete Product

### 6. Warranty Claim Interface
- **Issue Description Form:**
  - Textarea for problem description (character count)
  - Category selection (dropdown: malfunction, defect, damage, other)
  - Severity selector (radio buttons with icons)
- **Email Preview Card:**
  - Shows generated email content
  - Attached receipt thumbnail with filename
  - Manufacturer contact info display
  - Editable subject line
- **Send Button:** Large, clear CTA with confirmation modal

### 7. Rating & Review System
- **Star Rating Input:** Large, tappable stars with hover preview
- **Review Form:** 
  - Title field
  - Detailed review textarea
  - Pros/Cons lists (optional bullet points)
  - Recommend toggle (Yes/No)
- **Review Display Cards:**
  - User avatar (anonymous if desired)
  - Star rating
  - Date posted
  - Verified purchase badge
  - Helpful votes counter

### 8. Brand Database View
- **Brand Cards Grid:** Logo, name, product count, support info
- **Contact Details Modal:** Email, phone, website, support hours
- **Search & Filter:** Alphabetical, by product category

---

## UI Elements

### Badges & Status Indicators
- **Warranty Status:** Rounded pills with dot indicator
  - Valid: Green background, white text
  - Expiring: Yellow/amber, dark text
  - Expired: Red, white text
- **Category Badges:** Subtle gray background, dark text

### Buttons
- **Primary:** Solid fill, medium rounded corners (rounded-lg)
- **Secondary:** Outlined with 1px border
- **Icon Buttons:** Square or circular, 40px touch target
- **Floating Action Button:** Bottom-right corner for "Add Product" (mobile only)

### Form Inputs
- **Text Fields:** 
  - Border: 1px solid neutral
  - Focus: 2px border, subtle shadow
  - Height: 44px for touch-friendly interaction
- **Dropdowns:** Native select styling with custom arrow icon
- **Date Picker:** Calendar popup with month/year navigation
- **File Upload:** 
  - Drag-drop zone: Dashed border, centered icon + text
  - Preview thumbnails with remove button

### Data Display
- **Tables:** (for list view)
  - Alternating row backgrounds
  - Sortable column headers
  - Sticky header on scroll
- **Empty States:** 
  - Centered icon + message
  - Primary CTA button
  - Helpful guidance text

---

## Animations

**Minimal, Purposeful Only:**
- Card hover: transform scale(1.02) with shadow increase (200ms ease)
- Modal enter/exit: Fade + scale animation (300ms)
- Tab switching: Subtle crossfade (200ms)
- Status badge changes: Smooth color transition (150ms)
- **No:** Scroll-triggered animations, complex keyframes, decorative motion

---

## Images

### Hero/Dashboard
- **No traditional hero image** - utility app starts with dashboard
- **Product Placeholder:** Neutral icon on light background for products without photos
- **Brand Logos:** 
  - Positioned in product cards (top-left badge, 48x48px)
  - Database view (96x96px centered in card)

### Product Images
- **Aspect Ratio:** 4:3 for product photos
- **Upload Guidelines:** Minimum 800x600px, max 5MB per image
- **Gallery:** Lightbox modal for full-size viewing

### Receipt Images
- **Display:** Full-width preview with zoom capability
- **Thumbnail:** 120x160px in product card
- **Storage:** Optimized JPEG/PNG, linked to product record

---

## Accessibility Notes
- Maintain WCAG AA contrast ratios throughout
- All interactive elements: Minimum 44x44px touch targets
- Form inputs: Clear labels, error announcements, focus indicators
- Status indicators: Use icons + text, not color alone
- Keyboard navigation: Full support for all workflows