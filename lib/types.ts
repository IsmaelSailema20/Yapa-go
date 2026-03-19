export type Perfil = {
  id: string;
  email: string | null;
  nombre_completo: string | null;
  rol: 'comercio' | 'cliente' | null;
  created_at: string;
};

export type Comercio = {
  id: string;
  ruc: string | null;
  nombre_comercial: string | null;
  direccion_texto: string | null;
  ubicacion: string | null; // Representado como string para simplificar WKT o GeoJSON por ahora
  perfil_completado: boolean;
};

export type Pack = {
  id: string;
  comercio_id: string;
  titulo: string;
  precio_original: number | null;
  precio_rescate: number | null;
  foto_url: string | null;
  cantidad_disponible: number;
  estado: 'disponible' | 'agotado' | 'expirado';
};

export type Reserva = {
  id: string;
  pack_id: string;
  cliente_id: string;
  codigo_otp: string | null;
  estado: 'pendiente' | 'entregado' | 'cancelado';
};

export type Notificacion = {
  id: string;
  usuario_id: string;
  titulo: string | null;
  mensaje: string | null;
  tipo: string | null;
  leida: boolean;
};
