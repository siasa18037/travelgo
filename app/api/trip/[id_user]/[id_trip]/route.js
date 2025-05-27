// # GET, PUT, DELETE /trip/:id_user/:id_trip

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id_user, id_trip } = await params;
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  return NextResponse.json(trip, { status: 200 });
}

export async function PUT(req, { params }) {
  const { id_user, id_trip } = await params;
  const data = await req.json();
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  const updatedTrip = await Trip.findByIdAndUpdate(id_trip, data, { new: true });
  return NextResponse.json(updatedTrip, { status: 200 });
}

export async function DELETE(req, { params }) {
  const { id_user, id_trip } = await params;
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  await Trip.findByIdAndDelete(id_trip);
  return NextResponse.json({ message: 'Trip deleted successfully' }, { status: 200 });
}
