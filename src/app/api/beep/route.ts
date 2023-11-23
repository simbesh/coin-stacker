const endpointName = '/beep'
const umamiUrl = 'https://analytics.eu.umami.is'

// proxy for umami analytics to bypass adblockers
export async function POST(request: Request): Promise<any> {
    let headers: Record<string, string> = {}
    request.headers.forEach((v, k) => {
        if (!k.startsWith('sec-fetch')) {
            headers[k] = v
        }
    })
    const data = await request.json()

    const response = await fetch(umamiUrl + '/api/send', {
        method: 'POST',
        headers: {
            'content-type': headers['content-type'],
            'user-agent': headers['user-agent'],
        } as unknown as Record<string, string>,
        body: JSON.stringify(data),
    })
    const resData = await response.text()

    return new Response(resData, {
        status: 200,
    })
}

export async function GET(request: Request): Promise<any> {
    let headers: Record<string, string> = {}
    request.headers.forEach((v, k) => (headers[k] = v))

    const response = await fetch(umamiUrl + '/script.js')
    const originalScript = await response.text()
    const obfuscatedScript = originalScript.replace(new RegExp('/api/send', 'g'), endpointName)

    return new Response(obfuscatedScript, {
        status: 200,
    })
}
