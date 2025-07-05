import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import getUserTokenModel from '@/models/UserToken'

const PY_URL =
  process.env.PYTHON_ANYWHERE_URL ??
  'https://sensimods.pythonanywhere.com'

/** midnight UTC of today */
const todayUTC = () => {
  const n = new Date()
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()))
}

export const runtime = 'nodejs'

// POST /api/convert-docx-to-pdf
export async function POST (req) {
  await dbConnect()
  const UserToken = getUserTokenModel()

  // anonymous fingerprint sent from client JS; fall back to cookie/session
  const fingerprintId = req.headers.get('x-fingerprint-id') ?? null
  const userId        = req.headers.get('x-user-id') ?? null
  const anonymousId   = req.cookies.get('anonId')?.value ?? null

  // guarantee token doc exists
  let tokenDoc =
    (await UserToken.findOne({ userId })) ??
    (await UserToken.findOne({ fingerprintId })) ??
    (await UserToken.findOne({ anonymousId }))

  if (!tokenDoc) {
    tokenDoc = await UserToken.create({
      userId,
      fingerprintId,
      anonymousId,
      lastResetDate: todayUTC(),
      tokensUsedToday: 0,
      maxTokensPerDay: 20,
      isSubscriber: false
    })
  }

  // daily reset
  if (tokenDoc.lastResetDate.getTime() !== todayUTC().getTime()) {
    tokenDoc.lastResetDate  = todayUTC()
    tokenDoc.tokensUsedToday = 0
  }

  if (tokenDoc.tokensUsedToday >= tokenDoc.maxTokensPerDay && !tokenDoc.isSubscriber) {
    return NextResponse.json(
      { error: 'Insufficient tokens' },
      { status: 429 }
    )
  }

  // ----- forward the upload to Flask -----
  const formData = await req.formData()
  const file     = formData.get('file')
  if (!file)
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    )

  const flaskRes = await fetch(`${PY_URL}/convert-docx-to-pdf`, {
    method: 'POST',
    body: formData
  })

  if (!flaskRes.ok) {
    console.error('Flask conversion failed', await flaskRes.text())
    return NextResponse.json(
      { error: 'Conversion service failed' },
      { status: 502 }
    )
  }

  // increment quota **after** a successful conversion
  tokenDoc.tokensUsedToday += 1
  await tokenDoc.save()

  // stream back the PDF
  const pdfBuf = await flaskRes.arrayBuffer()
  return new NextResponse(pdfBuf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="converted.pdf"'
    }
  })
}
