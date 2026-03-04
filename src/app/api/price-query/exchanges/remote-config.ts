export type RemoteDisabledExchange = {
    id: string
    reason?: string
}

export const DEFAULT_REMOTE_DISABLED_REASON = 'Temporary unavailable'

const REMOTE_CONFIG_REFRESH_MS = 60_000
const ERROR_BODY_PREVIEW_LENGTH = 300

let cachedDisabledExchanges: RemoteDisabledExchange[] = []
let cacheExpiresAt = 0

function getRemoteConfigUrl(): string {
    return process.env.DISABLED_EXCHANGES_CONFIG_URL?.trim() ?? ''
}

function describeError(error: unknown): string {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}`
    }
    return String(error)
}

function previewBody(text: string): string {
    if (text.length <= ERROR_BODY_PREVIEW_LENGTH) {
        return text
    }
    return `${text.slice(0, ERROR_BODY_PREVIEW_LENGTH)}...`
}

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

    const remoteConfigUrl = getRemoteConfigUrl()
    if (!remoteConfigUrl) {
        cachedDisabledExchanges = []
        return cachedDisabledExchanges
    }

    try {
        const response = await fetch(remoteConfigUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        })

        const rawConfig = await response.text()

        if (!response.ok) {
            throw new Error(
                `Unable to fetch remote exchange config (${response.status} ${response.statusText}). Body: ${previewBody(rawConfig)}`
            )
        }

        let config: unknown
        try {
            config = JSON.parse(rawConfig) as unknown
        } catch {
            throw new Error(`Remote exchange config is not valid JSON. Body: ${previewBody(rawConfig)}`)
        }

        cachedDisabledExchanges = parseDisabledExchanges(config, new Set(supportedExchanges))
    } catch (error) {
        console.error(
            `[remote-config] Failed to refresh remotely disabled exchanges (url: ${remoteConfigUrl}): ${describeError(error)}`
        )
    }

    return cachedDisabledExchanges
}
