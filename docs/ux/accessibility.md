# Accessibility & Mobile Responsiveness Guide

This document outlines best practices and standards to ensure the public portal is fully responsive and meets WCAG 2.1 AA accessibility criteria.

## 1. Mobile-First Design

- Use Tailwind's mobile-first breakpoints:
  - `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
  - Example: `<div class="p-4 sm:p-6 md:p-8 lg:p-10">` to adjust padding at each breakpoint.
- Fluid layouts:
  - Employ `%` or `minmax()` in CSS Grid/Flexbox to adapt content width.
  - Avoid fixed pixel widths on key containers.

## 2. WCAG 2.1 AA Checklist

1. **Color Contrast**: Text and interactive elements must have at least 4.5:1 contrast ratio.
2. **Keyboard Navigation**: All functionality accessible via keyboard (Tab, Shift+Tab, Enter, Space).
3. **Focus Indicators**: Visible outline or styling on focus for links, buttons, and form fields.
4. **Semantic HTML**: Use `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` appropriately.
5. **Form Labels**: Associate `<label>` with each form control via `for`/`id`.
6. **Alt Text**: Provide meaningful `alt` attributes for all images.
7. **ARIA**: Use `role=`, `aria-label=`, `aria-describedby=` to enhance semantic meaning.

## 3. ARIA & Semantic Roles

- **Landmarks**: `<nav role="navigation">`, `<aside role="complementary">`.
- **Alerts & Live Regions**: `<div role="alert">` for error/success messages.
- **Buttons/Links**: Use `<button>` for actions; if using `<a>`, ensure `href` is valid.

## 4. Automated Audits

### Axe-Core Integration with Playwright

1. Install:
   ```bash
   npm install --save-dev @axe-core/playwright
   ```
2. Example test (`tests/accessibility.spec.ts`):
   ```ts
   import { test } from '@playwright/test';
   import { injectAxe, checkA11y } from '@axe-core/playwright';
   
   test('home page should have no accessibility issues', async ({ page }) => {
     await page.goto('/');
     await injectAxe(page);
     await checkA11y(page, null, {
       detailedReport: true,
       detailedReportOptions: { html: true }
     });
   });
   ```
3. **CI Integration**: Add to `.github/workflows/accessibility.yml` to fail builds on violations.

## 5. Continuous Monitoring

- Schedule monthly accessibility sweeps via CI.
- Record issues in your backlog and track remediation.
- Engage users with disabilities for manual testing and feedback.

---
_For questions or to propose updates, please raise an issue in `docs/ux/`._ 