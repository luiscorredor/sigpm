
window.SIGPM = window.SIGPM || {};

SIGPM.dashboard = {
  render() {
    const cont = document.getElementById("vista-dashboard");
    const u = SIGPM.utils;
    const r = SIGPM.alertas.resumen();

    cont.innerHTML = `
      <h2>Panel de control</h2>
      <p class="subtitulo">Hoy es ${u.formatoFecha(u.hoy())}. Aquí ves de un vistazo qué necesita atención.</p>

      <div class="kpis">
        <div class="kpi"><div class="valor">${r.totalMaquinas}</div><div class="etiqueta">Máquinas registradas (${r.operativas} operativas)</div></div>
        <div class="kpi ${r.maqVencidas ? "peligro" : "ok"}"><div class="valor">${r.maqVencidas}</div><div class="etiqueta">Mantenimientos vencidos</div></div>
        <div class="kpi ${r.maqProximas ? "aviso" : "ok"}"><div class="valor">${r.maqProximas}</div><div class="etiqueta">Mantenimientos próximos</div></div>
        <div class="kpi"><div class="valor">${r.totalProductos}</div><div class="etiqueta">Productos registrados</div></div>
        <div class="kpi ${r.prodVencidos ? "peligro" : "ok"}"><div class="valor">${r.prodVencidos}</div><div class="etiqueta">Productos vencidos</div></div>
        <div class="kpi ${r.prodPorVencer ? "aviso" : "ok"}"><div class="valor">${r.prodPorVencer}</div><div class="etiqueta">Productos por vencer</div></div>
      </div>

      <div class="tarjeta">
        <h3>Alertas activas (${r.totalAlertas})</h3>
        ${r.mensajes.length
          ? r.mensajes.map((m) => `
              <div class="alerta ${m.nivel}">
                <span class="texto">${u.esc(m.texto)}</span>
                <button class="btn mini ${m.tipo === "maquina" ? "" : "sec"}" data-ir="${m.tipo}">
                  ${m.tipo === "maquina" ? "Ver máquinas" : "Ver productos"}
                </button>
              </div>`).join("")
          : `<div class="alerta ok"><span class="texto">Todo en orden: no hay mantenimientos ni vencimientos pendientes.</span></div>`}
      </div>`;

    cont.querySelectorAll("[data-ir]").forEach((b) => {
      b.onclick = () => SIGPM.app.ir(b.dataset.ir === "maquina" ? "maquinas" : "productos");
    });
  }
};
