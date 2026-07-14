# Contributing to EFFIX

Thank you for your interest in contributing to EFFIX! We welcome contributions from everyone.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/effix.git
   cd effix
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```

## Development Workflow

### Building
```bash
npm run build        # Build production files
npm run dev         # Watch mode for development
npm run test        # Run tests
```

### File Organization

- **CSS Changes:** Edit files in `src/css/`
  - `src/css/effects/basic.css` — Basic animations (fades, bounces, etc.)
  - `src/css/effects/interactive.css` — Border and underline effects
  - `src/css/effects/text.css` — Text animations
  - `src/css/effects/scroll.css` — Scroll trigger styles
  - `src/css/effects/shapes.css` — Shape divider styles
  - `src/css/base.css` — Variables and defaults

- **JavaScript Changes:** Edit files in `src/js/`
  - `src/js/core.js` — Main Effix class
  - `src/js/modules/scroll.js` — Scroll detection and parallax
  - `src/js/modules/click.js` — Click event handling
  - `src/js/modules/shapes.js` — SVG shape generation

- **Documentation:** Edit files in `docs/`
  - `docs/QUICK-START.md` — Quick start guide
  - `docs/EFFECTS.md` — Effect reference
  - `docs/SHAPES.md` — Shape dividers guide
  - `docs/CUSTOMIZATION.md` — Customization options
  - `docs/TRIGGERS.md` — Trigger types

### Adding a New Effect

1. **Add CSS animation and class** to appropriate file in `src/css/effects/`
   ```css
   @keyframes efx-my-effect {
     from { /* initial state */ }
     to { /* final state */ }
   }
   
   .efx-my-effect {
     animation: efx-my-effect var(--efx-duration) var(--efx-easing) var(--efx-delay) 1 forwards;
   }
   ```

2. **Add to demo** in `src/templates/demo.html`
   ```html
   <div class="demo-box">
     <div class="demo-element efx-my-effect">My Effect</div>
     <code>efx-my-effect</code>
   </div>
   ```

3. **Document in** `docs/EFFECTS.md`
   ```markdown
   - `efx-my-effect` — Description of what the effect does
   ```

4. **Build and test**
   ```bash
   npm run build
   # Test in demo/index.html
   ```

5. **Commit with clear message**
   ```bash
   git commit -m "feat: add efx-my-effect animation"
   ```

## Commit Messages

Follow conventional commits format:

```
feat: add new effect or feature
fix: fix a bug
docs: update documentation
style: CSS or formatting changes
refactor: code reorganization
perf: performance improvements
test: add or update tests
chore: build, dependencies, etc.
```

Examples:
- `feat: add efx-glow-pulse effect`
- `fix: scroll reveal stagger not working on mobile`
- `docs: update customization guide`
- `perf: optimize parallax scroll calculations`

## Testing

### Manual Testing
1. Build: `npm run build`
2. Open `demo/index.html` in a browser
3. Test all effects on desktop and mobile
4. Check console for errors

### Effects to Test
- [ ] Animation plays
- [ ] Animation duration is correct
- [ ] Custom timing works (data-duration, data-easing, data-delay)
- [ ] Trigger works (hover, click, scroll, load)
- [ ] Respects prefers-reduced-motion
- [ ] No layout shifts
- [ ] Smooth 60fps on modern hardware

## Code Style

### CSS
- Use CSS custom properties for all variables
- Group related keyframes and classes
- Add comments for complex animations
- Ensure browser prefixes where needed (autoprefixer handles this)

### JavaScript
- Use ES6+ syntax
- Write clear variable names
- Add comments for complex logic
- Keep functions focused and reusable
- Use const/let, not var

### General
- Indentation: 2 spaces
- No trailing whitespace
- Max line length: ~100 characters for readability

## Performance Checklist

Before submitting a PR:
- [ ] Bundle size is appropriate (< 50KB gzipped)
- [ ] No console errors or warnings
- [ ] Animations run at 60fps
- [ ] No layout thrashing (excessive reflows)
- [ ] Minimal JavaScript in critical path
- [ ] CSS uses will-change sparingly
- [ ] Code is minified in production build

## Documentation

When adding features, update relevant documentation:
- `README.md` — If feature is significant
- `docs/EFFECTS.md` — If adding an effect
- `docs/SHAPES.md` — If adding a shape divider
- `docs/CUSTOMIZATION.md` — If adding customization options
- `docs/TRIGGERS.md` — If adding a trigger type
- Code comments — For complex implementations
- `demo/index.html` — Working examples

## Submitting a Pull Request

1. **Ensure your code is tested** and builds without errors
2. **Update documentation** for any new features
3. **Add examples** to the demo
4. **Write a clear PR description** including:
   - What problem does this solve?
   - How does it work?
   - Any breaking changes?
   - Testing notes
5. **Reference related issues** using `#issue-number`

Example PR description:
```markdown
## Description
Adds a new `efx-glow-pulse` effect for glowing animations.

## Problem
Users wanted a pulsing glow effect for CTAs and highlights.

## Solution
Added keyframes for glow-pulse animation with customizable intensity.

## Testing
- Tested on Chrome, Firefox, Safari
- Demo added: demo-box with example
- Works with all triggers
- Respects prefers-reduced-motion

## Checklist
- [x] Code builds without errors
- [x] Documentation updated
- [x] Demo examples added
- [x] Tested on desktop and mobile
```

## Reporting Bugs

When reporting bugs, include:
- **Browser/Device:** Chrome 120, macOS 14, etc.
- **Reproduction steps:** Clear steps to reproduce
- **Expected vs actual:** What should happen vs what happened
- **Error message:** Any console errors
- **Minimal example:** CodePen, JSFiddle, or code snippet

## Feature Requests

For feature requests, describe:
- **Use case:** Why is this needed?
- **Expected behavior:** How should it work?
- **Examples:** Similar libraries or solutions
- **Alternatives:** Any workarounds?

## Questions?

- 📖 Check the [documentation](docs/)
- 💬 Open an [issue](https://github.com/yourusername/effix/issues)
- 📧 Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under EFFIX's MIT License.

---

Thank you for making EFFIX better! 🎉
