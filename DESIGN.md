# DESIGN.md — Sistema de Diseño de Me Gusta Colombia

> Agentes: lean este archivo antes de diseñar o implementar cualquier cosa que tenga UI.
> Fuente canónica: `src/app/globals.css` + `src/app/layout.tsx`

---

## 1. Color tokens

Definidos en `globals.css` vía `@theme inline`. Usar siempre las CSS vars o los hex literales, no clases Tailwind con opacidad (`/XX`) sobre vars de color.

| Var | Hex | Uso |
|-----|-----|-----|
| `--color-bg-dark` | `#0a0a0a` | Fondo de página |
| `--color-bg-card` | `#141414` | Cards, modales, sidebars |
| `--color-bg-card-hover` | `#1a1a1a` | Estado hover de cards |
| `--color-gold` | `#d4a843` | CTA primario, precios, highlights |
| `--color-gold-light` | `#e8c96a` | Hover de elementos gold |
| `--color-gold-dim` | `#b8922e` | Labels, badges secundarios |
| `--color-text-primary` | `#f5f5f5` | Títulos, texto principal |
| `--color-text-secondary` | `#a0a0a0` | Subtítulos, descripciones |
| `--color-text-muted` | `#666666` | Metadata, timestamps |
| `--color-border` | `#2a2a2a` | Bordes de cards y dividers |

### Accents de ciudad

| Ciudad | Var | Hex |
|--------|-----|-----|
| Bogotá | `--color-bogota` | `#c0392b` |
| Medellín | `--color-medellin` | `#27ae60` |
| Cartagena | `--color-cartagena` | `#2980b9` |

---

## 2. Tipografía

| Rol | Font | Class Tailwind |
|-----|------|----------------|
| Cuerpo | Geist Sans | `font-sans` |
| Monospace / precios | Geist Mono | `font-mono` |
| Headings | Geist Sans | `font-bold` o `font-extrabold` |

**Tamaños mínimos:**
- PDFs móvil: `18px` body, `28px` line-height — los usuarios leen en el aeropuerto en celular
- IG Carousels: `64-96px` headline — se lee en feed a ⅓ del tamaño real

---

## 3. Patrones de componentes

### Hero con imagen de fondo

```tsx
// ✅ CORRECTO — rgba explícito
<div style={{ background: "rgba(10,10,10,0.65)" }} className="absolute inset-0" />

// ❌ INCORRECTO — Tailwind v4 resuelve bg-background/85 demasiado oscuro
<div className="absolute inset-0 bg-background/85" />
```

### Card estándar

```tsx
<div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-6">
  <h3 className="text-[#f5f5f5] font-bold">Título</h3>
  <p className="text-[#a0a0a0]">Descripción</p>
</div>
```

### CTA primario (gold)

```tsx
<button className="bg-[#d4a843] text-black font-bold px-6 py-3 rounded-lg
                   hover:bg-[#e8c96a] transition-colors">
  Texto del CTA
</button>
```

### Precio / número destacado

```tsx
<span className="text-5xl font-extrabold text-[#d4a843] font-mono">
  $40.000
</span>
```

### Badge de ciudad

```tsx
// Bogotá
<span className="text-xs font-bold text-[#c0392b] bg-[#c0392b]/10 px-2 py-1 rounded">
  BOGOTÁ
</span>
// Medellín → text-[#27ae60] bg-[#27ae60]/10
// Cartagena → text-[#2980b9] bg-[#2980b9]/10
```

### Modal / bottom sheet

```tsx
// Mobile: bottom sheet. Desktop: centrado.
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
  <div className="w-full sm:max-w-md bg-[#141414] border border-[#2a2a2a]
                  rounded-t-2xl sm:rounded-2xl p-6">
    {/* contenido */}
  </div>
</div>
```

---

## 4. Layout

- **Mobile-first siempre.** Breakpoints: `sm:` (640px) como primer paso hacia desktop.
- **PDFs:** `390x844px` (iPhone 14 Pro). `minHeight: 844` con HUG para que el contenido no se corte.
- **IG Carousels:** máximo 20-30 palabras por slide. Una idea por slide. Sin body text — solo headlines.
- **Modales:** bottom sheet en móvil, centrado en desktop (ver patrón arriba).

---

## 5. Animaciones (Framer Motion)

Variantes reutilizables en `src/lib/animations.ts`:

| Export | Uso |
|--------|-----|
| `sectionVariants` | Fade in de secciones al hacer scroll |
| `fadeUpItem` | Fade up de cards individuales |
| `staggerContainer` | Stagger de listas de items |
| `heroChildVariants` | Animaciones hijas del hero |
| `heroStagger` | Stagger del hero |
| `viewportOnce` | Config estándar: `{ once: true, amount: 0.2 }` |

```tsx
import { motion } from "framer-motion";
import { fadeUpItem, staggerContainer, viewportOnce } from "@/lib/animations";

<motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce}>
  <motion.div variants={fadeUpItem}>Item 1</motion.div>
  <motion.div variants={fadeUpItem}>Item 2</motion.div>
</motion.div>
```

---

## 6. Imágenes

Imágenes estáticas en `/public/assets/`. Referenciar con path string (no import):

```tsx
// ✅ Next.js — path string desde /public
<Image src="/assets/bogota_background.jpg" alt="Bogotá" fill />

// ❌ Vite — import de asset (no funciona en Next.js)
import bg from "@/assets/bogota_background.jpg";
```

Imágenes disponibles:
- `/assets/bogota_background.jpg`, `/assets/medellin_background.jpg`, `/assets/cartagena_background.jpg` — hero rotating
- `/assets/BOG_1280x360.png`, `/assets/MDE_1280x360.png`, `/assets/CTG_1280x360.png` — city card banners
- `/assets/BOG_600x600.png`, `/assets/MDE_600x600.png`, `/assets/CTG_600x600.png` — product images

---

## 7. ⚠️ Gotchas conocidos

| Problema | Causa | Solución |
|----------|-------|----------|
| Hero overlay muy oscuro | `bg-background/85` en Tailwind v4 usa `color-mix()` que resuelve mal sobre `#0a0a0a` | Usar `style={{ background: "rgba(10,10,10,0.65)" }}` |
| Imágenes no aparecen en Next.js | Vite usaba `import bg from "@/assets/..."` | Next.js: string path `"/assets/bg.jpg"` desde `/public` |
| Figma `layoutSizingHorizontal="FILL"` falla | Se setea antes de `appendChild` | Primero `appendChild` al auto-layout frame, luego setar sizing |
| `"use client"` faltante | Componentes con hooks o eventos sin la directiva | Agregar `"use client"` como primera línea del archivo |
