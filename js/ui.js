/* Utilidades de interfaz: toast, modal y confirmaciones */
window.SIGPM = window.SIGPM || {};

SIGPM.ui = {
  _timer: null,

  toast(mensaje) {
    const t = document.getElementById("toast");
    t.textContent = mensaje;
    t.classList.add("visible");
    clearTimeout(this._timer);
    this._timer = setTimeout(() => t.classList.remove("visible"), 2800);
  },

  // Abre un modal con título, HTML del formulario y callback al guardar.
  // alGuardar(formElement) debe devolver false para mantener el modal abierto.
  modal({ titulo, html, textoGuardar = "Guardar", alGuardar }) {
    const fondo = document.getElementById("modal-fondo");
    const caja = document.getElementById("modal-caja");
    caja.innerHTML = `
      <h3>${SIGPM.utils.esc(titulo)}</h3>
      <form id="modal-form" novalidate>
        ${html}
        <div class="acciones">
          <button type="button" class="btn sec" id="modal-cancelar">Cancelar</button>
          <button type="submit" class="btn">${SIGPM.utils.esc(textoGuardar)}</button>
        </div>
      </form>`;
    fondo.classList.add("abierto");

    const form = document.getElementById("modal-form");
    document.getElementById("modal-cancelar").onclick = () => this.cerrarModal();
    form.onsubmit = (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (alGuardar(form) !== false) this.cerrarModal();
    };
    const primero = form.querySelector("input, select, textarea");
    if (primero) primero.focus();
  },

  cerrarModal() {
    document.getElementById("modal-fondo").classList.remove("abierto");
    document.getElementById("modal-caja").innerHTML = "";
  },

  confirmar(mensaje) {
    return window.confirm(mensaje);
  },

  // Lee los valores de un formulario como objeto
  valores(form) {
    const datos = {};
    new FormData(form).forEach((v, k) => { datos[k] = typeof v === "string" ? v.trim() : v; });
    return datos;
  },

  estadoHtml(est) {
    return `<span class="estado ${est.nivel}">${SIGPM.utils.esc(est.texto)}</span>`;
  }
};
