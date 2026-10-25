# SIGPM — Sistema Integrado de Gestión de Producción y Mantenimiento

Aplicación web hecha solo con HTML, CSS y JavaScript (sin dependencias ni servidor).
Los datos se guardan en el navegador (localStorage).

## Qué hace

- **Máquinas**: alta, edición y baja. Cada máquina tiene un intervalo de mantenimiento (en días); el sistema calcula la próxima fecha y avisa cuando está próxima o vencida.
- **Mantenimientos**: al registrar uno, se actualiza el último mantenimiento y se recalcula el próximo. Hay historial con costos.
- **Productos**: alta, edición y baja con lote y fecha de vencimiento. Se marcan como *Vigente*, *Por vencer* o *Vencido*.
- **Producción**: registro por máquina, producto y turno, con opción de sumar al inventario. Avisa si la máquina tiene el mantenimiento vencido.
- **Panel**: indicadores y lista de alertas; el menú muestra un contador de alertas activas.
- **Ajustes**: cuántos días antes avisar, respaldo y restauración en JSON.

## Estructura

```
sigpm/
├── index.html
├── css/
│   ├── variables.css   <- paleta de colores (cambia aquí tus colores)
│   └── styles.css
└── js/
    ├── utils.js        fechas y helpers
    ├── storage.js      guardado de datos
    ├── alertas.js      reglas de vencimiento y mantenimiento
    ├── ui.js           modal, toast
    ├── dashboard.js
    ├── maquinas.js
    ├── mantenimientos.js
    ├── productos.js
    ├── produccion.js
    ├── ajustes.js
    └── app.js          navegación y arranque
```

## Cambiar la paleta de colores

Edita únicamente `css/variables.css`. Todo el sistema usa esas variables.

## Despliegue en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta (`index.html` debe quedar en la raíz).
2. En el repositorio: **Settings → Pages**.
3. En *Build and deployment*, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
4. Guarda. En un par de minutos tendrás la URL `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

## Importante

Los datos viven en el navegador de cada persona: no se comparten entre equipos. Usa **Ajustes → Descargar respaldo** para guardarlos o moverlos.
