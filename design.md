# CasaGroup Design System

## Inspiration
Editorial dark luxury — large typography, full-bleed photography, generous whitespace,
warm earthy accent tones. Inspired by high-end architecture/interior magazines.

## Color Palette
- Background Primary: `#0a0a0a` (near black)
- Background Secondary: `#111111`
- Background Card: `#161616`
- Background Elevated: `#1e1e1e`
- Accent Gold: `#c9a96e` (warm gold)
- Accent Light: `#e8d5b0` (cream)
- Text Primary: `#f0ece4` (warm white)
- Text Secondary: `#9a9085` (muted warm)
- Text Muted: `#5a554f`
- Border: `#2a2520`
- Status Green: `#4a7c59`
- Status Amber: `#b5832a`
- Status Red: `#8b3a3a`

## Typography
- Display: 'Cormorant Garamond' — serif, editorial, used for large headings
- Body/UI: 'DM Sans' — clean, modern sans-serif
- Mono: 'DM Mono' for numbers/stats

## Spacing
- Generous section padding: 120px vertical desktop, 80px mobile
- Section gap rhythm: 8, 16, 24, 32, 48, 64, 80, 120

## Cards
- Dark background #161616
- Subtle 1px border #2a2520
- Rounded corners: 12px (cards), 8px (buttons), 4px (badges)
- Soft shadow: 0 8px 40px rgba(0,0,0,0.4)
- Hover: lift + gold border glow

## Animations (Framer Motion)
- Page enter: fade + slight Y translate (20px → 0), duration 0.6s
- Scroll reveal: stagger 0.1s delay per item
- Card hover tilt: rotateX/Y ±5deg
- Hero parallax: scroll-driven Y movement
- Stats counter: animated number on viewport enter
- Transitions: ease [0.25, 0.1, 0.25, 1]

## Buttons
- Primary: gold fill, dark text, hover brighten
- Secondary: transparent + gold border
- Ghost: text only with underline reveal
- All: 44px min height, uppercase tracking-widest for primary

## Anti-patterns
- No purple/blue gradients
- No rounded pill buttons
- No generic card grid layouts
- No white backgrounds for sections
- No Inter or Roboto fonts
