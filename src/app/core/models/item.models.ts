export interface ItemDto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  estadisticaAfectada?: string | null;
  valorAjuste?: number | null;
  precio: number;
  tipoItem: EnumTipoItems;
  itemModificador: ItemModificadorDto[];
  imagenUrl?: string | null;
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
  precio: number;
  tipoItem: number;
  modificadores?: CrearItemModificadorDto[] | null;
  imagen?: File | null;
}

export interface ActualizarItemDto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipoItem: number;
  imagen?: File | null;
}


export enum EnumTipoItems {
  SinEtiqueta = 0,
  Consumible = 1,
  Casco = 2,
  Pechera = 3,
  Pantalones = 4,
  ArmaUnaMano = 5,
  ArmaDosManos = 6,
  Accesorio = 7
}

