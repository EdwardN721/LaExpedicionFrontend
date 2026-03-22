export interface CharacterStats {
  fuerza: number;
  magia: number;
  defensa: number;
  agilidad: number;
  salud: number;
}

export interface Character {
  id: number;
  nombre: string;
  nivel: number;
  experiencia: number;
  experienciaParaSiguienteNivel: number;
  oro: number;
  etiqueta: string; // e.g. "Novato", "Aventurero", "Héroe"
  estadisticas: CharacterStats;
}

export interface CreateCharacterDto {
  nombre: string;
}

// ── Inventory ──
export interface InventoryItem {
  id: number;
  itemId: number;
  nombre: string;
  tipo: string;
  usosRestantes: number | null;
  durabilidadMaxima: number | null;
  equipado: boolean;
}

// ── Adventure history ──
export interface AdventureRecord {
  id: number;
  expedicionNombre: string;
  fecha: string;
  exito: boolean;
  oroDobtenido: number;
  experienciaObtenida: number;
  descripcionResultado: string;
}
