/* Historial de mantenimientos realizados */
window.SIGPM = window.SIGPM || {};

SIGPM.mantenimientos = {
  filtroMaquina: "",

  render() {
    const cont = document.getElementById("vista-mantenimientos");
    const u = SIGPM.utils;
    const maquinas = SIGPM.storage.lista("maquinas");

    const registros = [...SIGPM.storage.lista("mantenimientos")]
      .filter((r) => !this.filtroMaquina || r.maquinaId === this.filtroMaquina)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    const costoTotal = registros.reduce((s, r) => s + (r.costo || 0), 0);

    cont.innerHTML = `
      <h2>Historial de mantenimientos</h2>
      <p class="subtitulo">Para registrar uno nuevo, ve a “Máquinas” y pulsa “Registrar mant.” en la máquina correspondiente.</p>
      <div class="kpis">
        <div class="kpi"><div class="valor">${registros.length}</div><div class="etiqueta">Mantenimientos</div></div>
        <div class="kpi"><div class="valor" style="font-size:1.4rem">${u.moneda(costoTotal)}</div><div class="etiqueta">Costo acumulado</div></div>
      </div>
      <div class="barra">
        <select id="man-maquina">
          <option value="">Todas las máquinas</option>
          ${maquinas.map((m) => `<option value="${m.id}" ${this.filtroMaquina === m.id ? "selected" : ""}>${u.esc(m.nombre)} (${u.esc(m.codigo)})</option>`).join("")}
        </select>
      </div>
      <div class="tarjeta tabla-wrap">
        <table>
          <thead><tr><th>Fecha</th><th>Máquina</th><th>Tipo</th><th>Descripción</th><th>Técnico</th><th>Costo</th></tr></thead>
          <tbody>
            ${registros.length ? registros.map((r) => {
              const m = SIGPM.storage.obtener("maquinas", r.maquinaId);
              return `<tr>
                <td>${u.formatoFecha(r.fecha)}</td>
                <td>${m ? u.esc(m.nombre) : "<em>(eliminada)</em>"}</td>
                <td>${u.esc(r.tipo)}</td>
                <td>${u.esc(r.descripcion)}</td>
                <td>${u.esc(r.tecnico || "—")}</td>
                <td>${u.moneda(r.costo)}</td>
              </tr>`;
            }).join("") : `<tr><td class="vacio" colspan="6">No hay mantenimientos registrados.</td></tr>`}
          </tbody>
        </table>
      </div>`;

    document.getElementById("man-maquina").onchange = (e) => { this.filtroMaquina = e.target.value; this.render(); };
  }
};
