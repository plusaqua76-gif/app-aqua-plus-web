import { CounterApiResponse } from '@interfaces/counter/IcounterApi';
import { CounterRow } from '@interfaces/counter/IcounterRow';

export function toCounterRow(counter: CounterApiResponse): CounterRow {
  // Construir la dirección completa
  const direccionCompleta = [
    counter.descripcion?.descripcion,
    counter.descripcion?.corregimientoId?.nombre,
    counter.descripcion?.ciudadId?.nombre,
    counter.descripcion?.departamentoId?.nombre
  ]
    .filter(Boolean)
    .join(', ');

  return {
    id: counter.id ?? 0,
    serial: counter.serial ?? '',
    tipoContador: counter.tipoContador?.nombre ?? 'Tipo no especificado',
    direccion: direccionCompleta || 'Dirección no disponible',
  };
}
