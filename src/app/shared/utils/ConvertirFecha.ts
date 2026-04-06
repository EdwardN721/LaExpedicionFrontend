export class ConvertirFecha {
  static CDMX (date: string | Date): string {
    const fecha = new Date(date);
    return new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(fecha);
  }
}
