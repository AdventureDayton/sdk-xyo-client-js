export type XyoObjectCategory = 'block' | 'payload'

/* 
  Valid Huri:

  [<protocol>://][archivist-host]/<hash>

  defaults:
    protocol: https
    archivist: api.archivist.xyo.network
*/

export class Huri {
  public originaHref: string
  public protocol?: string
  public archivist?: string
  public hash: string

  constructor(huri: string) {
    this.originaHref = huri
    const protocolSplit = huri.split('://')
    this.protocol = protocolSplit.length >= 2 ? protocolSplit[0] : 'http'
    const split = protocolSplit[protocolSplit.length - 1].split('/')

    //if no protocol and leading '/', remove it
    if (protocolSplit.length === 1) {
      if (split[0].length === 0) {
        split.shift()
      }
    }

    switch (split.length) {
      case 2:
        this.archivist = split[0]
        this.hash = split[1]
        break
      case 1:
        this.hash = split[0]
        break
      default:
        throw Error('Invalid huri')
    }
  }

  /*
  The full href or the hash
  */

  public get href() {
    const parts: string[] = []
    if (this.protocol) {
      parts.push(`${this.protocol}:/`)
    }
    if (this.archivist) {
      parts.push(`${this.archivist}`)
    }
    parts.push(this.hash)
    return parts.join('/')
  }

  public toString() {
    return this.href
  }
}