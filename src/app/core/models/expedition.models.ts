export interface Expedition {
  id: number;
  nombre: string;
  descripcion: string;
  nivelRecomendado: number;
  duracionHoras: number;
  recompensaOro: number;
  recompensaExperiencia: number;
  dificultad: 'Facil' | 'Normal' | 'Dificil' | 'Legendario';
}

export interface CreateExpeditionDto {
  nombre: string;
  descripcion: string;
  nivelRecomendado: number;
  duracionHoras: number;
  recompensaOro: number;
  recompensaExperiencia: number;
  dificultad: string;
}
