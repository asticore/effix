# EFFIX Implementation Prompt for Agentic Workers

Use this prompt when delegating implementation to another Claude instance.

---

## Brief Project Summary

**Project:** EFFIX v1.0 - CSS Effects Framework
**Language:** CSS3, Vanilla JavaScript (ES6+)
**Scope:** Build an open-source, Bootstrap-like effects framework with class-based animations

**What EFFIX does:**
- Users include 1 CSS + 1 JS file
- Apply classes like `efx-fade-in efx-scroll` to elements
- Effects trigger on hover, click, scroll, load
- Full customization via CSS variables and data attributes
- Includes animated SVG shape dividers

---

## Your Task

Implement the complete EFFIX framework following the detailed step-by-step plan in `docs/PLAN.md`.

**Do NOT deviate from the plan.** The plan includes:
- Exact file paths (use them verbatim)
- Complete code for each task (copy/paste, don't rewrite)
- Expected outputs and verification commands
- Commit messages

**Your workflow:**
1. Read the current task in the plan
2. Execute each step exactly as written
3. Run verification commands
4. Commit with provided message
5. Move to next task

---

## Key Constraints (Do Not Ignore)

### File Locations (Absolute, Windows Paths)
- Project root: `C:\Users\matth\Claude\Projects\effix\`
- Source files: `C:\Users\matth\Claude\Projects\effix\src\`
- Distribution: `C:\Users\matth\Claude\Projects\effix\dist\`
- Documentation: `C:\Users\matth\Claude\Projects\effix\docs\`

### Tech Requirements
- **CSS:** No preprocessors, pure CSS3 with custom properties
- **JavaScript:** Vanilla ES6+, no frameworks (React, Vue, etc.)
- **Bundle Size Goal:** < 50KB gzipped (CSS + JS combined)
- **Browser Support:** Modern only (Chrome 90+, Firefox 88+, Safari 14+, no IE11)
- **Dependencies:** ZERO external dependencies

### Code Standards
- 2-space indentation
- Clear, concise variable names
- Comment complex logic
- DRY principle (don't repeat code)
- Modular design (one responsibility per file)

---

## Architecture Overview

### CSS Structure
```
src/css/
├── base.css              (variables, defaults, resets)
├── effects/
│   ├── basic.css        (fades, bounces, slides, pops, rotations, scales, flips)
│   ├── interactive.css  (borders, underlines)
│   ├── text.css         (text animations)
│   ├── scroll.css       (scroll reveals)
│   └── shapes.css       (shape dividers)
└── index.css            (imports all)
```

All effects use CSS custom properties for:
- `--efx-duration` (default 0.6s)
- `--efx-easing` (default cubic-bezier(0.34, 1.56, 0.64, 1))
- `--efx-delay` (default 0s)
- `--efx-stagger` (default 0.1s for scroll reveals)

### JavaScript Structure
```
src/js/
├── core.js              (Effix class, initialization, event listeners)
├── modules/
│   ├── scroll.js       (scroll detection, parallax, progress bar)
│   ├── click.js        (click handling)
│   └── shapes.js       (SVG generation for shape dividers)
└── index.js            (bundles all modules, global init)
```

**Key Pattern:**
- IntersectionObserver for scroll triggers
- Data attributes for per-element customization
- Auto-initialization on page load (no user setup)

### Class Naming Convention
```
efx-[animation] efx-[trigger]
  ↓                 ↓
effect class    trigger class
  (required)       (required)
```

Examples:
- `efx-fade-in efx-hover` → fade in on hover
- `efx-bounce-in efx-scroll` → bounce in when scrolled into view
- `efx-border-rotate` → rotating border (CSS-only, no trigger needed)

---

## Effects Reference (Simplified)

### Basic Animations (CSS-only)
- Fades: fade-in, fade-out, fade-in-up, fade-in-down
- Bounces: bounce, bounce-in, bounce-out, bounce-up, bounce-down
- Slides: slide-up, slide-down, slide-left, slide-right
- Pops: pop, pop-in, pop-elastic
- Rotations: rotate, rotate-in, spin, spin-reverse
- Scales: scale-up, scale-down, zoom-in, zoom-out
- Flips: flip-x, flip-y, flip-3d

### Interactive (CSS-only)
- Borders: border-rotate, border-wipe, border-gradient, border-pulse
- Underlines: underline-grow, underline-left, underline-right, underline-center

### Text Effects
- text-reveal, text-slide, text-glitch, text-wave

### Scroll Effects (JS-triggered)
- scroll-reveal (container with staggered children)
- parallax, sticky-reveal, progress-bar

### Shape Dividers (SVG + JS)
- Shapes: wave, triangle, curve, zigzag, sawtooth, chevron, swoosh, leaves, hills, clouds
- Customizable: height, color, flip, position, animation, mobile-visibility

---

## Critical Implementation Notes

### CSS Variables in All Effects
Every animation class must use CSS custom properties:
```css
.efx-fade-in {
  animation: efx-fade-in var(--efx-duration, 0.6s) 
             var(--efx-easing, cubic-bezier(...))
             var(--efx-delay, 0s) 1 forwards;
}
```

**Why:** Allows users to override timing globally or per-element

### Data Attribute Processing in JS
The core.js must check for data attributes and apply them:
```javascript
applyCustomTiming(element) {
  if (element.dataset.duration) {
    element.style.setProperty('--efx-duration', element.dataset.duration);
  }
  // Same for easing, delay, stagger
}
```

### Scroll Reveal Pattern
The `.efx-scroll-reveal` container with children should:
1. Add `.efx-visible` class to children as they enter viewport
2. Stagger delay by `data-stagger` value (default 0.1s)
3. Each child uses its own animation class (e.g., `efx-fade-in`, `efx-pop-in`)

### Shape Dividers
Generate SVG dynamically based on data attributes:
- Shape SVG path generated in ShapesModule
- Colors applied via `data-color` or `data-colors` (for gradients)
- Height controlled by `data-height`
- Animation handled in CSS with `data-animate` and `data-animation-speed`

---

## Build & Testing

### Commands You'll Use
```bash
npm install              # Install dependencies (just webpack, postcss, etc.)
npm run build            # Build production files
npm run build:css        # Build CSS only
npm run build:js         # Build JS only
npm test                 # Run tests (if added)
git add <files>
git commit -m "<message>"
```

### Verification
After each task:
1. Run build: `npm run build`
2. Check dist files exist and are minified
3. Verify bundle size: `du -h dist/*`
4. Commit with exact message from plan

---

## Files You'll Create/Modify

### CSS Files (Task 2-7)
- `src/css/base.css`
- `src/css/effects/basic.css`
- `src/css/effects/interactive.css`
- `src/css/effects/text.css`
- `src/css/effects/scroll.css`
- `src/css/effects/shapes.css`
- `src/css/index.css` (imports all)

### JavaScript Files (Task 8-12)
- `src/js/core.js`
- `src/js/modules/scroll.js`
- `src/js/modules/click.js`
- `src/js/modules/shapes.js`
- `src/js/index.js` (bundles all)

### Config Files (Task 1)
- `package.json`
- `webpack.config.js`
- `postcss.config.js`

### Documentation (Task 14-17)
- `src/templates/demo.html`
- `docs/QUICK-START.md`
- `docs/EFFECTS.md`
- `docs/SHAPES.md`
- `docs/CUSTOMIZATION.md`
- `docs/TRIGGERS.md`
- `README.md`
- `CONTRIBUTING.md`
- `LICENSE`

---

## Success Criteria

When implementation is complete:
✅ `dist/effix.min.css` exists and is minified
✅ `dist/effix.min.js` exists and is minified
✅ Combined size < 50KB gzipped
✅ All effects work with CSS variables and data attributes
✅ Scroll reveals stagger children correctly
✅ Shape dividers render and customize as specified
✅ Interactive demo (`demo/index.html`) shows all effects
✅ Documentation is complete and accurate
✅ Git history is clean with 18 focused commits
✅ No console errors or warnings

---

## What NOT To Do

❌ Don't modify the design spec or architecture without asking
❌ Don't add external dependencies
❌ Don't use CSS preprocessors (SASS, LESS, PostCSS beyond minification)
❌ Don't change file paths from the plan
❌ Don't combine tasks or skip steps
❌ Don't rewrite code from the plan—copy it as written
❌ Don't forget data attribute parsing in JS
❌ Don't forget CSS variable usage in all animation classes

---

## If You Get Stuck

1. **Check the plan first** — every step and error scenario is documented
2. **Verify file paths** — make sure you're using absolute Windows paths
3. **Run build command** — `npm run build` will catch syntax errors
4. **Check dist files** — verify .min.css and .min.js exist after build
5. **Review the design spec** — `docs/DESIGN.md` has the full architecture

---

## Execution Checklist

Before you start:
- [ ] Read `docs/DESIGN.md` (project architecture)
- [ ] Read `docs/PLAN.md` (step-by-step tasks)
- [ ] Understand file structure and absolute paths
- [ ] Verify you're in the correct directory: `C:\Users\matth\Claude\Projects\effix`
- [ ] Run `npm install` to set up build tools

Then:
- [ ] Complete Task 1 (setup) through Task 18 (final)
- [ ] Verify each task with provided commands
- [ ] Commit after each task with exact message
- [ ] When done, all 18 tasks should show green checkmarks ✓

---

**You're building a production-ready open-source library. Every detail matters.**

**Execute the plan step-by-step. Don't skip, don't improvise. Follow exactly.**

Good luck! 🚀
