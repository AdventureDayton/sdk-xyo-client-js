import { XyoFetchedPayload, XyoSchemaPayload } from '@xyo-network/core'
import { XyoDomainConfigWrapper } from '@xyo-network/domain'
import Ajv, { SchemaObject } from 'ajv'
import LRU from 'lru-cache'

const getSchemaNameFromSchema = (schema: SchemaObject) => {
  if (schema.$id) {
    return schema.$id
  }
}

export type XyoSchemaCacheEntry = XyoFetchedPayload<XyoSchemaPayload>

export class XyoSchemaCache {
  public proxy = 'https://api.archivist.xyo.network/domain'
  private cache = new LRU<string, XyoSchemaCacheEntry | null>({ max: 500, ttl: 1000 * 60 * 5 })

  public onSchemaCached?: (name: string, entry: XyoSchemaCacheEntry) => void

  private cacheSchemaIfValid(entry: XyoSchemaCacheEntry) {
    //only store them if they match the schema root
    if (entry.payload.definition) {
      const ajv = new Ajv({ strict: false })
      //check if it is a valid schema def
      ajv.compile(entry.payload.definition)
      const schemaName = getSchemaNameFromSchema(entry.payload.definition)
      if (schemaName) {
        this.cache.set(schemaName, entry)
        this.onSchemaCached?.(schemaName, entry)
      }
    }
  }

  private cacheSchemas(aliasEntries?: XyoFetchedPayload[] | null) {
    aliasEntries
      ?.filter((entry) => entry.payload.schema === 'network.xyo.schema')
      .forEach((entry) => {
        this.cacheSchemaIfValid(entry as XyoSchemaCacheEntry)
      })
  }

  //Note: there is a race condition in here if two threads (or promises) start a get at the same time, they will both do the discovery
  public async get(schema: string) {
    const loadSchema = async (schema: string) => {
      const domain = await XyoDomainConfigWrapper.discover(schema, this.proxy)
      await domain?.fetch()
      this.cacheSchemas(domain?.aliases)

      //if it is still undefined, mark it as null (not found)
      if (this.cache.get(schema) === undefined) {
        this.cache.set(schema, null)
      }
    }

    //if we did not find it, mark it as not found (null)
    if (this.cache.get(schema) === undefined) {
      await loadSchema(schema)
    }
    return this.cache.get(schema)
  }

  private static _instance?: XyoSchemaCache
  static get instance() {
    if (!this._instance) {
      this._instance = new XyoSchemaCache()
    }
    return this._instance
  }
}