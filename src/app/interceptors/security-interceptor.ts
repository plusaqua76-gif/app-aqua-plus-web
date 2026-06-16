/**
 * SecurityInterceptor
 *
 * Intercepta peticiones hacia el backend y reemplaza el body por el envelope
 * cifrado que espera el filtro de seguridad Spring.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  Original body (cualquier DTO)                                       │
 * │       │                                                              │
 * │       ▼  CryptoService.buildSecuredPayload()  [síncrono]            │
 * │       │                                                              │
 * │       ▼                                                              │
 * │  { payload, timestamp, nonce, signature }  ───► backend (Spring)    │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Dos modos de activación  (POST / PUT / PATCH únicamente)
 * ──────────────────────────────────────────────────────────
 * ✓  URL contiene /secure/          → filtro activo por ruta
 * ✓  Header X-Secured: true         → filtro activo por header (endpoints existentes)
 *
 * Pasa sin cifrar
 * ──────────────────────────────────────────────────
 * ✗  Peticiones a servicios externos (Wompi, Azure…)
 * ✗  GET / DELETE
 * ✗  FormData (uploads)
 * ✗  Body nulo / vacío
 * ✗  Header X-Skip-Encryption: true
 * ✗  SSR (Node)
 */
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http'
import { inject, PLATFORM_ID }           from '@angular/core'
import { isPlatformBrowser }             from '@angular/common'
import { CryptoService }                 from '@services/crypto.service'
import { environment }                   from '../../environments/environment'

const SECURE_PATH_SEGMENT = '/secure/'
const SECURED_HEADER      = 'X-Secured'
const ENCRYPTED_METHODS   = new Set(['POST', 'PUT', 'PATCH'])
const SKIP_HEADER         = 'X-Skip-Encryption'

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId    = inject(PLATFORM_ID)
  const cryptoService = inject(CryptoService)

  if (!isPlatformBrowser(platformId)) return next(req)
  if (!shouldEncrypt(req))            return next(req)

  // buildSecuredPayload es síncrono → no necesita from()/switchMap
  const securedBody = cryptoService.buildSecuredPayload(req.body)

  return next(req.clone({
    body:       securedBody,
    setHeaders: { 'Content-Type': 'application/json', [SECURED_HEADER]: 'true' },
    headers:    req.headers.delete(SKIP_HEADER),
  }))
}

function shouldEncrypt(req: HttpRequest<unknown>): boolean {
  if (!ENCRYPTED_METHODS.has(req.method))                              return false
  if (req.headers.has(SKIP_HEADER))                                    return false
  if (!req.url.startsWith(environment.apiUrl))                         return false

  const isSecurePath   = req.url.includes(SECURE_PATH_SEGMENT)
  const isSecuredHeader = req.headers.get(SECURED_HEADER) === 'true'
  if (!isSecurePath && !isSecuredHeader)                               return false

  if (req.body === null || req.body === undefined)                      return false
  if (typeof FormData !== 'undefined' && req.body instanceof FormData)  return false
  return true
}
