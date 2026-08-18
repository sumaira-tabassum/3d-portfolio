# CLAUDE.md — Portfolio Project Context

## Project Overview

**[Your Agency Name]** — a premium scroll-animation portfolio website for a software development & consulting studio.

- Stack: Next.js 14 (App Router, TypeScript), Tailwind CSS, HTML5 Canvas API
- No Three.js. No GSAP. Canvas only.
- Fonts: Space Grotesk (headings) + Inter (body) from Google Fonts
- Deploy target: Vercel

---

## Brand Identity

| Key | Value |
|---|---|
| Name | [Your Agency Name] |
| Tagline | Code, Perfected. |
| Sub-tagline | Software development & consulting. Built to last. |
| Aesthetic | Linear meets Vercel meets Apple.com — precise, dark, confident |
| Feel | Standing in a clean, quiet studio at midnight, one spotlight, total focus. Premium, technical, trustworthy. |

---

## Color System

```
--bg-deep: #05070A;         /* near-black charcoal — main background */
--bg-section: #0A0D12;      /* deep charcoal */
--bg-card: #10141A;         /* card background */
--cyan: #2DD4BF;            /* primary accent */
--cyan-light: #5EEAD4;      /* bright cyan — glows and highlights */
--cyan-dim: #164E48;        /* muted cyan for borders/dividers */
--cream: #F1F5F4;           /* primary text */
--cream-muted: #8FA3A0;     /* secondary text */
--gradient-hero: linear-gradient(180deg, #05070A 0%, #0A0D12 50%, #05070A 100%);
--gradient-cyan: linear-gradient(135deg, #2DD4BF 0%, #5EEAD4 50%, #2DD4BF 100%);
--gradient-text: linear-gradient(135deg, #F1F5F4 0%, #2DD4BF 40%, #5EEAD4 100%);
```

---

## Typography System

### Google Fonts Import (in layout.tsx)
- Space Grotesk: weights 300, 400, 500, 600, 700
- Inter: weights 300, 400, 500

### Scale (desktop)

| Role | Size | Weight | Letter-spacing | Font | Notes |
|---|---|---|---|---|---|
| Display | 96px | 300 | -2px | Space Grotesk | Hero/CTA |
| H1 | 72px | 400 | -1.5px | Space Grotesk | |
| H2 | 48px | 500 | -1px | Space Grotesk | |
| H3 | 30px | 500 | — | Space Grotesk | |
| Body | 16px | 300 | — | Inter | line-height 1.85 |
| Caption | 11px | 400 | 4px | Inter | UPPERCASE |
| CTA | 13px | 500 | 3px | Inter | UPPERCASE |

---

## Scroll Animation Architecture

### Source
- Video file: `scroll-animation.mp4` in project root (your Kling-generated bracket video)
- Extract frames: `ffmpeg -i scroll-animation.mp4 -vf fps=30 public/frames/frame_%04d.webp`
- Output format: `.webp` to `/public/frames/`

### Canvas Setup
- Full viewport, `position: sticky`, background `#05070A`
- Total scroll height: 500vh
- Frame driven by scroll progress (0–1)
- Cool cyan radial glow behind canvas: `radial-gradient(rgba(45,212,191,0.07) at center)` — gives the bracket object a quiet, focused emanation

### 3-Act Story

| Act | Scroll % | Scene |
|---|---|---|
| 1 | 0–28% | Perfect bracket sculpture, sealed, still, floating in dark space |
| 2 | 30–68% | Bracket splits apart → cyan light and fragments erupt outward |
| 3 | 72–100% | Everything flows back → bracket reforms → returns to stillness |

---

## Text Overlay Specs

### Section 1 — Intro (visible 0%–22%)
- Position: bottom-left, 10% from left, 15% from bottom
- Label: SOFTWARE DEVELOPMENT — 11px Inter, letter-spacing 4px, color `#2DD4BF`, uppercase
- Headline: "Code,\nPerfected." — 80px Space Grotesk, weight 300, gradient text `#F1F5F4` → `#2DD4BF`, line-height 1.0
- Subtext: "No shortcuts. Built right." — 16px Inter weight 300, color `#8FA3A0`, margin-top 24px

### Section 2 — The Build (visible 30%–55%)
- Position: top-right, 8% from right, 18% from top
- Label: INSIDE THE PROCESS — same label style
- Headline: "Structure.\nBroken open." — 72px Space Grotesk, weight 400, color `#F1F5F4`
- Subtext: "Every project, taken apart and rebuilt right." — same subtext style, color `#8FA3A0`

### Section 3 — The Return (visible 60%–78%)
- Position: center, perfectly centered horizontally
- Label: BACK TO CLARITY — centered
- Headline: "Clean.\nSolid.\nDone." — 88px Space Grotesk, weight 300, gradient `#2DD4BF` → `#5EEAD4` → `#F1F5F4`, centered
- Subtext: "Every line earning its place." — centered, color `#8FA3A0`

### Section 4 — CTA (visible 84%–100%)
- Position: perfectly centered
- Headline: "Let's build\nsomething." — 92px Space Grotesk, weight 300, color `#F1F5F4`, centered
- Subtext: "Software development & consulting, done right." — 15px Inter, color `#8FA3A0`, centered
- CTA Button:
  - Text: `START A PROJECT →`
  - 13px Inter, weight 500, letter-spacing 3px
  - Background: `linear-gradient(135deg, #2DD4BF, #5EEAD4)`
  - Color: `#05070A`
  - Padding: 18px 52px
  - Border-radius: 0px (sharp — precise, not soft)
  - Hover: `scale(1.03)` with 0.3s ease
  - Box-shadow: `0 0 50px rgba(45,212,191,0.4)`

---

## Navbar

- Fixed, full width, initially transparent
- After scroll past 100px: `background: rgba(5,7,10,0.88)`, `backdrop-filter: blur(20px)`
- Left: `[YOUR AGENCY NAME]` — 13px Inter, weight 500, letter-spacing 4px, color `#F1F5F4`
- Right links: `Work · Services · Contact` — 12px Inter, letter-spacing 2px, color `#8FA3A0`, hover → `#2DD4BF` with 0.3s transition
- Far right pill: `LET'S TALK`
  - Border: 1px solid `#2DD4BF`, color `#2DD4BF`, padding 8px 20px, border-radius 2px
  - Hover: background `#2DD4BF`, color `#05070A`

---

## Loading Screen

- Background: `#05070A`
- Center: `[AGENCY NAME]` — 14px Inter, letter-spacing 6px, color `#2DD4BF`
- Progress bar: 200px wide, 1px height
  - Track: `rgba(255,255,255,0.08)`
  - Fill: `linear-gradient(90deg, #2DD4BF, #5EEAD4)`
- Below bar: percentage counter — 11px Inter, color `#8FA3A0`
- Dismiss: 0.8s opacity fade when frames fully loaded
- Site does not render until 100% of frames are preloaded

---

## Below-Fold Sections

### Services Section (replaces "Origin Section")
- Background: `#0A0D12`, full bleed
- 3 columns: `DEVELOPMENT / CONSULTING / DESIGN` (edit to match your actual services)
  - Each: cyan SVG icon, 11px cyan label, 24px Space Grotesk heading, 15px Inter body in `#8FA3A0`
- Column dividers: 1px solid `rgba(45,212,191,0.12)`

### Process Quote Section
- Background: `#05070A`, full bleed
- Centered quote: "From first line\nto final deploy." — 48px Space Grotesk, color `#F1F5F4`, centered
- Cyan divider: 60px wide, 1px, centered, color `#2DD4BF`

### Work Section (replaces "Ingredients Section")
- Background: `#0A0D12`
- 2–3 floating project cards:
  - Card bg: `#10141A`, border: 1px solid `rgba(45,212,191,0.15)`, border-radius 4px, padding 40px
  - Each: project name (Space Grotesk), short description (Inter), tech stack tags
  - Hover: `border-color rgba(45,212,191,0.5)`, `translateY(-4px)` with transition
  - **Fill in with your real or sample projects here**

### Final CTA Section
- Background: `linear-gradient(180deg, #0A0D12, #05070A)`
- Centered "Let's build something." heading
- Same cyan CTA button as scroll overlay

---

## Micro-Details (Non-Negotiable)

### Grain Texture Overlay
```css
/* Full page, pointer-events: none, z-index top */
/* SVG feTurbulence filter noise */
opacity: 0.04;
position: fixed;
inset: 0;
pointer-events: none;
```

### Scroll Progress Bar
- `position: fixed`, top 0, left 0
- height: 1px, background: `linear-gradient(90deg, #2DD4BF, #5EEAD4)`
- Width driven by `window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100`

### Custom Cursor
- Inner: 8px filled circle, color `#2DD4BF`
- Outer: 28px ring, border: 1px solid `#2DD4BF`, follows with ~100ms lag
- On CTA hover: outer ring scales to 48px

### Cool Cyan Canvas Glow
- `radial-gradient(rgba(45,212,191,0.07) at center)` positioned behind canvas
- Gives the bracket object a quiet, focused emanation

### Page Transition
- Fade in on load: `opacity 0 → 1` over 0.7s

---

## Performance Rules

- Preload ALL frames before showing any content
- Use `requestAnimationFrame` for canvas rendering — never `setInterval`
- Mobile (< 768px): skip every 2nd frame
- Cache frames: source `/frames/:path*`, `Cache-Control: public, max-age=31536000, immutable`
- All frame images must be `.webp`

---

## SEO & Metadata

```
title: '[Your Agency Name] — Code, Perfected.'
description: 'Software development & consulting. No shortcuts, built right.'
themeColor: '#05070A'
openGraph.images: ['/frames/frame_0001.webp']
```

---

## File Structure Reference

```
/
├── public/
│   └── frames/                    ← .webp frames extracted from video
├── app/
│   ├── layout.tsx                 ← fonts, metadata, grain overlay, cursor
│   ├── page.tsx                   ← main scroll page
│   └── globals.css                ← CSS variables, base resets
├── components/
│   ├── Navbar.tsx
│   ├── LoadingScreen.tsx
│   ├── ScrollCanvas.tsx           ← Canvas + frame animation + cyan glow
│   ├── TextOverlay.tsx            ← Section text with opacity transitions
│   ├── ServicesSection.tsx
│   ├── ProcessQuote.tsx
│   ├── WorkSection.tsx
│   └── FinalCTA.tsx
├── hooks/
│   └── useScrollProgress.ts
├── scroll-animation.mp4
└── next.config.js
```

---

## Claude Code Behavior Rules

- Never use Three.js, GSAP, Framer Motion, or any animation library — Canvas + CSS only
- Every color must reference the CSS variable system above — no hardcoded hex in components
- Tailwind for layout/spacing only; typography and color styles via CSS variables
- Always build mobile-responsive (frame-skip logic on < 768px)
- Prioritize perceived performance: loading screen → instant canvas → lazy below-fold sections
- The cool cyan canvas glow is mandatory — it is central to the "precise, technical, midnight studio" atmosphere
- Every section must feel clean, confident, and technical — check the design philosophy before writing any new component

---

## To Fill In Before Building

- [ ] Replace `[Your Agency Name]` everywhere with your real agency name
- [ ] Confirm/edit the 3 services listed in Services Section
- [ ] Add 2–3 real or sample projects to Work Section
- [ ] Confirm tagline/sub-tagline wording with your senior
