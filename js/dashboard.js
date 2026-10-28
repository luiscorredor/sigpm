window.SIGPM = window.SIGPM || {};

SIGPM.dashboard = {
  render() {
    const cont = document.getElementById("vista-dashboard");
    const u = SIGPM.utils;
    const data = SIGPM.storage.datos;
    const resumen = SIGPM.alertas.resumen();
    const hoy = u.hoy();
    const produccionHoy = data.produccion.filter((r) => r.fecha === hoy).reduce((s, r) => s + Number(r.cantidad || 0), 0);
    const mantenimientosAbiertos = data.maquinas.filter((m) => m.estado === "en_mantenimiento" || SIGPM.alertas.estadoMaquina(m).nivel === "peligro").length;
    const alertasInventario = resumen.prodVencidos + resumen.prodPorVencer;
    const ultimos = [...data.produccion].sort((a,b) => (b.fecha || "").localeCompare(a.fecha || "")).slice(0,5);
    const week = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); const iso=u.aISO(d); return {iso,label:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()],total:data.produccion.filter(r=>r.fecha===iso).reduce((s,r)=>s+Number(r.cantidad||0),0)}; });
    const max = Math.max(1,...week.map(x=>x.total));
    cont.innerHTML = `
      <div class="dashboard-intro">
        <div><p class="eyebrow">VISTA GENERAL</p><h2>Panel de control</h2><p class="subtitulo">Monitorea producción, inventario y mantenimiento desde un solo lugar.</p></div>
        <button class="btn" id="dashboard-new">＋ Nuevo registro</button>
      </div>
      <section class="hero-banner">
        <div class="hero-copy">
          <div class="hero-kicker"><i></i> CENTRO DE OPERACIONES <span>/</span> SIGPM 2.0</div>
          <h3>Todo bajo control.<br><em>Producción en movimiento.</em></h3>
          <p>Una visión clara de tus órdenes, equipos e inventario para tomar mejores decisiones.</p>
          <div class="hero-actions"><button class="btn" id="dashboard-explore">Explorar producción　↗</button><span class="hero-note">PANEL OPERATIVO · ACTUALIZADO AL INSTANTE</span></div>
        </div>
        <div class="hero-graphic" aria-hidden="true"><div class="hero-orbit"></div><div class="hero-orbit two"></div><div class="hero-diamond"><span><b>SP</b><small>CONTROL<br>INTEGRADO</small></span></div><div class="hero-float one"><b>↗　Operación</b><small>Panel central</small></div><div class="hero-float two"><b>⌁　Flujo activo</b><small>Producción + mantenimiento</small></div></div>
        <span class="hero-page">01 / 04</span>
      </section>
      <div class="kpis dashboard-kpis">
        <div class="kpi"><div class="kpi-top"><span>Órdenes activas</span><i>▤</i></div><div class="valor">${data.produccion.filter(r=>r.fecha===hoy).length}</div><div class="etiqueta">Registros de producción hoy</div></div>
        <div class="kpi"><div class="kpi-top"><span>Máquinas operativas</span><i>⚙</i></div><div class="valor">${resumen.operativas}/${resumen.totalMaquinas}</div><div class="etiqueta">Disponibilidad de equipos</div></div>
        <div class="kpi"><div class="kpi-top"><span>Mantenimientos abiertos</span><i>🔧</i></div><div class="valor">${mantenimientosAbiertos}</div><div class="etiqueta">Pendientes o en ejecución</div></div>
        <div class="kpi"><div class="kpi-top"><span>Alertas de inventario</span><i>◉</i></div><div class="valor">${alertasInventario}</div><div class="etiqueta">Artículos vencidos o por vencer</div></div>
      </div>
      <div class="dashboard-lower">
        <section class="tarjeta chart-card"><div class="section-heading"><div><h3>Producción semanal</h3><p>Unidades registradas en los últimos 7 días</p></div><button class="btn sec mini" id="dashboard-see-production">Ver producción ↗</button></div>
          <div class="weekly-chart">${week.map(x=>`<div class="chart-col"><span class="chart-value">${x.total||""}</span><div class="chart-track"><div class="chart-bar" style="height:${Math.max(x.total?8:2,Math.round(x.total/max*100))}%"></div></div><small>${x.label}</small></div>`).join("")}</div>
        </section>
        <section class="tarjeta alert-card"><div class="section-heading"><div><h3>Alertas y atención</h3><p>Elementos que requieren seguimiento</p></div><span class="alert-count">${resumen.totalAlertas}</span></div>
          ${resumen.mensajes.length ? resumen.mensajes.slice(0,4).map(m=>`<div class="alerta ${m.nivel}"><span class="texto">${u.esc(m.texto)}</span><button class="btn mini sec" data-alert-ir="${m.tipo}">Ver</button></div>`).join("") : `<div class="empty-state"><span>✓</span><b>Todo en orden</b><small>No hay alertas de mantenimiento ni vencimientos.</small></div>`}
        </section>
      </div>
      <section class="tarjeta recent-card"><div class="section-heading"><div><h3>Producción reciente</h3><p>Últimos registros añadidos al sistema</p></div><button class="btn sec mini" id="dashboard-see-all">Ver todos</button></div>
        <div class="tabla-wrap"><table><thead><tr><th>Fecha</th><th>Producto</th><th>Máquina</th><th>Cantidad</th><th>Turno</th></tr></thead><tbody>
        ${ultimos.length ? ultimos.map(r=>{const p=data.productos.find(x=>x.id===r.productoId),m=data.maquinas.find(x=>x.id===r.maquinaId);return `<tr><td>${u.formatoFecha(r.fecha)}</td><td>${u.esc(p?.nombre||"Producto eliminado")}</td><td>${u.esc(m?.nombre||"Máquina eliminada")}</td><td><b>${Number(r.cantidad||0).toLocaleString("es-CO")}</b></td><td>${u.esc(r.turno||"—")}</td></tr>`}).join("") : `<tr><td class="vacio" colspan="5">Aún no hay producción registrada.</td></tr>`}
        </tbody></table></div>
      </section>`;
    document.getElementById("dashboard-new").onclick=()=>SIGPM.app.ir("maquinas");
    document.getElementById("dashboard-explore").onclick=()=>SIGPM.app.ir("produccion");
    document.getElementById("dashboard-see-production").onclick=()=>SIGPM.app.ir("produccion");
    document.getElementById("dashboard-see-all").onclick=()=>SIGPM.app.ir("produccion");
    cont.querySelectorAll("[data-alert-ir]").forEach(b=>b.onclick=()=>SIGPM.app.ir(b.dataset.alertIr==="maquina"?"maquinas":"productos"));
  }
};