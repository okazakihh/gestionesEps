// Servicio que encapsula llamadas al endpoint de disponibilidad médico
const API_BASE = '/api/disponibilidad-medico';

export const disponibilidadService = {
  async createDisponibilidad(payload) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Error creando disponibilidad');
    }
    return res.json();
  },

  async getDisponibilidades(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}?${query}` : API_BASE;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Error cargando disponibilidades');
    }
    return res.json();
  }
};
