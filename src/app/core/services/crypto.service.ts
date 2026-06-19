
import { Injectable }  from '@angular/core'
import * as CryptoJS   from 'crypto-js'

export interface SecuredPayload {
  payload:   string
  timestamp: number
  nonce:     string
  signature: string
}

const DES_KEY_SOURCE  = 'keyacuaplus'
const HMAC_SECRET     = 'keyacuaplus-hmac-secure-2025!!'

@Injectable({ providedIn: 'root' })
export class CryptoService {

  private readonly desKey: CryptoJS.lib.WordArray = (() => {
    const md5Hex   = CryptoJS.MD5(DES_KEY_SOURCE).toString(CryptoJS.enc.Hex)
    const keyHex24 = md5Hex + '0000000000000000'
    return CryptoJS.enc.Hex.parse(keyHex24)
  })()

  buildSecuredPayload(body: unknown): SecuredPayload {
    const payload   = this.desEncrypt(JSON.stringify(body))
    const nonce     = this.generateNonce()
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = this.hmacSign(nonce, timestamp, payload)
    return { payload, timestamp, nonce, signature }
  }

  private desEncrypt(text: string): string {
    return CryptoJS.TripleDES.encrypt(text, this.desKey, {
      mode:    CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString()
  }

  private hmacSign(nonce: string, timestamp: number, payload: string): string {
    const message = `${nonce}.${timestamp}.${payload}`
    return CryptoJS.HmacSHA256(message, HMAC_SECRET).toString(CryptoJS.enc.Hex)
  }

  private generateNonce(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.trunc(Math.random() * 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }
}
