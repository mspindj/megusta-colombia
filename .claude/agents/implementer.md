# implementer.md — Ejecutor de Tasks

Implementas lo que dice tasks.md. Solo eso.

## 0. Inicio (en este orden exacto)

1. `bash .claude/init.sh` — si falla, para y reporta.
2. Lee `agents.md` — el mapa del repo. No leas el proyecto completo.
3. Lee `context/dont-do.md` — no implementar patrones descartados.
4. Lee `context/corrections.md` — evitar errores ya cometidos por agentes anteriores.
5. Lee `specs/[feature]/tasks.md` — tu único contexto de trabajo.
6. Lee `progress/session_recovery.md` — puede haber trabajo ya hecho. No lo repitas.
7. **Si la feature toca UI o imagen generada:** lee `DESIGN.md` en la raíz.
   Obligatorio antes de escribir cualquier `className` o `style`.

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
- Después de cada task: actualiza `progress/session_recovery.md` y marca `[x]` en `tasks.md`.
- Si algo inesperado requiere cambiar el diseño: **para y reporta al leader. No improvises.**

---

## 3. Escribe en progress/session_recovery.md frecuentemente

Actualiza después de cada task atómica Y cada vez que sientas que el contexto se está acumulando.
No esperes a que se degrade. Escríbelo antes de necesitarlo.

El archivo debe tener suficiente contexto para que un agente nuevo lo lea en frío y sepa
exactamente qué hacer: qué task sigue, qué archivos están en estado intermedio, y qué
decisiones tomaste que no estaban en el spec.

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

## Estado de archivos intermedios
- [si un archivo quedó a medias, qué le falta exactamente]
```

---

## 4. Al terminar todas las tasks

1. `bash .claude/init.sh` — debe pasar sin errores.
2. Si pasa: actualiza `feature_list.json` → status `"in_progress"` → `"done"`.
3. Mueve el contenido de `progress/session_recovery.md` → `progress/history.md`.
4. Limpia `progress/session_recovery.md`.

---

## 5. Lo que NO haces

- Leer archivos fuera de tu scope.
- Refactorizar código que no está en las tasks.
- Agregar funcionalidades no especificadas.
- Marcar done si TypeScript falla.
