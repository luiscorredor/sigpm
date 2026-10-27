# SIGPM — Sistema Integrado de Gestión de Producción y Mantenimiento

## Estructura del repositorio
- `index.html`: interfaz principal.
- `css/`: estilos y variables de color.
- `js/`: utilidades, almacenamiento local, alertas, interfaz y módulos.
- `server.js`: servidor Express y comprobación de conexión a PostgreSQL.
- `database/schema.sql`: esquema inicial de la base de datos.
- `scripts/migrate.js`: aplica el esquema a PostgreSQL.
- `.env.example`: plantilla de configuración; copia a `.env` localmente y no publiques secretos.

## Preparar el proyecto localmente
1. Instala Node.js 20 o superior.
2. Descarga/clona el repositorio y ejecuta `npm install`.
3. Copia `.env.example` a `.env` y reemplaza `DATABASE_URL` con la URL privada de tu base de datos PostgreSQL.
4. Si el proveedor exige SSL, configura `PGSSL=true`.
5. Ejecuta `npm run db:migrate` para crear las tablas.
6. Ejecuta `npm start` y abre `http://localhost:3000`.
7. Consulta `http://localhost:3000/api/health` para verificar la conexión.

## Estado actual
La estructura SQL y el servidor inicial están agregados. La interfaz actual todavía utiliza `localStorage`; no todos los módulos están conectados al API. El siguiente trabajo es implementar rutas CRUD seguras y conectar cada módulo a PostgreSQL. La tabla de usuarios no significa que el inicio de sesión esté implementado; antes de manejar datos reales se debe agregar autenticación y autorización en el servidor.

No subas el archivo `.env`, contraseñas ni la URL de conexión de la base de datos a GitHub.
