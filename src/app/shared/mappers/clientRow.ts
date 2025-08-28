import { ClienteApi } from '@interfaces/client/IclienteApi';
import { ClientRow } from '@interfaces/client/IclientRow';

export function toClientRow(c: ClienteApi): ClientRow {
  const fullName = [c?.nombre, c?.apellido, c?.segundoApellido]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    id: c?.id ?? 0,
    idContador: c?.id ?? 0,
    codigoVereda: c?.direccion?.corregimientoId?.nombre ?? '',
    numeroIdentificacion: c?.numeroCedula ?? '',
    razonSocial: c?.razonSocial ?? fullName ?? '',
    nombreCliente: fullName ?? '',
    telefono: c?.telefono ?? '',
    direccion: c?.direccion?.descripcion ?? '',
    correo: c?.correo ?? '',
    estado:
      typeof c?.estado === 'boolean'
        ? c.estado
        : typeof c?.activo === 'boolean'
        ? c.activo
        : false,
  };
}
