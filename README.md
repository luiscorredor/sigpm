# SIGPM — Gestión de Producción y Mantenimiento

## Abrir en local
Abre `index.html` con Live Server en Visual Studio Code. Firebase usa módulos JavaScript y no funciona al abrir con `file://`.

## Terminal Firebase
- `firebase-setup.html`: configura el proyecto web y registra la primera cuenta.
- `js/firebase/firebase-client.js`: Firebase Authentication y perfil Firestore.
- `js/firebase/auth-ui.js`: inicio de sesión, recuperación de contraseña y cierre de sesión.
- `firebase.rules.txt`: reglas iniciales de referencia.

## Configuración
1. En Firebase Console registra una aplicación web y copia `apiKey`, `authDomain`, `projectId` y `appId`.
2. Abre `firebase-setup.html` con Live Server y guarda los valores.
3. En Build → Authentication → Sign-in method habilita Correo electrónico/Contraseña.
4. Crea Cloud Firestore.
5. Registra una cuenta en la terminal. Las cuentas nuevas empiezan con rol `employee`; asigna `admin` al documento `users/{uid}` desde Firestore para la cuenta administradora.

## Estado y límites
El inicio de sesión usa Firebase Authentication cuando se configura. El modo de demostración es local. **Los módulos de negocio todavía guardan datos en localStorage**; la integración de máquinas, mantenimientos, productos y producción con Firestore es una etapa posterior. No uses datos reales hasta completar esa integración y revisar las reglas por rol. No pegues claves privadas ni archivos de cuentas de servicio en la página.
