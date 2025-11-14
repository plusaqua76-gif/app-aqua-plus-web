/**
 * Utilidades para manejo de filtros de reportes
 * Centraliza la lógica de formateo y validación de filtros
 */

import { Filtro } from '@interfaces/reports/filtersReports';

/**
 * Formatea el nombre de un campo eliminando prefijos y convirtiendo a formato legible
 * @param fieldName - Nombre del campo (ej: p_nombre_cliente)
 * @returns Nombre formateado (ej: Nombre Cliente)
 */
export function formatFieldName(fieldName: string): string {
  if (!fieldName || typeof fieldName !== 'string') {
    return '';
  }

  return fieldName
    .replace(/^p_/, '') // Remover prefijo p_
    .replace(/_/g, ' ') // Reemplazar _ con espacios
    .split(' ')
    .map((word) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .filter((word) => word.length > 0) // Filtrar palabras vacías
    .join(' ');
}

/**
 * Determina si un filtro es opcional y editable
 */
export function isOptionalEditableFilter(filtro: Filtro): boolean {
  return !filtro.requerido && !filtro.lectura && !!filtro.campo;
}

/**
 * Determina si un filtro es requerido y editable
 */
export function isRequiredEditableFilter(filtro: Filtro): boolean {
  return filtro.requerido && !filtro.lectura && !!filtro.campo;
}

/**
 * Determina si un filtro es requerido pero de solo lectura (autogenerado)
 */
export function isReadOnlyRequiredFilter(filtro: Filtro): boolean {
  return filtro.requerido && filtro.lectura;
}

/**
 * Determina si un filtro debe mostrarse en la UI
 */
export function shouldShowFilter(filtro: Filtro): boolean {
  return isOptionalEditableFilter(filtro) || isRequiredEditableFilter(filtro);
}

/**
 * Obtiene el valor inicial según el tipo de atributo
 */
export function getInitialValueByType(type: string): string | number[] | null {
  switch (type) {
    case 'TEXT':
      return '';
    case 'LIST':
    case 'INTEGER':
      return [];
    case 'DATE':
      return '';
    case 'BOOLEAN':
      return null;
    default:
      return null;
  }
}

/**
 * Parsea un valor de filtro al tipo correcto
 */
export function parseFilterValue(
  value: string | number | boolean | number[]
): string | number | boolean | number[] | null {
  if (value === null || value === undefined || value === '') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (Array.isArray(value)) return value; // Para campos LIST/INTEGER con múltiples valores
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  if (!Number.isNaN(Number(value)) && value !== '') return Number(value);
  return value;
}

/**
 * Valida si un campo requerido tiene un valor válido
 */
export function isValidRequiredValue(
  value: string | number | boolean | number[] | null | undefined
): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}
