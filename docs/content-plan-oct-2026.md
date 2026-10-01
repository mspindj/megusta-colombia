# Plan de contenido, octubre 2026

Estado de partida (medido el 29 sep 2026, no supuesto):

- 44 seguidores, 90 posts publicados, 0 comentarios en total.
- Likes por post: imagen 1,95, carrusel 2,26, Reel 1,75 (4 Reels, todos de abril). Ningún formato se separa de los otros.
- El token actual no tiene `instagram_manage_insights`. No hay datos de alcance, guardados ni compartidos. Hoy no podemos saber qué formato llega a más gente.

Consecuencia: publicar más no es el cuello de botella. Con 44 seguidores, el único formato de Instagram que muestra contenido a gente que no te sigue es el Reel. Los carruseles sirven para guardar y compartir. Las historias solo las ven los seguidores.

## 1. Frecuencia definida

| Formato | Frecuencia | Días | Para qué sirve | Quién lo publica |
|---|---|---|---|---|
| Reel | 2 por semana desde el 11 oct (6 en octubre) | Domingo y miércoles | Alcance a no seguidores | Cron, después de agregar soporte de video a `meta-publish` |
| Carrusel | 2 por semana | Lunes y viernes | Contenido de referencia para guardar y compartir | Cron, ya funciona |
| Historias | 2 días por semana, 3 cuadros cada uno | Martes y jueves | Preguntas reales a seguidores y un pedido directo (el PDF gratis) | Tú, a mano desde el celular, 10 min |

Se mantienen los 4 posts de feed por semana y los días del cron (dom, lun, mié, vie). Solo cambia la mezcla: hoy son 4 carruseles, pasan a 2 carruseles y 2 Reels.

Por qué las historias van a mano: la API de Instagram no permite stickers de pregunta, encuesta ni link. Una historia automática sería una imagen muda, que es justo lo que no sirve. Solo tiene sentido con interacción.

Por qué solo 2 Reels por semana: cada uno exige filmar algo real. Más de 2 obliga a caer en stock y voz sintética, que es la categoría de contenido genérico que estamos evitando.

Regla de revisión: el 31 oct se mide. Si los Reels no llegan a 3 veces el alcance mediano de un carrusel, bajan a 1 por semana. Si a esa fecha hay menos de 100 seguidores, las historias pasan a 1 por semana, solo de pedido.

## 2. Calendario de octubre

Todas las publicaciones son en inglés, para el público extranjero. Los carruseles marcados "En cola" se quedan; los Reels desplazan 6 carruseles que pasan a noviembre.

| Fecha | Día | Formato | Tema | Estado |
|---|---|---|---|---|
| 2 oct | Vie | Carrusel | Dos semanas entre Bogotá y Cartagena | En cola |
| 4 oct | Dom | Carrusel | SIM en el aeropuerto de noche | En cola |
| 5 oct | Lun | Carrusel | Medellín: cuándo ir a cada barrio | En cola |
| 7 oct | Mié | Carrusel | Cuánto dinero llevar | En cola, ver nota 1 |
| 9 oct | Vie | Carrusel | ¿Vale la pena Cartagena? | En cola |
| 11 oct | Dom | Reel 1 | Taxi desde El Dorado: taxímetro contra lo que te dicen | Por filmar |
| 12 oct | Lun | Carrusel | Medellín: lo que cambió desde 2024 | En cola |
| 14 oct | Mié | Reel 2 | La SIM del aeropuerto: mostrador, precio, recibo | Por filmar |
| 16 oct | Vie | Carrusel | Bogotá en dos días | En cola |
| 18 oct | Dom | Reel 3 | Palabras que oyes en la calle y no traduce el celular | Por grabar |
| 19 oct | Lun | Carrusel | eSIM contra SIM local | En cola |
| 21 oct | Mié | Reel 4 | No dar papaya: lo que hacen los locales en Bogotá | Por filmar |
| 23 oct | Vie | Carrusel | Medellín en tres días | En cola |
| 25 oct | Dom | Reel 5 | Transmilenio: tarjeta, recarga, primer viaje | Por filmar |
| 26 oct | Lun | Carrusel | SIM y efectivo al aterrizar | En cola |
| 28 oct | Mié | Reel 6 | Cuánto gasté esta semana en Bogotá (recibos reales) | Por filmar |
| 30 oct | Vie | Carrusel | Medellín fuera del circuito de Instagram | En cola |

Los 6 carruseles que se mueven a noviembre (ya generados): manejar en Bogotá (era 11 oct), slang (14 oct), Medellín guía completa (18 oct), estafas en Cartagena (21 oct), seguridad para mochileros (25 oct), no dar papaya en Medellín (28 oct). Cada uno sale una o dos semanas después del Reel de su tema, como versión de referencia para guardar.

Nota 1: el carrusel del 7 oct habla de Cartagena aunque la idea original era genérica, y los precios dentro de los slides los inventó el modelo. Ver la regla de datos abajo.

Historias (a mano, cada una en martes y jueves): 1 de octubre, 6, 8, 13, 15, 20, 22, 27, 29.

- Cuadro 1: foto o video real del día, sin texto encima o con una sola línea en el texto nativo de Instagram.
- Cuadro 2: una pregunta real con el sticker de pregunta. Ejemplo: "¿Cuándo viajas y por cuánto tiempo?" Es la misma pregunta que no respondió nadie por correo, hecha donde sí hay gente mirando.
- Cuadro 3 (solo los jueves): sticker de link al PDF gratis. Es el único pedido directo de la semana.

## 3. Cómo se produce un Reel sin caer en genérico

Supuesto que necesito que confirmes: filmas en Bogotá y puedes salir con el celular dos sábados al mes. Medellín y Cartagena entran con clips que ya tienes o con datos verificados por alguien que esté allá, no inventados.

Formato base, el mismo para los 6:

- Video propio vertical, de 8 a 20 segundos, con sonido ambiente real.
- Una sola idea y un dato con su prueba en pantalla: el recibo, el taxímetro, la pantalla del banco.
- Tu voz o texto en pantalla. No usar la voz sintética Orus en contenido orgánico: un anuncio de pago la tolera, un Reel orgánico con voz de IA sobre stock es lo más reconocible como relleno.
- Subtítulos quemados, una línea, sin etiquetas ni contadores.
- El beat de Ableton solo como cama baja, opcional.
- Cierre con `megusta.com.co` en el caption, nunca dentro del video.

Sesiones de calle: sábado 3 oct (clips para los Reels 1, 2, 4, 5) y sábado 17 oct (Reel 6 y adelantar noviembre). El Reel 3 se graba en casa.

Edición: hay que armar `colombia-reel-template` en Remotion, parametrizado (clip, línea de texto, subtítulos, dato). Sin plantilla cada Reel cuesta una tarde; con plantilla, unos 30 a 45 minutos.

## 4. Reglas anti relleno (aplican a carruseles, Reels e historias)

Diseño, tomado de la lista de prohibidos de impeccable (`craft-floor.md`):

- Sin eyebrow ni kicker sobre el titular. Es una prohibición absoluta en impeccable: no hay marca ni brief que la recupere. Hoy los slides de carrusel llevan una etiqueta dorada en mayúsculas arriba (por ejemplo "CARTAGENA REALITY"). Sale.
- Sin contador de slide ("3/5") ni numeración. Instagram ya muestra los puntos.
- Sin regla dorada decorativa sobre el titular.
- Sin texto con degradado, sin vidrio ni blur decorativo, sin emojis como íconos.
- Sin fondo oscuro pesado para tapar la foto. Si la foto no aguanta sin tapar, es la foto equivocada.
- Sin foto de skyline genérica. Si la foto es de stock, el titular tiene que decir algo que la foto no dice.
- Tipografía con carácter, no Noto Sans Black como voz de marca.

Copy, tomado de `humanizalo` y de la voz del proyecto:

- Prohibido: "hits different", "moves different", "Swipe for...", "Here's what", el contraste "No es X. Es Y.", listas de tres por reflejo, aperturas retóricas.
- "Four months in" y cualquier frase de experiencia personal solo si es verdad y dice qué se vio. Hoy es una afirmación heredada del modelo, no un dato tuyo.
- Sin signos de exclamación, sin raya, una idea por oración.

Datos, la regla más importante:

- Todo número (precio, tiempo, tarifa) necesita fuente y fecha guardadas en la fila de `content_ideas.notes`: recibo propio, tarifa oficial, o alguien que lo verificó. Sin fuente, el número se corta. El modelo no puede proveerlos.
- Cada pieza lleva la fecha del dato ("verificado 12 oct"). Es la diferencia con Reddit y con las guías de 2019, y es el único diferenciador que tenemos.

## 5. Qué hay que construir (en este orden)

1. Tú: regenerar el token de Meta con `instagram_manage_insights`. Sin eso la revisión del 31 oct (sección 6) no se puede hacer. Es un paso de 10 minutos en Graph API Explorer.
2. `carousel-slide`: quitar kicker, contador y regla dorada. Re-renderizar los 17 carruseles de octubre, porque hoy los 85 slides ya traen el kicker dibujado en la imagen. Los textos dentro de los slides no se guardaron, así que la regeneración implica correr `idea-to-queue` de nuevo con el prompt nuevo (Haiku genera de nuevo el copy, con la regla de datos). Los dos primeros posts salen el 2 y el 4 oct, así que esos van primero.
3. `idea-to-queue`: quitar el campo `kicker` del prompt, exigir fuente para todo número, y forzar `megusta.com.co` al final del caption por código, no por instrucción (el modelo la ignora: 0 de 17 posts de septiembre lo traían).
4. `meta-publish` y `auto-publish`: agregar tipo `reel` (video en Storage, `media_type=REELS`, esperar `FINISHED`). Historias quedan manuales.
5. `colombia-reel-template` en Remotion.
6. Mover los 6 carruseles desplazados a noviembre y dejar libres los slots de Reel.

## 6. Cómo sabemos si funciona

Revisión cada lunes, en 10 minutos:

- Seguidores.
- Alcance por formato (Reels contra carruseles), guardados y compartidos por post.
- Clics al sitio desde Instagram (UTM `utm_source=instagram`) y leads nuevos en Brevo con esa fuente.

Decisiones al 31 oct:

- Reels a 3 veces el alcance mediano de un carrusel: se mantienen 2 por semana y se agrega uno más de intel de calle.
- Reels por debajo de eso: bajan a 1 por semana y el tiempo se va a distribución fuera de la cuenta.
- Menos de 100 seguidores: historias a 1 por semana, solo de pedido.

Distribución fuera de la cuenta, 15 minutos al día: comentar con datos concretos en 5 publicaciones de cuentas de viaje a Colombia y responder por mensaje con el PDF cuando alguien pregunte. Con 44 seguidores esto puede mover más que cualquier ajuste de formato, y es el Warm Outreach que sigue sin activarse.

## 7. Sistema de caption y CTA

Construido con `hundred-million-leads-post-content` (Hook, Retain, Reward, Give/Ask, ask integrado e intermitente), `copywriting` (una sola acción por pieza, sin claims inventados) y `humanizalo` (sin raya, sin "no es X, es Y", sin remates de moraleja).

Estructura de todo caption de feed, en inglés:

1. Gancho, una línea, que se entienda sola porque Instagram corta después de ~125 caracteres. Usa las características de titular de Hormozi que sí tenemos: relevancia (qué le pasa al lector al aterrizar), proximidad (un lugar concreto) y conflicto (dos opciones en tensión). Sin número si el número no está verificado.
2. Descripción, dos oraciones: qué cubren los slides y qué gana el lector. No repite cifras de los slides, para no contradecirlos.
3. Un solo CTA. Nunca dos.
4. `megusta.com.co` en su propia línea, y luego los hashtags.

Los seis tipos de CTA, en orden de peso del pedido (Give/Ask: se da mucho más de lo que se pide):

| Tipo | Ejemplo | Para qué | Posts de octubre |
|---|---|---|---|
| Enviar | "Send this to whoever is planning Medellín with you." | Alcance: un envío pone el post frente a alguien que no nos sigue | 5 (5, 9, 12, 16, 30 oct) |
| Guardar | "Save this before you book the rental." | Señal de valor para el algoritmo, y el lector vuelve a él | 4 (7, 11, 18, 23 oct) |
| Pregunta | "Which one did you already know? Tell me in the comments." | Primeros comentarios, y las respuestas alimentan la investigación de avatar | 3 (2, 14, 28 oct) |
| Palabra clave | "Comment SIM and I'll DM you the free arrival cheat sheet." | Lead: das el PDF gratis por mensaje directo | 2 (4, 25 oct) |
| Link, PDF gratis | "The full landing checklist is in the free arrival cheat sheet. Link in bio." | Lead directo, ask intermitente | 2 (19, 26 oct) |
| Link, oferta paga | "The full Cartagena guide is $17. If it doesn't save you at least that much, it's refunded." | Ask intermitente de venta, usa la garantía del sitio | 1 (21 oct) |

Proporción: 12 de 17 son dar (enviar, guardar, pregunta). 5 de 17 piden algo, y 4 de esos 5 piden algo gratis. La oferta paga es 1 de 17.

Lo que te toca a mano:

- Responder cada comentario y cada pregunta en menos de 24 horas, con una respuesta útil. Con 44 seguidores el volumen es manejable, y es el "da hasta que te pidan" de Hormozi.
- Cuando alguien comente la palabra clave, mandarle el link del PDF gratis por mensaje directo.
- Cambiar el link del bio. Hoy apunta a `megustacomco.gumroad.com` (la tienda con productos de pago) y dice "Download the manual". Los tres CTA de "link in bio" necesitan que ese link lleve a `megusta.com.co`, donde está el formulario del PDF gratis. Instagram no deja editar el bio por API.
- El bio también arrastra los tics que queremos evitar: emojis como íconos (⚠️ ✈️ 🚫 ⬇️) y "Gringo Tax" como gancho. Se puede reescribir en una línea que diga para quién es y qué entrega.

## 8. Estado de los slides de octubre (regenerados el 29 sep)

Los 17 carruseles se regeneraron con el pipeline nuevo y se revisaron slide por slide.

Resuelto:

- Sin eyebrow, contador ni regla dorada. Titular en DM Serif Display sobre la foto, con degradado solo en el tercio inferior.
- Las cifras salen de `VERIFIED_FACTS` (verificadas el 29 sep): TransMilenio 3.550 (Tullave 8.000), metro de Medellín 4.400 turista y 3.820 frecuente, Transcaribe 3.900, taxi de Bogotá con banderazo 4.500, mínima 8.000, recargo de El Dorado 8.000 y recargo nocturno 3.800, pico y placa par/impar de 6 a.m. a 9 p.m. El Metrocable a Arví figura solo como "tarifa aparte, más alta que el metro" porque las dos fuentes que encontré no coinciden (24.500 y 26.700).
- Cada foto tiene Colombia o un lugar colombiano en su descripción, y ningún carrusel repite foto dentro de sí mismo (verificado por comparación de imagen).
- 25 slides con frases dudosas se corrigieron a mano con `edit-slide` ("The Metro runs six lines", "Tap on, tap off", "Getsemaní: food and prices drop", "Book domestic flights once you land").
- Captions con gancho, descripción, CTA, `megusta.com.co` y hashtags corregidos. 17 de 17 con el link.

Limitaciones que siguen:

- Las fotos de stock con descripción colombiana son pocas: la misma vista de la montaña de Medellín, la calle roja y blanca de La Candelaria y la pared azul de Getsemaní se repiten entre posts. La salida real es tu propio material (el plan de Reels ya lo pide) o sumar otra fuente.
- Queda una frase que no pude verificar: "Skip the app" (slide 5 del post del 23 oct). El resto de los slides son consejos ("pregunta el precio", "revisa el taxímetro"), no datos. Si alguien local puede revisarlos, ese post va primero.
- Las cifras dependen de la lista `VERIFIED_FACTS`: hay que reverificarla cuando cambien las tarifas (cada enero como mínimo).
