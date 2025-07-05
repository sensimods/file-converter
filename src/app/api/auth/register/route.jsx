
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import getUserModel from '@/models/User';
import getUserTokenModel from '@/models/UserToken'; // Import UserToken model

export const runtime = 'nodejs';

export async function POST(request) {
  await dbConnect();
  const User = getUserModel();
  const UserToken = getUserTokenModel();

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
    }

    // Create new user
    const newUser = await User.create({ email, password });

    // Create a corresponding UserToken document for the new user
    // This ensures every authenticated user has a token record from the start.
    const newUserToken = await UserToken.create({
      userId: newUser._id,
      lastResetDate: new Date(),
      tokensUsedToday: 0,
      maxTokensPerDay: 20, // Default for new users
      isSubscriber: false,
    });

    return NextResponse.json({
      message: 'User registered successfully.',
      userId: newUser._id,
      userTokenId: newUserToken._id,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration API error:', error);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
  }
}
