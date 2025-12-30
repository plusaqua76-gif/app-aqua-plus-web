// Interfaces para la respuesta detallada del cliente
export interface ITipoDocumento {
  id: number;
  nombre: string;
  codigo: string;
}

export interface ICiudad {
  id: number;
  nombre: string;
  activo: boolean;
  usuarioCreacion: string;
}

export interface ICorregimiento {
  id: number;
  nombre: string;
}

export interface IDepartamento {
  id: number;
  nombre: string;
}

export interface IDireccion {
  id: number;
  departamento: IDepartamento;
  ciudad: ICiudad;
  corregimiento: ICorregimiento;
  descripcion: string;
}

export interface IPersona {
  id: number;
  direccion: IDireccion;
  tipoDocumento: ITipoDocumento;
  numeroCedula: string;
  nombre: string;
  segundoNombre?: string;
  apellido: string;
  segundoApellido?: string;
  discapacidad: boolean;
  activo: boolean;
}

export interface ITipoContador {
  id: number;
  nombre: string;
}

export interface IDescripcionContador {
  id: number;
  departamento: IDepartamento;
  ciudad: ICiudad;
  corregimiento: ICorregimiento;
  descripcion: string;
  usuarioCreacion: string;
}

export interface IContador {
  id: number;
  tipoContador: ITipoContador;
  descripcion: IDescripcionContador;
  serial: string;
  digitos: number;
  fechaInstalacion: string;
  nuid: number;
  estrato: number;
  activo: boolean;
}

export interface ITipoTarifa {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
}

export interface ITarifa {
  id: number;
  tipoTarifa: ITipoTarifa;
  aplica: boolean;
}

export interface IClienteDetalle {
  persona: IPersona;
  contadores: IContador[];
  empleadoEmpresaId: number;
  empleadoNombre: string;
  correo: string;
  telefono: string;
  tarifasContadores: ITarifa[];
  tiposTarifaFaltantes: ITipoTarifa[];
}


export interface tiposTarifaFaltantes {

}

// Respuesta de la API para obtener cliente por ID
export interface IClienteDetalleApiResponse {
  success: boolean;
  message: string;
  code: number;
  response: IClienteDetalle;
}





//         "persona": {
//             "id": 1717,
//             "direccion": {
//                 "id": 3670,
//                 "departamento": {
//                     "id": 22,
//                     "nombre": "Huila"
//                 },
//                 "ciudad": {
//                     "id": 25,
//                     "nombre": "Isnos",
//                     "activo": true,
//                     "usuarioCreacion": "npeñafiel"
//                 },
//                 "corregimiento": {
//                     "id": 36,
//                     "nombre": "La Estrella"
//                 },
//                 "descripcion": "carrera 42 # 57 -12"
//             },
//             "tipoDocumento": {
//                 "id": 7,
//                 "nombre": "CEDULA DE CIUDADANIA",
//                 "codigo": "CCCI"
//             },
//             "numeroCedula": "345345345345",
//             "nombre": "deiber",
//             "segundoNombre": "eviles",
//             "apellido": "Chavarro",
//             "segundoApellido": "Rojas",
//             "discapacidad": true,
//             "activo": true
//         },
//         "contadores": [
//             {
//                 "id": 2080,
//                 "tipoContador": {
//                     "id": 6,
//                     "nombre": "Analógico"
//                 },
//                 "descripcion": {
//                     "id": 3669,
//                     "departamento": {
//                         "id": 22,
//                         "nombre": "Huila"
//                     },
//                     "ciudad": {
//                         "id": 25,
//                         "nombre": "Isnos",
//                         "activo": true,
//                         "usuarioCreacion": "npeñafiel"
//                     },
//                     "corregimiento": {
//                         "id": 36,
//                         "nombre": "La Estrella"
//                     },
//                     "descripcion": "careerta 234",
//                     "usuarioCreacion": "SaltoBordonesSAS"
//                 },
//                 "serial": "GHFSJD67547",
//                 "digitos": 3,
//                 "fechaInstalacion": "2025-12-16T17:16:31.074+00:00",
//                 "nuid": 50617013,
//                 "estrato": 2,
//                 "activo": true
//             }
//         ],
//         "empleadoEmpresaId": 16,
//         "empleadoNombre": "Danilo cicey motta anacona",
//         "correo": "aanac345345onachavarro@gmail.com",
//         "telefono": "320328437845634",
//         "tarifasContadores": [
//             {
//                 "id": 23,
//                 "tipoTarifa": {
//                     "id": 6,
//                     "nombre": "Alcantarillado",
//                     "descripcion": "Alcantarillado",
//                     "codigo": "ALC"
//                 },
//                 "aplica": false
//             }
//         ],
//         "tiposTarifaFaltantes": [
//             {
//                 "id": 7,
//                 "nombre": "Aseo",
//                 "descripcion": "Aseo",
//                 "codigo": "ASE"
//             },
//             {
//                 "id": 8,
//                 "nombre": "Acueducto",
//                 "descripcion": "Acueducto metros cúbicos",
//                 "codigo": "ACU"
//             },
//             {
//                 "id": 5,
//                 "nombre": "Otros Conceptos",
//                 "descripcion": "Deudas y ajustes",
//                 "codigo": "OTR"
//             }
//         ]
//     }
// }
