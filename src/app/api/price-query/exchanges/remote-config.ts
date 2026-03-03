export type RemoteDisabledExchange = {
    id: string
    reason?: string
}

export const DEFAULT_REMOTE_DISABLED_REASON = 'Temporary unavailable'

const REMOTE_CONFIG_URL = process.env.DISABLED_EXCHANGES_CONFIG_URL
const REMOTE_CONFIG_REFRESH_MS = 60_000

let cachedDisabledExchanges: RemoteDisabledExchange[] = []
let cacheExpiresAt = 0

function normalizeDisabledExchange(entry: unknown): RemoteDisabledExchange | undefined {
    if (typeof entry === 'string') {
        const id = entry.trim().toLowerCase()
        return id ? { id } : undefined
    }

    if (typeof entry !== 'object' || entry === null) {
        return undefined
    }

    const record = entry as { id?: unknown; reason?: unknown }
    if (typeof record.id !== 'string') {
        return undefined
    }

    const id = record.id.trim().toLowerCase()
    if (!id) {
        return undefined
    }

    if (typeof record.reason === 'string') {
        const reason = record.reason.trim()
        if (reason) {
            return { id, reason }
        }
    }

    return { id }
}

function getDisabledExchangeEntries(config: unknown): unknown[] {
    if (Array.isArray(config)) {
        return config
    }

    if (typeof config !== 'object' || config === null) {
        return []
    }

    const record = config as { disabledExchanges?: unknown }
    if (Array.isArray(record.disabledExchanges)) {
        return record.disabledExchanges
    }

    return []
}

function parseDisabledExchanges(config: unknown, validExchanges: Set<string>): RemoteDisabledExchange[] {
    const entries = getDisabledExchangeEntries(config)
    const uniqueById = new Map<string, RemoteDisabledExchange>()

    for (const entry of entries) {
        const normalized = normalizeDisabledExchange(entry)
        if (!normalized || !validExchanges.has(normalized.id) || uniqueById.has(normalized.id)) {
            continue
        }
        uniqueById.set(normalized.id, normalized)
    }

    return [...uniqueById.values()]
}

export async function getRemoteDisabledExchanges(supportedExchanges: string[]): Promise<RemoteDisabledExchange[]> {
    const now = Date.now()
    if (cacheExpiresAt > now) {
        return cachedDisabledExchanges
    }

    cacheExpiresAt = now + REMOTE_CONFIG_REFRESH_MS

    if (!REMOTE_CONFIG_URL) {
        cachedDisabledExchanges = []
        return cachedDisabledExchanges
    }

    try {
        const response = await fetch(REMOTE_CONFIG_URL, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            throw new Error(`Unable to fetch remote exchange config (${response.status})`)
        }

        const config = (await response.json()) as unknown
        cachedDisabledExchanges = parseDisabledExchanges(config, new Set(supportedExchanges))
    } catch (error) {
        console.error('Failed to refresh remotely disabled exchanges:', error)
    }

    return cachedDisabledExchanges
}
