# SIGPM Admin API (Render)

## Render settings
- Create a **Web Service** connected to this repository.
- Root Directory: `server`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`

## Environment variables
- `FIREBASE_PROJECT_ID`: `sigpm-53b9e`
- `FIREBASE_SERVICE_ACCOUNT_JSON`: complete service-account JSON as one environment variable. Generate it only from Firebase/Google Cloud IAM for the project, store it only in Render Environment, and never commit it.
- `ALLOWED_ORIGINS`: `https://luiscorredor.github.io` (the GitHub Pages origin; no trailing slash).

If using a Render service account with Google Application Default Credentials instead, configure that securely and omit the JSON variable. Never paste service-account keys into chat or GitHub.

## Endpoints
- `GET /health`: health check.
- `GET /api/admin/users`: list user profiles.
- `POST /api/admin/users`: create an Employee (requires name, email, password >= 12 chars, role `Empleado`).
- `PATCH /api/admin/users/:uid/status`: activate/block employee.
- `GET /api/admin/activity`: recent admin API activity.

All /api/admin routes require `Authorization: Bearer <Firebase ID token>` and verify the caller's active Firestore profile has role exactly `Administrador`.

This API is a first backend milestone. Before production, configure Firestore rules to prevent client-side privilege escalation and add activity logging for machine/product/maintenance/production writes.
