window.SIGPM = window.SIGPM || {};
SIGPM.storage = {
  CLAVE:"sigpm_datos_v1",
  porDefecto(){return {maquinas:[],mantenimientos:[],productos:[],produccion:[],materias:[],tecnicos:[],repuestos:[],ventas:[],config:{diasAvisoVencimiento:30,diasAvisoMantenimiento:7}}},
  datos:null,
  cargar(){try{const raw=localStorage.getItem(this.CLAVE);this.datos={...this.porDefecto(),...JSON.parse(raw||"{}")}}catch(e){console.error("No se pudieron leer los datos guardados",e);this.datos=this.porDefecto()}return this.datos},
  guardar(){try{localStorage.setItem(this.CLAVE,JSON.stringify(this.datos))}catch(e){alert("No se pudo guardar: el almacenamiento del navegador está lleno o bloqueado.")}},
  lista(c){if(!Array.isArray(this.datos[c]))this.datos[c]=[];return this.datos[c]},
  obtener(c,id){return this.lista(c).find(x=>x.id===id)},
  _sincronizarMaquina(item){if(!window.SIGPM.cloudSync?.saveMachine)return;window.SIGPM.cloudSync.saveMachine(item).catch(error=>console.warn("La máquina quedó guardada localmente, pero no se pudo sincronizar con Firestore.",error))},
  agregar(c,item){item.id=SIGPM.utils.uid();this.lista(c).push(item);this.guardar();if(c==="maquinas")this._sincronizarMaquina(item);return item},
  actualizar(c,id,cambios){const item=this.obtener(c,id);if(item){Object.assign(item,cambios);this.guardar();if(c==="maquinas")this._sincronizarMaquina(item)}return item},
  eliminar(c,id){this.datos[c]=this.lista(c).filter(x=>x.id!==id);this.guardar();if(c==="maquinas"&&window.SIGPM.cloudSync?.deleteMachine)window.SIGPM.cloudSync.deleteMachine(id).catch(error=>console.warn("No se pudo eliminar la máquina de Firestore.",error))},
  exportar(){const blob=new Blob([JSON.stringify(this.datos,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`respaldo-sigpm-${SIGPM.utils.hoy()}.json`;a.click();URL.revokeObjectURL(a.href)},
  importar(texto){const obj=JSON.parse(texto);if(!obj||typeof obj!=="object"||!Array.isArray(obj.maquinas)||!Array.isArray(obj.productos))throw new Error("El archivo no tiene el formato del sistema.");this.datos={...this.porDefecto(),...obj};this.guardar()}
};