# Corlith — Cinematic SEO Agency

A premium, cinematic website for a fictional SEO studio. Built with vanilla HTML/CSS/JS, **Three.js** (3D), **GSAP** (animations), **ScrollTrigger** (scroll-driven effects), and **Lenis** (smooth scrolling).

## Stack

- **HTML / CSS / Vanilla JS** — no build step
- **Three.js r128** — hero + contact 3D scenes (wireframe icosahedron core, particle field, wave grid)
- **GSAP 3.12** + **ScrollTrigger** — cinematic scroll-driven reveals, parallax, text masking
- **Lenis 1.1** — buttery smooth scroll
- **Space Grotesk + Inter** — typography

## Features

- Animated preloader with count-up + slide-out
- Custom blend-mode cursor with hover states
- Hero: wireframe icosahedron + 1,800 particle field, mouse-reactive, scroll-zoom camera
- Section title reveal with masked words
- Stat counters that count up on scroll
- Service rows with horizontal hover-slide
- Case study cards with rotating arrow
- Process timeline
- Footer giant text with parallax
- Contact section with a separate 3D wave grid + rings
- Fully responsive (mobile, tablet, desktop)

## Run

Drop the `corlith/` folder on any static host. No build, no install.

Quick local preview:
```bash
cd corlith
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

## File map

```
corlith/
├── index.html          # markup
├── css/
│   └── style.css       # full design system
├── js/
│   ├── main.js         # cursor, Lenis, preloader, GSAP timeline
│   ├── three-hero.js   # icosahedron + particle field
│   └── three-contact.js# wave grid + rings
└── assets/             # (empty — drop fonts/icons here)
```

## Customise

- **Accent color** — change `--accent` in `css/style.css` (currently `#e6ff55`)
- **3D model swap** — replace the `IcosahedronGeometry` in `js/three-hero.js` with `GLTFLoader` + your own `.glb`
- **Copy** — all section text is in `index.html`
- **Add a real `.glb`** — drop into `assets/`, add `<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>`, then `loader.load('assets/your.glb', ...)`