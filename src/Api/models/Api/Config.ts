import { ApiConfig } from '@xylabs/sdk-js'

import { XyoApiError } from './Error'
import { XyoApiResponse } from './Response'

interface XyoApiConfig extends ApiConfig {
  /** @description The location in the API tree where this API object is mounted */
  root?: string

  /** @description The query string, if any, that is added to the end of every request */
  query?: string

  /** @description Callback that notifies on every transort error */
  onError?: (error: XyoApiError) => void

  /** @description Callback that notifies on every server failure (status >= 300) */
  onFailure?: (response: XyoApiResponse) => void

  /** @description Callback that notifies on every server success (status < 300) */
  onSuccess?: (response: XyoApiResponse) => void

  /** @description Threshold for Content-Size to cause automatic gzip of request body [default = 1024] */
  compressionThreshold?: number

  /** @description Throw on failures */
  throwFailure?: boolean

  /** @description Throw on error */
  throwError?: boolean
}

export type { XyoApiConfig }