// src/app/core/models/item.models.ts

// Usamos string para mapear los Guid de C#
export interface ItemDto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  estadisticaAfectada?: string | null;
  valorAjuste?: number | null;
  precio: number; 
  itemModificador: ItemModificadorDto[];
}

export interface ItemModificadorDto {
  id: string;
  itemId: string;
  estadisticaAfectada: string;
  valorAjuste: number;
}

export interface CrearItemModificadorDto {
  // EnumEstadistica en C# (0=Ninguna, 1=Salud, 2=Fuerza, etc.)
  // Lo enviamos como número
  estadisticaAfectada: number; 
  valorAjustado: number;
}

export interface CrearItemDto {
  nombre: string;
  descripcion?: string | null;
  modificadores?: CrearItemModificadorDto[] | null;
}

export interface ActualizarItemDto {
  id: string;
  nombre: string;
  descripcion: string; // En tu backend no es nullable al actualizar
}

// Reutilizamos la paginación
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