# Copias en profe.html

`profe.html` incluye el código de `apps-script/Code.gs` y las preguntas originales del juego. Después de cambiar cualquiera de los dos:

```bash
node pruebas/comprobar-copias.js --arreglar
```

El servidor de prueba también imita la pestaña Preguntas (`?preguntas=1` y el guardado con la clave `clave-test`).

# Simular una clase

Juega muchas partidas con el juego real, sin dibujar y con el tiempo acelerado (unos 9 s por partida), con alumnos de perfiles distintos (aplicado, normal, solo plantar, despistado, pasivo, explorador). Un 10 % recarga la página a mitad de partida.

```bash
cd pruebas
node servidor-prueba.js &                  # sirve el juego e imita la hoja de Google (clave: clave-test)
NODE_PATH=$(npm root -g) node simular-clase.js 100 4 resultados.jsonl
python3 analizar.py resultados.jsonl
```

Para probar otro equilibrio sin tocar el juego: `BAL='{"costMul":1.3,"litterSec":20}' node simular-clase.js ...` (ver `BAL` en `index.html`).

"atascado_min" es el tiempo en que el alumno tiene cosas por comprar pero ni Ciencia suficiente ni forma de ganarla en ese momento.
