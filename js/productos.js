/* Módulo de productos / inventario con control de vencimientos */
window.SIGPM = window.SIGPM || {};

SIGPM.productos = {
  filtro: { texto: "", estado: "" },

  render() {
    const cont = document.getElementById("vista-productos");
    const u = SIGPM.utils;
    const todos = SIGPM.storage.lista("productos");

    const filas = todos
      .map((p) => ({ p, est: SIGPM.alertas.estadoProducto(p) }))
      .filter(({ p, est }) => {
        const t = this.filtro.texto.toLowerCase();
        const coincideTexto = !t || [p.codigo, p.nombre, p.categoria, p.lote].join(" ").toLowerCase().includes(t);
        const coincideEstado = !this.filtro.estado || est.nivel === this.filtro.estado;
        return coincideTexto && coincideEstado;
      })
      .sort((a, b) => (a.est.dias ?? 99999) - (b.est.dias ?? 99999));

    cont.innerHTML = `
      <h2>Productos</h2>
      <p class="subtitulo">Registra productos con su lote y fecha de vencimiento. El sistema marca los que están por vencer o ya vencidos.</p>
      <div class="barra">
        <input type="search" id="prod-buscar" placeholder="Buscar por código, nombre, categoría o lote…" value="${u.esc(this.filtro.texto)}">
        <select id="prod-estado">
          <option value="">Todos los estados</option>
          <option value="ok" ${this.filtro.estado === "ok" ? "selected" : ""}>Vigentes</option>
          <option value="aviso" ${this.filtro.estado === "aviso" ? "selected" : ""}>Por vencer</option>
          <option value="peligro" ${this.filtro.estado === "peligro" ? "selected" : ""}>Vencidos</option>
        </select>
        <button class="btn acento" id="prod-nuevo">+ Nuevo producto</button>
      </div>
      <div class="tarjeta tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th><th>Producto</th><th>Categoría</th><th>Lote</th><th>Cantidad</th>
              <th>Producción</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filas.length ? filas.map(({ p, est }) => `
              <tr>
                <td><strong>${u.esc(p.codigo)}</strong></td>
                <td>${u.esc(p.nombre)}</td>
                <td>${u.esc(p.categoria || "—")}</td>
                <td>${u.esc(p.lote || "—")}</td>
                <td>${u.esc(p.cantidad)} ${u.esc(p.unidad)}</td>
                <td>${u.formatoFecha(p.fechaProduccion)}</td>
                <td>${u.formatoFecha(p.fechaVencimiento)}<br><small style="color:var(--color-texto-suave)">${p.fechaVencimiento ? u.textoDias(est.dias) : ""}</small></td>
                <td>${SIGPM.ui.estadoHtml(est)}</td>
                <td class="acciones">
                  <button class="btn mini sec" data-acc="editar" data-id="${p.id}">Editar</button>
                  <button class="btn mini peligro" data-acc="borrar" data-id="${p.id}">Eliminar</button>
                </td>
              </tr>`).join("") : `<tr><td class="vacio" colspan="9">${todos.length ? "Ningún producto coincide con el filtro." : "Aún no hay productos. Pulsa “Nuevo producto” para empezar."}</td></tr>`}
          </tbody>
        </table>
      </div>`;

    document.getElementById("prod-buscar").oninput = (e) => {
      this.filtro.texto = e.target.value;
      this.render();
      const input = document.getElementById("prod-buscar");
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    };
    document.getElementById("prod-estado").onchange = (e) => { this.filtro.estado = e.target.value; this.render(); };
    document.getElementById("prod-nuevo").onclick = () => this.formulario();
    cont.querySelectorAll("[data-acc]").forEach((b) => {
      b.onclick = () => {
        if (b.dataset.acc === "editar") this.formulario(b.dataset.id);
        if (b.dataset.acc === "borrar") this.eliminar(b.dataset.id);
      };
    });
  },

  formulario(id) {
    const u = SIGPM.utils;
    const p = id ? SIGPM.storage.obtener("productos", id) : {
      codigo: "", nombre: "", categoria: "", lote: "", cantidad: 0, unidad: "unid",
      fechaProduccion: u.hoy(), fechaVencimiento: "", ubicacion: ""
    };

    SIGPM.ui.modal({
      titulo: id ? "Editar producto" : "Nuevo producto",
      html: `
        <div class="form-grid">
          <div class="campo"><label>Código *</label><input name="codigo" required value="${u.esc(p.codigo)}"></div>
          <div class="campo"><label>Nombre *</label><input name="nombre" required value="${u.esc(p.nombre)}"></div>
          <div class="campo"><label>Categoría</label><input name="categoria" value="${u.esc(p.categoria)}"></div>
          <div class="campo"><label>Lote</label><input name="lote" value="${u.esc(p.lote)}"></div>
          <div class="campo"><label>Cantidad *</label><input type="number" name="cantidad" min="0" step="any" required value="${p.cantidad}"></div>
          <div class="campo"><label>Unidad</label><input name="unidad" value="${u.esc(p.unidad)}"></div>
          <div class="campo"><label>Fecha de producción</label><input type="date" name="fechaProduccion" value="${p.fechaProduccion || ""}"></div>
          <div class="campo"><label>Fecha de vencimiento</label><input type="date" name="fechaVencimiento" value="${p.fechaVencimiento || ""}"></div>
          <div class="campo ancho"><label>Ubicación en bodega</label><input name="ubicacion" value="${u.esc(p.ubicacion)}"></div>
        </div>`,
      alGuardar: (form) => {
        const v = SIGPM.ui.valores(form);
        if (v.fechaProduccion && v.fechaVencimiento && v.fechaVencimiento < v.fechaProduccion) {
          alert("La fecha de vencimiento no puede ser anterior a la de producción.");
          return false;
        }
        v.cantidad = Number(v.cantidad);
        if (id) SIGPM.storage.actualizar("productos", id, v);
        else SIGPM.storage.agregar("productos", v);
        SIGPM.ui.toast(id ? "Producto actualizado" : "Producto registrado");
        SIGPM.app.refrescar();
      }
    });
  },

  eliminar(id) {
    const p = SIGPM.storage.obtener("productos", id);
    if (!SIGPM.ui.confirmar(`¿Eliminar el producto "${p.nombre}"?`)) return;
    SIGPM.storage.eliminar("productos", id);
    SIGPM.ui.toast("Producto eliminado");
    SIGPM.app.refrescar();
  }
};
