// # POST, GET /trip/:id_user

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Award } from 'lucide-react';

export async function POST(req, { params }) {
  await connectDB();
  const data = await req.json();

  try {
    const newTrip = await Trip.create({ ...data});
    return NextResponse.json(newTrip, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  await connectDB();
  const { id_user } = await params;

  try {
    const trips = await Trip.find({ 'user.id_user': id_user }).select('name start_date end_date profile_image user');

    return NextResponse.json(trips);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

}
