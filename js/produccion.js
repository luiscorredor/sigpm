/* Módulo de producción: registro de lo producido por máquina y turno */
window.SIGPM = window.SIGPM || {};

SIGPM.produccion = {
  render() {
    const cont = document.getElementById("vista-produccion");
    const u = SIGPM.utils;
    const registros = [...SIGPM.storage.lista("produccion")].sort((a, b) => b.fecha.localeCompare(a.fecha));
    const hoy = u.hoy();
    const mes = hoy.slice(0, 7);

    const totalHoy = registros.filter((r) => r.fecha === hoy).reduce((s, r) => s + r.cantidad, 0);
    const totalMes = registros.filter((r) => r.fecha.startsWith(mes)).reduce((s, r) => s + r.cantidad, 0);

    cont.innerHTML = `
      <h2>Producción</h2>
      <p class="subtitulo">Registra lo producido en cada máquina. Opcionalmente suma la cantidad al inventario del producto.</p>
      <div class="kpis">
        <div class="kpi"><div class="valor">${totalHoy}</div><div class="etiqueta">Unidades producidas hoy</div></div>
        <div class="kpi"><div class="valor">${totalMes}</div><div class="etiqueta">Unidades este mes</div></div>
        <div class="kpi"><div class="valor">${registros.length}</div><div class="etiqueta">Registros totales</div></div>
      </div>
      <div class="barra"><button class="btn acento" id="pro-nueva">+ Registrar producción</button></div>
      <div class="tarjeta tabla-wrap">
        <table>
          <thead><tr><th>Fecha</th><th>Producto</th><th>Máquina</th><th>Cantidad</th><th>Turno</th><th>Observaciones</th><th></th></tr></thead>
          <tbody>
            ${registros.length ? registros.map((r) => {
              const p = SIGPM.storage.obtener("productos", r.productoId);
              const m = SIGPM.storage.obtener("maquinas", r.maquinaId);
              return `<tr>
                <td>${u.formatoFecha(r.fecha)}</td>
                <td>${p ? u.esc(p.nombre) : "<em>(producto eliminado)</em>"}</td>
                <td>${m ? u.esc(m.nombre) : "<em>(máquina eliminada)</em>"}</td>
                <td>${r.cantidad}</td>
                <td>${u.esc(r.turno)}</td>
                <td>${u.esc(r.observaciones || "—")}</td>
                <td><button class="btn mini peligro" data-id="${r.id}">Eliminar</button></td>
              </tr>`;
            }).join("") : `<tr><td class="vacio" colspan="7">Todavía no hay registros de producción.</td></tr>`}
          </tbody>
        </table>
      </div>`;

    document.getElementById("pro-nueva").onclick = () => this.formulario();
    cont.querySelectorAll("button[data-id]").forEach((b) => {
      b.onclick = () => {
        if (!SIGPM.ui.confirmar("¿Eliminar este registro de producción? (No revierte el inventario)")) return;
        SIGPM.storage.eliminar("produccion", b.dataset.id);
        SIGPM.app.refrescar();
      };
    });
  },

  formulario() {
    const u = SIGPM.utils;
    const productos = SIGPM.storage.lista("productos");
    const maquinas = SIGPM.storage.lista("maquinas");

    if (!productos.length || !maquinas.length) {
      alert("Primero registra al menos un producto y una máquina.");
      return;
    }

    SIGPM.ui.modal({
      titulo: "Registrar producción",
      html: `
        <div class="form-grid">
          <div class="campo"><label>Fecha *</label><input type="date" name="fecha" required value="${u.hoy()}"></div>
          <div class="campo"><label>Turno</label>
            <select name="turno"><option>Mañana</option><option>Tarde</option><option>Noche</option></select>
          </div>
          <div class="campo"><label>Producto *</label>
            <select name="productoId" required>
              ${productos.map((p) => `<option value="${p.id}">${u.esc(p.nombre)} (lote ${u.esc(p.lote || "s/n")})</option>`).join("")}
            </select>
          </div>
          <div class="campo"><label>Máquina *</label>
            <select name="maquinaId" required>
              ${maquinas.map((m) => `<option value="${m.id}">${u.esc(m.nombre)} (${u.esc(m.codigo)})</option>`).join("")}
            </select>
          </div>
          <div class="campo"><label>Cantidad producida *</label><input type="number" name="cantidad" min="0.01" step="any" required></div>
          <div class="campo"><label>&nbsp;</label>
            <label style="font-weight:400;color:var(--color-texto)"><input type="checkbox" name="sumar" value="1" checked> Sumar al inventario</label>
          </div>
          <div class="campo ancho"><label>Observaciones</label><textarea name="observaciones" rows="2"></textarea></div>
        </div>`,
      alGuardar: (form) => {
        const v = SIGPM.ui.valores(form);
        const maq = SIGPM.storage.obtener("maquinas", v.maquinaId);
        const est = SIGPM.alertas.estadoMaquina(maq);

        if (maq.estado !== "operativa") {
          if (!SIGPM.ui.confirmar(`La máquina "${maq.nombre}" está en estado "${est.texto}". ¿Registrar la producción de todos modos?`)) return false;
        } else if (est.texto === "Mantenimiento vencido") {
          if (!SIGPM.ui.confirmar(`La máquina "${maq.nombre}" tiene el mantenimiento vencido. ¿Registrar la producción de todos modos?`)) return false;
        }

        const cantidad = Number(v.cantidad);
        SIGPM.storage.agregar("produccion", {
          fecha: v.fecha, turno: v.turno, productoId: v.productoId, maquinaId: v.maquinaId,
          cantidad, observaciones: v.observaciones
        });

        if (v.sumar) {
          const prod = SIGPM.storage.obtener("productos", v.productoId);
          SIGPM.storage.actualizar("productos", prod.id, { cantidad: Number(prod.cantidad) + cantidad });
        }
        SIGPM.ui.toast("Producción registrada");
        SIGPM.app.refrescar();
      }
    });
  }
};
