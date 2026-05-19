<div align="center">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width="72" height="72">
  <polygon points="10,56 50,56 42,38 18,38" fill="#2a2a2a" opacity="0.22"/>
  <polygon points="8,54 46,54 8,20" fill="#2E7D32" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
  <polygon points="18,44 56,44 18,10" fill="#C8262A" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
</svg>

# PT. ARBRION ASIA

**Cable Tray & Cable Ladder Manufacturer — Est. 2007**

*Depok, West Java, Indonesia*

---

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r184-black?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org)
[![Anime.js](https://img.shields.io/badge/Anime.js-4.x-FF6B6B?style=flat-square)](https://animejs.com)
[![ISO 9001](https://img.shields.io/badge/ISO-9001%20Certified-0057A8?style=flat-square)](https://arbrion-asia.com)
[![License](https://img.shields.io/badge/License-Proprietary-gray?style=flat-square)](./LICENSE)

</div>

---

## Overview

Official company website for **PT. Arbrion Asia**, a manufacturer of industrial cable management systems including cable trays, cable ladders, and accessories — certified ISO 9001 and serving construction projects across Indonesia since 2007.

The site is a high-performance, bilingual (ID/EN) single-page application built with vanilla JavaScript, featuring real-time 3D product visualization powered by Three.js, smooth scroll-driven animations via Anime.js, and a fully responsive mobile-first design.

---

## Features

| Feature | Description |
|---|---|
| **3D Product Viewer** | Interactive Three.js models for each product type — rotate, zoom, inspect cross-sections |
| **Bilingual** | Full Indonesian / English toggle with live re-render, no page reload |
| **Product Catalog** | 6 product types with filter tabs, spec drawer, and WhatsApp CTA per product |
| **Mobile Slider** | Full-width swipe slider with prev/next navigation for catalog on mobile |
| **PDF Downloads** | Direct download links for product brochures and technical catalogs |
| **ISO Certificate Viewer** | Inline certificate display |
| **WhatsApp Integration** | Floating action button + direct sales team contact with pre-filled messages |
| **Scroll Animations** | Entrance animations on all sections using Anime.js |
| **Performance** | Lazy-loaded assets, low-power GPU mode detection, minimal dependencies |

---

## Product Range

| Product | Code | Description |
|---|---|---|
| Cable Tray Tipe C | `type-c` | Perforated C-channel, 100–500 mm width |
| Cable Tray Tipe U | `type-u` | Solid U-profile, dust & moisture resistant |
| Cable Tray Tipe W | `type-w` | Wide-body with centre divider, 300–600 mm |
| Cable Tray Heavy Duty | `heavy-duty` | Hot-rolled steel, up to 120 mm depth |
| Cable Ladder | `cable-ladder` | Open rung ladder system, up to 200 kg/m |
| Cover / Tutup | `cover` | Flat solid lid with downward lips, no perforations |

All products available in **Galvanised (Hot-Dip)**, **Powder Coat**, **Galvanised Z350**, and **SS304** finishes.

---

## Tech Stack

```
Frontend      Vanilla JavaScript (ES Modules)
Bundler       Vite 8.x
3D Engine     Three.js r184
Animation     Anime.js 4.x
Fonts         Barlow Condensed · IBM Plex Sans · IBM Plex Mono
Styling       Pure CSS with custom properties (no framework)
i18n          Custom lightweight translation layer (ID / EN)
```

---

## Project Structure

```
arbrion-asia/
├── public/
│   └── assets/
│       ├── logo.svg                  # Company logo (SVG)
│       ├── about-factory.jpg         # Factory photo
│       ├── hero-tray.png             # Hero background
│       ├── Brosur ASIA.pdf           # Product brochure
│       └── ...
├── src/
│   ├── main.js                       # App entry — init, catalog, drawer, slider
│   ├── style.css                     # All styles, design tokens, responsive
│   ├── scene/
│   │   ├── three-scenes.js           # 3D product builders (Type C/U/W/HD/CL/Cover)
│   │   └── product-data.js           # Spec data per product
│   └── i18n/
│       └── translations.js           # ID/EN string table + contact/marketer data
├── index.html                        # Single-page HTML shell
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
git clone https://github.com/your-org/arbrion-asia.git
cd arbrion-asia
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` with hot module replacement.

### Build

```bash
npm run build
```

Output in `dist/`. Optimised, tree-shaken, hashed assets.

### Preview Production Build

```bash
npm run preview
```

---

## Deployment

The `dist/` folder is a fully static site — deploy to any static host:

| Platform | Command |
|---|---|
| Vercel | `vercel --prod` |
| Netlify | Drag & drop `dist/` or `netlify deploy --prod` |
| GitHub Pages | Push `dist/` to `gh-pages` branch |
| Nginx / Apache | Serve `dist/` as document root |

> **Note:** All routes resolve to `index.html`. Configure your host to serve `index.html` for all paths if using hash-less routing.

---

## Contact

**PT. Arbrion Asia**

| | |
|---|---|
| Address | Jl. Bulan Raya No. 27B Mekarsari, Cimanggis — Depok, Jawa Barat |
| Phone | 021 29374932 |
| Fax | 021 29374931 |
| Email | info@arbrion-asia.com |
| Hours | Mon–Fri 08:00–17:00 WIB |

**Sales Team**

| Name | Role | WhatsApp |
|---|---|---|
| Dhaya | Marketing Jakarta | +62 858-1115-7844 |
| Ady | Technical Sales | +62 881-1729-776 |
| Darmanto | Project Coordinator | +62 813-2576-8815 |

---

## License

Copyright © 2007–2026 PT. Arbrion Asia. All rights reserved.

This codebase is proprietary. Unauthorised reproduction, distribution, or modification is prohibited without written permission from PT. Arbrion Asia.
