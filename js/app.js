
window.SIGPM = window.SIGPM || {};

SIGPM.app = {
  vistaActual: "dashboard",

  vistas: {
    dashboard: () => SIGPM.dashboard,
    maquinas: () => SIGPM.maquinas,
    productos: () => SIGPM.productos,
    produccion: () => SIGPM.produccion,
    mantenimientos: () => SIGPM.mantenimientos,
    ajustes: () => SIGPM.ajustes
  },

  iniciar() {
    SIGPM.storage.cargar();

    document.querySelectorAll(".nav-btn").forEach((b) => {
      b.onclick = () => this.ir(b.dataset.vista);
    });

    document.getElementById("modal-fondo").addEventListener("mousedown", (e) => {
      if (e.target.id === "modal-fondo") SIGPM.ui.cerrarModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") SIGPM.ui.cerrarModal();
    });

    this.ir("dashboard");

    setInterval(() => {
      if (document.getElementById("modal-fondo").classList.contains("abierto")) return;
      this.refrescar();
    }, 60 * 60 * 1000);
  },

  ir(nombre) {
    this.vistaActual = nombre;
    document.querySelectorAll(".vista").forEach((v) => v.classList.toggle("activa", v.id === `vista-${nombre}`));
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("activo", b.dataset.vista === nombre));
    this.refrescar();
  },

  refrescar() {
    this.vistas[this.vistaActual]().render();
    this.actualizarInsignia();
  },

  actualizarInsignia() {
    const total = SIGPM.alertas.resumen().totalAlertas;
    const badge = document.getElementById("badge-alertas");
    badge.textContent = total;
    badge.classList.toggle("oculto", total === 0);
  }
};

document.addEventListener("DOMContentLoaded", () => SIGPM.app.iniciar());
