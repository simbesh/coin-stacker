import type { NextRequest } from 'next/server'

const HTTP_PROTOCOLS = new Set(['http:', 'https:'])

export async function GET(request: NextRequest) {
    const src = request.nextUrl.searchParams.get('src')

    if (!src) {
        return new Response('src parameter is required', { status: 400 })
    }

    let imageUrl: URL

    try {
        imageUrl = new URL(src)
    } catch {
        return new Response('Invalid src URL', { status: 400 })
    }

    if (!HTTP_PROTOCOLS.has(imageUrl.protocol)) {
        return new Response('Unsupported src protocol', { status: 400 })
    }

    let upstreamResponse: Response

    try {
        upstreamResponse = await fetch(imageUrl, {
            next: { revalidate: 86_400 },
        })
    } catch {
        return new Response('Failed to fetch remote image', { status: 502 })
    }

    if (!upstreamResponse.ok) {
        return new Response('Failed to fetch remote image', { status: 502 })
    }

    const contentType = upstreamResponse.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
        return new Response('Remote asset is not an image', { status: 415 })
    }

    return new Response(await upstreamResponse.arrayBuffer(), {
        headers: {
            'Cache-Control': upstreamResponse.headers.get('cache-control') ?? 'public, max-age=86400',
            'Content-Type': contentType,
        },
    })
}
