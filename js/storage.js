window.SIGPM=window.SIGPM||{};
SIGPM.storage={
 CLAVE:"sigpm_datos_v1",
 porDefecto(){return {maquinas:[],mantenimientos:[],productos:[],produccion:[],materias:[],tecnicos:[],repuestos:[],ventas:[],config:{diasAvisoVencimiento:30,diasAvisoMantenimiento:7}}},
 datos:null,
 cargar(){try{const raw=localStorage.getItem(this.CLAVE);this.datos={...this.porDefecto(),...JSON.parse(raw||"{}")}}catch(e){console.error("No se pudieron leer datos locales",e);this.datos=this.porDefecto()}return this.datos},
 guardar(){try{localStorage.setItem(this.CLAVE,JSON.stringify(this.datos))}catch(e){console.error("No se pudo guardar localmente",e)}},
 lista(c){if(!Array.isArray(this.datos[c]))this.datos[c]=[];return this.datos[c]},
 obtener(c,id){return this.lista(c).find(x=>x.id===id)},
 _sincronizar(c,item,op="save"){const cloud=window.SIGPM.cloudSync;if(!cloud?.ready||!cloud.collections.includes(c))return;const task=op==="delete"?cloud.delete(c,item.id):cloud.save(c,item);task.catch(error=>{console.error("Error sincronizando con Firestore:",c,error);window.dispatchEvent(new CustomEvent("sigpm:cloud-error",{detail:{collection:c,error}}));});},
 agregar(c,item){item.id=item.id||SIGPM.utils.uid();this.lista(c).push(item);this.guardar();this._sincronizar(c,item);return item},
 actualizar(c,id,cambios){const item=this.obtener(c,id);if(item){Object.assign(item,cambios);this.guardar();this._sincronizar(c,item)}return item},
 eliminar(c,id){const item=this.obtener(c,id);this.datos[c]=this.lista(c).filter(x=>x.id!==id);this.guardar();if(item)this._sincronizar(c,item,"delete")},
 exportar(){const blob=new Blob([JSON.stringify(this.datos,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`respaldo-sigpm-${SIGPM.utils.hoy()}.json`;a.click();URL.revokeObjectURL(a.href)},
 importar(texto){const obj=JSON.parse(texto);if(!obj||typeof obj!=="object"||!Array.isArray(obj.maquinas)||!Array.isArray(obj.productos))throw new Error("El archivo no tiene el formato del sistema.");this.datos={...this.porDefecto(),...obj};this.guardar();Object.keys(this.datos).forEach(c=>this.lista(c).forEach(item=>this._sincronizar(c,item)))}
};