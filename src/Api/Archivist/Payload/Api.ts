import { assertEx } from '@xylabs/sdk-js'

import { XyoPayload } from '../../../models'
import { XyoApiBase } from '../../Base'
import { XyoApiConfig } from '../../Config'
import { WithArchive } from '../../WithArchive'

export class XyoArchivistArchivePayloadApi<
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>,
  T extends XyoPayload = XyoPayload
> extends XyoApiBase<C> {
  public async getStats() {
    return await this.getEndpoint<{ count: number }>('stats')
  }

  public async getByHash(hash: string) {
    return await this.getEndpoint<T[]>(`hash/${hash}`)
  }

  public async repairByHash(hash: string) {
    return await this.getEndpoint<T[]>(`hash/${hash}/repair`)
  }

  private async get(params: { order: 'desc' | 'asc'; timestamp: number }, limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return await this.getEndpoint<T[]>('')
  }

  public async getBefore(timestamp: number, limit = 20) {
    return await this.get({ order: 'desc', timestamp }, limit)
  }

  public async getAfter(timestamp: number, limit = 20) {
    return await this.get({ order: 'asc', timestamp }, limit)
  }

  public async getMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return await this.getEndpoint<T[]>(`recent/${limit}`)
  }

  public async getSample(size: number) {
    return await this.getEndpoint<T[]>(`sample/${size}`)
  }
}