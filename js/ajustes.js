
window.SIGPM = window.SIGPM || {};

SIGPM.ajustes = {
  render() {
    const cont = document.getElementById("vista-ajustes");
    const cfg = SIGPM.storage.datos.config;

    cont.innerHTML = `
      <h2>Ajustes</h2>
      <p class="subtitulo">Configura cuándo quieres que el sistema empiece a avisarte.</p>

      <div class="tarjeta">
        <h3>Anticipación de las alertas</h3>
        <form id="aj-form">
          <div class="form-grid">
            <div class="campo"><label>Avisar vencimiento de productos con (días)</label>
              <input type="number" name="diasAvisoVencimiento" min="0" required value="${cfg.diasAvisoVencimiento}"></div>
            <div class="campo"><label>Avisar mantenimiento de máquinas con (días)</label>
              <input type="number" name="diasAvisoMantenimiento" min="0" required value="${cfg.diasAvisoMantenimiento}"></div>
          </div>
          <div class="acciones" style="margin-top:14px"><button class="btn" type="submit">Guardar ajustes</button></div>
        </form>
      </div>

      <div class="tarjeta">
        <h3>Respaldo de datos</h3>
        <p class="subtitulo" style="margin-bottom:12px">Los datos se guardan en este navegador. Descarga un respaldo con frecuencia, o para llevarlos a otro equipo.</p>
        <div class="acciones">
          <button class="btn" id="aj-exportar">Descargar respaldo (.json)</button>
          <button class="btn sec" id="aj-importar">Restaurar desde respaldo</button>
          <input type="file" id="aj-archivo" accept="application/json" hidden>
          <button class="btn peligro" id="aj-borrar">Borrar todos los datos</button>
        </div>
      </div>`;

    document.getElementById("aj-form").onsubmit = (e) => {
      e.preventDefault();
      const v = SIGPM.ui.valores(e.target);
      cfg.diasAvisoVencimiento = Number(v.diasAvisoVencimiento);
      cfg.diasAvisoMantenimiento = Number(v.diasAvisoMantenimiento);
      SIGPM.storage.guardar();
      SIGPM.ui.toast("Ajustes guardados");
      SIGPM.app.refrescar();
    };

    document.getElementById("aj-exportar").onclick = () => SIGPM.storage.exportar();

    const archivo = document.getElementById("aj-archivo");
    document.getElementById("aj-importar").onclick = () => archivo.click();
    archivo.onchange = () => {
      const f = archivo.files[0];
      if (!f) return;
      if (!SIGPM.ui.confirmar("Esto reemplazará los datos actuales por los del respaldo. ¿Continuar?")) {
        archivo.value = "";
        return;
      }
      const lector = new FileReader();
      lector.onload = () => {
        try {
          SIGPM.storage.importar(lector.result);
          SIGPM.ui.toast("Datos restaurados");
          SIGPM.app.refrescar();
        } catch (err) {
          alert("No se pudo restaurar: " + err.message);
        }
      };
      lector.readAsText(f);
    };

    document.getElementById("aj-borrar").onclick = () => {
      if (!SIGPM.ui.confirmar("¿Borrar TODOS los datos? Esta acción no se puede deshacer.")) return;
      SIGPM.storage.datos = SIGPM.storage.porDefecto();
      SIGPM.storage.guardar();
      SIGPM.ui.toast("Datos borrados");
      SIGPM.app.refrescar();
    };
  }
};
