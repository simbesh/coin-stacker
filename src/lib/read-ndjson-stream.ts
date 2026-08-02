import type { PriceQueryStreamEvent } from '@/types/price-query'

const isNonNegativeInteger = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 0

const isPriceQueryStreamEvent = (value: unknown): value is PriceQueryStreamEvent => {
    if (!(value && typeof value === 'object' && 'type' in value && typeof value.type === 'string')) {
        return false
    }

    if (value.type === 'start') {
        return 'total' in value && isNonNegativeInteger(value.total)
    }

    if (value.type !== 'snapshot' && value.type !== 'complete') {
        return false
    }

    const hasCommonFields =
        'best' in value &&
        Array.isArray(value.best) &&
        'completed' in value &&
        isNonNegativeInteger(value.completed) &&
        'errors' in value &&
        Array.isArray(value.errors) &&
        'total' in value &&
        isNonNegativeInteger(value.total)

    if (!hasCommonFields) {
        return false
    }

    return value.type === 'complete' || ('exchange' in value && typeof value.exchange === 'string')
}

const parseEvent = (line: string): PriceQueryStreamEvent => {
    let value: unknown
    try {
        value = JSON.parse(line)
    } catch {
        throw new Error('Price query stream contained malformed JSON')
    }

    if (!isPriceQueryStreamEvent(value)) {
        throw new Error('Price query stream contained an invalid event')
    }
    return value
}

export async function readPriceQueryStream(
    stream: ReadableStream<Uint8Array>,
    onEvent: (event: PriceQueryStreamEvent) => void,
): Promise<void> {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let completed = false

    try {
        while (true) {
            const { done, value } = await reader.read()
            buffer += decoder.decode(value, { stream: !done })

            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''
            for (const line of lines) {
                if (!line.trim()) {
                    continue
                }
                const event = parseEvent(line)
                completed ||= event.type === 'complete'
                onEvent(event)
            }

            if (done) {
                break
            }
        }

        if (buffer.trim()) {
            const event = parseEvent(buffer)
            completed ||= event.type === 'complete'
            onEvent(event)
        }

        if (!completed) {
            throw new Error('Price query stream ended before completion')
        }
    } finally {
        reader.releaseLock()
    }
}
