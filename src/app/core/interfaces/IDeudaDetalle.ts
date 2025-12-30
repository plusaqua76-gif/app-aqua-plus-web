export interface IDeudaDetalle {
	id: number;
	empresaClienteContador: {
		id: number;
		empresa: {
			id: number;
			usuario: {
				id: number;
				rol: {
					id: number;
					nombre: string;
					usuarioCreacion: string;
				};
				estado: {
					id: number;
					nombre: string;
				};
				nombre: string;
				contrasena: string;
				activo: boolean;
				usuarioCreacion: string;
				usuarioModificacion: string;
			};
			direccion: {
				id: number;
				departamento: {
					id: number;
					nombre: string;
				};
				ciudad: {
					id: number;
					nombre: string;
					activo: boolean;
					usuarioCreacion: string;
				};
				corregimiento: {
					id: number;
					nombre: string;
				};
				usuarioCreacion: string;
			};
			nombre: string;
			nit: string;
			codigo: string;
			activo: boolean;
			usuarioCreacion: string;
			fechaCreacion: string;
			fechaModificacion: string;
		};
		cliente: {
			id: number;
			direccion: {
				id: number;
				departamento: {
					id: number;
					nombre: string;
				};
				ciudad: {
					id: number;
					nombre: string;
					activo: boolean;
					usuarioCreacion: string;
				};
				corregimiento: {
					id: number;
					nombre: string;
				};
				descripcion: string;
				usuarioCreacion: string;
			};
			tipoDocumento: {
				id: number;
				nombre: string;
				codigo: string;
			};
			numeroCedula: string;
			nombre: string;
			segundoNombre: string;
			apellido: string;
			segundoApellido: string;
			codigo: string;
			activo: boolean;
			usuarioCreacion: string;
		};
		contador: {
			id: number;
			cliente: {
				id: number;
				direccion: {
					id: number;
					departamento: {
						id: number;
						nombre: string;
					};
					ciudad: {
						id: number;
						nombre: string;
						activo: boolean;
						usuarioCreacion: string;
					};
					corregimiento: {
						id: number;
						nombre: string;
					};
					descripcion: string;
					usuarioCreacion: string;
				};
				tipoDocumento: {
					id: number;
					nombre: string;
					codigo: string;
				};
				numeroCedula: string;
				nombre: string;
				segundoNombre: string;
				apellido: string;
				segundoApellido: string;
				codigo: string;
				activo: boolean;
				usuarioCreacion: string;
			};
			tipoContador: {
				id: number;
				nombre: string;
			};
			descripcion: {
				id: number;
				departamento: {
					id: number;
					nombre: string;
				};
				ciudad: {
					id: number;
					nombre: string;
					activo: boolean;
					usuarioCreacion: string;
				};
				corregimiento: {
					id: number;
					nombre: string;
				};
				descripcion: string;
				usuarioCreacion: string;
			};
			serial: string;
			activo: boolean;
			usuarioCreacion: string;
		};
		activo: boolean;
		usuarioCreacion: string;
		fechaCreacion: string;
		usuarioModificacion: string;
		fechaModificacion: string;
	};
	tipoDeuda: {
		id: number;
		nombre: string;
		descripcion: string;
		codigo: string;
	};
	factura: {
		id: number;
		empresaClienteContador: any; // Puede ser tipado igual que arriba si se requiere
		lectura: {
			id: number;
			contador: any; // Puede ser tipado igual que arriba si se requiere
			lectura: number;
			fechaLectura: string;
			consumoAnormal: boolean;
			descripcion: string;
			activo: boolean;
			usuarioCreacion: string;
		};
		tipoPago: {
			id: number;
			nombre: string;
			descripcion: string;
			activo: boolean;
			usuarioCreacion: string;
			fechaCreacion: string;
			usuarioModificacion: string | null;
			fechaModificacion: string | null;
		};
		estado: {
			id: number;
			nombre: string;
		};
		fechaEmision: string;
		fechaFin: string;
		precio: number;
		codigo: string;
		activo: boolean;
		usuarioCreacion: string;
		fechaCreacion: string;
		usuarioModificacion: string | null;
		fechaModificacion: string | null;
	};
	plazoPago: any; // null en el ejemplo, tipar si se requiere
	fechaDeuda: string;
	valor: number;
	descripcion: string;
	activo: boolean | null;
	usuarioCreacion: string | null;
	fechaCreacion: string | null;
	usuarioModificacion: string | null;
	fechaModificacion: string | null;
}
