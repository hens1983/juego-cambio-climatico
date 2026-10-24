# Guardianes de Cabo de Gata

Juego en HTML sobre cambio climático para 1º de ESO (Almería). Una partida dura unos 15 minutos y funciona en el móvil.

- **Alumnos:** `index.html`. Cada alumno escribe su nombre al empezar y al terminar puede descargar un certificado en imagen.
- **Profe:** `profe.html`. Panel para ver quién ha jugado, cómo va cada partida casi en directo, las preguntas que ha fallado cada alumno y una nota orientativa. Los resultados llegan a una Hoja de cálculo de Google de la profe.

## Publicar el juego

1. En GitHub: Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`. El repositorio debe ser público.
2. El juego queda en `https://hens1983.github.io/juego-cambio-climatico/` y el panel en `https://hens1983.github.io/juego-cambio-climatico/profe.html`.

## Preparar la hoja de resultados (una sola vez, unos 10 minutos)

Abre `profe.html` → pestaña **Configuración** y sigue los pasos. En resumen:

1. Con la cuenta de Google del centro crea una Hoja de cálculo y abre **Extensiones → Apps Script**.
2. Pega el código de `apps-script/Code.gs` y cambia `CLAVE_PROFE` por una clave tuya.
3. **Implementar → Nueva implementación → Aplicación web**, ejecutar como **Yo**, acceso **Cualquier usuario**. Copia la URL que termina en `/exec`.
4. En el panel, pega esa URL y pulsa **Crear enlace**. Ese enlace es el que das a los alumnos (puede llevar el grupo, por ejemplo 1º A).
5. Para ver resultados: pestaña **Resultados**, pega la URL y tu clave y pulsa **Cargar resultados**.

Si un alumno abre el juego sin el enlace de clase, juega en modo práctica: no se envía nada y solo queda el certificado.

Los nombres se guardan solo en la hoja de Google de la profe. Conviene informar al centro y a las familias según su protocolo de protección de datos.
