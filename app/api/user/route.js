import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  await connectDB();
  const users = await User.find({}).select('_id name email avatar type_user');
  return NextResponse.json(users);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  try {
    const newUser = await User.create(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Create failed', details: err.message }, { status: 400 });
  }
}
