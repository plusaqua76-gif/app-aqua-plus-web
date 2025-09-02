import { LecturaResponse } from '@interfaces/reading/Ireading';

export interface ReadingRow {
  id: number;
  serial: string;
  lectura: number;
  fechaLectura: string;
  consumoAnormal: string;
  observacion: string;
}

export function toReadingRow(item: LecturaResponse): ReadingRow {
  return {
    id: item.id,
    serial: item.contador?.serial ?? '',
    lectura: item.lectura ?? 0,
    fechaLectura: new Date(item.fechaLectura).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    consumoAnormal: item.consumoAnormal ? 'Sí' : 'No',
    observacion: item.descripcion || ''
  };
}
