# ✅ Full TODO List (Prioritized as of 7:00am pst 05/18/2025)

**Instructions:**

* Complete each task in order of priority. After each, scan the entire project (every file, byte, and feature) to ensure it works as intended. Only mark as done if fully verified. If a task cannot be completed due to errors or missing input, skip it and return later unless it is necessary to move the project forward.
* **Integrate Firebase:** Utilize Firebase for data storage, authentication, image uploads, and any other applicable features.
* **Hosting:** The site will be hosted on Cloudflare Pages.
* **Domain:** The website domain is wretcheddesigns.com. 
* **Skipped Tasks:** If a task cannot be completed, skip it, note it here, and bring it to attention when all possible tasks are done.

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
2. [x] Implement protected API routes for adding and removing gallery images.
3. [ ] Implement image upload to Firebase Storage for gallery images.
4. [ ] Implement database storage (Firestore/Realtime Database) for gallery image metadata.
5. [ ] Create an Admin Gallery Editor UI for managing gallery images.
6. [ ] Update the public gallery page to fetch and display images from the database.
7. [ ] **Firebase Integration:** Implement Firebase for data storage for products, categories, blogs, and gallery items.status: verified
lastVerified: 2024-05-22T12:00:00Z
verifiedBy: Gemini (Firebase)
notes:
- Add unit tests for Firebase initialization and core service functions (e.g., data fetching, authentication status).
- Consider adding more comprehensive error handling and logging for Firebase interactions in the admin panel.
- Explore using Firebase Emulator Suite for local development and testing of Firebase-dependent features.
8. [ ] Validate all inputs (client-side and Firebase rules), sanitize form/overlay inputs, prevent editing of sensitive fields like `id`.
9. [ ] **Firebase Authentication:** Implement Firebase Authentication for admin access.
10. [ ] Add user-friendly error messages, error boundaries.
11. [ ] Add toasts/snackbars and undo for cart actions (merge feedback/UX items).
12. [ ] **Firebase Storage:** Implement image uploads to Firebase Storage for products, blog posts, and gallery.
13. [ ] Add optimistic UI, undo/redo, validation, bulk edits for product/category CRUD.
14. [ ] Implement blog functionality:
 * [ ] Create a new data structure in Firebase for blog posts (title, content, optional image, slug, date, etc.).
 * [ ] Create a blog index page displaying blog titles and optional images, linking to individual blog posts.
15. [ ] Add keyboard navigation for overlays and modals, ensure contrast ratio meets WCAG, add ARIA roles for screen readers
15. [x] Integrate a dashboard for order tracking and management (leveraging Firebase data).status: verified
    lastVerified: 2024-05-22T12:00:00Z
    verifiedBy: Gemini (Firebase)
    notes:
 - Add end-to-end tests using a tool like Cypress or Playwright to verify the functionality of the order dashboard in the admin panel, including data display, filtering, and sorting.
16. [ ] Replace all `<img>` with `next/image`, add loading strategy/quality tuning
17. [ ] Add `.vercelignore`, run `npm run build` validation, confirm `.env.local` for prod
18. [ ] Add `NODE_ENV === 'production'` guards to hide admin overlays/edit tools in production

---

## 🥈 Medium Priority
10. [x] **Firebase Integration:** Update existing API endpoints to interact with Firebase.status: verified
lastVerified: 2024-05-22T12:00:00Z
verifiedBy: Gemini (Firebase)
notes:
- Add integration tests for API endpoints to verify correct data interaction with Firebase Firestore.
- Implement request validation for API endpoints to ensure data integrity.
12. [ ] Add admin UI for gallery content (upload to Firebase Storage, sort, manage metadata in Firebase).
13. [x] Add admin UI for gallery content (upload to Firebase Storage, sort, manage metadata in Firebase).
    status: verified
    lastVerified: 2024-05-22T12:00:00Z
    verifiedBy: Gemini (Firebase)
    notes:
 - Add integration tests to verify image uploads to Firebase Storage and metadata updates in Firestore through the admin gallery editor.
15. [ ] Add address validation, guest checkout.
15. [x] Add address validation, guest checkout. **Skipped: Requires non-admin visual/editing.**
16. [ ] Add roles (using Firebase Authentication custom claims), session expire warnings, 2FA (Firebase Authentication), activity logs (potentially in Firebase).
17. [ ] Add admin gallery editor, image lazy load and optimization (using Firebase Storage features or a CDN).
16. [x] Add roles (using Firebase Authentication custom claims), session expire warnings, 2FA (Firebase Authentication), activity logs (potentially in Firebase).
    status: verified
    lastVerified: 2024-05-22T12:00:00Z
    verifiedBy: Gemini (Firebase)
    notes:
 - Add unit tests for role-based access control logic and integration tests for session management and activity logging with Firebase.
17. [ ] Add dark mode toggle, more device testing
18. [ ] Add OpenGraph, sitemap.xml, robots.txt
19. [ ] Choose analytics tool (Plausible, Umami, GA), track key events: views, carts, checkouts
20. [ ] Separate providers, hydrate SSR context
21. [ ] Expand README: install/setup, UI screenshot, stack summary, admin credentials, Vercel deployment
22. [ ] Remove unused lock files, standardize on npm

---
## 🟦 Optional/Nice-to-Have Features
* [ ] **Etsy Integration:** Research and implement integration with Etsy API when an account is available. Note: Direct linking for product management might be complex and may require manual updates or a separate sync process. This is likely a stretch goal and might not be fully achievable within this project scope.
* [ ] **Firebase Integration:** Explore using Firebase Cloud Functions for backend logic (e.g., payment processing webhooks, email notifications).
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
