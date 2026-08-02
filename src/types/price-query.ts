export interface PriceQueryBest {
    exchange: string
    feeRate: number
    fees: number
    grossAveragePrice: number
    grossPrice: number
    netCost: number
    netPrice: number
}

export interface PriceQueryErrorDetail {
    message?: string
    name?: string
}

export interface PriceQueryError {
    error: PriceQueryErrorDetail
    name: string
}

export type PriceQueryStreamEvent =
    | {
          type: 'start'
          total: number
      }
    | {
          best: PriceQueryBest[]
          completed: number
          errors: PriceQueryError[]
          exchange: string
          total: number
          type: 'snapshot'
      }
    | {
          best: PriceQueryBest[]
          completed: number
          errors: PriceQueryError[]
          total: number
          type: 'complete'
      }
