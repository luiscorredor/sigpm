/* Lógica de negocio: cuándo vence un producto y cuándo toca mantenimiento */
window.SIGPM = window.SIGPM || {};

SIGPM.alertas = {
  // ---------- Productos ----------
  estadoProducto(p) {
    const cfg = SIGPM.storage.datos.config;
    const dias = SIGPM.utils.diasHasta(p.fechaVencimiento);
    if (dias === null) return { nivel: "ok", texto: "Sin vencimiento", dias: null };
    if (dias < 0) return { nivel: "peligro", texto: "Vencido", dias };
    if (dias <= cfg.diasAvisoVencimiento) return { nivel: "aviso", texto: "Por vencer", dias };
    return { nivel: "ok", texto: "Vigente", dias };
  },

  // ---------- Máquinas ----------
  proximoMantenimiento(m) {
    const base = m.ultimoMantenimiento || m.fechaIngreso;
    if (!base || !m.intervaloDias) return null;
    return SIGPM.utils.sumarDias(base, m.intervaloDias);
  },

  estadoMaquina(m) {
    const cfg = SIGPM.storage.datos.config;
    const proximo = this.proximoMantenimiento(m);
    const dias = proximo ? SIGPM.utils.diasHasta(proximo) : null;

    if (m.estado === "fuera_servicio") return { nivel: "peligro", texto: "Fuera de servicio", dias, proximo };
    if (m.estado === "en_mantenimiento") return { nivel: "aviso", texto: "En mantenimiento", dias, proximo };
    if (dias === null) return { nivel: "ok", texto: "Sin plan", dias, proximo };
    if (dias < 0) return { nivel: "peligro", texto: "Mantenimiento vencido", dias, proximo };
    if (dias <= cfg.diasAvisoMantenimiento) return { nivel: "aviso", texto: "Mantenimiento próximo", dias, proximo };
    return { nivel: "ok", texto: "Al día", dias, proximo };
  },

  // ---------- Resumen para el panel ----------
  resumen() {
    const { maquinas, productos } = SIGPM.storage.datos;
    const u = SIGPM.utils;

    const maq = maquinas.map((m) => ({ item: m, est: this.estadoMaquina(m) }));
    const prod = productos.map((p) => ({ item: p, est: this.estadoProducto(p) }));

    const maqVencidas = maq.filter((x) => x.est.nivel === "peligro" && x.est.texto === "Mantenimiento vencido");
    const maqProximas = maq.filter((x) => x.est.texto === "Mantenimiento próximo");
    const prodVencidos = prod.filter((x) => x.est.texto === "Vencido");
    const prodPorVencer = prod.filter((x) => x.est.texto === "Por vencer");

    const mensajes = [];
    maqVencidas.forEach((x) => mensajes.push({
      nivel: "peligro", tipo: "maquina", id: x.item.id,
      texto: `Máquina ${x.item.nombre} (${x.item.codigo}): mantenimiento vencido ${u.textoDias(x.est.dias).toLowerCase()} (${u.formatoFecha(x.est.proximo)}).`
    }));
    prodVencidos.forEach((x) => mensajes.push({
      nivel: "peligro", tipo: "producto", id: x.item.id,
      texto: `Producto ${x.item.nombre} (lote ${x.item.lote || "s/n"}): vencido ${u.textoDias(x.est.dias).toLowerCase()} (${u.formatoFecha(x.item.fechaVencimiento)}).`
    }));
    maqProximas.forEach((x) => mensajes.push({
      nivel: "aviso", tipo: "maquina", id: x.item.id,
      texto: `Máquina ${x.item.nombre} (${x.item.codigo}): mantenimiento ${u.textoDias(x.est.dias).toLowerCase()} (${u.formatoFecha(x.est.proximo)}).`
    }));
    prodPorVencer.forEach((x) => mensajes.push({
      nivel: "aviso", tipo: "producto", id: x.item.id,
      texto: `Producto ${x.item.nombre} (lote ${x.item.lote || "s/n"}): vence ${u.textoDias(x.est.dias).toLowerCase()} (${u.formatoFecha(x.item.fechaVencimiento)}).`
    }));

    return {
      totalMaquinas: maquinas.length,
      totalProductos: productos.length,
      maqVencidas: maqVencidas.length,
      maqProximas: maqProximas.length,
      prodVencidos: prodVencidos.length,
      prodPorVencer: prodPorVencer.length,
      operativas: maq.filter((x) => x.item.estado === "operativa").length,
      mensajes,
      totalAlertas: mensajes.length
    };
  }
};
