import { assertEx } from '@xylabs/sdk-js'
import { XyoAccount } from '@xyo-network/account'
import { XyoArchivist, XyoArchivistBase, XyoPayloadFindFilter } from '@xyo-network/archivist'
import { XyoBoundWitnessWithPartialMeta } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoArchivistApi } from './Api'

export class XyoRemoteArchivist extends XyoArchivistBase {
  protected api: XyoArchivistApi
  protected archive: string
  constructor(api: XyoArchivistApi, archive: string, parent?: XyoArchivist, account?: XyoAccount) {
    super(parent, account)
    this.api = api
    this.archive = archive
  }

  public async get(hash: string) {
    const [payloads] = await this.api.archive(this.archive).payload.hash(hash).get('tuple')
    return payloads?.pop()
  }

  public async insert(payloads: XyoPayload[]) {
    const boundwitnesses = payloads.filter((payload) => payload.schema === 'network.xyo.payload') as XyoBoundWitnessWithPartialMeta[]
    boundwitnesses.forEach((boundwitness) => {
      boundwitness._payloads ===
        payloads.filter((payload) => {
          const hash = new XyoPayloadWrapper(payload).hash
          return boundwitness.payload_hashes.includes(hash)
        })
    })
    payloads.forEach((payload) => {
      let found = false
      const hash = new XyoPayloadWrapper(payload).hash
      boundwitnesses.forEach((boundwitnesses) => {
        if (boundwitnesses.payload_hashes.includes(hash)) {
          found = true
        }
      })
      assertEx(found, 'Payload not in Boundwitness received')
    })
    await this.api.archive(this.archive).block.post(boundwitnesses)
    return payloads
  }

  public async find(filter: XyoPayloadFindFilter) {
    const [payloads = []] = (await this.api.archive(this.archive).payload.find(filter, 'tuple')) ?? []
    const [blocks = []] = (await this.api.archive(this.archive).block.find(filter, 'tuple')) ?? []
    return payloads.concat(blocks)
  }
}