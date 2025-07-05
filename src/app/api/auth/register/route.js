import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import getUserModel from '@/models/User'
import getUserTokenModel from '@/models/UserToken'

export const runtime = 'nodejs'

export async function POST (request) {
  await dbConnect()
  const User       = getUserModel()
  const UserToken  = getUserTokenModel()

  try {
    const { email, password } = await request.json()

    if (!email || !password)
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )

    // duplicate check
    if (await User.findOne({ email }))
      return NextResponse.json(
        { error: 'User with this email already exists.' },
        { status: 409 }
      )

    // create user + initial token-quota doc
    const newUser = await User.create({ email, password })

    await UserToken.create({
      userId: newUser._id,
      lastResetDate: new Date(Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate()
      )),
      tokensUsedToday: 0,
      maxTokensPerDay: 20,
      isSubscriber: false
    })

    return NextResponse.json(
      { message: 'User registered successfully.' },
      { status: 201 }
    )
  } catch (err) {
    console.error('Registration API error:', err)
    return NextResponse.json(
      { error: 'Internal server error during registration.' },
      { status: 500 }
    )
  }
}
