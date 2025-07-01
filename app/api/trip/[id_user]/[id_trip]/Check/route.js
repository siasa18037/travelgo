// GET /api/trip/:id_user/:id_trip/Check

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id_user, id_trip } = await params;
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  const user = trip.user.find(u => u.id_user === id_user);
  if (!user) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    type: user.type,
    name_trip : trip.name,
    trip_status : trip.status,
    status: 200
  });
}
