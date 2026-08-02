// @ts-expect-error -- Bun supplies this module at test runtime; the project does not install Bun's global type package.
import { describe, expect, test } from 'bun:test'
import type { PriceQueryStreamEvent } from '@/types/price-query'
import { readPriceQueryStream } from './read-ndjson-stream'

const createStream = (chunks: string[]): ReadableStream<Uint8Array> => {
    const encoder = new TextEncoder()
    return new ReadableStream({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(encoder.encode(chunk))
            }
            controller.close()
        },
    })
}

const startLine = '{"type":"start","total":1}\n'
const completeLine = '{"type":"complete","completed":1,"total":1,"best":[],"errors":[]}\n'

describe('readPriceQueryStream', () => {
    test('reads complete events from individual chunks', async () => {
        const events: PriceQueryStreamEvent[] = []
        await readPriceQueryStream(createStream([startLine, completeLine]), (event) => events.push(event))
        expect(events.map(({ type }) => type)).toEqual(['start', 'complete'])
    })

    test('reassembles events split across chunks', async () => {
        const events: PriceQueryStreamEvent[] = []
        await readPriceQueryStream(createStream([startLine.slice(0, 10), startLine.slice(10), completeLine]), (event) =>
            events.push(event),
        )
        expect(events[0]).toEqual({ type: 'start', total: 1 })
    })

    test('reads multiple events from one chunk', async () => {
        const events: PriceQueryStreamEvent[] = []
        await readPriceQueryStream(createStream([startLine + completeLine]), (event) => events.push(event))
        expect(events).toHaveLength(2)
    })

    test('reads a final complete event without a trailing newline', async () => {
        const events: PriceQueryStreamEvent[] = []
        await readPriceQueryStream(createStream([startLine, completeLine.trimEnd()]), (event) => events.push(event))
        expect(events.at(-1)?.type).toBe('complete')
    })

    test('rejects malformed JSON', async () => {
        await expect(readPriceQueryStream(createStream(['not-json\n']), () => undefined)).rejects.toThrow(
            'malformed JSON',
        )
    })

    test('rejects unknown event types', async () => {
        await expect(readPriceQueryStream(createStream(['{"type":"mystery"}\n']), () => undefined)).rejects.toThrow(
            'invalid event',
        )
    })

    test('rejects streams that end before complete', async () => {
        await expect(readPriceQueryStream(createStream([startLine]), () => undefined)).rejects.toThrow(
            'ended before completion',
        )
    })
})
