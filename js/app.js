window.SIGPM = window.SIGPM || {};

SIGPM.app = {
  vistaActual: "dashboard",
  nombres: {dashboard:"Panel general",maquinas:"Máquinas",mantenimientos:"Mantenimiento",productos:"Productos",produccion:"Producción",ajustes:"Ajustes",materias:"Materias primas",tecnicos:"Técnicos",repuestos:"Repuestos",ventas:"Ventas",reportes:"Reportes",usuarios:"Usuarios"},
  vistas: {
    dashboard: () => SIGPM.dashboard, maquinas: () => SIGPM.maquinas,
    productos: () => SIGPM.productos, produccion: () => SIGPM.produccion,
    mantenimientos: () => SIGPM.mantenimientos, ajustes: () => SIGPM.ajustes,
    materias: () => SIGPM.extraModules, tecnicos: () => SIGPM.extraModules,
    repuestos: () => SIGPM.extraModules, ventas: () => SIGPM.extraModules,
    reportes: () => SIGPM.extraModules, usuarios: () => SIGPM.usuarios
  },
  iniciar() {
    SIGPM.storage.cargar();
    document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>this.ir(b.dataset.vista));
    document.querySelector(".brand")?.addEventListener("click",e=>{e.preventDefault();this.ir("dashboard")});
    document.getElementById("modal-fondo").addEventListener("mousedown",e=>{if(e.target.id==="modal-fondo")SIGPM.ui.cerrarModal()});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")SIGPM.ui.cerrarModal()});
    const date=document.getElementById("topbar-date");
    if(date) date.textContent=new Intl.DateTimeFormat("es-CO",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(new Date());
    this.ir("dashboard");
    setInterval(()=>{if(!document.getElementById("modal-fondo").classList.contains("abierto"))this.refrescar()},60000);
  },
  ir(nombre) {
    this.vistaActual=nombre;
    document.querySelectorAll(".vista").forEach(v=>v.classList.toggle("activa",v.id===`vista-${nombre}`));
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("activo",b.dataset.vista===nombre));
    const crumb=document.getElementById("breadcrumb-current"); if(crumb)crumb.textContent=this.nombres[nombre]||nombre;
    this.refrescar();
  },
  refrescar() {
    const modulo=this.vistas[this.vistaActual]?.();
    if(this.vistaActual==="materias"||this.vistaActual==="tecnicos"||this.vistaActual==="repuestos"||this.vistaActual==="ventas"||this.vistaActual==="reportes") modulo?.render(this.vistaActual);
    else modulo?.render();
    this.actualizarInsignia();
  },
  actualizarInsignia() {
    const badge=document.getElementById("badge-alertas"); if(!badge)return;
    const total=SIGPM.alertas.resumen().totalAlertas; badge.textContent=total; badge.classList.toggle("oculto",total===0);
  }
};
document.addEventListener("DOMContentLoaded",()=>SIGPM.app.iniciar());