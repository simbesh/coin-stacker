import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse<any>> {
    const forwarded = request.headers.get('x-forwarded-for')
    const userAgent = request.headers.get('user-agent')

    const { title, email, message } = await request.json()
    const options = `&parse_mode=HTML&disable_web_page_preview=true`
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_API}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}${options}&text=`
    let text = `
<b>Tite</b>: ${title}
<b>Email</b>: ${email}
<b>Message</b>: ${message}
<b>IP</b>: ${forwarded}`

    if (forwarded) {
        try {
            const url = `https://api.ipdata.co/${forwarded}?api-key=${process.env.IPDATA_CO_API_KEY}`
            const { ip, city, region, country_name, emoji_flag } = await fetch(url).then((res) => res.json())
            text += `
${city} - ${region}
${emoji_flag} ${country_name}</code>
<a href="https://tools.keycdn.com/geo?host=${ip}">Geolocation info</a>
UA: ${userAgent}`
        } catch (e) {}
    }

    let body = encodeURIComponent(text)
    await fetch(url + body)
    return NextResponse.json({ success: true })
}
