'use client'

import { useLocalStorage } from '@uidotdev/usehooks'
import { useCallback, useEffect, useMemo } from 'react'
import { LocalStorageKeys } from '@/lib/constants'
import { defaultEnabledExchanges } from '@/lib/utils'

type EnabledExchangesMap = Record<string, boolean>

export interface EnabledExchangesPreferences {
    touched: EnabledExchangesMap
    values: EnabledExchangesMap
}

const legacyDefaultEnabledExchanges: EnabledExchangesMap = {
    ...defaultEnabledExchanges,
    pepperstonecrypto: false,
}

const createEmptyEnabledExchangesPreferences = (): EnabledExchangesPreferences => ({
    touched: {},
    values: {},
})

const isRecordOfBooleans = (value: unknown): value is EnabledExchangesMap => {
    if (!value || typeof value !== 'object') {
        return false
    }

    return Object.values(value).every((entry) => typeof entry === 'boolean')
}

const parseEnabledExchangesMap = (value: string | null): EnabledExchangesMap | undefined => {
    if (!value) {
        return undefined
    }

    try {
        const parsedValue = JSON.parse(value) as unknown
        return isRecordOfBooleans(parsedValue) ? parsedValue : undefined
    } catch {
        return undefined
    }
}

const normalizeEnabledExchangesPreferences = (
    preferences: EnabledExchangesPreferences | undefined,
): EnabledExchangesPreferences => {
    if (!preferences) {
        return createEmptyEnabledExchangesPreferences()
    }

    const values = isRecordOfBooleans(preferences.values) ? preferences.values : {}
    const touched = isRecordOfBooleans(preferences.touched) ? preferences.touched : {}

    const normalizedValues: EnabledExchangesMap = {}
    const normalizedTouched: EnabledExchangesMap = {}

    for (const exchange of Object.keys(defaultEnabledExchanges)) {
        if (touched[exchange] === true) {
            normalizedTouched[exchange] = true
            normalizedValues[exchange] = values[exchange] ?? defaultEnabledExchanges[exchange] ?? false
        }
    }

    return {
        touched: normalizedTouched,
        values: normalizedValues,
    }
}

const arePreferencesEqual = (left: EnabledExchangesPreferences, right: EnabledExchangesPreferences): boolean => {
    return JSON.stringify(left) === JSON.stringify(right)
}

const migrateLegacyEnabledExchanges = (
    legacyEnabledExchanges: EnabledExchangesMap | undefined,
): EnabledExchangesPreferences => {
    if (!legacyEnabledExchanges) {
        return createEmptyEnabledExchangesPreferences()
    }

    const migratedPreferences = createEmptyEnabledExchangesPreferences()

    for (const [exchange, enabled] of Object.entries(legacyEnabledExchanges)) {
        const legacyDefault = legacyDefaultEnabledExchanges[exchange] ?? defaultEnabledExchanges[exchange] ?? enabled

        if (enabled !== legacyDefault) {
            migratedPreferences.touched[exchange] = true
            migratedPreferences.values[exchange] = enabled
        }
    }

    return migratedPreferences
}

export const resolveEnabledExchanges = (preferences: EnabledExchangesPreferences | undefined): EnabledExchangesMap => {
    const normalizedPreferences = normalizeEnabledExchangesPreferences(preferences)
    const resolvedExchanges: EnabledExchangesMap = {}

    for (const [exchange, defaultEnabled] of Object.entries(defaultEnabledExchanges)) {
        resolvedExchanges[exchange] =
            normalizedPreferences.touched[exchange] === true
                ? (normalizedPreferences.values[exchange] ?? defaultEnabled)
                : defaultEnabled
    }

    return resolvedExchanges
}

const updateExchangePreference = (
    previousPreferences: EnabledExchangesPreferences | undefined,
    exchange: string,
    enabled: boolean,
): EnabledExchangesPreferences => {
    const normalizedPreferences = normalizeEnabledExchangesPreferences(previousPreferences)

    return {
        touched: {
            ...normalizedPreferences.touched,
            [exchange]: true,
        },
        values: {
            ...normalizedPreferences.values,
            [exchange]: enabled,
        },
    }
}

const updateAllExchangePreferences = (enabled: boolean): EnabledExchangesPreferences => {
    const values: EnabledExchangesMap = {}
    const touched: EnabledExchangesMap = {}

    for (const exchange of Object.keys(defaultEnabledExchanges)) {
        values[exchange] = enabled
        touched[exchange] = true
    }

    return {
        touched,
        values,
    }
}

export const useEnabledExchanges = () => {
    const [storedPreferences, setStoredPreferences] = useLocalStorage<EnabledExchangesPreferences | undefined>(
        LocalStorageKeys.EnabledExchanges,
        undefined,
    )

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        if (storedPreferences === undefined) {
            const legacyStorageValue = window.localStorage.getItem(LocalStorageKeys.EnabledExchangesLegacy)
            const migratedPreferences = migrateLegacyEnabledExchanges(parseEnabledExchangesMap(legacyStorageValue))

            setStoredPreferences(migratedPreferences)
            return
        }

        const normalizedPreferences = normalizeEnabledExchangesPreferences(storedPreferences)

        if (!arePreferencesEqual(storedPreferences, normalizedPreferences)) {
            setStoredPreferences(normalizedPreferences)
        }
    }, [setStoredPreferences, storedPreferences])

    const enabledExchanges = useMemo(() => resolveEnabledExchanges(storedPreferences), [storedPreferences])

    const setExchangeEnabled = useCallback(
        (exchange: string, enabled: boolean) => {
            setStoredPreferences((previousPreferences) =>
                updateExchangePreference(previousPreferences, exchange, enabled),
            )
        },
        [setStoredPreferences],
    )

    const setAllExchangesEnabled = useCallback(
        (enabled: boolean) => {
            setStoredPreferences(updateAllExchangePreferences(enabled))
        },
        [setStoredPreferences],
    )

    return {
        enabledExchanges,
        setAllExchangesEnabled,
        setExchangeEnabled,
    }
}
