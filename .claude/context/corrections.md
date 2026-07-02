# corrections.md — Log de correcciones a los agentes

> Solo se agrega, nunca se edita ni se borra.
> Formato: [fecha] Agente — Qué hizo mal → Qué es correcto

---

[2026-05-22] implementer (idea-to-queue) — Usó WOFF2 (fontsource URLs) para Satori → Satori rechaza WOFF2 con "Unsupported OpenType signature wOF2". Correcto: Noto Sans Bold/Black TTF desde `https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf`.

[2026-05-22] implementer (idea-to-queue) — Usó `SUPABASE_SERVICE_ROLE_KEY` para Storage upload → Storage rechaza el nuevo formato `sb_secret_*` con "Invalid Compact JWS". Correcto: usar secret separado `SERVICE_ROLE_JWT` con el JWT legacy (formato `eyJhbG...`). NOTA: el nombre no puede empezar con `SUPABASE_` — la Management API rechaza esos nombres para secrets manuales.

[2026-05-22] implementer (idea-to-queue) — Deploy via Management API PATCH → BOOT_ERROR persistente. El endpoint dice "ACTIVE" pero el código no se actualiza. Correcto: SIEMPRE usar MCP `deploy_edge_function`.

[2026-05-27] implementer (idea-to-queue) — Generó copy en español ("Tu cara te vende en Bogotá") → el target audience son English-speaking travelers pagando USD en Gumroad. El copy de IG va en inglés. El español es insider vocabulary drops, no idioma base del copy.

[2026-05-27] implementer (auto-publish) — Primera versión leía array `CONTENT_QUEUE` hardcodeado en el código → TODO el contenido viene de la tabla `content_queue` en DB. Nunca hardcodear contenido en Edge Functions.

[2026-05-27] spec_author (generate-copy) — Documentó "trigger on_idea_approved" en Postgres como si existiera → ese trigger no existe y nunca existió. El pipeline se dispara explícitamente desde el Server Action `approveIdea` con `fetch()` + `AbortSignal.timeout(500)`. No documentar triggers como existentes sin verificarlos en DB.

[2026-05-27] implementer (idea-to-queue) — `markIdeaProcessed` fallaba silenciosamente al actualizar `status='in_progress'` → la constraint `content_ideas_status_check` no incluía 'in_progress'. Correcto: verificar constraints de DB antes de asumir que un UPDATE va a funcionar. Nunca confiar en que un PATCH sin `Prefer: return=representation` falló o pasó sin revisar el status HTTP.

[2026-05-27] spec_author (intel-gather) — Queries genéricas ("colombia", "bogota", "medellin") traían contenido amarillista (cartel, narco, política). Correcto: queries travel-focused ("colombia digital nomad", "medellin coworking", etc.) + `BLOCKED_KEYWORDS` filter antes de insertar.

[2026-05-27] leader/Claude — Habló al usuario en voseo argentino ("pifié", "pusheé", "querés") → El usuario es de Bogotá. Tuteo colombiano: "lo dejé", "te lo dejo", "quedó", "puedes verificar". Sin marcadores regionales fuertes.
