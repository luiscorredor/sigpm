import express from "express";
import cors from "cors";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const app = express();
app.use(express.json({ limit: "1mb" }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map((value) => value.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origen no autorizado por CORS."));
  }
}));

function initFirebaseAdmin() {
  if (getApps().length) return getApps()[0];
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
  }
  return initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
}
initFirebaseAdmin();
const auth = getAuth();
const db = getFirestore();

app.get("/health", (_req, res) => res.json({ ok: true, service: "SIGPM Admin API" }));

async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return res.status(401).json({ error: "Falta el token de sesión." });
    const decoded = await auth.verifyIdToken(header.slice(7));
    const snap = await db.collection("users").doc(decoded.uid).get();
    const profile = snap.exists ? snap.data() : {};
    if (profile.active !== true || profile.role !== "Administrador") {
      return res.status(403).json({ error: "Solo un administrador activo puede realizar esta operación." });
    }
    req.admin = { uid: decoded.uid, email: decoded.email || "" };
    next();
  } catch (error) {
    console.error("Error verificando administrador:", error.message);
    res.status(401).json({ error: "Sesión no válida o no autorizada." });
  }
}

app.use("/api/admin", requireAdmin);

app.get("/api/admin/users", async (_req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    res.json(snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron consultar los usuarios." });
  }
});

app.post("/api/admin/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name?.trim() || !email?.trim() || typeof password !== "string" || password.length < 12) {
      return res.status(400).json({ error: "Indica nombre, correo y una contraseña temporal de al menos 12 caracteres." });
    }
    if (role !== "Empleado") return res.status(400).json({ error: "Desde este panel solo se pueden crear usuarios Empleado." });
    const userRecord = await auth.createUser({ email: email.trim(), password, displayName: name.trim(), disabled: false });
    try {
      await db.collection("users").doc(userRecord.uid).set({
        name: name.trim(), email: email.trim(), role: "Empleado", active: true,
        createdAt: FieldValue.serverTimestamp(), createdBy: req.admin.uid
      });
      await db.collection("user_activity").add({
        action: "user_created", targetUid: userRecord.uid, actorUid: req.admin.uid,
        actorEmail: req.admin.email, at: FieldValue.serverTimestamp()
      });
    } catch (error) {
      await auth.deleteUser(userRecord.uid).catch(() => {});
      throw error;
    }
    res.status(201).json({ uid: userRecord.uid, name: name.trim(), email: email.trim(), role: "Empleado", active: true });
  } catch (error) {
    console.error("No se pudo crear empleado:", error.code || error.message);
    const messages = {
      "auth/email-already-exists": "Ese correo ya tiene una cuenta.",
      "auth/invalid-email": "El correo no es válido.",
      "auth/weak-password": "La contraseña es demasiado débil."
    };
    res.status(400).json({ error: messages[error.code] || "No se pudo crear el empleado. Revisa los datos." });
  }
});

app.patch("/api/admin/users/:uid/status", async (req, res) => {
  try {
    const { active } = req.body || {};
    if (typeof active !== "boolean") return res.status(400).json({ error: "El estado active debe ser true o false." });
    if (req.params.uid === req.admin.uid && active === false) {
      return res.status(400).json({ error: "No puedes bloquear tu propia cuenta de administrador." });
    }
    const ref = db.collection("users").doc(req.params.uid);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "No existe el perfil de usuario." });
    if (snap.data().role === "Administrador") return res.status(403).json({ error: "Este endpoint no permite bloquear administradores." });
    await auth.updateUser(req.params.uid, { disabled: !active });
    await ref.update({ active, updatedAt: FieldValue.serverTimestamp(), updatedBy: req.admin.uid });
    await db.collection("user_activity").add({
      action: active ? "user_reactivated" : "user_blocked", targetUid: req.params.uid,
      actorUid: req.admin.uid, actorEmail: req.admin.email, at: FieldValue.serverTimestamp()
    });
    res.json({ uid: req.params.uid, active });
  } catch (error) {
    console.error("No se pudo cambiar el estado:", error.code || error.message);
    res.status(400).json({ error: "No se pudo cambiar el estado del usuario." });
  }
});

app.get("/api/admin/activity", async (_req, res) => {
  try {
    const snapshot = await db.collection("user_activity").orderBy("at", "desc").limit(100).get();
    res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo consultar la actividad." });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`SIGPM Admin API escuchando en puerto ${port}`));
