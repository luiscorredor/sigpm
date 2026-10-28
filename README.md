# SIGPM — Gestión de Producción y Mantenimiento

## Inicio de sesión

SIGPM usa Firebase Authentication con el método **Correo electrónico/Contraseña**. Las cuentas se crean y administran desde Firebase Console; la página pública no ofrece un formulario para configurar el proyecto ni para registrar usuarios.

1. En Firebase Console, abre el proyecto `sigpm-53b9e`.
2. En **Authentication → Users**, agrega las cuentas autorizadas con correo y contraseña.
3. Abre SIGPM mediante un servidor web (por ejemplo, GitHub Pages o Live Server). Los módulos JavaScript de Firebase no funcionan abriendo el archivo con `file://`.
4. Inicia sesión con una cuenta existente. No hay modo de demostración local.

El enlace **Olvidé mi contraseña** envía el correo de restablecimiento mediante Firebase Authentication.

## Servicios Firebase

- `js/firebase/firebase-client.js`: configuración fija de la aplicación web SIGPM y funciones de Authentication.
- `js/firebase/auth-ui.js`: inicio de sesión, recuperación de contraseña y cierre de sesión.
- Cloud Firestore está creado en el proyecto. El perfil de usuario se lee si existe; Authentication es quien valida las credenciales.

La configuración de una aplicación web de Firebase se incluye en el cliente y no equivale a una contraseña de administrador. Nunca publiques claves privadas de cuentas de servicio.

## Estado de la integración

La pantalla de configuración y el registro público de cuentas se han retirado de la interfaz. Las cuentas deben crearse en Firebase Console. **Los módulos de máquinas, mantenimientos, productos y producción todavía guardan sus datos de negocio en `localStorage`**; conectarlos a Firestore y definir reglas de acceso por rol es una etapa pendiente. No uses todavía esta versión para información de negocio sensible.
