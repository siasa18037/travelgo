// # GET, PUT, DELETE /trip/:id_user/:id_trip

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req, { params }) {
  const { id_user, id_trip } = await params;
  await connectDB();

  const url = new URL(req.url);
  const mode = url.searchParams.get('mode'); // ดึงค่า ?mode=some

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  // ✅ ถ้ามี query ?mode=some → ลบ field plan ออกจาก object
  let result = trip.toObject();
  if (mode === 'some') {
    delete result.plan;
    delete result.wallet_transaction;
  }

  return NextResponse.json(result, { status: 200 });
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

// # DELETE /trip/:id_user/:id_trip
export async function DELETE(req, { params }) {
  const { id_user, id_trip } = await params;
  const password = await req.json();
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  const userAdminExists = trip.user.some(u => u.type === 'admin');
  if (!userAdminExists) return NextResponse.json({ message: 'User not Admin in this trip' }, { status: 403 });

  const user = await User.findOne({ _id : id_user });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ message: "รหัสผิด" }, { status: 401 });
  }

  await Trip.findByIdAndDelete(id_trip);
  return NextResponse.json({ message: 'Trip deleted successfully' }, { status: 200 });
}
