# Guardianes de Cabo de Gata — notas para quien continúe el proyecto

Juego educativo en un solo archivo (`index.html`, sin dependencias) para **1º de ESO en Almería**. La profe es la mujer del usuario. Tema actual: **cambio climático** (la geología ya se estudió y solo queda como repaso). Una partida dura **unos 15 minutos** y debe funcionar en el móvil. Idioma: español, con textos pensados para niños de 12 años.

## Qué hace
- Mundo de bloques en **vista isométrica** (estilo Minecraft) de 4 pantallas (Tabernas, Sorbas, Pueblo, Costa de Cabo de Gata) más la cueva de Sorbas (repaso de rocas). La lógica sigue siendo una cuadrícula de 10×12 con movimiento por casillas; solo cambia cómo se dibuja y cómo se toca.
- 2025 → 2050, un año cada 36 s. Objetivo: llegar a 2050 con menos de +1.5 °C. Se pierde si el mar sube 60 cm.
- Ciencia (🔬) se gana con paneles informativos (8), retos de la profe (12, cada 2 años desde 2027), misiones (6), rocas (5), +2 al año y basura recogible (1 🔬, aparece cada 15 s, máximo 5).
- Se gasta en placas solares, árboles, posidonia y 5 medidas del Ayuntamiento (mitigación y adaptación).
- Eventos en 2031, 2036, 2041 y 2046 (ola de calor, DANA, incendio, ola de calor marina).
- Tutorial de 4 pantallas al empezar (misión, marcador, controles, Ciencia), que se puede volver a abrir desde Misiones.
- La partida se guarda sola en el navegador cada 5 s y al salir; al volver se ofrece continuarla o empezar como otra persona (tablets compartidas: el nombre no se rellena solo).
- Los avisos van en cola para que no se pisen.
- Al empezar el alumno escribe nombre y grupo. Al terminar se genera un **certificado PNG** descargable (nombre, resultado, aciertos, código).
- **Informe a la profe:** si el juego se abre con el enlace de clase (`#c=` con la URL de la hoja y el grupo), envía la partida a una Hoja de Google de la profe al empezar, cada 5 años de juego y al terminar (misma fila por partida, `sid`). `profe.html` muestra la tabla, la ficha de cada alumno, CSV y una nota orientativa. El servidor es `apps-script/Code.gs` (Apps Script, `doPost` guarda y `doGet` con clave lee). Sin enlace de clase no se envía nada (modo práctica).
- **Preguntas de la profe:** en `profe.html` → pestaña Preguntas edita los 12 retos y los 8 paneles (texto y pregunta). Se guardan en la pestaña `Preguntas` de su hoja (`doPost` con `tipo:'preguntas'` y clave; también se puede editar a mano en la hoja). Con enlace de clase el juego las pide con `?preguntas=1` (sin clave) y guarda una copia en el navegador; `applyQ` las aplica. Panel sin pregunta completa → el original; reto vacío → no sale; ningún reto → los originales. Sin enlace se usan las del código (`CARDS`, `RETOS`). Las rocas no se editan.
- `profe.html` lleva copias de `apps-script/Code.gs` y de las preguntas originales (`DEF`). Tras cambiar cualquiera de los dos: `node pruebas/comprobar-copias.js --arreglar`.
- Los textos de las tarjetas se escapan al mostrarlos (`esc`), porque ahora los escribe la profe.

## Vista isométrica (sección «dibujo isométrico» de `index.html`)
- Coordenadas del mundo: `x`=columna, `y`=fila, `z`=altura en bloques. Pantalla: `X=(x-y)·U`, `Y=(x+y)·U/2−z·U`; `U` es la mitad del ancho de una casilla y se calcula en `resize()`. Se ven la cara de arriba, la `+y` (izquierda) y la `+x` (derecha).
- Todo se monta con `box()`/`box3()` (bloques con caras sombreadas) y `flat()`/`faceX()`/`faceY()`. Los objetos (`objW`, `house`, `drawPlayer`, `drawLitter`) son composiciones de bloques: para cambiar el aspecto de algo se tocan sus medidas ahí.
- El suelo se pinta una vez en una imagen (`buildGround`, se rehace al cambiar de pantalla, de zoom o de nivel del mar) y el resto se ordena de atrás hacia delante cada fotograma (diagonales `c+r`). Si se añade algo que tape cosas, va en esa pasada y no en el suelo.
- Cámara: sigue al jugador (`aim`); en la cueva es libre y se arrastra. Los toques se resuelven con `pickAt`, que prueba las casillas de delante hacia atrás contra su silueta (`topZ` da la altura de cada cosa), así se toca lo que se ve.
- La cruceta va en diagonal (↖ ↗ ↙ ↘) porque las filas y columnas van en diagonal en pantalla. Las flechas del teclado siguen la misma lógica (↑ = ↗).
- Antes (2D tipo Zelda) estaba en el historial de git, antes de la rama `vista-isometrica`.

## Decisiones tomadas
- Primero se quitó el panel (bastaba el certificado); después el usuario pidió recuperarlo para tener trazabilidad. Se mantienen las dos cosas.
- La integración con Google se probó con un servidor que imita al Apps Script, nunca contra Google de verdad. Si falla, revisar CORS y la redirección de `script.google.com` (el juego reintenta con `mode:'no-cors'`).
- Se publica con **GitHub Pages** desde `main` (`https://hens1983.github.io/juego-cambio-climatico/`). El repositorio tiene que ser público para eso con una cuenta gratuita.
- `index.html` es un documento completo. La versión publicada como Artifact de claude.ai se genera quitando `<!doctype>`, `<html>`, `<head>` y `<body>` (el Artifact no permite descargas, así que allí el botón de la imagen no funciona).

## Equilibrio (objeto `BAL` en `index.html`)
Emisiones base 6 ppm/año; cada placa −1; medidas bus −0.7, reciclaje −0.5, coche eléctrico −0.7; árbol absorbe 0.3 y posidonia 0.4. El CO₂ no baja de 420 ppm (la temperatura no baja de la actual, +1.1 °C: en la realidad no se enfría rápido). Precios ×1.2 (placa 14, árbol 7, posidonia 8, medidas 14-19). `YEAR_SEC=36`, `LOSE_SEA=60`.
Ajustado con 100 partidas simuladas (`pruebas/`): gana ~74 % (aplicados 100 %, normales 90 %, despistados y pasivos 0 %). Sin placas solares no gana nadie y con 4 placas ganan todos: plantar ayuda pero no basta.

## Cómo probarlo
- El gancho `window.__TEST__=true` (con `addInitScript` de Playwright) expone `window.__g` con el estado. Sin eso no existe, para que los alumnos no hagan trampas.
- Con `window.__FAST__=true` el bucle no avanza solo y `__g.run(segundos)` adelanta el juego al instante (así funciona `pruebas/simular-clase.js`). Chromium está en `/opt/pw-browsers/chromium`.
- `__g.tapCell(c,r)` toca una casilla sin pasar por el dibujo (mover/actuar en el mundo, excavar en la cueva): lo usa `pruebas/simular-clase.js`.
- Tras editar, comprobar la sintaxis del script con `node --check`.
- En Windows (sin Playwright) se puede probar en el navegador integrado: `node pruebas/servidor-prueba.js` y cargar `index.html` con `document.write` añadiendo antes `<script>window.__TEST__=true</script>` (el archivo usa saltos de línea CRLF).

## Pendiente o ideas
- Las preguntas editables nunca se han probado contra Google de verdad (solo con `pruebas/servidor-prueba.js`). Quien ya tenía la hoja preparada debe pegar el nuevo `Code.gs` e implementar una nueva versión.
- Nombre del centro o logo en el certificado.
- Más cosas que hacer a mitad de partida; nivel de agua en Tabernas; modo clase por votación.
- Si la basura no basta, subir lo que da o lo frecuente que aparece.
