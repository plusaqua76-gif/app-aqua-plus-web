import { Iuser } from '@interfaces/Iuser';

export interface UserAccessRow {
  id: number;
  nombre: string;
  estado: string;
  rol: string;
  contrasena?: string;
}

export function toUserAccessRow(user: Iuser): UserAccessRow {
  return {
    id: user?.id ?? 0,
    nombre: user?.nombre ?? 'Sin nombre',
    estado: user?.estado?.nombre ?? 'Sin estado',
    rol: user?.rol?.nombre ?? 'Sin rol',
    contrasena: user?.contrasena
  };
}
