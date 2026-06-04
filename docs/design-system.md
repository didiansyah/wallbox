# Wallbox Design System

Wallbox uses a Cloudflare-inspired UI/UX: infrastructure-grade, developer-friendly, security-focused, and operational.

## Direction

- Visual mood: credible infrastructure product, not playful AI SaaS.
- Palette: Cloudflare orange, warm cream, charcoal, restrained neutral surfaces.
- Typography: Inter/Geist/System sans-serif. No serif headlines.
- UI motifs: edge network maps, dotted grids, thin connection lines, request pipelines, certificate chains.
- Icons: Lucide line icons only. No emoji.
- Motion: subtle status pulses and verification progress. Avoid glossy or playful motion.

## Tokens

```css
:root {
  --background: #fff7ed;
  --foreground: #111111;
  --primary: #f6821f;
  --primary-foreground: #111111;
  --secondary: #ffffff;
  --secondary-foreground: #111111;
  --accent: #faae40;
  --accent-foreground: #111111;
  --muted: #f5eadc;
  --muted-foreground: #6b5f55;
  --card: #ffffff;
  --card-foreground: #111111;
  --border: #eadccf;
  --ring: #f6821f;
  --success: #15803d;
  --warning: #b45309;
  --destructive: #b91c1c;
}

.dark {
  --background: #0f0b08;
  --foreground: #fff7ed;
  --primary: #f6821f;
  --primary-foreground: #111111;
  --secondary: #1a1410;
  --secondary-foreground: #fff7ed;
  --accent: #faae40;
  --accent-foreground: #111111;
  --muted: #241a14;
  --muted-foreground: #b8a99b;
  --card: #17110d;
  --card-foreground: #fff7ed;
  --border: #33261d;
  --ring: #f6821f;
  --success: #22c55e;
  --warning: #f59e0b;
  --destructive: #ef4444;
}
```

## Landing page structure

1. Header: sticky, compact, warm cream/white blur, border-bottom.
2. Hero: left copy + right dark console preview.
3. Problem: agents act without auditability.
4. How it works: Record → Store → Certify → Verify.
5. Product console: run ID, capsule hash, Walrus blob ID, Sui certificate ID.
6. Use cases: trading agents, research agents, coding agents, enterprise workflows.
7. Final CTA: run demo / verify certificate.

## Component rules

- Buttons: orange primary, white/charcoal secondary; medium radius, not pill-heavy.
- Cards: border, warm off-white, 12–16px radius, orange top/left rail accents.
- Code blocks: dark charcoal surface, orange highlights, monospace.
- Status chips: orange for in-progress, green only for verified, amber for warnings, red for tampered.
- Background: subtle dotted grid or network lines. Do not use blue/teal tints.
