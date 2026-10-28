
window.SIGPM = window.SIGPM || {};

SIGPM.utils = {

  hoy() {
    return this.aISO(new Date());
  },

  aISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  },

  aFecha(iso) {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  },

  sumarDias(iso, dias) {
    const f = this.aFecha(iso);
    f.setDate(f.getDate() + Number(dias));
    return this.aISO(f);
  },

  diasHasta(iso) {
    if (!iso) return null;
    const hoy = this.aFecha(this.hoy());
    const destino = this.aFecha(iso);
    return Math.round((destino - hoy) / 86400000);
  },

  formatoFecha(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  },

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  esc(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  },

  moneda(n) {
    return Number(n || 0).toLocaleString("es-CO", {
      style: "currency", currency: "COP", maximumFractionDigits: 0
    });
  },

  textoDias(dias) {
    if (dias === null || dias === undefined) return "—";
    if (dias === 0) return "Hoy";
    if (dias === 1) return "Mañana";
    if (dias === -1) return "Ayer";
    return dias > 0 ? `En ${dias} días` : `Hace ${Math.abs(dias)} días`;
  }
};
