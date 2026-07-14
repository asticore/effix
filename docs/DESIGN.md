# EFFIX Framework Design Specification

**Project:** Effix (Effects Framework)
**Version:** v1.0
**Date:** 2026-07-14
**Purpose:** Open-source CSS effects framework with class-based application, like Bootstrap but for animations and interactive effects.

---

## Overview

Effix is a modular, lightweight effects framework that allows developers to apply powerful animations, transitions, and interactive effects to any HTML element using simple CSS classes. Users include one CSS file and one JS file, then apply classes to elements—no configuration required.

**Core Philosophy:**
- Intuitive class-based API (like Bootstrap)
- Minimal setup (1 CSS + 1 JS)
- Customizable via CSS variables and data attributes
- Modern browser support (no IE11)
- Modular—users load only what they need

---

## 1. Project Structure

```
effix/
├── src/
│   ├── css/
│   │   ├── base.css              (CSS variables, resets, defaults)
│   │   ├── effects/
│   │   │   ├── basic.css         (fades, bounces, slides, pops, rotations, scales, flips)
│   │   │   ├── interactive.css   (border animations, underlines, micro-interactions)
│   │   │   ├── text.css          (text reveals, glitch, wave, kinetic effects)
│   │   │   ├── scroll.css        (scroll reveals, parallax, sticky reveals)
│   │   │   └── shapes.css        (shape dividers with presets)
│   │   └── index.css             (imports all effects, bundled for production)
│   ├── js/
│   │   ├── core.js               (event detection, IntersectionObserver, DOM initialization)
│   │   ├── modules/
│   │   │   ├── scroll.js         (scroll-triggered animations, reveal stagger logic)
│   │   │   ├── click.js          (click event handling and effect application)
│   │   │   └── shapes.js         (shape divider SVG generation and customization)
│   │   └── index.js              (initializes all modules, bundled for production)
│   ├── templates/
│   │   └── demo.html             (interactive template/playground for testing effects)
│   └── docs/
│       ├── EFFECTS.md            (complete effects reference, class names, examples)
│       ├── SHAPES.md             (shape dividers guide, all presets, customization)
│       ├── CUSTOMIZATION.md      (CSS variables, data attributes, advanced customization)
│       ├── TRIGGERS.md           (trigger types, usage, browser support)
│       └── QUICK-START.md        (5-minute setup guide)
├── dist/
│   ├── effix.min.css             (production-ready bundled CSS)
│   └── effix.min.js              (production-ready bundled JS with all modules)
├── demo/                          (example implementations for each effect category)
│   ├── basic-effects.html
│   ├── interactive-buttons.html
│   ├── text-animations.html
│   ├── scroll-reveals.html
│   └── shape-dividers.html
├── README.md                      (project overview, quick start, features)
├── CONTRIBUTING.md               (development guidelines, how to add effects)
├── LICENSE                        (MIT)
├── package.json                  (npm metadata)
└── .gitignore

```

---

## 2. Class Naming Convention (Hybrid Model)

**Pattern:**
```
efx-[animation] efx-[trigger]
efx-[child-animation] (when inside a container)
```

**Example Structure:**
```html
<!-- Container with effect + trigger -->
<section class="efx-reveal efx-scroll" data-stagger="0.1s">
  <!-- Children inherit stagger, each with own animation -->
  <h1 class="efx-pop">Title</h1>
  <p class="efx-fade-in">Paragraph</p>
  <img class="efx-slide-up" src="..." />
</section>

<!-- Standalone effect + trigger -->
<button class="efx-bounce-in efx-hover">Click me</button>

<!-- Shape divider -->
<div class="efx-divider" data-shape="wave" data-animate="true"></div>
```

**Rationale:**
- Separation of concerns (effect + trigger are distinct)
- Chainable (multiple triggers possible in future)
- Intuitive for developers familiar with Bootstrap/Tailwind

---

## 3. Effect Categories & Animations (v1)

### 3.1 Basic Animations (CSS-Only, No JS Required)

**Fades:**
- `efx-fade-in` — fade from 0 to 1 opacity
- `efx-fade-out` — fade from 1 to 0 opacity
- `efx-fade-in-up` — fade in while sliding up
- `efx-fade-in-down` — fade in while sliding down

**Bounces:**
- `efx-bounce` — elastic bounce effect
- `efx-bounce-in` — bounces in from scaled-down
- `efx-bounce-out` — bounces out to scaled-up
- `efx-bounce-up` — bounces upward
- `efx-bounce-down` — bounces downward

**Slides:**
- `efx-slide-up` — slides in from bottom
- `efx-slide-down` — slides in from top
- `efx-slide-left` — slides in from right
- `efx-slide-right` — slides in from left

**Pops:**
- `efx-pop` — quick scale + opacity pop
- `efx-pop-in` — pops in from smaller scale
- `efx-pop-elastic` — elastic pop with overshoot

**Rotations:**
- `efx-rotate` — rotates 360°
- `efx-rotate-in` — rotates in from 0° to natural
- `efx-spin` — continuous spin
- `efx-spin-reverse` — spin counterclockwise

**Scales:**
- `efx-scale-up` — grows from 0.5 to 1
- `efx-scale-down` — shrinks from 1.5 to 1
- `efx-zoom-in` — zoom in effect (scale + blur)
- `efx-zoom-out` — zoom out effect

**Flips:**
- `efx-flip-x` — 3D flip on X axis
- `efx-flip-y` — 3D flip on Y axis
- `efx-flip-3d` — 3D flip (perspective-based)

---

### 3.2 Border & Interactive Animations (CSS + JS for advanced)

**Border Effects:**
- `efx-border-rotate` — border rotates around element (like Dribbble example)
- `efx-border-wipe` — border draws/wipes across edges
- `efx-border-gradient` — gradient animates around border
- `efx-border-pulse` — border expands/contracts

**Underline Effects:**
- `efx-underline-grow` — underline grows on hover
- `efx-underline-left` — underline fills from left
- `efx-underline-right` — underline fills from right
- `efx-underline-center` — underline fills from center

---

### 3.3 Text & Typography Animations

**Text Reveals:**
- `efx-text-reveal` — text reveals character by character
- `efx-text-slide` — text slides in character by character
- `efx-text-glitch` — glitch/corruption effect on text
- `efx-text-wave` — wave motion passes through text

---

### 3.4 Scroll-Triggered Effects (Requires JS)

**Scroll Container:**
- `efx-scroll-reveal` — container that reveals children on scroll with stagger
  - Children automatically stagger based on `data-stagger` value
  - Each child applies its own animation class (`efx-fade-in`, `efx-pop`, etc.)

**Parallax & Advanced:**
- `efx-parallax` — parallax depth effect (children move at different speeds)
- `efx-sticky-reveal` — reveals content as it becomes sticky
- `efx-progress-bar` — animated progress bar tied to scroll position

---

### 3.5 Shape Dividers (SVG-Based, CSS + JS)

**Container:**
```html
<div class="efx-divider" 
     data-shape="wave"
     data-height="120"
     data-color="#FF6B6B"
     data-animate="true">
</div>
```

**Available Shapes:**
`wave`, `triangle`, `curve`, `zigzag`, `sawtooth`, `chevron`, `swoosh`, `leaves`, `hills`, `clouds`, `custom-svg`

---

## 4. Triggers (When Effects Occur)

### 4.1 Trigger Types

| Trigger | Type | Browser Support | Use Case |
|---------|------|-----------------|----------|
| `efx-hover` | CSS | All | Hover state changes, button effects |
| `efx-click` | JS | All | Click-triggered animations, toggles |
| `efx-scroll` | JS (IntersectionObserver) | Modern | On-scroll reveals, lazy animation |
| `efx-load` | JS | All | Page load animations, entry effects |
| `efx-focus` | CSS | All | Form element focus states |
| `efx-active` | CSS | All | Button/link active/pressed states |

### 4.2 Trigger Examples

```html
<!-- Hover (CSS only) -->
<button class="efx-bounce efx-hover">Hover me</button>

<!-- Click (JS) -->
<div class="efx-pop efx-click">Click me</div>

<!-- Scroll (JS) -->
<section class="efx-fade-in efx-scroll">Content reveals on scroll</section>

<!-- Load (JS) -->
<div class="efx-slide-up efx-load">Animates on page load</div>

<!-- Focus (CSS, form elements) -->
<input class="efx-scale-up efx-focus" type="text" />

<!-- Active (CSS, buttons) -->
<button class="efx-scale-down efx-active">Active state</button>
```

---

## 5. Customization System

### 5.1 CSS Variables (Global Defaults)

```css
:root {
  /* Core animation properties */
  --efx-duration: 0.6s;
  --efx-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
  --efx-delay: 0s;
  
  /* Stagger for scroll reveals */
  --efx-stagger: 0.1s;
  
  /* Accessibility: respects prefers-reduced-motion */
  --efx-reduced-motion: false;
  
  /* Shape divider defaults */
  --efx-divider-height: 100px;
  --efx-divider-color: currentColor;
}
```

### 5.2 Data Attributes (Per-Element Overrides)

```html
<!-- Override duration and easing on single element -->
<div class="efx-fade-in efx-scroll" 
     data-duration="1.2s" 
     data-easing="ease-in-out"
     data-delay="0.5s">
  Content
</div>

<!-- Scroll reveal with custom stagger -->
<section class="efx-scroll-reveal" data-stagger="0.2s">
  <div class="efx-pop">First</div>
  <div class="efx-pop">Second (delayed 0.2s)</div>
  <div class="efx-pop">Third (delayed 0.4s)</div>
</section>
```

### 5.3 Shape Divider Customization

```html
<!-- Full customization example -->
<div class="efx-divider" 
     data-shape="wave"
     data-style="smooth"
     data-height="120"
     data-width="100%"
     data-color="#FF6B6B"
     data-colors="#FF6B6B|#4ECDC4|#45B7D1"
     data-gradient-angle="90deg"
     data-flip="false"
     data-position="top"
     data-animate="true"
     data-animation-speed="3s"
     data-mobile-visible="true">
</div>
```

**Shape Divider Attributes:**
- `data-shape` — shape type (`wave`, `triangle`, `curve`, `zigzag`, `sawtooth`, `chevron`, `swoosh`, `leaves`, `hills`, `clouds`, `custom-svg`)
- `data-style` — style variant (`smooth`, `jagged`, `organic`, `geometric`)
- `data-height` — vertical height in px or %
- `data-width` — horizontal width control (px or %)
- `data-color` — single fill color (hex, rgb, hsl)
- `data-colors` — gradient stops separated by `|` (e.g., `#FF6B6B|#4ECDC4|#45B7D1`)
- `data-gradient-angle` — gradient direction (0-360deg or predefined: `to-right`, `to-bottom`, etc.)
- `data-flip` — flip shape horizontally (`true` or `false`)
- `data-position` — placement (`top`, `bottom`, `left`, `right`)
- `data-animate` — enable continuous animation (`true` or `false`)
- `data-animation-speed` — duration for animation loop (`0.5s` to `5s`)
- `data-mobile-visible` — show/hide on mobile (`true` or `false`)

---

## 6. Interactive Template/Demo Page

**File:** `src/templates/demo.html`

A single, interactive HTML page that:
1. **Shows all effect types** with live examples
2. **Allows users to test** by applying classes and data attributes
3. **Displays class names and variable names** next to each effect
4. **Includes copy-paste snippets** for each effect
5. **Shows customization examples** with data attributes in action
6. **Demonstrates combining effects** (multiple classes on one element)
7. **Includes responsive breakpoint examples** (efx classes on different screens)
8. **Links to full documentation** for deep dives

**Template Structure:**
- Header with quick start
- Section for each effect category
- For each effect: live demo + code snippet + customization options
- Sidebar with CSS variable override examples
- Shape divider playground (live color/shape/height picker)
- Scroll reveal showcase
- Copy-to-clipboard buttons for all code examples

---

## 7. User-Facing Initialization

**Users only need:**

```html
<!-- One CSS file -->
<link rel="stylesheet" href="path/to/effix/effix.min.css">

<!-- One JS file -->
<script src="path/to/effix/effix.min.js"></script>
```

**That's it.** Behind the scenes:
- All effect CSS is bundled into `effix.min.css`
- All JS modules (scroll, click, shapes) are bundled into `effix.min.js`
- JS auto-initializes on page load (no `new Effix()` needed)

---

## 8. File Delivery

### 8.1 NPM Package

```bash
npm install effix
```

Includes:
- `dist/effix.min.css`
- `dist/effix.min.js`
- `dist/effix.min.css.map` and `.js.map` (sourcemaps)
- Full source in `src/` for customization

### 8.2 CDN (Optional, Phase 2)

```html
<link rel="stylesheet" href="https://cdn.effix.js/v1/effix.min.css">
<script src="https://cdn.effix.js/v1/effix.min.js"></script>
```

### 8.3 GitHub Release

Raw files and minified bundles available for direct download.

---

## 9. Documentation Files

| File | Purpose |
|------|---------|
| `QUICK-START.md` | 5-minute setup, first effect example |
| `EFFECTS.md` | Complete reference of all effects with examples |
| `SHAPES.md` | Shape divider guide, all presets, customization |
| `CUSTOMIZATION.md` | CSS variables, data attributes, advanced config |
| `TRIGGERS.md` | Trigger types, compatibility, use cases |
| `demo.html` | Interactive playground (see section 6) |

---

## 10. Browser Support & Dependencies

**Modern Browsers Only:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

**No External Dependencies:**
- Pure CSS (no SASS/LESS needed, but CSS variables required)
- Vanilla JS (no jQuery, React, etc. required)
- Uses native IntersectionObserver API (modern browsers only)

**Accessibility:**
- Respects `prefers-reduced-motion` media query
- Semantic HTML with ARIA where needed
- Keyboard-navigable examples

---

## 11. Build & Deployment

**Build Tools:**
- PostCSS for CSS optimization
- Webpack/esbuild for JS bundling
- Minification and sourcemaps for production

**Version Control:**
- Git repository on GitHub
- Semantic versioning (v1.0.0, v1.1.0, etc.)
- CHANGELOG.md for release notes

---

## 12. Scope & Constraints

**In Scope (v1):**
- All effects listed in section 3
- All triggers listed in section 4
- CSS variables + data attribute customization
- Shape dividers with full customization
- Interactive demo template
- Full documentation
- NPM package distribution

**Out of Scope (Future Versions):**
- 3D WebGL effects (phase 2)
- Drag/drop animations (phase 2)
- CDN hosting (phase 2)
- Framework integrations (React, Vue, Svelte components)
- Motion path animations (`offset-path`)

---

## 13. Success Criteria

✅ Users can apply one CSS and one JS file and use effects immediately
✅ Class naming is intuitive (like Bootstrap)
✅ Customization via CSS variables and data attributes works as expected
✅ Scroll reveals with stagger work smoothly
✅ Shape dividers render and animate without flicker
✅ Demo page is interactive and educational
✅ Documentation is clear and examples are copy-paste ready
✅ Bundle size is < 50KB gzipped (CSS + JS combined)
✅ Performance: animations run at 60fps on modern hardware

---

## 14. Next Steps

1. ✅ Design approved (this document)
2. ⏳ Implementation plan created (writing-plans skill)
3. ⏳ Code scaffolding and file structure
4. ⏳ Build pipeline setup (PostCSS, bundling)
5. ⏳ Effect implementations (CSS + JS)
6. ⏳ Demo page creation
7. ⏳ Documentation writing
8. ⏳ Testing and optimization
9. ⏳ GitHub repo creation and initial release

---

**Design Approved By:** [To be filled]
**Design Date:** 2026-07-14
**Last Updated:** 2026-07-14
