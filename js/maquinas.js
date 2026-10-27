/* Módulo de máquinas: alta, edición, baja y registro de mantenimiento */
window.SIGPM = window.SIGPM || {};

SIGPM.maquinas = {
  filtro: { texto: "", estado: "" },

  ESTADOS: {
    operativa: "Operativa",
    en_mantenimiento: "En mantenimiento",
    fuera_servicio: "Fuera de servicio"
  },

  render() {
    const cont = document.getElementById("vista-maquinas");
    const u = SIGPM.utils;
    const todas = SIGPM.storage.lista("maquinas");

    const filas = todas
      .map((m) => ({ m, est: SIGPM.alertas.estadoMaquina(m) }))
      .filter(({ m, est }) => {
        const t = this.filtro.texto.toLowerCase();
        const coincideTexto = !t || [m.codigo, m.nombre, m.ubicacion].join(" ").toLowerCase().includes(t);
        const coincideEstado = !this.filtro.estado || est.nivel === this.filtro.estado;
        return coincideTexto && coincideEstado;
      })
      .sort((a, b) => (a.est.dias ?? 99999) - (b.est.dias ?? 99999));

    cont.innerHTML = `
      <h2>Máquinas</h2>
      <p class="subtitulo">Registra tus máquinas y define cada cuántos días necesitan mantenimiento. El sistema calcula la próxima fecha y te avisa.</p>
      <div class="barra">
        <input type="search" id="maq-buscar" placeholder="Buscar por código, nombre o ubicación…" value="${u.esc(this.filtro.texto)}">
        <select id="maq-estado">
          <option value="">Todos los estados</option>
          <option value="ok" ${this.filtro.estado === "ok" ? "selected" : ""}>Al día</option>
          <option value="aviso" ${this.filtro.estado === "aviso" ? "selected" : ""}>Próximas / en mantenimiento</option>
          <option value="peligro" ${this.filtro.estado === "peligro" ? "selected" : ""}>Vencidas / fuera de servicio</option>
        </select>
        <button class="btn acento" id="maq-nueva">+ Nueva máquina</button>
      </div>
      <div class="tarjeta tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th><th>Nombre</th><th>Ubicación</th><th>Cada (días)</th>
              <th>Último mant.</th><th>Próximo mant.</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filas.length ? filas.map(({ m, est }) => `
              <tr>
                <td><strong>${u.esc(m.codigo)}</strong></td>
                <td>${u.esc(m.nombre)}</td>
                <td>${u.esc(m.ubicacion || "—")}</td>
                <td>${m.intervaloDias || "—"}</td>
                <td>${u.formatoFecha(m.ultimoMantenimiento)}</td>
                <td>${u.formatoFecha(est.proximo)}<br><small style="color:var(--color-texto-suave)">${est.proximo ? u.textoDias(est.dias) : ""}</small></td>
                <td>${SIGPM.ui.estadoHtml(est)}</td>
                <td class="acciones">
                  <button class="btn mini" data-acc="mant" data-id="${m.id}">Registrar mant.</button>
                  <button class="btn mini sec" data-acc="editar" data-id="${m.id}">Editar</button>
                  <button class="btn mini peligro" data-acc="borrar" data-id="${m.id}">Eliminar</button>
                </td>
              </tr>`).join("") : `<tr><td class="vacio" colspan="8">${todas.length ? "Ninguna máquina coincide con el filtro." : "Aún no hay máquinas. Pulsa “Nueva máquina” para empezar."}</td></tr>`}
          </tbody>
        </table>
      </div>`;

    document.getElementById("maq-buscar").oninput = (e) => {
      this.filtro.texto = e.target.value;
      this.render();
      const input = document.getElementById("maq-buscar");
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    };
    document.getElementById("maq-estado").onchange = (e) => { this.filtro.estado = e.target.value; this.render(); };
    document.getElementById("maq-nueva").onclick = () => this.formulario();
    cont.querySelectorAll("[data-acc]").forEach((b) => {
      b.onclick = () => {
        const id = b.dataset.id;
        if (b.dataset.acc === "mant") this.registrarMantenimiento(id);
        if (b.dataset.acc === "editar") this.formulario(id);
        if (b.dataset.acc === "borrar") this.eliminar(id);
      };
    });
  },

  formulario(id) {
    const u = SIGPM.utils;
    const m = id ? SIGPM.storage.obtener("maquinas", id) : {
      codigo: "", nombre: "", ubicacion: "", fechaIngreso: u.hoy(),
      intervaloDias: 90, ultimoMantenimiento: "", estado: "operativa", notas: ""
    };

    SIGPM.ui.modal({
      titulo: id ? "Editar máquina" : "Nueva máquina",
      html: `
        <div class="form-grid">
          <div class="campo"><label>Código *</label><input name="codigo" required value="${u.esc(m.codigo)}"></div>
          <div class="campo"><label>Nombre *</label><input name="nombre" required value="${u.esc(m.nombre)}"></div>
          <div class="campo"><label>Ubicación / línea</label><input name="ubicacion" value="${u.esc(m.ubicacion)}"></div>
          <div class="campo"><label>Fecha de ingreso *</label><input type="date" name="fechaIngreso" required value="${m.fechaIngreso}"></div>
          <div class="campo"><label>Mantenimiento cada (días) *</label><input type="number" name="intervaloDias" min="1" required value="${m.intervaloDias}"></div>
          <div class="campo"><label>Último mantenimiento</label><input type="date" name="ultimoMantenimiento" value="${m.ultimoMantenimiento || ""}"></div>
          <div class="campo"><label>Estado</label>
            <select name="estado">
              ${Object.entries(this.ESTADOS).map(([k, v]) => `<option value="${k}" ${m.estado === k ? "selected" : ""}>${v}</option>`).join("")}
            </select>
          </div>
          <div class="campo ancho"><label>Notas</label><textarea name="notas" rows="2">${u.esc(m.notas)}</textarea></div>
        </div>`,
      alGuardar: (form) => {
        const v = SIGPM.ui.valores(form);
        const repetido = SIGPM.storage.lista("maquinas")
          .some((x) => x.codigo.toLowerCase() === v.codigo.toLowerCase() && x.id !== id);
        if (repetido) {
          alert("Ya existe una máquina con ese código.");
          return false;
        }
        v.intervaloDias = Number(v.intervaloDias);
        if (id) SIGPM.storage.actualizar("maquinas", id, v);
        else SIGPM.storage.agregar("maquinas", v);
        SIGPM.ui.toast(id ? "Máquina actualizada" : "Máquina registrada");
        SIGPM.app.refrescar();
      }
    });
  },

  registrarMantenimiento(id) {
    const u = SIGPM.utils;
    const m = SIGPM.storage.obtener("maquinas", id);
    SIGPM.ui.modal({
      titulo: `Registrar mantenimiento — ${m.nombre}`,
      textoGuardar: "Registrar",
      html: `
        <div class="form-grid">
          <div class="campo"><label>Fecha *</label><input type="date" name="fecha" required value="${u.hoy()}"></div>
          <div class="campo"><label>Tipo *</label>
            <select name="tipo"><option>Preventivo</option><option>Correctivo</option><option>Predictivo</option></select>
          </div>
          <div class="campo"><label>Técnico / responsable</label><input name="tecnico"></div>
          <div class="campo"><label>Costo (COP)</label><input type="number" name="costo" min="0" value="0"></div>
          <div class="campo ancho"><label>Descripción del trabajo *</label><textarea name="descripcion" rows="3" required></textarea></div>
        </div>`,
      alGuardar: (form) => {
        const v = SIGPM.ui.valores(form);
        SIGPM.storage.agregar("mantenimientos", {
          maquinaId: id, fecha: v.fecha, tipo: v.tipo,
          tecnico: v.tecnico, costo: Number(v.costo || 0), descripcion: v.descripcion
        });
        SIGPM.storage.actualizar("maquinas", id, { ultimoMantenimiento: v.fecha, estado: "operativa" });
        SIGPM.ui.toast("Mantenimiento registrado. Próxima fecha recalculada.");
        SIGPM.app.refrescar();
      }
    });
  },

  eliminar(id) {
    const m = SIGPM.storage.obtener("maquinas", id);
    if (!SIGPM.ui.confirmar(`¿Eliminar la máquina "${m.nombre}" y su historial de mantenimientos?`)) return;
    SIGPM.storage.eliminar("maquinas", id);
    SIGPM.storage.datos.mantenimientos = SIGPM.storage.datos.mantenimientos.filter((x) => x.maquinaId !== id);
    SIGPM.storage.guardar();
    SIGPM.ui.toast("Máquina eliminada");
    SIGPM.app.refrescar();
  }
};
