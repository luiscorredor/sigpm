window.SIGPM = window.SIGPM || {};
SIGPM.usuarios = {
  perfiles: [],
  async render() {
    const cont = document.getElementById("vista-usuarios");
    if (!cont) return;
    const current = SIGPM.currentUser;
    if (current?.role !== "admin") {
      cont.innerHTML = '<div class="tarjeta"><h3>Acceso restringido</h3><p>Este apartado es exclusivo del administrador.</p></div>';
      return;
    }
    cont.innerHTML = '<div class="page-heading"><div><p class="eyebrow">ADMINISTRACIÓN DEL SISTEMA</p><h2>Usuarios</h2><p class="subtitulo">Consulta las cuentas de empleados y retira su acceso cuando sea necesario.</p></div><button class="btn sec" id="users-refresh">↻ Actualizar</button></div><div class="kpis" id="users-kpis"></div><div class="barra"><input id="users-search" type="search" placeholder="Buscar por nombre o correo…"></div><div class="tarjeta tabla-wrap"><table><thead><tr><th>Empleado</th><th>Correo electrónico</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead><tbody id="users-rows"><tr><td colspan="5" class="vacio">Cargando usuarios…</td></tr></tbody></table></div><p class="subtitulo" style="margin-top:12px">Retirar el acceso desactiva el perfil en SIGPM. La eliminación definitiva de la cuenta de Firebase Authentication requiere una función segura de Firebase.</p>';
    document.getElementById("users-refresh").onclick = () => this.cargar();
    document.getElementById("users-search").oninput = () => this.dibujar();
    await this.cargar();
  },
  async cargar() {
    const rows = document.getElementById("users-rows");
    if (!rows) return;
    rows.innerHTML = '<tr><td colspan="5" class="vacio">Cargando usuarios…</td></tr>';
    try {
      const mod = await import("./firebase/firebase-client.js");
      this.perfiles = await mod.listUserProfiles();
      this.dibujar();
    } catch (error) {
      console.error("No se pudieron cargar los usuarios:", error);
      rows.innerHTML = '<tr><td colspan="5" class="vacio">No se pudieron cargar los usuarios. Verifica que tu perfil tenga role = admin y que las reglas de Firestore estén publicadas.</td></tr>';
    }
  },
  dibujar() {
    const rows = document.getElementById("users-rows");
    if (!rows) return;
    const q = (document.getElementById("users-search")?.value || "").toLowerCase();
    const profiles = this.perfiles.filter(p => (p.role || "employee") !== "admin");
    const active = profiles.filter(p => p.active !== false).length;
    const disabled = profiles.length - active;
    const kpis = document.getElementById("users-kpis");
    if (kpis) kpis.innerHTML = '<div class="kpi"><div class="kpi-top"><span>Empleados</span><i>♙</i></div><div class="valor">' + profiles.length + '</div><div class="etiqueta">Perfiles registrados</div></div><div class="kpi"><div class="kpi-top"><span>Activos</span><i>✓</i></div><div class="valor">' + active + '</div><div class="etiqueta">Con acceso habilitado</div></div><div class="kpi"><div class="kpi-top"><span>Desactivados</span><i>⊘</i></div><div class="valor">' + disabled + '</div><div class="etiqueta">Sin acceso a SIGPM</div></div>';
    const filtered = profiles.filter(p => String(p.name || "").toLowerCase().includes(q) || String(p.email || "").toLowerCase().includes(q));
    rows.innerHTML = filtered.length ? filtered.map(p => {
      const name = SIGPM.utils.esc(p.name || "Sin nombre");
      const email = SIGPM.utils.esc(p.email || "Sin correo");
      const isActive = p.active !== false;
      return '<tr><td><b>' + name + '</b></td><td>' + email + '</td><td>Empleado</td><td><span class="estado ' + (isActive ? 'ok' : 'peligro') + '">' + (isActive ? 'Activo' : 'Desactivado') + '</span></td><td>' + (isActive ? '<button class="btn mini peligro" data-deactivate="' + SIGPM.utils.esc(p.uid) + '">Retirar acceso</button>' : '<span class="subtitulo">Acceso retirado</span>') + '</td></tr>';
    }).join("") : '<tr><td colspan="5" class="vacio">No hay empleados que coincidan con la búsqueda.</td></tr>';
    rows.querySelectorAll("[data-deactivate]").forEach(btn => btn.onclick = async () => {
      const p = this.perfiles.find(x => x.uid === btn.dataset.deactivate);
      if (!p || p.role === "admin") return;
      if (!SIGPM.ui.confirmar("¿Retirar el acceso a " + (p.name || p.email || "este empleado") + "? No podrá volver a entrar a SIGPM mientras esté desactivado.")) return;
      btn.disabled = true;
      try {
        const mod = await import("./firebase/firebase-client.js");
        await mod.deactivateUserProfile(p.uid);
        const item = this.perfiles.find(x => x.uid === p.uid);
        if (item) item.active = false;
        SIGPM.ui.toast("Acceso del empleado retirado");
        this.dibujar();
      } catch (error) {
        console.error(error);
        SIGPM.ui.toast(error.message || "No se pudo retirar el acceso");
        btn.disabled = false;
      }
    });
  }
};
