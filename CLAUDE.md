# Guardianes de Cabo de Gata — notas para quien continúe el proyecto

Juego educativo en un solo archivo (`index.html`, sin dependencias) para **1º de ESO en Almería**. La profe es la mujer del usuario. Tema actual: **cambio climático** (la geología ya se estudió y solo queda como repaso). Una partida dura **unos 15 minutos** y debe funcionar en el móvil. Idioma: español, con textos pensados para niños de 12 años.

## Qué hace
- Mapa tipo Zelda de 4 pantallas (Tabernas, Sorbas, Pueblo, Costa de Cabo de Gata) más la cueva de Sorbas (repaso de rocas).
- 2025 → 2050, un año cada 36 s. Objetivo: llegar a 2050 con menos de +1.5 °C. Se pierde si el mar sube 60 cm.
- Ciencia (🔬) se gana con paneles informativos (8), retos de la profe (8, cada 3 años desde 2028), misiones (6), rocas (5), +2 al año y basura recogible (1 🔬, aparece cada 30 s, máximo 4).
- Se gasta en placas solares, árboles, posidonia y 5 medidas del Ayuntamiento (mitigación y adaptación).
- Eventos en 2031, 2036, 2041 y 2046 (ola de calor, DANA, incendio, ola de calor marina).
- Al empezar el alumno escribe nombre y grupo. Al terminar se genera un **certificado PNG** descargable (nombre, resultado, aciertos, código). No se guardan datos en ningún servidor.

## Decisiones tomadas
- Sin servidor ni panel de administrador: la profe pidió solo que cada alumno se registre y descargue una imagen como prueba.
- Se publica con **GitHub Pages** desde `main` (`https://hens1983.github.io/juego-cambio-climatico/`). El repositorio tiene que ser público para eso con una cuenta gratuita.
- `index.html` es un documento completo. La versión publicada como Artifact de claude.ai se genera quitando `<!doctype>`, `<html>`, `<head>` y `<body>` (el Artifact no permite descargas, así que allí el botón de la imagen no funciona).

## Constantes de equilibrio (en el script de `index.html`)
`YEAR_SEC=36`, costes `COST={tree:6,solar:12,pos:7}`, medidas del Ayuntamiento 12-16, emisiones base 4.7 menos 0.8 por placa y menos las medidas, árbol absorbe 0.4 y posidonia 0.5 por año, `LOSE_SEA=60`. Probado con bots: quien lo hace todo gana con margen, quien solo planta pierde por poco, quien no hace nada pierde hacia 2043.

## Cómo probarlo
- El gancho `window.__TEST__=true` (con `addInitScript` de Playwright) expone `window.__g` con el estado. Sin eso no existe, para que los alumnos no hagan trampas.
- Con `page.clock.install()` y `page.clock.runFor(ms)` se juega una partida entera en poco tiempo. Chromium está en `/opt/pw-browsers/chromium`.
- Tras editar, comprobar la sintaxis del script con `node --check`.

## Pendiente o ideas
- Preguntas y retos editables por la profe desde su temario (ahora están escritos en el código: `CARDS`, `RETOS`).
- Nombre del centro o logo en el certificado.
- Más cosas que hacer a mitad de partida; nivel de agua en Tabernas; modo clase por votación.
- Si la basura no basta, subir lo que da o lo frecuente que aparece.
