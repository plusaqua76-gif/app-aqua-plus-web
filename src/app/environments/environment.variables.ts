import { ProductoService } from "../modules/accounting/service/producto.service";

export const END_POINT_SERVICE = {
  POST_AUTH_USER: 'usuario/validar',
  POST_REC_PASS: 'recoverPassword',
  POST_UPD_PASS: 'update-password',
  PUT_UPD_PASS: 'Password',
  PUT_IMG_USER: 'imagen',
  PUT_CORREGIMIENTO: 'corregimiento',

  GET_USER: 'usuario',
  POST_SEND_EMAIL: 'sendEmail',

  GET_ALL_TIPO_DOCUMENTO: 'tipoDocumento/all',

  GET_ALL_CORREO_PER: 'correoGeneral/all',

  GET_ALL_TELEFONO_PER: 'telefonoGeneral/all',

  GET_FACTURA: 'factura',
  GET_FACTURA_ALL: 'all',

  GET_DEUDA: 'DeudaCliente',
  GET_DEUDA_ALL: 'all',

  GET_ABONO: 'Abono',
  GET_ABONO_ALL: 'all',

  GET_EMPLEADO: 'EmpleadoEmpresa',
  PUT_UPD_EMPLEADO: 'update',
  GET_SAVE_EMPLEADO: 'save',
  GET_EMPLEADO_ALL: 'all',
  POST_UPD_ESTADO: 'estado',

  GET_ALL_ESTADO: 'Estado/all',

  GET_ALL_TIPO_DEUDA: 'TipoDeuda/all',

  GET_ALL_PLAZO_PAGO: 'PlazoPago/all',

  GET_ALL_LECTURA: 'all',
  GET_LECTURA: 'lectura',

  GET_ENTERPRISE: 'empresa/usuario',
  GET_ALL_ENTERPRISE:'empresa/all',
  GET_ENTER:'empresa',
  UPDATE_EMPRESA:'updateEmpresa',
  UPDATE_ESTADO: 'update',

  GET_INVENTORY:'Inventario',
  GET_ALL_INVENTORY:'empresa',

  GET_PRODUC:'Producto',
  GET_ALL_PRODUC:'empresa'
};

export const ENTERPRISE_CLIENT_COUNT = {
  ENT_CLI_COU: 'empresa-cliente-contador',
  GET_CLIENT: 'clientes',
  GET_ALL_CLI: 'all',
  GET_ENT_BY_ID: 'empresa',
  POST_SAVE_CLI: 'save',
  UPDATE_CLI: 'update',
  DELETE_CLI: 'delete'
};

export const COUNTER = {
  COUNTER: 'Contador',

}

export const TYPE_COUNTER = {
  TYPE_COUNTER: 'TipoContador',
  GET_ALL: 'all',
  GET_ENT_BY_ID: 'empresa',
};

export const ADDRESS = {
  ADDRESS: 'Direccion'
};

export const PRODUCT_CATEGORY = {
  PRODUCT_CATEGORY: 'CategoriaProducto',
  GET_ALL: 'all',
}
