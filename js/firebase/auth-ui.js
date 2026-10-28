import { signIn, resetPassword, currentSession, logOut, syncAllCollections, saveRecordToCloud, deleteRecordFromCloud } from "./firebase-client.js";

const $ = (selector) => document.querySelector(selector);

const messages = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/invalid-email": "El correo no tiene un formato válido.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  "auth/network-request-failed": "No hay conexión. Revisa internet e inténtalo otra vez.",
  "auth/operation-not-allowed": "El método Correo electrónico/Contraseña no está habilitado en Firebase Authentication.",
  "permission-denied": "Firebase bloqueó el acceso a los datos. Hay que revisar las reglas de Firestore.",
  "unavailable": "Firestore no está disponible en este momento. Revisa tu conexión e inténtalo de nuevo."
};

function errorMessage(error) {
  return messages[error.code] || "No se pudo completar la operación. Revisa los datos e inténtalo de nuevo.";
}

function renderLogin() {
  document.body.classList.remove("sigpm-authenticated");

  let screen = $("#sigpm-auth-screen");
  if (!screen) {
    screen = document.createElement("section");
    screen.id = "sigpm-auth-screen";
    document.body.append(screen);
  }

  screen.innerHTML = `
    <div class="sigpm-login-layout">
      <section class="sigpm-login-hero">
        <div class="sigpm-login-brand">
          <span>S</span>
          <div><b>SIGPM</b><small>Gestión inteligente de operaciones</small></div>
        </div>
        <div class="sigpm-hero-copy">
          <p>PRODUCCIÓN · INVENTARIO · MANTENIMIENTO</p>
          <h1>Todo tu negocio,<br><em>en un solo lugar.</em></h1>
          <div class="sigpm-benefits">
            <div>✓ <span><b>Control operativo</b><small>Órdenes, máquinas y mantenimiento</small></span></div>
            <div>✓ <span><b>Inventario y ventas</b><small>Productos, materiales y reportes</small></span></div>
            <div>✓ <span><b>Acceso seguro</b><small>Cuenta autorizada por SIGPM</small></span></div>
          </div>
        </div>
        <small class="sigpm-hero-footer">SIGPM · Gestión de Producción y Mantenimiento</small>
      </section>
      <section class="sigpm-login-main">
        <div class="sigpm-login-card">
          <p class="sigpm-kicker">PORTAL PRIVADO</p>
          <h2>Bienvenido</h2>
          <p class="sigpm-login-subtitle">Ingresa con el correo y la contraseña que te asignó el administrador en Firebase.</p>
          <form id="sigpm-login-form">
            <label>Correo electrónico<input name="email" type="email" autocomplete="username" required placeholder="nombre@empresa.com"></label>
            <label>Contraseña<input name="password" type="password" autocomplete="current-password" required placeholder="Tu contraseña"></label>
            <p id="sigpm-login-error" role="alert" hidden></p>
            <button class="sigpm-login-submit" type="submit">Iniciar sesión <span>→</span></button>
            <button id="sigpm-reset" class="sigpm-link-button" type="button">Olvidé mi contraseña</button>
          </form>
        </div>
        <p class="sigpm-login-footer">Acceso privado · Firebase Authentication</p>
      </section>
    </div>`;

  $("#sigpm-login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const error = $("#sigpm-login-error");
    error.hidden = true;
    button.disabled = true;
    button.textContent = "Verificando…";

    try {
      const data = new FormData(form);
      const user = await signIn(String(data.get("email")), String(data.get("password")));
      sessionStorage.removeItem("sigpm_demo_mode");
      sessionStorage.setItem("sigpm_firebase_uid", user.uid);
      await prepareCloudSync(user);
      openApp(user);
      window.SIGPM?.app?.refrescar();
    } catch (problem) {
      error.textContent = errorMessage(problem);
      error.hidden = false;
    } finally {
      button.disabled = false;
      button.innerHTML = 'Iniciar sesión <span>→</span>';
    }
  });

  $("#sigpm-reset").addEventListener("click", async () => {
    const email = $("#sigpm-login-form").elements.email.value.trim();
    const error = $("#sigpm-login-error");
    if (!email) {
      error.textContent = "Escribe tu correo electrónico primero.";
      error.hidden = false;
      return;
    }

    try {
      await resetPassword(email);
      error.textContent = "Si el correo pertenece a una cuenta, recibirás instrucciones para restablecer la contraseña.";
      error.hidden = false;
    } catch (problem) {
      error.textContent = errorMessage(problem);
      error.hidden = false;
    }
  });
}

async function prepareCloudSync(user) {
  window.SIGPM=window.SIGPM||{};
  const names=["maquinas","mantenimientos","productos","produccion","materias","tecnicos","repuestos","ventas"];
  window.SIGPM.cloudSync={ready:false,collections:names,save:(name,record)=>saveRecordToCloud(name,record,user.uid),delete:(name,id)=>deleteRecordFromCloud(name,id)};
  const cloud=await syncAllCollections(window.SIGPM.storage?.datos||{},user.uid);
  if(window.SIGPM.storage){for(const name of names)window.SIGPM.storage.datos[name]=cloud[name]||[];window.SIGPM.storage.guardar();}
  window.SIGPM.cloudSync.ready=true;
}
function openApp(user) {
  document.body.classList.add("sigpm-authenticated");
  const app = $(".app");
  if (app) app.style.display = "";

  let chip = $("#sigpm-session-chip");
  if (!chip) {
    chip = document.createElement("div");
    chip.id = "sigpm-session-chip";
    chip.className = "sigpm-session-chip";
    $(".sidebar")?.append(chip);
  }

  window.SIGPM.currentUser = user;
  const userNav = $("#nav-usuarios");
  if (userNav) { userNav.hidden = user.role !== "admin"; userNav.style.display = user.role === "admin" ? "" : "none"; }
  if (user.role !== "admin" && window.SIGPM.app?.vistaActual === "usuarios") window.SIGPM.app.ir("dashboard");

  const safeName = escapeHtml(user.name || user.email || "Usuario");
  const safeRole = escapeHtml(user.role || "Usuario");
  chip.innerHTML = `<div><b>${safeName}</b><small>${safeRole}</small></div>`;
  const topName = $("#topbar-name"); if (topName) topName.textContent = user.name || user.email || "Usuario SIGPM";
  const topRole = $("#topbar-role"); if (topRole) topRole.textContent = user.role || "Usuario";
  const avatar = $(".user-avatar"); if (avatar) avatar.textContent = String(user.name || user.email || "S").split(/[\\s@._-]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();

  const logout = async () => {
    try {
      await logOut();
    } finally {
      sessionStorage.removeItem("sigpm_firebase_uid");
      sessionStorage.removeItem("sigpm_demo_mode");
      window.SIGPM.currentUser = null;
      const userNav = $("#nav-usuarios"); if (userNav) { userNav.hidden = true; userNav.style.display = "none"; }
      renderLogin();
    }
  };
  $("#topbar-logout")?.addEventListener("click", logout);

  $("#sigpm-auth-screen")?.remove();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

async function start() {
  document.body.classList.remove("sigpm-authenticated");

  renderLogin();

  try {
    const user = await Promise.race([
      currentSession(),
      new Promise((resolve) => setTimeout(() => resolve(null), 5000))
    ]);
    if (user && user.active !== false) {
      await prepareCloudSync(user);
      openApp(user);
      window.SIGPM?.app?.refrescar();
    }
  } catch (error) {
    console.error("No se pudo recuperar la sesión de Firebase:", error);
   
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
