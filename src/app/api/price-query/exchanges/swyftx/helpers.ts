import { toIsoString } from '@/lib/utils'
import { sql } from '@vercel/postgres'

export async function updateCachedSwyftxKey(key: string) {
    return await sql`UPDATE swyftx
                SET refresh_key = ${key},
                    updated_at = ${toIsoString(new Date())}
                WHERE access_token = '1';`
}

export async function getCachedSwyftxKey(): Promise<{ refresh_key: string; updated_at: Date } | undefined> {
    const { rows } = await sql`SELECT refresh_key, updated_at from swyftx WHERE access_token = '1';`
    if (rows.length === 1) {
        return rows[0] as { refresh_key: string; updated_at: Date }
    }
}

export async function refreshSwyftxToken() {
    const res = await fetch(`https://api.swyftx.com.au/auth/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
            apiKey: process.env.SWYFTX_API_KEY,
        }),
    })
    const json = await res.json()
    return json.accessToken
}
