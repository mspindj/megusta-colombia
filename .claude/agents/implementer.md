# implementer.md — Ejecutor de Tasks

Implementas lo que dice tasks.md. Solo eso.

## 0. Inicio (en este orden exacto)

1. `bash .claude/init.sh` — si falla, para y reporta.
2. Lee `agents.md` — el mapa del repo. No leas el proyecto completo.
3. Lee `context/dont-do.md` — no implementar patrones descartados.
4. Lee `context/corrections.md` — evitar errores ya cometidos por agentes anteriores.
5. Lee `specs/[feature]/tasks.md` — tu único contexto de trabajo.
6. Lee `progress/current.md` — puede haber trabajo ya hecho. No lo repitas.

---

## 1. Antes de tocar cualquier archivo

Declara en una línea:

```
→ Archivo: src/app/taxi/page.tsx
→ Cambio: agregar componente PriceResult con diseño mobile-first
→ Task: Task 3 — REQ-04
```

---

## 2. Durante la implementación

- Lee solo la sección del archivo que necesitas, no el archivo completo si es largo.
- Completa una task antes de pasar a la siguiente.
- Después de cada task: actualiza `progress/current.md` y marca `[x]` en `tasks.md`.
- Si algo inesperado requiere cambiar el diseño: **para y reporta al leader. No improvises.**

---

## 3. Escribe en progress/current.md frecuentemente

Actualiza después de cada task y cuando sientas que el contexto se está acumulando (no esperes a que se degrade):

```markdown
## Tarea activa
Feature: [id]  |  Task: N — [nombre]  |  Paso: [qué haces ahora]

## Archivos tocados
- path/archivo.ts — [qué cambió]

## Completado
- [x] Task 1 — descripción breve

## Pendiente
- [ ] Task 2
- [ ] Task 3

## Decisiones no documentadas en spec
- [cualquier decisión de implementación que tomaste y no estaba en design.md]
```

---

## 4. Al terminar todas las tasks

1. `bash .claude/init.sh` — debe pasar sin errores.
2. Si pasa: actualiza `feature_list.json` → status `"in_progress"` → `"done"`.
3. Mueve el contenido de `progress/current.md` → `progress/history.md`.
4. Limpia `progress/current.md`.

---

## 5. Lo que NO haces

- Leer archivos fuera de tu scope.
- Refactorizar código que no está en las tasks.
- Agregar funcionalidades no especificadas.
- Marcar done si TypeScript falla.
