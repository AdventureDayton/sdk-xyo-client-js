import { XyoSimpleWitness } from '@xyo-network/core'
import { v4 as uuid } from 'uuid'

import { XyoIdPayload } from './Payload'
import { idTemplate } from './Template'

export class XyoIdWitness extends XyoSimpleWitness<XyoIdPayload> {
  private salt: string

  constructor(salt = uuid()) {
    const template = idTemplate()
    super({
      schema: template.schema,
      template,
    })
    this.salt = salt
  }

  override async observe(): Promise<XyoIdPayload> {
    return await super.observe({
      salt: this.salt,
    })
  }
}
