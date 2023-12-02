import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse<any>> {
    const forwarded = request.headers.get('x-forwarded-for')

    const { title, email, message } = await request.json()
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_API}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&parse_mode=HTML&&text=`

    let body = `
<b>Tite</b>: ${title}
%0A
<b>Email</b>: ${email}
%0A
<b>Message</b>: ${message}
%0A
<b>IP</b>: ${forwarded}`

    await fetch(url + body)
    return NextResponse.json({ success: true })
}
