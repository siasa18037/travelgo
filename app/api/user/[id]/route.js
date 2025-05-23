import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import User from '@/models/User';

export async function GET(req, { params }) {
  await connectDB();

  const { id } = await params;

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}


export async function PUT(req, { params }) {
  await connectDB();

  const { id } = await params;

  const data = await req.json();
  const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(updatedUser);
}

export async function DELETE(req, { params }) {
  await dbConnect();

  const { id } = await params;

  await User.findByIdAndDelete(id);
  return NextResponse.json({ message: 'User deleted' });
}
