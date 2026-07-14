# 🎬 EFFIX - CSS Effects Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](https://www.npmjs.com/package/effix)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/yourusername/effix)

**EFFIX** is a lightweight, open-source CSS effects framework inspired by Bootstrap. Apply powerful animations, transitions, and interactive effects to any HTML element using simple, intuitive CSS classes.

## ✨ Features

- 🎯 **Class-Based API** — Apply effects like Bootstrap classes
- 📦 **Minimal Setup** — Just one CSS file + one JS file
- ⚡ **Lightweight** — < 50KB gzipped (combined)
- 🎨 **Highly Customizable** — CSS variables + data attributes
- 🔄 **Multiple Triggers** — hover, click, scroll, load, focus, active
- 🌊 **Shape Dividers** — Animated SVG shape dividers
- 📜 **Scroll Reveals** — Smart reveal animations with stagger
- ♿ **Accessible** — Respects `prefers-reduced-motion`
- 🌐 **Modern Browsers** — No IE11, pure ES6+, zero dependencies

## 🚀 Quick Start

### Installation

#### Option 1: NPM
```bash
npm install effix
```

#### Option 2: Direct Include
```html
<link rel="stylesheet" href="https://cdn.example.com/effix.min.css">
<script src="https://cdn.example.com/effix.min.js"></script>
```

### Basic Usage

```html
<!-- Fade in on page load -->
<div class="efx-fade-in efx-load">Content fades in</div>

<!-- Bounce on hover -->
<button class="efx-bounce efx-hover">Hover me</button>

<!-- Pop on click -->
<div class="efx-pop efx-click">Click me</div>

<!-- Reveal on scroll with stagger -->
<section class="efx-scroll-reveal" data-stagger="0.1s">
  <div class="efx-fade-in">Item 1</div>
  <div class="efx-slide-up">Item 2</div>
  <div class="efx-pop-in">Item 3</div>
</section>
```

That's it! No configuration needed.

## 📚 Documentation

### Effect Classes (30+)

| Category | Classes |
|----------|---------|
| **Fades** | `efx-fade-in`, `efx-fade-out`, `efx-fade-in-up`, `efx-fade-in-down` |
| **Bounces** | `efx-bounce`, `efx-bounce-in`, `efx-bounce-out`, `efx-bounce-up`, `efx-bounce-down` |
| **Slides** | `efx-slide-up`, `efx-slide-down`, `efx-slide-left`, `efx-slide-right` |
| **Pops** | `efx-pop`, `efx-pop-in`, `efx-pop-elastic` |
| **Rotations** | `efx-rotate`, `efx-rotate-in`, `efx-spin`, `efx-spin-reverse` |
| **Scales** | `efx-scale-up`, `efx-scale-down`, `efx-zoom-in`, `efx-zoom-out` |
| **Flips** | `efx-flip-x`, `efx-flip-y`, `efx-flip-3d` |
| **Borders** | `efx-border-rotate`, `efx-border-wipe`, `efx-border-gradient`, `efx-border-pulse` |
| **Underlines** | `efx-underline-grow`, `efx-underline-left`, `efx-underline-right`, `efx-underline-center` |
| **Text** | `efx-text-reveal`, `efx-text-slide`, `efx-text-glitch`, `efx-text-wave` |
| **Scroll** | `efx-scroll-reveal`, `efx-parallax`, `efx-sticky-reveal`, `efx-progress-bar` |
| **Shapes** | `efx-divider` with 10+ SVG shapes |

### Trigger Classes

| Trigger | When | Example |
|---------|------|---------|
| `efx-hover` | On mouse hover | `<button class="efx-bounce efx-hover">` |
| `efx-click` | On element click | `<div class="efx-pop efx-click">` |
| `efx-scroll` | When element enters viewport | `<section class="efx-fade-in efx-scroll">` |
| `efx-load` | On page load | `<div class="efx-slide-up efx-load">` |
| `efx-focus` | On form input focus (CSS) | `<input class="efx-scale-up efx-focus">` |
| `efx-active` | On button/link active state (CSS) | `<button class="efx-scale-down efx-active">` |

## ⚙️ Customization

### Global CSS Variables

Override these variables to customize all effects:

```css
:root {
  --efx-duration: 0.6s;           /* Animation duration */
  --efx-easing: cubic-bezier(...); /* Easing function */
  --efx-delay: 0s;                /* Animation delay */
  --efx-stagger: 0.1s;            /* Scroll reveal stagger */
  --efx-divider-height: 100px;    /* Shape divider height */
  --efx-divider-color: currentColor; /* Shape divider color */
  --efx-divider-animate-speed: 3s; /* Animation speed */
}
```

### Per-Element Customization

Use data attributes to customize individual elements:

```html
<div class="efx-fade-in efx-scroll"
     data-duration="1.2s"
     data-easing="ease-in-out"
     data-delay="0.5s">
  Custom timing on this element
</div>
```

### Scroll Reveal with Stagger

```html
<section class="efx-scroll-reveal" data-stagger="0.15s">
  <div class="efx-fade-in">First item (0s delay)</div>
  <div class="efx-slide-up">Second item (0.15s delay)</div>
  <div class="efx-pop-in">Third item (0.30s delay)</div>
</section>
```

### Shape Dividers

```html
<div class="efx-divider" 
     data-shape="wave"
     data-height="120"
     data-color="#FF6B6B"
     data-animate="true">
</div>
```

**Available shapes:** `wave`, `triangle`, `curve`, `zigzag`, `sawtooth`, `chevron`, `swoosh`, `leaves`, `hills`, `clouds`

## 📖 Full Documentation

- **[Quick Start Guide](docs/QUICK-START.md)** — 5-minute setup
- **[Effects Reference](docs/EFFECTS.md)** — All 30+ effects with examples
- **[Shape Dividers Guide](docs/SHAPES.md)** — SVG shapes and customization
- **[Customization Guide](docs/CUSTOMIZATION.md)** — CSS variables and data attributes
- **[Trigger Types](docs/TRIGGERS.md)** — When and how to use each trigger
- **[Interactive Demo](demo/index.html)** — Live examples of all effects

## 🎯 Examples

### Hover Animation
```html
<button class="efx-bounce efx-hover">
  Click Me
</button>
```

### Scroll Reveal
```html
<section class="efx-scroll-reveal" data-stagger="0.1s">
  <h2 class="efx-fade-in">Heading</h2>
  <p class="efx-slide-up">Paragraph</p>
  <img class="efx-pop-in" src="image.jpg" />
</section>
```

### Custom Timing
```html
<div class="efx-fade-in efx-scroll"
     data-duration="1.5s"
     data-easing="cubic-bezier(0.68, -0.55, 0.265, 1.55)"
     data-delay="0.3s">
  Takes 1.5s to fade in with elastic easing
</div>
```

### Shape Divider with Animation
```html
<section style="background: linear-gradient(135deg, #667eea, #764ba2);">
  <h2>My Section</h2>
</section>

<div class="efx-divider" 
     data-shape="wave"
     data-height="150"
     data-color="white"
     data-animate="true"
     data-animation-speed="3s">
</div>

<section style="background: white;">
  <h2>Next Section</h2>
</section>
```

## 🌐 Browser Support

| Browser | Support | Version |
|---------|---------|---------|
| Chrome | ✅ | 90+ |
| Firefox | ✅ | 88+ |
| Safari | ✅ | 14+ |
| Edge | ✅ | 90+ |
| Mobile (iOS/Android) | ✅ | Modern browsers |
| Internet Explorer | ❌ | Not supported |

## 📦 File Structure

```
effix/
├── dist/
│   ├── effix.min.css       (Production CSS)
│   ├── effix.min.css.map   (CSS sourcemap)
│   ├── effix.min.js        (Production JS)
│   └── effix.min.js.map    (JS sourcemap)
├── src/
│   ├── css/                (Source CSS files)
│   ├── js/                 (Source JS files)
│   ├── templates/          (Demo template)
│   └── docs/               (Detailed documentation)
├── demo/                   (Interactive demo)
├── docs/                   (User documentation)
├── package.json
├── webpack.config.js
├── postcss.config.js
├── README.md
├── LICENSE
└── .gitignore
```

## 🛠️ Development

### Build from Source

```bash
# Install dependencies
npm install

# Build CSS and JS
npm run build

# Development mode (watch for changes)
npm run dev

# Run tests
npm run test
```

### Project Structure

- **src/css/** — Modular CSS organized by effect type
  - `base.css` — Variables and defaults
  - `effects/basic.css` — Fades, bounces, slides, pops, rotations, scales, flips
  - `effects/interactive.css` — Border and underline animations
  - `effects/text.css` — Text animations
  - `effects/scroll.css` — Scroll trigger styles
  - `effects/shapes.css` — Shape divider styles

- **src/js/** — Vanilla JavaScript modules
  - `core.js` — Main Effix class and initialization
  - `modules/scroll.js` — Scroll triggers and parallax
  - `modules/click.js` — Click event handling
  - `modules/shapes.js` — SVG shape generation

## 📝 Variables Reference

### CSS Variables

```css
--efx-duration        /* How long the animation runs (default: 0.6s) */
--efx-easing          /* Animation timing function */
--efx-delay           /* Delay before animation starts */
--efx-stagger         /* Delay between children in scroll reveal */
--efx-divider-height  /* Height of shape dividers */
--efx-divider-color   /* Color of shape dividers */
--efx-divider-animate-speed /* Speed of animated dividers */
```

### Data Attributes

```html
data-duration="0.8s"                    <!-- Override --efx-duration -->
data-easing="ease-in-out"              <!-- Override --efx-easing -->
data-delay="0.2s"                      <!-- Override --efx-delay -->
data-stagger="0.1s"                    <!-- Override --efx-stagger (for containers) -->
data-shape="wave"                      <!-- Shape divider type -->
data-height="100"                      <!-- Divider height in px -->
data-color="#FF6B6B"                   <!-- Divider fill color -->
data-animate="true"                    <!-- Animate divider -->
data-animation-speed="3s"              <!-- Divider animation speed -->
data-flip="true"                       <!-- Flip divider horizontally -->
```

## 📄 License

MIT License © 2026 — See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Before You Submit

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-effect`)
3. Commit your changes (`git commit -am 'Add amazing effect'`)
4. Push to the branch (`git push origin feature/amazing-effect`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🐛 Reporting Issues

Found a bug? Please open an issue on [GitHub](https://github.com/yourusername/effix/issues) with:

- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or minimal example

## 🎯 Roadmap

### v1.0 (Current)
- ✅ 30+ effects across 7 categories
- ✅ 6 trigger types (hover, click, scroll, load, focus, active)
- ✅ 10 shape divider types
- ✅ Full customization via CSS variables and data attributes
- ✅ Comprehensive documentation
- ✅ Interactive demo

### v1.1 (Planned)
- 3D WebGL effects
- More shape dividers
- React/Vue component wrappers
- CDN distribution
- TypeScript definitions

### v2.0 (Future)
- Motion path animations
- Drag/drop effects
- Advanced timing controls
- Plugin system
- Builder UI

## 📮 Questions?

- 💬 Check the [documentation](docs/)
- 🎬 View the [interactive demo](demo/index.html)
- 📖 See [QUICK-START.md](docs/QUICK-START.md)
- 🐛 [Open an issue](https://github.com/yourusername/effix/issues)

## 🎉 Support EFFIX

If you find EFFIX useful, please consider:

- ⭐ Starring the repository
- 📢 Sharing with others
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code

## 👨‍💻 Author

**Matt Peterman** — [GitHub](https://github.com/yourusername) | [Twitter](https://twitter.com/yourusername)

---

**Made with ❤️ for developers who care about smooth, beautiful animations.**

Built with modern web standards. Zero dependencies. Infinitely customizable.

**[Get Started →](docs/QUICK-START.md)** | **[View Demo →](demo/index.html)** | **[Full Docs →](docs/)**
