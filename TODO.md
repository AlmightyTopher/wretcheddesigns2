# ✅ Full TODO List (Prioritized as of 7:00am pst 05/18/2025)

**Instructions:**

* Complete each task in order of priority. After each, scan the entire project (every file, byte, and feature) to ensure it works as intended. Only mark as done if fully verified. If a task cannot be completed due to errors or missing input, skip it and return later unless it is necessary to move the project forward.

---

## ✅ Project Capabilities (as of review)

* [x] Product/category CRUD via admin overlays
* [x] Admin authentication
* [x] Session & role-based access
* [x] Editable shop categories and products
* [x] Cart system
* [x] Checkout flow
* [x] API endpoints for products & categories
* [x] Gallery page
* [x] Responsive, modern UI
* [x] Unit/integration test setup
* [x] Custom admin overlays with 'Done' button
* [x] Basic error handling for forms
* [x] SEO meta tags
* [x] Provider pattern for session/cart
* [x] .env support for secrets/config
* [x] Next.js 15, App Router, TypeScript

---

## 🥇 High Priority
1. [ ] Real payment provider (Stripe, etc.) and order confirmation email/notification
2. [ ] Validate all API inputs (zod or custom), sanitize form/overlay inputs, prevent editing of sensitive fields like `id`
3. [ ] Add optimistic UI, undo/redo, validation, bulk edits for product/category CRUD
4. [ ] Add user-friendly API error messages, error boundaries
5. [ ] Add toasts/snackbars and undo for cart actions (merge feedback/UX items)
6. [ ] Add keyboard navigation for overlays and modals, ensure contrast ratio meets WCAG, add ARIA roles for screen readers
7. [ ] Replace all `<img>` with `next/image`, add loading strategy/quality tuning
8. [ ] Add `.vercelignore`, run `npm run build` validation, confirm `.env.local` for prod
9. [ ] Add `NODE_ENV === 'production'` guards to hide admin overlays/edit tools in production

---

## 🥈 Medium Priority
10. [ ] Integrate dashboard for order tracking and management
11. [ ] Add admin UI or script for gallery content (upload, sort, manage)
12. [ ] Add drag-and-drop, rich text, image cropping for shop categories/products
13. [ ] Add persistent cart, cart merge for users
14. [ ] Add address validation, guest checkout
15. [ ] Add roles, session expire warnings, 2FA, activity logs, reset admin password
16. [ ] Add admin gallery editor, image lazy load and optimization
17. [ ] Add dark mode toggle, more device testing
18. [ ] Add OpenGraph, sitemap.xml, robots.txt
19. [ ] Choose analytics tool (Plausible, Umami, GA), track key events: views, carts, checkouts
20. [ ] Separate providers, hydrate SSR context
21. [ ] Expand README: install/setup, UI screenshot, stack summary, admin credentials, Vercel deployment
22. [ ] Remove unused lock files, standardize on npm

---

## 🟦 Optional/Nice-to-Have Features
* [ ] User account system (for order history, etc.)
* [ ] Inventory management
* [ ] External admin UI/backend
* [ ] Add more analytics support
* [ ] Increase unit/integration test coverage, add E2E tests
* [ ] UX polish: keyboard shortcuts, animations
* [ ] Add bulk edit/delete for products/categories

---

## 🔁 Shop Item Availability Pattern

* Every product:

  * Toggle `available` in admin
  * Unavailable: grayscale, hover color, 'Unavailable' text, disabled cart
  * Price retained

Apply this to all current and future shop sections

---

## ✅ Code Review Suggestions

* [x] Use ARIA roles and keyboard nav (basic audit done)
* [x] Add unit/integration tests with Vitest

---

(Add more project-wide TODOs below as needed)
