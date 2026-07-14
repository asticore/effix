# EFFIX v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, open-source CSS effects framework with class-based animations, scroll reveals with stagger, shape dividers, and comprehensive documentation.

**Architecture:** Modular CSS organized by effect category (basic, interactive, text, scroll, shapes) bundled into a single production file. Lightweight vanilla JS core handles event detection (scroll via IntersectionObserver, click, page load) and applies animations. Users include one CSS + one JS file. All customization through CSS variables and data attributes.

**Tech Stack:** 
- CSS3 (animations, transitions, custom properties, clip-path for shapes)
- Vanilla JavaScript (ES6+, IntersectionObserver API)
- PostCSS for processing
- Webpack for JS bundling
- Node/npm for package management and build scripts

## Global Constraints

- Browser support: Modern browsers only (Chrome 90+, Firefox 88+, Safari 14+)
- No external dependencies (CSS or JS)
- Bundle size: < 50KB gzipped (CSS + JS combined)
- All effects configurable via CSS variables and data attributes
- Respects `prefers-reduced-motion` media query for accessibility
- Semantic HTML and ARIA where applicable
- All animation durations, easings, stagger delays customizable per-element

---

## Phase 1: Project Setup & Build Pipeline

### Task 1: Initialize Project Structure & Dependencies

**Files:**
- Create: `package.json`
- Create: `webpack.config.js`
- Create: `postcss.config.js`
- Create: `.gitignore`
- Create: Directory structure (src/css/effects, src/js/modules, dist, demo, etc.)

**Interfaces:**
- Produces: Build pipeline ready to process CSS and JS
- Consumes: None (first task)

- [ ] **Step 1: Initialize npm package**

Create `package.json`:
```json
{
  "name": "effix",
  "version": "1.0.0",
  "description": "CSS effects framework with class-based animations",
  "main": "dist/effix.min.js",
  "style": "dist/effix.min.css",
  "files": [
    "dist",
    "src",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack --mode development --watch",
    "test": "jest",
    "docs": "echo 'Documentation in /docs folder'"
  },
  "keywords": [
    "css",
    "animations",
    "effects",
    "bootstrap-like",
    "lightweight"
  ],
  "author": "Matt Peterman",
  "license": "MIT",
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.4",
    "postcss": "^8.4.31",
    "postcss-cli": "^10.1.0",
    "cssnano": "^6.0.1",
    "autoprefixer": "^10.4.16"
  }
}
```

- [ ] **Step 2: Create webpack.config.js**

```javascript
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/js/index.js',
  output: {
    filename: 'effix.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devtool: 'source-map'
};
```

- [ ] **Step 3: Create postcss.config.js**

```javascript
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')
  ]
};
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
*.log
.DS_Store
.env
```

- [ ] **Step 5: Create directory structure**

```bash
mkdir -p src/css/effects
mkdir -p src/js/modules
mkdir -p src/templates
mkdir -p src/docs
mkdir -p dist
mkdir -p demo
mkdir -p tests
```

- [ ] **Step 6: Commit**

```bash
git init
git add package.json webpack.config.js postcss.config.js .gitignore
git commit -m "chore: initialize project structure and build config"
```

---

## Phase 2: CSS Foundation & Effect Styles

### Task 2: Create Base CSS (Variables & Defaults)

**Files:**
- Create: `src/css/base.css`
- Create: `src/css/index.css` (main bundler)

**Interfaces:**
- Produces: CSS variables and default animations setup
- Consumes: None

- [ ] **Step 1: Create src/css/base.css**

```css
:root {
  /* Core animation properties */
  --efx-duration: 0.6s;
  --efx-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
  --efx-delay: 0s;
  
  /* Stagger for scroll reveals */
  --efx-stagger: 0.1s;
  
  /* Accessibility: respects prefers-reduced-motion */
  --efx-reduced-motion: prefers-reduced-motion;
  
  /* Shape divider defaults */
  --efx-divider-height: 100px;
  --efx-divider-color: currentColor;
  --efx-divider-animate-speed: 3s;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Default animation utilities */
.efx-no-motion {
  animation: none !important;
  transition: none !important;
}

/* Ensure transforms work on all elements */
.efx-fade-in,
.efx-fade-out,
.efx-bounce,
.efx-bounce-in,
.efx-bounce-out,
.efx-bounce-up,
.efx-bounce-down,
.efx-slide-up,
.efx-slide-down,
.efx-slide-left,
.efx-slide-right,
.efx-pop,
.efx-pop-in,
.efx-pop-elastic,
.efx-rotate,
.efx-rotate-in,
.efx-spin,
.efx-spin-reverse,
.efx-scale-up,
.efx-scale-down,
.efx-zoom-in,
.efx-zoom-out,
.efx-flip-x,
.efx-flip-y,
.efx-flip-3d {
  will-change: transform, opacity;
}

/* Shape divider base */
.efx-divider {
  position: relative;
  overflow: hidden;
}

.efx-divider svg {
  display: block;
  width: 100%;
  height: auto;
}
```

- [ ] **Step 2: Create src/css/index.css (main bundler)**

```css
/* Import all effect styles in order */
@import 'base.css';
@import 'effects/basic.css';
@import 'effects/interactive.css';
@import 'effects/text.css';
@import 'effects/scroll.css';
@import 'effects/shapes.css';
```

- [ ] **Step 3: Verify imports are correct**

Check that each @import file exists (will be created in subsequent tasks).

- [ ] **Step 4: Commit**

```bash
git add src/css/base.css src/css/index.css
git commit -m "feat: add base CSS variables and defaults"
```

---

### Task 3: Create Basic Effects CSS

**Files:**
- Create: `src/css/effects/basic.css`

**Interfaces:**
- Produces: CSS classes for fades, bounces, slides, pops, rotations, scales, flips
- Consumes: base.css variables

- [ ] **Step 1: Create src/css/effects/basic.css**

```css
/* ============================================================
   FADE EFFECTS
   ============================================================ */

@keyframes efx-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes efx-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes efx-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes efx-fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.efx-fade-in {
  animation: efx-fade-in var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-fade-out {
  animation: efx-fade-out var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-fade-in-up {
  animation: efx-fade-in-up var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-fade-in-down {
  animation: efx-fade-in-down var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

/* ============================================================
   BOUNCE EFFECTS
   ============================================================ */

@keyframes efx-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes efx-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes efx-bounce-out {
  0% {
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

@keyframes efx-bounce-up {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  60% {
    opacity: 1;
    transform: translateY(-10px);
  }
  80% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes efx-bounce-down {
  0% {
    opacity: 0;
    transform: translateY(-40px);
  }
  60% {
    opacity: 1;
    transform: translateY(10px);
  }
  80% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

.efx-bounce {
  animation: efx-bounce var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) infinite;
}

.efx-bounce-in {
  animation: efx-bounce-in var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-bounce-out {
  animation: efx-bounce-out var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-bounce-up {
  animation: efx-bounce-up var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-bounce-down {
  animation: efx-bounce-down var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

/* ============================================================
   SLIDE EFFECTS
   ============================================================ */

@keyframes efx-slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes efx-slide-down {
  from {
    opacity: 0;
    transform: translateY(-40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes efx-slide-left {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes efx-slide-right {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.efx-slide-up {
  animation: efx-slide-up var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-slide-down {
  animation: efx-slide-down var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-slide-left {
  animation: efx-slide-left var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-slide-right {
  animation: efx-slide-right var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

/* ============================================================
   POP EFFECTS
   ============================================================ */

@keyframes efx-pop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes efx-pop-in {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes efx-pop-elastic {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.efx-pop {
  animation: efx-pop var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) infinite;
}

.efx-pop-in {
  animation: efx-pop-in var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-pop-elastic {
  animation: efx-pop-elastic var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

/* ============================================================
   ROTATION EFFECTS
   ============================================================ */

@keyframes efx-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes efx-rotate-in {
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0);
  }
  to {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}

@keyframes efx-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes efx-spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.efx-rotate {
  animation: efx-rotate var(--efx-duration, 0.6s) linear var(--efx-delay, 0s) 1;
}

.efx-rotate-in {
  animation: efx-rotate-in var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-spin {
  animation: efx-spin var(--efx-duration, 2s) linear var(--efx-delay, 0s) infinite;
}

.efx-spin-reverse {
  animation: efx-spin-reverse var(--efx-duration, 2s) linear var(--efx-delay, 0s) infinite;
}

/* ============================================================
   SCALE EFFECTS
   ============================================================ */

@keyframes efx-scale-up {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes efx-scale-down {
  from {
    opacity: 0;
    transform: scale(1.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes efx-zoom-in {
  from {
    opacity: 0;
    transform: scale(0.8) blur(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) blur(0);
  }
}

@keyframes efx-zoom-out {
  from {
    opacity: 0;
    transform: scale(1.2) blur(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) blur(0);
  }
}

.efx-scale-up {
  animation: efx-scale-up var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-scale-down {
  animation: efx-scale-down var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-zoom-in {
  animation: efx-zoom-in var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-zoom-out {
  animation: efx-zoom-out var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

/* ============================================================
   FLIP EFFECTS
   ============================================================ */

@keyframes efx-flip-x {
  from {
    opacity: 0;
    transform: perspective(400px) rotateX(-90deg);
  }
  to {
    opacity: 1;
    transform: perspective(400px) rotateX(0);
  }
}

@keyframes efx-flip-y {
  from {
    opacity: 0;
    transform: perspective(400px) rotateY(-90deg);
  }
  to {
    opacity: 1;
    transform: perspective(400px) rotateY(0);
  }
}

@keyframes efx-flip-3d {
  from {
    opacity: 0;
    transform: perspective(400px) rotateX(-45deg) rotateY(-45deg);
  }
  to {
    opacity: 1;
    transform: perspective(400px) rotateX(0) rotateY(0);
  }
}

.efx-flip-x {
  animation: efx-flip-x var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-flip-y {
  animation: efx-flip-y var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-flip-3d {
  animation: efx-flip-3d var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/effects/basic.css
git commit -m "feat: add basic effects (fades, bounces, slides, pops, rotations, scales, flips)"
```

---

### Task 4: Create Interactive Effects CSS (Borders, Underlines)

**Files:**
- Create: `src/css/effects/interactive.css`

**Interfaces:**
- Produces: CSS classes for border and underline animations
- Consumes: base.css variables

- [ ] **Step 1: Create src/css/effects/interactive.css**

```css
/* ============================================================
   BORDER EFFECTS
   ============================================================ */

@keyframes efx-border-rotate {
  0% {
    border-color: #ff0000;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  }
  25% {
    border-color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }
  50% {
    border-color: #0000ff;
    box-shadow: 0 0 10px rgba(0, 0, 255, 0.5);
  }
  75% {
    border-color: #ffff00;
    box-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
  }
  100% {
    border-color: #ff0000;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  }
}

@keyframes efx-border-wipe {
  0% {
    border-width: 2px;
    border-style: solid;
    border-image: linear-gradient(90deg, transparent, #4ECDC4, transparent) 1;
    background-position: 0% center;
  }
  100% {
    border-width: 2px;
    border-style: solid;
    border-image: linear-gradient(90deg, transparent, #4ECDC4, transparent) 1;
    background-position: 100% center;
  }
}

@keyframes efx-border-gradient {
  0% {
    border-image: linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ff0000) 1;
  }
  100% {
    border-image: linear-gradient(225deg, #ff0000, #00ff00, #0000ff, #ff0000) 1;
  }
}

@keyframes efx-border-pulse {
  0%, 100% {
    border-width: 2px;
    box-shadow: 0 0 0 0 rgba(78, 205, 196, 0.7);
  }
  50% {
    border-width: 3px;
    box-shadow: 0 0 0 10px rgba(78, 205, 196, 0);
  }
}

.efx-border-rotate {
  border: 2px solid;
  animation: efx-border-rotate var(--efx-duration, 2s) linear var(--efx-delay, 0s) infinite;
}

.efx-border-wipe {
  border: 2px solid transparent;
  background-image: linear-gradient(white, white), linear-gradient(90deg, #4ECDC4, #FF6B6B);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  animation: efx-border-wipe var(--efx-duration, 1.5s) ease-in-out var(--efx-delay, 0s) 1;
}

.efx-border-gradient {
  border: 2px solid;
  border-image: linear-gradient(45deg, #ff0000, #00ff00, #0000ff) 1;
  animation: efx-border-gradient var(--efx-duration, 2s) linear var(--efx-delay, 0s) infinite;
}

.efx-border-pulse {
  border: 2px solid #4ECDC4;
  animation: efx-border-pulse var(--efx-duration, 1.5s) ease-out var(--efx-delay, 0s) infinite;
}

/* ============================================================
   UNDERLINE EFFECTS
   ============================================================ */

@keyframes efx-underline-grow {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

@keyframes efx-underline-left {
  0% {
    width: 0;
    left: 0;
  }
  100% {
    width: 100%;
    left: 0;
  }
}

@keyframes efx-underline-right {
  0% {
    width: 0;
    right: 0;
  }
  100% {
    width: 100%;
    right: 0;
  }
}

@keyframes efx-underline-center {
  0% {
    width: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  100% {
    width: 100%;
    left: 50%;
    transform: translateX(-50%);
  }
}

.efx-underline-grow::after,
.efx-underline-left::after,
.efx-underline-right::after,
.efx-underline-center::after {
  content: '';
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: currentColor;
}

.efx-underline-grow:hover::after {
  animation: efx-underline-grow var(--efx-duration, 0.4s) ease-out forwards;
}

.efx-underline-left:hover::after {
  animation: efx-underline-left var(--efx-duration, 0.4s) ease-out forwards;
}

.efx-underline-right:hover::after {
  animation: efx-underline-right var(--efx-duration, 0.4s) ease-out forwards;
}

.efx-underline-center:hover::after {
  animation: efx-underline-center var(--efx-duration, 0.4s) ease-out forwards;
}

.efx-underline-grow,
.efx-underline-left,
.efx-underline-right,
.efx-underline-center {
  position: relative;
  display: inline-block;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/effects/interactive.css
git commit -m "feat: add interactive effects (borders, underlines)"
```

---

### Task 5: Create Text Effects CSS

**Files:**
- Create: `src/css/effects/text.css`

**Interfaces:**
- Produces: CSS classes for text animations
- Consumes: base.css variables

- [ ] **Step 1: Create src/css/effects/text.css**

```css
/* ============================================================
   TEXT REVEAL EFFECTS
   ============================================================ */

@keyframes efx-text-reveal {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes efx-text-slide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes efx-text-glitch {
  0% {
    text-shadow: -2px 0 #ff0000, 2px 0 #00ff00;
    transform: translate(0);
  }
  20% {
    text-shadow: -2px 0 #ff0000, 2px 0 #00ff00;
    transform: translate(-2px, 2px);
  }
  40% {
    text-shadow: -2px 0 #ff0000, 2px 0 #00ff00;
    transform: translate(-2px, -2px);
  }
  60% {
    text-shadow: -2px 0 #ff0000, 2px 0 #00ff00;
    transform: translate(2px, 2px);
  }
  80% {
    text-shadow: -2px 0 #ff0000, 2px 0 #00ff00;
    transform: translate(2px, -2px);
  }
  100% {
    text-shadow: none;
    transform: translate(0);
  }
}

@keyframes efx-text-wave {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.efx-text-reveal {
  animation: efx-text-reveal var(--efx-duration, 0.8s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-text-slide {
  animation: efx-text-slide var(--efx-duration, 0.8s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) var(--efx-delay, 0s) 1 forwards;
}

.efx-text-glitch {
  animation: efx-text-glitch var(--efx-duration, 0.4s) linear var(--efx-delay, 0s) 1 forwards;
}

.efx-text-wave {
  display: inline-block;
  animation: efx-text-wave var(--efx-duration, 0.6s) ease-in-out var(--efx-delay, 0s) infinite;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/effects/text.css
git commit -m "feat: add text animation effects"
```

---

### Task 6: Create Scroll Effects CSS

**Files:**
- Create: `src/css/effects/scroll.css`

**Interfaces:**
- Produces: CSS classes for scroll-triggered animations (state classes)
- Consumes: base.css variables, basic.css animations

**Note:** Scroll trigger logic is handled in JS. This CSS defines the "visible" state classes that JS applies.

- [ ] **Step 1: Create src/css/effects/scroll.css**

```css
/* ============================================================
   SCROLL REVEAL EFFECTS
   ============================================================ */

/* When .efx-scroll-visible is added by JS, apply staggered animation */

.efx-scroll-reveal {
  /* Container doesn't animate itself */
}

.efx-scroll-reveal > * {
  /* All children start with opacity 0 and transform */
  opacity: 0;
}

.efx-scroll-reveal > *.efx-visible {
  /* When JS adds .efx-visible, animation fires */
  animation: efx-scroll-animation var(--efx-duration, 0.6s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) forwards;
  opacity: 1;
}

@keyframes efx-scroll-animation {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Parallax effect */

@keyframes efx-parallax-motion {
  0% {
    transform: translateY(100px);
  }
  100% {
    transform: translateY(-100px);
  }
}

.efx-parallax {
  /* Parallax handled by JS calculating scroll position */
  will-change: transform;
}

/* Sticky reveal */

@keyframes efx-sticky-reveal {
  from {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0% 0);
  }
}

.efx-sticky-reveal.efx-visible {
  animation: efx-sticky-reveal var(--efx-duration, 1s) var(--efx-easing, cubic-bezier(0.34, 1.56, 0.64, 1)) forwards;
}

/* Progress bar on scroll */

@keyframes efx-progress-bar {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.efx-progress-bar {
  height: 4px;
  background: linear-gradient(90deg, #4ECDC4, #FF6B6B);
  width: 0%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/effects/scroll.css
git commit -m "feat: add scroll-triggered animation styles"
```

---

### Task 7: Create Shape Dividers CSS

**Files:**
- Create: `src/css/effects/shapes.css`

**Interfaces:**
- Produces: CSS classes and base styles for shape dividers
- Consumes: base.css variables

**Note:** SVG generation is handled in JS module.

- [ ] **Step 1: Create src/css/effects/shapes.css**

```css
/* ============================================================
   SHAPE DIVIDERS
   ============================================================ */

.efx-divider {
  position: relative;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.efx-divider svg {
  position: relative;
  display: block;
  width: 100%;
  height: var(--efx-divider-height, 100px);
  background: transparent;
}

.efx-divider svg path {
  fill: var(--efx-divider-color, currentColor);
  transition: fill 0.3s ease;
}

/* Animated divider */

@keyframes efx-divider-wave {
  0% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(-25px) translateY(10px);
  }
  100% {
    transform: translateX(0) translateY(0);
  }
}

@keyframes efx-divider-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.efx-divider[data-animate="true"] svg {
  animation: var(--efx-divider-animate-speed, 3s) linear infinite;
}

.efx-divider[data-animate="true"][data-shape="wave"] svg {
  animation: efx-divider-wave var(--efx-divider-animate-speed, 3s) linear infinite;
}

.efx-divider[data-animate="true"][data-shape="leaves"] svg {
  animation: efx-divider-float var(--efx-divider-animate-speed, 3s) ease-in-out infinite;
}

/* Flip shape */

.efx-divider[data-flip="true"] svg {
  transform: scaleX(-1);
}

/* Position variants */

.efx-divider[data-position="bottom"] {
  order: 1;
}

.efx-divider[data-position="left"] {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: auto;
  line-height: normal;
}

.efx-divider[data-position="right"] {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: auto;
  line-height: normal;
}

/* Mobile visibility */

@media (max-width: 768px) {
  .efx-divider[data-mobile-visible="false"] {
    display: none;
  }
}

/* Gradient support */

.efx-divider[data-colors] svg path {
  fill: url(#efxGradient);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/effects/shapes.css
git commit -m "feat: add shape divider styles and positioning"
```

---

## Phase 3: JavaScript Core & Event Handling

### Task 8: Create Core JS Module

**Files:**
- Create: `src/js/core.js`

**Interfaces:**
- Produces: Effix global object, initialization function, core utilities
- Consumes: None

- [ ] **Step 1: Create src/js/core.js**

```javascript
/**
 * EFFIX Core Module
 * Handles initialization, event detection, and effect application
 */

class Effix {
  constructor() {
    this.initialized = false;
    this.effectsQueue = [];
    this.observer = null;
  }

  /**
   * Initialize Effix framework
   */
  init() {
    if (this.initialized) return;
    
    this.setupIntersectionObserver();
    this.setupClickListeners();
    this.setupHoverListeners();
    this.setupLoadEffects();
    this.initialized = true;
    
    console.log('✓ Effix initialized');
  }

  /**
   * Apply animations to elements with custom timing
   */
  applyCustomTiming(element) {
    const duration = element.dataset.duration;
    const easing = element.dataset.easing;
    const delay = element.dataset.delay;

    if (duration) {
      element.style.setProperty('--efx-duration', duration);
    }
    if (easing) {
      element.style.setProperty('--efx-easing', easing);
    }
    if (delay) {
      element.style.setProperty('--efx-delay', delay);
    }
  }

  /**
   * Setup IntersectionObserver for scroll-triggered effects
   */
  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleScrollEntry(entry);
        }
      });
    }, options);

    // Observe all elements with efx-scroll or efx-scroll-reveal
    document.querySelectorAll('[class*="efx-scroll"]').forEach(el => {
      this.observer.observe(el);
    });
  }

  /**
   * Handle scroll trigger entry
   */
  handleScrollEntry(entry) {
    const element = entry.target;
    
    // Skip if already visible
    if (element.classList.contains('efx-scroll-triggered')) {
      return;
    }

    element.classList.add('efx-scroll-triggered');

    // If it's a scroll-reveal container, stagger children
    if (element.classList.contains('efx-scroll-reveal')) {
      this.applyScrollReveal(element);
    } else {
      // Single element with efx-scroll trigger
      this.applyCustomTiming(element);
    }
  }

  /**
   * Apply staggered scroll reveal to children
   */
  applyScrollReveal(container) {
    const stagger = parseFloat(container.dataset.stagger || '0.1') * 1000;
    const children = container.querySelectorAll(':scope > *');

    children.forEach((child, index) => {
      setTimeout(() => {
        this.applyCustomTiming(child);
        child.classList.add('efx-visible');
      }, stagger * index);
    });
  }

  /**
   * Setup click listeners for efx-click
   */
  setupClickListeners() {
    document.addEventListener('click', (e) => {
      let target = e.target;
      
      while (target && target !== document) {
        if (target.classList.contains('efx-click')) {
          this.applyCustomTiming(target);
          this.triggerAnimation(target);
        }
        target = target.parentElement;
      }
    });
  }

  /**
   * Setup hover listeners (CSS handles most, but support data attributes)
   */
  setupHoverListeners() {
    document.querySelectorAll('.efx-hover').forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.applyCustomTiming(element);
      });
    });
  }

  /**
   * Setup load effects
   */
  setupLoadEffects() {
    document.querySelectorAll('.efx-load').forEach(element => {
      // Wait for DOM to be fully rendered
      requestAnimationFrame(() => {
        this.applyCustomTiming(element);
        element.classList.add('efx-load-triggered');
      });
    });
  }

  /**
   * Trigger animation on element
   */
  triggerAnimation(element) {
    const animations = Array.from(element.classList).filter(cls => 
      cls.startsWith('efx-') && cls !== 'efx-click' && cls !== 'efx-hover' && cls !== 'efx-scroll'
    );

    if (animations.length > 0) {
      // Remove and re-add animation class to trigger restart
      animations.forEach(anim => {
        element.classList.remove(anim);
        // Force repaint
        void element.offsetWidth;
        element.classList.add(anim);
      });
    }
  }

  /**
   * Destroy observer on unload
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.initialized = false;
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.Effix = Effix;
}

export default Effix;
```

- [ ] **Step 2: Create test file to verify core functionality**

Create `tests/core.test.js`:

```javascript
import Effix from '../src/js/core.js';

describe('Effix Core', () => {
  let effix;

  beforeEach(() => {
    effix = new Effix();
  });

  test('should initialize without errors', () => {
    expect(() => effix.init()).not.toThrow();
    expect(effix.initialized).toBe(true);
  });

  test('should not double-initialize', () => {
    effix.init();
    effix.init();
    expect(effix.initialized).toBe(true);
  });

  test('should apply custom timing from data attributes', () => {
    const element = document.createElement('div');
    element.dataset.duration = '1.5s';
    element.dataset.easing = 'ease-in';
    element.dataset.delay = '0.2s';

    effix.applyCustomTiming(element);

    expect(element.style.getPropertyValue('--efx-duration')).toBe('1.5s');
    expect(element.style.getPropertyValue('--efx-easing')).toBe('ease-in');
    expect(element.style.getPropertyValue('--efx-delay')).toBe('0.2s');
  });

  afterEach(() => {
    effix.destroy();
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add src/js/core.js tests/core.test.js
git commit -m "feat: add Effix core module with initialization and event handling"
```

---

### Task 9: Create Scroll Module

**Files:**
- Create: `src/js/modules/scroll.js`

**Interfaces:**
- Produces: ScrollModule object with startScrollTrigger() method
- Consumes: Core Effix object methods

- [ ] **Step 1: Create src/js/modules/scroll.js**

```javascript
/**
 * EFFIX Scroll Module
 * Handles scroll-triggered animations and parallax effects
 */

class ScrollModule {
  constructor(effix) {
    this.effix = effix;
    this.parallaxElements = [];
  }

  init() {
    this.initParallax();
    this.initProgressBar();
  }

  /**
   * Initialize parallax effect
   */
  initParallax() {
    this.parallaxElements = document.querySelectorAll('.efx-parallax');
    
    if (this.parallaxElements.length > 0) {
      window.addEventListener('scroll', () => this.updateParallax());
    }
  }

  /**
   * Update parallax transform based on scroll position
   */
  updateParallax() {
    this.parallaxElements.forEach(element => {
      const scrollPosition = window.pageYOffset;
      const elementOffset = element.offsetTop;
      const parallaxSpeed = parseFloat(element.dataset.speed || '0.5');
      
      const yPos = (scrollPosition - elementOffset) * parallaxSpeed;
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  /**
   * Initialize progress bar on scroll
   */
  initProgressBar() {
    const progressBar = document.querySelector('.efx-progress-bar');
    if (progressBar) {
      window.addEventListener('scroll', () => this.updateProgressBar(progressBar));
    }
  }

  /**
   * Update progress bar width
   */
  updateProgressBar(progressBar) {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.pageYOffset / scrollHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }
}

export default ScrollModule;
```

- [ ] **Step 2: Commit**

```bash
git add src/js/modules/scroll.js
git commit -m "feat: add scroll module for parallax and progress tracking"
```

---

### Task 10: Create Click Module

**Files:**
- Create: `src/js/modules/click.js`

**Interfaces:**
- Produces: ClickModule object (initializes automatically with core)
- Consumes: Core Effix methods

- [ ] **Step 1: Create src/js/modules/click.js**

```javascript
/**
 * EFFIX Click Module
 * Handles click-triggered animations
 */

class ClickModule {
  constructor(effix) {
    this.effix = effix;
  }

  init() {
    // Core already handles click listeners in core.js
    // This module exists for future extensibility (toggle effects, counters, etc.)
  }

  /**
   * Restart animation on an element (useful for repeat clicks)
   */
  restartAnimation(element) {
    this.effix.triggerAnimation(element);
  }

  /**
   * Toggle animation on/off
   */
  toggleAnimation(element, animationClass) {
    element.classList.toggle(animationClass);
  }
}

export default ClickModule;
```

- [ ] **Step 2: Commit**

```bash
git add src/js/modules/click.js
git commit -m "feat: add click module for event handling"
```

---

### Task 11: Create Shapes Module

**Files:**
- Create: `src/js/modules/shapes.js`

**Interfaces:**
- Produces: ShapesModule object with initShapeDividers() method
- Consumes: DOM, data attributes on .efx-divider elements

**Note:** This task generates SVG shapes dynamically based on data attributes

- [ ] **Step 1: Create src/js/modules/shapes.js**

```javascript
/**
 * EFFIX Shapes Module
 * Generates animated SVG shape dividers
 */

class ShapesModule {
  constructor() {
    this.shapes = {
      wave: this.generateWave,
      triangle: this.generateTriangle,
      curve: this.generateCurve,
      zigzag: this.generateZigzag,
      sawtooth: this.generateSawtooth,
      chevron: this.generateChevron,
      swoosh: this.generateSwoosh,
      leaves: this.generateLeaves,
      hills: this.generateHills,
      clouds: this.generateClouds
    };
  }

  init() {
    this.initShapeDividers();
  }

  /**
   * Initialize all shape dividers on page
   */
  initShapeDividers() {
    document.querySelectorAll('.efx-divider').forEach(divider => {
      const shape = divider.dataset.shape || 'wave';
      const height = parseInt(divider.dataset.height || '100');
      const color = divider.dataset.color || '#4ECDC4';
      const flip = divider.dataset.flip === 'true';

      if (this.shapes[shape]) {
        const svg = this.shapes[shape].call(this, height, color);
        
        if (flip) {
          svg.setAttribute('style', `transform: scaleX(-1); ${svg.getAttribute('style') || ''}`);
        }

        divider.innerHTML = '';
        divider.appendChild(svg);
      }
    });
  }

  /**
   * Generate SVG element
   */
  createSVG(width = 1200, height = 100) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return svg;
  }

  /**
   * Wave shape
   */
  generateWave(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,${height * 0.5} Q300,${height * 0.1} 600,${height * 0.5} T1200,${height * 0.5} L1200,${height} L0,${height} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /**
   * Triangle shape
   */
  generateTriangle(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,0 L600,${height} L1200,0 L1200,${height} L0,${height} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /**
   * Curve shape
   */
  generateCurve(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,${height} Q300,0 600,${height} T1200,${height} L1200,${height} L0,${height} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /**
   * Zigzag shape
   */
  generateZigzag(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,0 L300,${height} L600,0 L900,${height} L1200,0 L1200,${height} L0,${height} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /**
   * Sawtooth shape
   */
  generateSawtooth(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,0 L150,${height} L300,0 L450,${height} L600,0 L750,${height} L900,0 L1050,${height} L1200,0 L1200,${height} L0,${height} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /**
   * Chevron shape
   */
  generateChevron(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,0 L600,${height} L1200,0 L1200,${height * 0.3} L600,${height * 1.3} L0,${height * 0.3} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /**
   * Swoosh shape
   */
  generateSwoosh(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,${height * 0.7} Q300,0 600,${height * 0.7} T1200,${height * 0.7} L1200,${height} L0,${height} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /**
   * Leaves shape
   */
  generateLeaves(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,${height * 0.6} Q150,${height * 0.2} 300,${height * 0.6} Q450,${height * 0.2} 600,${height * 0.6} Q750,${height * 0.2} 900,${height * 0.6} Q1050,${height * 0.2} 1200,${height * 0.6} L1200,${height} L0,${height} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /**
   * Hills shape
   */
  generateHills(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,${height * 0.5} Q300,${height * 0.1} 600,${height * 0.5} Q900,${height * 0.9} 1200,${height * 0.5} L1200,${height} L0,${height} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /**
   * Clouds shape
   */
  generateClouds(height, color) {
    const svg = this.createSVG(1200, height);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M0,${height * 0.7} C100,${height * 0.7} 150,${height * 0.3} 300,${height * 0.3} C450,${height * 0.3} 500,${height * 0.7} 600,${height * 0.7} C700,${height * 0.7} 750,${height * 0.4} 900,${height * 0.4} C1050,${height * 0.4} 1100,${height * 0.7} 1200,${height * 0.7} L1200,${height} L0,${height} Z`);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }
}

export default ShapesModule;
```

- [ ] **Step 2: Commit**

```bash
git add src/js/modules/shapes.js
git commit -m "feat: add shapes module for SVG shape dividers"
```

---

### Task 12: Create Main JS Bundle & Initialization

**Files:**
- Create: `src/js/index.js`

**Interfaces:**
- Produces: Bundled JavaScript that initializes on window.load
- Consumes: core.js, scroll.js, click.js, shapes.js

- [ ] **Step 1: Create src/js/index.js**

```javascript
/**
 * EFFIX Main Entry Point
 * Bundles all modules and initializes on page load
 */

import Effix from './core.js';
import ScrollModule from './modules/scroll.js';
import ClickModule from './modules/click.js';
import ShapesModule from './modules/shapes.js';

// Create global Effix instance
const effix = new Effix();

// Initialize modules
const scrollModule = new ScrollModule(effix);
const clickModule = new ClickModule(effix);
const shapesModule = new ShapesModule();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEffix);
} else {
  initializeEffix();
}

function initializeEffix() {
  effix.init();
  scrollModule.init();
  clickModule.init();
  shapesModule.init();
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.effix = {
    core: effix,
    scroll: scrollModule,
    click: clickModule,
    shapes: shapesModule,
    version: '1.0.0'
  };
}

export { effix, scrollModule, clickModule, shapesModule };
```

- [ ] **Step 2: Build with Webpack**

```bash
npm run build
```

Expected: Creates `dist/effix.min.js` and `dist/effix.min.js.map`

- [ ] **Step 3: Verify bundled file exists**

```bash
ls -lah dist/
```

Expected output:
```
effix.min.js
effix.min.js.map
```

- [ ] **Step 4: Commit**

```bash
git add src/js/index.js dist/
git commit -m "feat: bundle all JS modules into production-ready dist"
```

---

## Phase 4: CSS Bundling & Minification

### Task 13: Bundle & Minify CSS

**Files:**
- Produce: `dist/effix.min.css`

**Interfaces:**
- Consumes: All src/css files
- Produces: Production CSS bundle

- [ ] **Step 1: Add PostCSS build step to package.json**

Update `package.json` scripts:
```json
"scripts": {
  "build": "npm run build:css && npm run build:js",
  "build:css": "postcss src/css/index.css -o dist/effix.min.css",
  "build:js": "webpack --mode production",
  "dev": "npm run dev:css & npm run dev:js",
  "dev:css": "postcss src/css/index.css -o dist/effix.min.css --watch",
  "dev:js": "webpack --mode development --watch"
}
```

- [ ] **Step 2: Build CSS**

```bash
npm run build:css
```

Expected: Creates `dist/effix.min.css` (minified)

- [ ] **Step 3: Verify bundle size**

```bash
ls -lh dist/effix.min.css
wc -l dist/effix.min.css
```

Expected: < 50KB gzipped combined with JS

- [ ] **Step 4: Commit**

```bash
git add package.json dist/effix.min.css
git commit -m "build: add CSS bundling with PostCSS and minification"
```

---

## Phase 5: Demo & Documentation

### Task 14: Create Interactive Demo Template

**Files:**
- Create: `src/templates/demo.html`

**Interfaces:**
- Produces: Single HTML file showcasing all effects with live examples
- Consumes: dist/effix.min.css, dist/effix.min.js

This is a large file. Due to length, I'll create a summary structure in the next step, but you'll need to expand it with all categories.

- [ ] **Step 1: Create src/templates/demo.html (full template)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EFFIX - CSS Effects Framework Demo</title>
  <link rel="stylesheet" href="../css/index.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    header { text-align: center; margin-bottom: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; border-radius: 8px; }
    header h1 { font-size: 3em; margin-bottom: 10px; }
    header p { font-size: 1.2em; opacity: 0.9; }
    .section { background: white; margin-bottom: 40px; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .section h2 { margin-bottom: 30px; font-size: 1.8em; border-bottom: 3px solid #667eea; padding-bottom: 15px; }
    .demo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .demo-box { background: #f9f9f9; padding: 20px; border-radius: 6px; text-align: center; border: 1px solid #eee; }
    .demo-element { display: inline-block; padding: 15px 30px; margin: 10px; background: #667eea; color: white; border-radius: 4px; cursor: pointer; transition: all 0.3s; }
    .demo-element:hover { background: #764ba2; transform: scale(1.05); }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 0.9em; }
    .code-block { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 6px; overflow-x: auto; margin: 20px 0; font-family: 'Courier New', monospace; font-size: 0.85em; line-height: 1.4; }
    .variables-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
    .variables-table th, .variables-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .variables-table th { background: #f5f5f5; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header>
      <h1>🎬 EFFIX</h1>
      <p>CSS Effects Framework - Bootstrap-Like Class-Based Animations</p>
      <p style="font-size: 0.9em; margin-top: 20px;">Apply powerful effects with simple CSS classes</p>
    </header>

    <!-- Quick Start -->
    <section class="section">
      <h2>⚡ Quick Start</h2>
      <p style="margin-bottom: 20px;">Include one CSS and one JS file:</p>
      <div class="code-block">&lt;link rel="stylesheet" href="effix.min.css"&gt;
&lt;script src="effix.min.js"&gt;&lt;/script&gt;</div>
      <p>Then apply classes to any element:</p>
      <div class="code-block">&lt;button class="efx-bounce efx-hover"&gt;Hover me&lt;/button&gt;</div>
    </section>

    <!-- Customization -->
    <section class="section">
      <h2>⚙️ Customization</h2>
      <h3 style="margin: 20px 0 15px 0;">Global CSS Variables</h3>
      <div class="code-block">:root {
  --efx-duration: 0.6s;
  --efx-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
  --efx-delay: 0s;
  --efx-stagger: 0.1s;
}</div>

      <h3 style="margin: 20px 0 15px 0;">Per-Element Data Attributes</h3>
      <div class="code-block">&lt;div class="efx-fade-in efx-scroll" 
     data-duration="1.2s" 
     data-easing="ease-in-out"
     data-delay="0.5s"&gt;
  Content
&lt;/div&gt;</div>
    </section>

    <!-- Basic Effects -->
    <section class="section">
      <h2>✨ Basic Effects</h2>
      <div class="demo-grid">
        <div class="demo-box">
          <div class="demo-element efx-fade-in">Fade In</div>
          <code>efx-fade-in</code>
        </div>
        <div class="demo-box">
          <div class="demo-element efx-bounce-in">Bounce In</div>
          <code>efx-bounce-in</code>
        </div>
        <div class="demo-box">
          <div class="demo-element efx-slide-up">Slide Up</div>
          <code>efx-slide-up</code>
        </div>
        <div class="demo-box">
          <div class="demo-element efx-pop-in">Pop In</div>
          <code>efx-pop-in</code>
        </div>
        <div class="demo-box">
          <div class="demo-element efx-rotate-in">Rotate In</div>
          <code>efx-rotate-in</code>
        </div>
        <div class="demo-box">
          <div class="demo-element efx-scale-up">Scale Up</div>
          <code>efx-scale-up</code>
        </div>
        <div class="demo-box">
          <div class="demo-element efx-flip-x">Flip X</div>
          <code>efx-flip-x</code>
        </div>
        <div class="demo-box">
          <div class="demo-element efx-zoom-in">Zoom In</div>
          <code>efx-zoom-in</code>
        </div>
      </div>
    </section>

    <!-- Hover Effects -->
    <section class="section">
      <h2>🎯 Hover Effects</h2>
      <div class="demo-grid">
        <div class="demo-box">
          <button class="demo-element efx-bounce efx-hover" style="cursor: pointer;">Bounce</button>
          <code>efx-bounce efx-hover</code>
        </div>
        <div class="demo-box">
          <button class="demo-element efx-spin efx-hover" style="cursor: pointer;">Spin</button>
          <code>efx-spin efx-hover</code>
        </div>
        <div class="demo-box">
          <button class="demo-element efx-pop efx-hover" style="cursor: pointer;">Pop</button>
          <code>efx-pop efx-hover</code>
        </div>
        <div class="demo-box">
          <button class="demo-element efx-border-rotate" style="cursor: pointer;">Border Rotate</button>
          <code>efx-border-rotate</code>
        </div>
      </div>
    </section>

    <!-- Click Effects -->
    <section class="section">
      <h2>👆 Click Effects</h2>
      <div class="demo-grid">
        <div class="demo-box">
          <button class="demo-element efx-bounce-out efx-click" style="cursor: pointer;">Click Me</button>
          <code>efx-bounce-out efx-click</code>
        </div>
        <div class="demo-box">
          <button class="demo-element efx-pop efx-click" style="cursor: pointer;">Click Me</button>
          <code>efx-pop efx-click</code>
        </div>
      </div>
    </section>

    <!-- Scroll Reveal -->
    <section class="section">
      <h2>📜 Scroll Reveal</h2>
      <p style="margin-bottom: 20px;">Scroll down to see elements animate in with stagger effect.</p>
      
      <div style="background: #f0f0f0; padding: 30px; border-radius: 6px; margin: 20px 0;">
        <div class="efx-scroll-reveal" data-stagger="0.15s" style="min-height: 300px; display: flex; flex-direction: column; justify-content: space-around;">
          <div class="efx-fade-in" style="background: #667eea; color: white; padding: 20px; border-radius: 4px;">Item 1 - Fades in</div>
          <div class="efx-slide-up" style="background: #764ba2; color: white; padding: 20px; border-radius: 4px;">Item 2 - Slides up</div>
          <div class="efx-pop-in" style="background: #f093fb; color: white; padding: 20px; border-radius: 4px;">Item 3 - Pops in</div>
          <div class="efx-bounce-in" style="background: #4ecdc4; color: white; padding: 20px; border-radius: 4px;">Item 4 - Bounces in</div>
        </div>
      </div>

      <p><strong>Code:</strong></p>
      <div class="code-block">&lt;div class="efx-scroll-reveal" data-stagger="0.15s"&gt;
  &lt;div class="efx-fade-in"&gt;Item 1&lt;/div&gt;
  &lt;div class="efx-slide-up"&gt;Item 2&lt;/div&gt;
  &lt;div class="efx-pop-in"&gt;Item 3&lt;/div&gt;
&lt;/div&gt;</div>
    </section>

    <!-- Shape Dividers -->
    <section class="section">
      <h2>🌊 Shape Dividers</h2>
      <p style="margin-bottom: 20px;">Animated SVG shape dividers that separate sections beautifully.</p>

      <div style="margin: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 6px;">
        <h3>Wave Divider</h3>
        <p>Smooth wave effect</p>
      </div>

      <div class="efx-divider" data-shape="wave" data-height="120" data-color="#FF6B6B" data-animate="true"></div>

      <p style="margin-top: 20px;"><strong>Code:</strong></p>
      <div class="code-block">&lt;div class="efx-divider" 
     data-shape="wave"
     data-height="120"
     data-color="#FF6B6B"
     data-animate="true"&gt;
&lt;/div&gt;</div>

      <h3 style="margin-top: 30px; margin-bottom: 15px;">Available Shapes:</h3>
      <p><code>wave</code>, <code>triangle</code>, <code>curve</code>, <code>zigzag</code>, <code>sawtooth</code>, <code>chevron</code>, <code>swoosh</code>, <code>leaves</code>, <code>hills</code>, <code>clouds</code></p>
    </section>

    <!-- Reference -->
    <section class="section">
      <h2>📖 Class Reference</h2>
      
      <h3 style="margin: 20px 0 15px 0;">Animation Classes</h3>
      <table class="variables-table">
        <tr>
          <th>Class</th>
          <th>Effect</th>
          <th>Type</th>
        </tr>
        <tr>
          <td><code>efx-fade-in</code></td>
          <td>Fades element in</td>
          <td>Basic</td>
        </tr>
        <tr>
          <td><code>efx-bounce-in</code></td>
          <td>Bounces element in</td>
          <td>Basic</td>
        </tr>
        <tr>
          <td><code>efx-slide-up</code></td>
          <td>Slides element up</td>
          <td>Basic</td>
        </tr>
        <tr>
          <td><code>efx-pop-in</code></td>
          <td>Pops element in</td>
          <td>Basic</td>
        </tr>
        <tr>
          <td><code>efx-rotate-in</code></td>
          <td>Rotates element in</td>
          <td>Basic</td>
        </tr>
        <tr>
          <td><code>efx-scale-up</code></td>
          <td>Scales element up</td>
          <td>Basic</td>
        </tr>
        <tr>
          <td><code>efx-flip-x</code></td>
          <td>Flips element on X axis</td>
          <td>Basic</td>
        </tr>
        <tr>
          <td><code>efx-border-rotate</code></td>
          <td>Rotating border animation</td>
          <td>Interactive</td>
        </tr>
        <tr>
          <td><code>efx-text-reveal</code></td>
          <td>Reveals text</td>
          <td>Text</td>
        </tr>
      </table>

      <h3 style="margin: 20px 0 15px 0;">Trigger Classes</h3>
      <table class="variables-table">
        <tr>
          <th>Trigger</th>
          <th>Behavior</th>
        </tr>
        <tr>
          <td><code>efx-hover</code></td>
          <td>Animation plays on mouse hover</td>
        </tr>
        <tr>
          <td><code>efx-click</code></td>
          <td>Animation plays on element click</td>
        </tr>
        <tr>
          <td><code>efx-scroll</code></td>
          <td>Animation plays when element enters viewport</td>
        </tr>
        <tr>
          <td><code>efx-load</code></td>
          <td>Animation plays on page load</td>
        </tr>
      </table>
    </section>

    <!-- Footer -->
    <footer style="text-align: center; padding: 40px 20px; color: #666;">
      <p><strong>EFFIX v1.0</strong> - Open Source CSS Effects Framework</p>
      <p><a href="https://github.com" style="color: #667eea; text-decoration: none;">GitHub</a> | <a href="#" style="color: #667eea; text-decoration: none;">Documentation</a></p>
    </footer>
  </div>

  <script src="../js/index.js"></script>
</body>
</html>
```

- [ ] **Step 2: Copy demo to root for easy access**

```bash
cp src/templates/demo.html demo/index.html
```

- [ ] **Step 3: Commit**

```bash
git add src/templates/demo.html demo/index.html
git commit -m "docs: add interactive demo template with examples for all effects"
```

---

### Task 15: Create Documentation Files

**Files:**
- Create: `docs/QUICK-START.md`
- Create: `docs/EFFECTS.md`
- Create: `docs/SHAPES.md`
- Create: `docs/CUSTOMIZATION.md`
- Create: `docs/TRIGGERS.md`

Due to length constraints, here's the structure. Each should be created separately.

- [ ] **Step 1: Create docs/QUICK-START.md**

```markdown
# EFFIX Quick Start Guide

## Installation

### Option 1: NPM
\`\`\`bash
npm install effix
\`\`\`

### Option 2: Direct Include
Download \`effix.min.css\` and \`effix.min.js\` and include in your HTML:

\`\`\`html
<link rel="stylesheet" href="path/to/effix.min.css">
<script src="path/to/effix.min.js"></script>
\`\`\`

## Basic Usage

Apply CSS classes to elements to add effects:

\`\`\`html
<!-- Fade in on page load -->
<div class="efx-fade-in efx-load">Content fades in</div>

<!-- Bounce on hover -->
<button class="efx-bounce efx-hover">Hover me</button>

<!-- Pop on click -->
<div class="efx-pop efx-click">Click me</div>

<!-- Fade in when scrolled into view -->
<section class="efx-fade-in efx-scroll">Content reveals on scroll</section>
\`\`\`

## Effect Classes

| Class | Effect |
|-------|--------|
| \`efx-fade-in\` | Fades element in |
| \`efx-bounce-in\` | Bounces element in |
| \`efx-slide-up\` | Slides element up |
| \`efx-pop-in\` | Pops element in |
| \`efx-rotate-in\` | Rotates element in |
| \`efx-scale-up\` | Scales element up |
| \`efx-flip-x\` | Flips on X axis |
| \`efx-border-rotate\` | Animated rotating border |

## Trigger Classes

| Trigger | Behavior |
|---------|----------|
| \`efx-hover\` | Triggers on mouse hover |
| \`efx-click\` | Triggers on element click |
| \`efx-scroll\` | Triggers when element enters viewport |
| \`efx-load\` | Triggers on page load |

## Customization

Override global animation properties with CSS variables:

\`\`\`css
:root {
  --efx-duration: 0.8s;
  --efx-easing: ease-in-out;
  --efx-delay: 0.2s;
}
\`\`\`

Or customize individual elements with data attributes:

\`\`\`html
<div class="efx-fade-in efx-scroll"
     data-duration="1.5s"
     data-delay="0.5s">
  Custom timing element
</div>
\`\`\`

## Next Steps

- Explore all effects in the [interactive demo](../demo/index.html)
- Read the [complete effects reference](EFFECTS.md)
- Learn about [customization options](CUSTOMIZATION.md)
- View [shape divider documentation](SHAPES.md)
```

- [ ] **Step 2: Create docs/EFFECTS.md**

```markdown
# EFFIX Effects Reference

## Basic Animations

### Fades
- \`efx-fade-in\` - Fade from 0 to 1 opacity
- \`efx-fade-out\` - Fade from 1 to 0 opacity
- \`efx-fade-in-up\` - Fade in while sliding up
- \`efx-fade-in-down\` - Fade in while sliding down

### Bounces
- \`efx-bounce\` - Elastic bounce (looping)
- \`efx-bounce-in\` - Bounces in from scaled-down
- \`efx-bounce-out\` - Bounces out to scaled-up
- \`efx-bounce-up\` - Bounces upward
- \`efx-bounce-down\` - Bounces downward

### Slides
- \`efx-slide-up\` - Slides in from bottom
- \`efx-slide-down\` - Slides in from top
- \`efx-slide-left\` - Slides in from right
- \`efx-slide-right\` - Slides in from left

### Pops
- \`efx-pop\` - Quick scale and opacity pop (looping)
- \`efx-pop-in\` - Pops in from smaller scale
- \`efx-pop-elastic\` - Elastic pop with overshoot

### Rotations
- \`efx-rotate\` - Rotates 360° (looping)
- \`efx-rotate-in\` - Rotates in from 0°
- \`efx-spin\` - Continuous spin (looping)
- \`efx-spin-reverse\` - Spin counterclockwise (looping)

### Scales
- \`efx-scale-up\` - Grows from 0.5 to 1
- \`efx-scale-down\` - Shrinks from 1.5 to 1
- \`efx-zoom-in\` - Zoom in with blur
- \`efx-zoom-out\` - Zoom out with blur

### Flips
- \`efx-flip-x\` - 3D flip on X axis
- \`efx-flip-y\` - 3D flip on Y axis
- \`efx-flip-3d\` - 3D flip on both axes

## Interactive Animations

### Border Effects
- \`efx-border-rotate\` - Rotating colored border
- \`efx-border-wipe\` - Border wipes across
- \`efx-border-gradient\` - Gradient rotates around border
- \`efx-border-pulse\` - Border expands/contracts

### Underline Effects
- \`efx-underline-grow\` - Underline grows on hover
- \`efx-underline-left\` - Underline fills from left on hover
- \`efx-underline-right\` - Underline fills from right on hover
- \`efx-underline-center\` - Underline fills from center on hover

## Text Effects

- \`efx-text-reveal\` - Text reveals/fades in
- \`efx-text-slide\` - Text slides in
- \`efx-text-glitch\` - Glitch/corruption effect
- \`efx-text-wave\` - Wave motion through text

## Scroll Effects

- \`efx-scroll-reveal\` - Container for staggered child reveals
- \`efx-parallax\` - Parallax depth effect
- \`efx-sticky-reveal\` - Reveals as it becomes sticky
- \`efx-progress-bar\` - Progress bar tied to scroll

## Shape Dividers

\`\`\`html
<div class="efx-divider" data-shape="wave"></div>
\`\`\`

Available shapes: wave, triangle, curve, zigzag, sawtooth, chevron, swoosh, leaves, hills, clouds
```

- [ ] **Step 3: Create docs/CUSTOMIZATION.md**

```markdown
# EFFIX Customization Guide

## Global CSS Variables

Override these in your CSS to change default behavior for all effects:

\`\`\`css
:root {
  /* Animation timing */
  --efx-duration: 0.6s;
  --efx-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
  --efx-delay: 0s;
  
  /* Stagger delay for scroll reveals */
  --efx-stagger: 0.1s;
  
  /* Shape divider defaults */
  --efx-divider-height: 100px;
  --efx-divider-color: currentColor;
  --efx-divider-animate-speed: 3s;
}
\`\`\`

## Per-Element Data Attributes

Override timing for individual elements:

\`\`\`html
<div class="efx-fade-in efx-scroll"
     data-duration="1.2s"
     data-easing="ease-in-out"
     data-delay="0.5s">
  Custom timing
</div>
\`\`\`

### Supported Attributes
- \`data-duration\` - Animation duration (e.g., "1s", "500ms")
- \`data-easing\` - Timing function (e.g., "ease-in", "cubic-bezier(...)")
- \`data-delay\` - Animation delay (e.g., "0.5s")
- \`data-stagger\` - Stagger delay for children (scroll-reveal only)

## Shape Divider Customization

Complete example with all options:

\`\`\`html
<div class="efx-divider"
     data-shape="wave"
     data-height="120"
     data-color="#FF6B6B"
     data-flip="false"
     data-position="top"
     data-animate="true"
     data-animation-speed="3s"
     data-mobile-visible="true">
</div>
\`\`\`

### Divider Attributes
- \`data-shape\` - Shape type (wave, triangle, curve, etc.)
- \`data-height\` - Vertical height in px
- \`data-color\` - Fill color (hex, rgb, hsl)
- \`data-flip\` - Flip shape (true/false)
- \`data-position\` - Position (top, bottom, left, right)
- \`data-animate\` - Enable animation (true/false)
- \`data-animation-speed\` - Animation duration
- \`data-mobile-visible\` - Show on mobile (true/false)

## Advanced: Combining Effects

Stack multiple effects on one element:

\`\`\`html
<div class="efx-bounce-in efx-scale-up efx-scroll"
     data-duration="0.8s"
     data-stagger="0.15s">
  Multiple effects combined
</div>
\`\`\`

## Accessibility

EFFIX respects the \`prefers-reduced-motion\` media query automatically. Users who prefer reduced motion will see animations significantly reduced in speed.

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`
```

- [ ] **Step 4: Create docs/SHAPES.md**

```markdown
# EFFIX Shape Dividers Guide

Shape dividers are SVG-based section separators that can be animated and fully customized.

## Basic Usage

\`\`\`html
<div class="efx-divider" data-shape="wave"></div>
\`\`\`

## Available Shapes

| Shape | Description |
|-------|-------------|
| \`wave\` | Smooth wave pattern |
| \`triangle\` | Triangle points |
| \`curve\` | Curved bottom |
| \`zigzag\` | Zigzag pattern |
| \`sawtooth\` | Sharp sawtooth edges |
| \`chevron\` | Chevron/arrow pattern |
| \`swoosh\` | Flowing swoosh |
| \`leaves\` | Leaf/petal pattern |
| \`hills\` | Rolling hills |
| \`clouds\` | Cloud shapes |

## Color Customization

### Single Color
\`\`\`html
<div class="efx-divider" 
     data-shape="wave"
     data-color="#FF6B6B">
</div>
\`\`\`

### Gradient
\`\`\`html
<div class="efx-divider"
     data-shape="wave"
     data-colors="#FF6B6B|#4ECDC4|#45B7D1"
     data-gradient-angle="90deg">
</div>
\`\`\`

## Animation

Enable animation on the divider:

\`\`\`html
<div class="efx-divider"
     data-shape="wave"
     data-animate="true"
     data-animation-speed="3s">
</div>
\`\`\`

## Positioning

Place dividers at different positions:

\`\`\`html
<!-- Top of section -->
<div class="efx-divider" data-position="top"></div>

<!-- Bottom of section -->
<div class="efx-divider" data-position="bottom"></div>

<!-- Left side -->
<div class="efx-divider" data-position="left"></div>

<!-- Right side -->
<div class="efx-divider" data-position="right"></div>
\`\`\`

## Flipping

Flip shapes horizontally:

\`\`\`html
<div class="efx-divider"
     data-shape="wave"
     data-flip="true">
</div>
\`\`\`

## Mobile Responsiveness

Hide dividers on mobile devices:

\`\`\`html
<div class="efx-divider"
     data-shape="wave"
     data-mobile-visible="false">
</div>
\`\`\`

## Complete Example

\`\`\`html
<section style="background: #667eea; padding: 60px 20px;">
  <h2>Section Content</h2>
  <p>Your content here</p>
</section>

<div class="efx-divider"
     data-shape="wave"
     data-height="120"
     data-color="#667eea"
     data-animate="true"
     data-animation-speed="4s">
</div>

<section style="background: white; padding: 60px 20px;">
  <h2>Next Section</h2>
  <p>Your content here</p>
</section>
\`\`\`
```

- [ ] **Step 5: Create docs/TRIGGERS.md**

```markdown
# EFFIX Triggers Guide

Triggers define when effects play. Combine with any animation class.

## Trigger Types

### efx-hover
Plays animation on mouse hover. CSS-only, no JavaScript required.

\`\`\`html
<button class="efx-bounce efx-hover">Hover me</button>
<a href="#" class="efx-underline-grow efx-hover">Link with growing underline</a>
\`\`\`

### efx-click
Plays animation when element is clicked.

\`\`\`html
<button class="efx-pop-elastic efx-click">Click me</button>
<div class="efx-bounce-out efx-click">Click to animate</div>
\`\`\`

### efx-scroll
Plays animation when element enters viewport while scrolling.

\`\`\`html
<div class="efx-fade-in efx-scroll">Animates when scrolled into view</div>
\`\`\`

### efx-load
Plays animation when page finishes loading.

\`\`\`html
<div class="efx-slide-up efx-load">Animates on page load</div>
\`\`\`

### efx-focus
Plays animation when element receives focus (form elements).

\`\`\`html
<input class="efx-scale-up efx-focus" type="text" />
\`\`\`

### efx-active
Plays animation during active/pressed state (buttons, links).

\`\`\`html
<button class="efx-scale-down efx-active">Button</button>
\`\`\`

## Combining Effects and Triggers

Stack animation and trigger classes:

\`\`\`html
<!-- Multiple animations on one trigger -->
<div class="efx-bounce-in efx-scale-up efx-click">
  Click for combined effect
</div>

<!-- Custom timing with trigger -->
<div class="efx-fade-in efx-scroll"
     data-duration="1.5s"
     data-delay="0.3s">
  Custom timed scroll effect
</div>
\`\`\`

## Scroll Reveal Pattern

For multiple elements with staggered animations:

\`\`\`html
<section class="efx-scroll-reveal" data-stagger="0.15s">
  <div class="efx-fade-in">First item</div>
  <div class="efx-slide-up">Second item (0.15s delay)</div>
  <div class="efx-pop-in">Third item (0.3s delay)</div>
  <div class="efx-bounce-in">Fourth item (0.45s delay)</div>
</section>
\`\`\`

Each child animates with custom class and staggered delay automatically applied.

## Browser Compatibility

| Trigger | Supported Browsers |
|---------|-------------------|
| efx-hover | All modern browsers |
| efx-click | All modern browsers |
| efx-scroll | All modern browsers (uses IntersectionObserver) |
| efx-load | All modern browsers |
| efx-focus | All modern browsers |
| efx-active | All modern browsers |
```

- [ ] **Step 6: Commit all documentation**

```bash
git add docs/QUICK-START.md docs/EFFECTS.md docs/SHAPES.md docs/CUSTOMIZATION.md docs/TRIGGERS.md
git commit -m "docs: add comprehensive documentation for all features"
```

---

## Phase 6: README & Final Setup

### Task 16: Create README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# 🎬 EFFIX - CSS Effects Framework

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-1.0.0-blue.svg)](package.json)

A lightweight, open-source CSS effects framework inspired by Bootstrap. Apply powerful animations and interactive effects to any HTML element using simple CSS classes—no configuration required.

## ✨ Features

- **⚡ Zero Setup** — Include one CSS + one JS file, then start applying classes
- **🎯 Class-Based API** — Like Bootstrap, but for animations (e.g., `efx-fade-in`, `efx-bounce efx-hover`)
- **📦 Modular** — Use CSS-only for simple effects, add optional JS for advanced triggers
- **🎨 Fully Customizable** — Override timing, easing, and delays via CSS variables or data attributes
- **📱 Responsive** — Works on all modern browsers, respects `prefers-reduced-motion`
- **🌊 Shape Dividers** — Animated SVG section separators with full customization
- **♿ Accessible** — Built with accessibility in mind, ARIA support where needed
- **🎪 No Dependencies** — Pure CSS and vanilla JavaScript, no frameworks required

## 🚀 Quick Start

### Installation

**Option 1: NPM**
```bash
npm install effix
```

**Option 2: Direct Download**
Download `effix.min.css` and `effix.min.js` and include in your HTML.

### Basic Usage

```html
<!-- Include CSS and JS -->
<link rel="stylesheet" href="effix.min.css">
<script src="effix.min.js"></script>

<!-- Apply classes to elements -->
<button class="efx-bounce efx-hover">Hover me</button>
<div class="efx-fade-in efx-scroll">Reveals when scrolled into view</div>
<div class="efx-pop efx-click">Click to animate</div>
```

That's it! No configuration needed.

## 📚 Effects

### Basic Animations
- Fades: `efx-fade-in`, `efx-fade-out`, `efx-fade-in-up`, `efx-fade-in-down`
- Bounces: `efx-bounce`, `efx-bounce-in`, `efx-bounce-out`, `efx-bounce-up`, `efx-bounce-down`
- Slides: `efx-slide-up`, `efx-slide-down`, `efx-slide-left`, `efx-slide-right`
- Pops: `efx-pop`, `efx-pop-in`, `efx-pop-elastic`
- Rotations: `efx-rotate`, `efx-rotate-in`, `efx-spin`, `efx-spin-reverse`
- Scales: `efx-scale-up`, `efx-scale-down`, `efx-zoom-in`, `efx-zoom-out`
- Flips: `efx-flip-x`, `efx-flip-y`, `efx-flip-3d`

### Interactive Animations
- Border effects: `efx-border-rotate`, `efx-border-wipe`, `efx-border-gradient`, `efx-border-pulse`
- Underline effects: `efx-underline-grow`, `efx-underline-left`, `efx-underline-right`, `efx-underline-center`

### Text Animations
- `efx-text-reveal`, `efx-text-slide`, `efx-text-glitch`, `efx-text-wave`

### Scroll Effects
- `efx-scroll-reveal` (with staggered children)
- `efx-parallax`, `efx-sticky-reveal`, `efx-progress-bar`

### Shape Dividers
- `efx-divider` with customizable shapes, colors, heights, and animations

## 🎯 Triggers

When effects occur:

| Trigger | Behavior |
|---------|----------|
| `efx-hover` | Animation on mouse hover |
| `efx-click` | Animation on element click |
| `efx-scroll` | Animation when element enters viewport |
| `efx-load` | Animation on page load |
| `efx-focus` | Animation on form element focus |
| `efx-active` | Animation on button/link active state |

## ⚙️ Customization

### Global CSS Variables

```css
:root {
  --efx-duration: 0.6s;
  --efx-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
  --efx-delay: 0s;
  --efx-stagger: 0.1s;
}
```

### Per-Element Data Attributes

```html
<div class="efx-fade-in efx-scroll"
     data-duration="1.2s"
     data-easing="ease-in-out"
     data-delay="0.5s">
  Custom timing
</div>
```

## 📖 Documentation

- **[Quick Start Guide](docs/QUICK-START.md)** — Get up and running in 5 minutes
- **[Effects Reference](docs/EFFECTS.md)** — Complete list of all effects
- **[Triggers Guide](docs/TRIGGERS.md)** — When and how effects play
- **[Customization](docs/CUSTOMIZATION.md)** — Advanced configuration options
- **[Shape Dividers](docs/SHAPES.md)** — SVG dividers guide
- **[Live Demo](demo/index.html)** — Interactive playground with all effects

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

**Note:** EFFIX is modern browsers only. No IE11 support.

## 📦 Bundle Size

- CSS: ~15KB (minified)
- JS: ~8KB (minified + gzipped)
- **Combined: < 50KB gzipped**

## 🛠️ Development

### Setup
```bash
git clone <repo>
cd effix
npm install
```

### Build
```bash
npm run build        # Build production files
npm run dev          # Watch and rebuild on changes
npm test             # Run tests
```

### Project Structure
```
effix/
├── src/
│   ├── css/           # Effect stylesheets
│   ├── js/            # JavaScript modules
│   ├── templates/     # Demo HTML
│   └── docs/          # Documentation
├── dist/              # Production bundles
├── demo/              # Example implementations
└── tests/             # Unit tests
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🐛 Issues & Feedback

Found a bug? Have a feature request? [Open an issue](https://github.com/yourusername/effix/issues)

## 🙏 Acknowledgments

Inspired by:
- Bootstrap (class-based utilities)
- Elementor (shape dividers)
- Modern CSS animation trends

---

**Made with ❤️ by [Your Name]**

[⬆ Back to top](#-effix---css-effects-framework)
```

- [ ] **Step 2: Commit README**

```bash
git add README.md
git commit -m "docs: add comprehensive README with features and quick start"
```

---

### Task 17: Create CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create CONTRIBUTING.md**

```markdown
# Contributing to EFFIX

Thank you for considering contributing to EFFIX! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourname/effix.git`
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Install dependencies: `npm install`
5. Make your changes
6. Test: `npm test`
7. Build: `npm run build`
8. Commit with clear messages
9. Push and create a Pull Request

## Code Style

- Use 2-space indentation
- Follow existing code patterns
- Add comments for complex logic
- Keep files focused and modular

## Adding New Effects

1. Add CSS keyframes to appropriate file in `src/css/effects/`
2. Add class definition with custom properties
3. Update `docs/EFFECTS.md` with examples
4. Add demo example to `demo/index.html`
5. Commit with clear message

## Testing

Run tests before submitting PR:
```bash
npm test
```

## Pull Request Process

1. Update documentation for any new features
2. Ensure all tests pass
3. Add description of changes
4. Reference any related issues
5. Wait for review and feedback

## Reporting Bugs

Include:
- Description of bug
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS
- Minimal code example

## License

By contributing, you agree to license your work under the MIT License.

Thank you! 🎉
```

- [ ] **Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add contribution guidelines"
```

---

### Task 18: Create LICENSE & Final Cleanup

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Create MIT LICENSE**

```
MIT License

Copyright (c) 2026 Matt Peterman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Verify all files exist**

```bash
ls -la | grep -E "README|LICENSE|package.json"
ls -la dist/
ls -la src/css/
ls -la src/js/
```

- [ ] **Step 3: Final commit**

```bash
git add LICENSE
git commit -m "chore: add MIT license"
```

- [ ] **Step 4: Create initial git tag**

```bash
git tag v1.0.0
git log --oneline | head -20
```

- [ ] **Step 5: Verify build artifacts**

```bash
npm run build
du -h dist/*
```

Expected: Both effix.min.css and effix.min.js created and < 50KB combined

- [ ] **Step 6: Final verification commit**

```bash
git status
# Should show "On branch main, nothing to commit, working tree clean"
```

---

## Summary

**Total Tasks: 18**

All tasks completed result in:
✅ Complete project structure
✅ All CSS effect files (7 files)
✅ All JS modules (4 modules)
✅ Production bundles (CSS + JS minified)
✅ Interactive demo template
✅ Comprehensive documentation (5 guides)
✅ README and contributing guidelines
✅ MIT License
✅ Git repository with clean history

**Next Phase:** GitHub upload and NPM publication (Phase 7, not in this plan)

---

**Plan Ready for Implementation**
```

