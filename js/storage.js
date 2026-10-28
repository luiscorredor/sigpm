
window.SIGPM = window.SIGPM || {};

SIGPM.storage = {
  CLAVE: "sigpm_datos_v1",
  porDefecto() {
    return {
      maquinas: [], mantenimientos: [], productos: [], produccion: [],
      config: { diasAvisoVencimiento: 30, diasAvisoMantenimiento: 7 }
    };
  },
  datos: null,
  cargar() {
    try {
      const raw = localStorage.getItem(this.CLAVE);
      this.datos = raw ? { ...this.porDefecto(), ...JSON.parse(raw) } : this.porDefecto();
    } catch (e) {
      console.error("No se pudieron leer los datos guardados", e);
      this.datos = this.porDefecto();
    }
    return this.datos;
  },
  guardar() {
    try { localStorage.setItem(this.CLAVE, JSON.stringify(this.datos)); }
    catch (e) { alert("No se pudo guardar: el almacenamiento del navegador está lleno o bloqueado."); }
  },
  lista(coleccion) { return this.datos[coleccion]; },
  obtener(coleccion, id) { return this.datos[coleccion].find((x) => x.id === id); },
  _sincronizarMaquina(item) {
    if (!window.SIGPM.cloudSync?.saveMachine) return;
    window.SIGPM.cloudSync.saveMachine(item).catch((error) => {
      console.warn("La máquina quedó guardada localmente, pero no se pudo sincronizar con Firestore.", error);
    });
  },
  agregar(coleccion, item) {
    item.id = SIGPM.utils.uid();
    this.datos[coleccion].push(item);
    this.guardar();
    if (coleccion === "maquinas") this._sincronizarMaquina(item);
    return item;
  },
  actualizar(coleccion, id, cambios) {
    const item = this.obtener(coleccion, id);
    if (item) {
      Object.assign(item, cambios);
      this.guardar();
      if (coleccion === "maquinas") this._sincronizarMaquina(item);
    }
    return item;
  },
  eliminar(coleccion, id) {
    this.datos[coleccion] = this.datos[coleccion].filter((x) => x.id !== id);
    this.guardar();
    if (coleccion === "maquinas" && window.SIGPM.cloudSync?.deleteMachine) {
      window.SIGPM.cloudSync.deleteMachine(id).catch((error) => {
        console.warn("No se pudo eliminar la máquina de Firestore.", error);
      });
    }
  },
  exportar() {
    const blob = new Blob([JSON.stringify(this.datos, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `respaldo-sigpm-${SIGPM.utils.hoy()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  importar(textoJson) {
    const obj = JSON.parse(textoJson);
    if (!obj || typeof obj !== "object" || !Array.isArray(obj.maquinas) || !Array.isArray(obj.productos)) {
      throw new Error("El archivo no tiene el formato del sistema.");
    }
    this.datos = { ...this.porDefecto(), ...obj };
    this.guardar();
  }
};
