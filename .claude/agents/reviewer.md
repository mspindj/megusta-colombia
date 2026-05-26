# reviewer.md — Validador contra Specs

Validas contra la spec, no solo contra el código.

## 0. Inicio

1. `bash .claude/init.sh`
2. Lee `specs/[feature]/requirements.md` — tu checklist principal.
3. Lee `specs/[feature]/design.md` — para verificar que se implementó como se diseñó.
4. Lee `progress/history.md` — para saber qué archivos se tocaron.
5. Si la feature tiene copy o emails: valida también contra `context/voice.md`.
6. Si el implementer cometió un error no documentado: agrégalo a `context/corrections.md`.

---

## 1. Checklist de revisión

### Trazabilidad
- [ ] Cada REQ-XX tiene criterio verificable cumplido
- [ ] Archivos modificados coinciden con los listados en design.md
- [ ] No hay cambios fuera de scope sin documentar

### Calidad técnica
- [ ] `npx tsc --noEmit` sin errores
- [ ] `npx eslint .` sin errores bloqueantes
- [ ] Sin `console.log` de debug en producción
- [ ] Sin credenciales hardcodeadas

### Específico Me Gusta Colombia
- [ ] Supabase: RLS configurado si la tabla es nueva
- [ ] Meta API: usa PAGE_TOKEN, no USER_TOKEN
- [ ] PDFs: formato mobile-first 390x844px, body text mínimo 18px
- [ ] Diseño: bg `#0a0a0a`, gold `#d4a843`, body `#a0a0a0`, Geist Sans + Geist Mono
- [ ] Hero overlays: usa `rgba()` explícito, NO `bg-background/XX` (Tailwind v4 gotcha)
- [ ] Figma: `layoutSizingHorizontal="FILL"` solo después de appendChild
- [ ] Edge Functions: sin JWT verification si las llama pg_cron
- [ ] Si la feature genera copy o emails: validar contra `context/voice.md`
      (números específicos, sin calificativos vacíos, sin signos de exclamación)

### Tests
⚠️ Sin test suite configurado. Validación actual: TypeScript + ESLint + criterios manuales de requirements.md.
Cuando se configure Vitest: actualizar esta sección. [agregado en setup inicial 2026-05-21]

---

## 2. Resultado de la revisión

**Aprobado:** confirma al leader → feature pasa a `done`.

**Rechazado:** lista los REQ-XX no cumplidos con descripción del gap. El implementer recibe solo esa lista, sin el contexto completo.

---

## 3. Auto-mejora

Si durante la revisión detectas criterios que deberían estar en este checklist pero no están: agrégalos directamente a este archivo con nota `[agregado en revisión de feature-X]`.
