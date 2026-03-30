// src/app/core/models/player.models.ts

// ─── Personaje ────────────────────────────────────────────────────────
export interface PersonajeDto {
  id: string;
  usuarioId: string;
  nombreUsuario: string;
  
  nivel: number;
  experiencia: number;
  dinero: number;
  saludActual: number; 

  etiquetaId: string;
  etiqueta?: string;
  
  estadisticasId: string;
  fuerza: number;
  energia: number;
  magia: number;
  mana: number;
  salud: number; 
}

export interface CrearPersonajeDto {
  usuarioId: string; // Guid del usuario logueado
  nombreUsuario: string;
}

export interface ActualizarPersonajeDto {
  id: string;
  nombreUsuario: string;
  etiquetaId: string; // Guid de la etiqueta elegida
}

// ─── Estadísticas y Etiquetas ──────────────────────────────────────────
export interface EstadisticaDto {
  id: string;
  personajeId: string;
  salud: number;
  fuerza: number;
  energia: number;
  magia: number;
  mana: number;
}

export interface EtiquetaDto {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

// ─── Inventario ────────────────────────────────────────────────────────
export interface InventarioDto {
  id: string; // Agregado lógicamente para el update en frontend
  nombrePersonaje?: string | null;
  nombreItem?: string | null;
  equipado: boolean;
  usosRestantes: number;
}

export interface CrearInventarioDto {
  personajeId: string;
  itemId: string;
  equipado: boolean;
  usosRestantes: number;
}

export interface ActualizarInventarioDto {
  id: string;
  equipado: boolean;
  usosRestantes: number;
}