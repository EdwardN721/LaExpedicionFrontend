// ─── Item models ─────────────────────────────────────────────────────────────

export interface StatModifier {
  stat: string;      // e.g. "Fuerza", "Magia", "Salud"
  value: number;
}

export interface Item {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  usosRestantes: number | null;
  durabilidadMaxima: number | null;
  precio: number;
  modificadoresEstadisticas: StatModifier[];
}

export interface CreateItemDto {
  nombre: string;
  descripcion: string;
  tipo: string;
  durabilidadMaxima: number | null;
  precio: number;
  modificadoresEstadisticas: StatModifier[];
}

// ─── Pagination metadata ──────────────────────────────────────────────────────

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
