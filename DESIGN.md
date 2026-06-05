---
version: alpha
name: Wallbox Oxide Console
description: Dark infrastructure-grade Wallbox UI inspired by oxide.computer: hard-edged panels, technical figure labels, product-console layouts, near-black backgrounds, and green verification accents.
colors:
  background: "#080F11"
  backgroundRaised: "#0D1316"
  panel: "#101618"
  panelAlt: "#151B1E"
  panelHigh: "#1F2427"
  border: "#292F31"
  borderStrong: "#3A4245"
  text: "#E7EAEB"
  textSoft: "#B8BDBF"
  textMuted: "#7E8385"
  textDim: "#4D5558"
  accent: "#00D497"
  accentFg: "#001F1A"
  accentBg: "#003931"
  accentBorder: "#236A4C"
  warning: "#FEBB55"
  danger: "#FF6785"
  purple: "#C58CFF"
typography:
  h1:
    fontFamily: Geist
    fontSize: 4.5rem
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.055em"
  h2:
    fontFamily: Geist
    fontSize: 3.5rem
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.045em"
  h3:
    fontFamily: Geist
    fontSize: 1.375rem
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body-md:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.012em"
  mono-label:
    fontFamily: Geist Mono
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  none: 0px
  sm: 2px
  md: 4px
spacing:
  xs: 6px
  sm: 12px
  md: 20px
  lg: 40px
  xl: 72px
  section: 112px
components:
  button-primary:
    backgroundColor: "{colors.accentBg}"
    textColor: "{colors.accent}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.textSoft}"
    rounded: "{rounded.sm}"
    padding: 12px
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: 28px
  status-verified:
    backgroundColor: "{colors.accentBg}"
    textColor: "{colors.accent}"
    rounded: "{rounded.sm}"
    padding: 6px
---

## Overview

Wallbox should feel like an operational infrastructure console, not a friendly marketing SaaS page. Use oxide.computer as the visual reference: dark blue-black surfaces, thin technical borders, product UI fragments, figure labels, monospace metadata, and one electric green verification accent.

The product story is a “flight recorder for AI agents,” so the UI should look like evidence infrastructure: console windows, audit tables, certificate panels, hash comparisons, storage/certificate diagrams, and data-grid backgrounds.

## Colors

- **Background (#080F11):** primary page canvas. Never pure black; keep the subtle green-blue industrial cast.
- **Panel (#101618) / PanelAlt (#151B1E):** cards, consoles, and feature modules.
- **Border (#292F31):** hairline structure. Use borders instead of shadows.
- **Text (#E7EAEB):** high-emphasis headings and primary values.
- **Muted (#7E8385):** body copy, captions, and secondary labels.
- **Accent (#00D497):** verification green. Use only for live status, primary CTA, links, hashes, LEDs, and successful states.
- **Warning / Danger / Purple:** only inside diagrams/status states, never as broad brand colors.

Avoid the previous orange/cream Wallbox palette for this redesign. Avoid gradients except very subtle green glow behind console/product visuals.

## Typography

Use Geist as the local substitute for Oxide’s Suisse-style sans, and Geist Mono as the substitute for GT America Mono.

- Marketing headlines are large, regular-weight, tight line-height, negative tracking.
- Section labels, nav, buttons, figure labels, status pills, and hashes use monospace uppercase.
- Body text is muted, compact, and technical.
- Do not use serif typography. Do not use playful rounded UI fonts.

## Layout

- Max container: `1440px`; side padding `40px` desktop, `20px` mobile.
- Sections use large vertical rhythm (`96–128px`) with dark backgrounds that bleed together.
- Prefer asymmetric split layouts: text/terminal on left, console/hardware-style visual on right.
- Use hard rectangular panels with thin borders. Border radius should be `0–4px`, not pill/rounded SaaS cards.
- Place decorative backgrounds as radial dot fields, grid lines, LED bars, and figure captions, especially behind hero and console sections.

## Elevation & Depth

Oxide-like depth comes from:

- nested dark panels,
- subtle inset borders,
- low-opacity green glows,
- technical grid/dot overlays,
- overlapping console frames.

Avoid drop shadows on light cards. If depth is needed, use `box-shadow: 0 0 80px rgba(0,212,151,.08)` or inset borders.

## Shapes

- Rectangles and hairline dividers dominate.
- Radius: `0px` for major panels, `2–4px` for buttons/pills/input controls.
- Status badges are compact rectangles, not rounded pills.
- Icons should be Lucide line icons or simple CSS/SVG schematic marks.

## Components

- **Header:** sticky, dark, 56–64px high, thin bottom border. Logo left; nav links uppercase monospace; compact CTAs right.
- **Primary CTA:** dark green fill, electric green text, mono uppercase, square corners.
- **Secondary CTA:** transparent/dark panel with border, muted text.
- **Hero:** left stack: small console tabs/status label + large headline. Right: large audit console/hardware-style mockup. Include `FIG. 01` label and dot/grid field.
- **Feature cards:** rectangular technical modules. Each card must include a mini UI artifact: terminal output, hash row, storage bars, certificate timeline, or verifier table.
- **Verification console:** dense table/list UI, status badges, hash comparison, file checklist.
- **Run page:** should look like an execution console with five pipeline stages, not a generic form.
- **Footer/CTA:** dark section with split headline and two compact buttons, plus LED/data-bar decoration.

## Do's and Don'ts

Do:
- Use dark industrial surfaces and electric green as the single action/accent color.
- Use `FIG.` labels, `RUNNING`, `VERIFIED`, `TESTNET`, and hash snippets as visual texture.
- Build real-feeling product UI fragments instead of abstract illustrations.
- Keep copy direct, technical, and evidence-focused.
- Keep production mode visibly `TESTNET` until mainnet ops are ready.

Don’t:
- Don’t use orange/cream Midday/Cloudflare colors for this Wallbox iteration.
- Don’t use big rounded cards, emoji, bubbly gradients, or generic SaaS icon grids.
- Don’t overuse accent green; it should feel like LEDs/status, not decoration everywhere.
- Don’t claim “truth verified.” Use “integrity verified.”
