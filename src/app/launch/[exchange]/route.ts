import { getAfiliateOrTradeUrl } from '@/lib/constants'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, props: { params: Promise<{ exchange: string }> }) {
    const params = await props.params;
    const { exchange } = params
    const searchParams = request.nextUrl.searchParams
    const coin = searchParams.get('coin')
    const quote = searchParams.get('quote')

    if (!exchange) {
        return new Response('Exchange parameter is required', { status: 400 })
    }

    const url = getAfiliateOrTradeUrl(exchange, coin || '', quote || '')

    if (!url) {
        return new Response('Invalid exchange or no affiliate link available', { status: 404 })
    }

    return Response.redirect(url)
}
