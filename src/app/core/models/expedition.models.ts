// src/app/core/models/expedition.models.ts

export interface ExpedicionDto {
  id: string; // En TypeScript, un Guid de C# es siempre un string
  nombre: string;
  descripcion?: string | null;
  experiencia: number;
  dinero: number;
}

export interface CrearExpedicionDto {
  nombre: string;
  descripcion?: string | null;
  experiencia: number;
  dinero: number;
}

export interface ActualizarExpedicionDto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  experiencia: number;
  dinero: number;
}

// Interfaz genérica para la paginación que usaba tu tabla
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ExpedicionRealizadaDto {
  id: string; // Guid
  nombre: string;
  descripcion?: string | null;
  nombrePersonaje?: string | null;
  fechaInicio: string; // Las fechas en JSON llegan como string ISO (ej: "2026-03-22T10:00:00Z")
  fechaFin?: string | null;
  resultado?: string | null;
  experienciaGanada: number;
  dineroGanado: number;
}