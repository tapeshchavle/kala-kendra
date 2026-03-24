import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role = 'buyer', craftType, location, story, yearsOfExperience } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = {
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      role,
      avatar: '',
      location: location || { village: '', district: '', state: 'Madhya Pradesh' },
      craftType: craftType || '',
      yearsOfExperience: yearsOfExperience || 0,
      story: story || '',
      giTagVerified: false,
      whatsappRegistered: role === 'seller',
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(user);

    const token = createToken({
      id: result.insertedId.toString(),
      email,
      role,
      name,
    });

    const response = NextResponse.json({
      message: 'Registration successful',
      user: { id: result.insertedId, name, email, role },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
