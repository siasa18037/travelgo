// # GET, POST, PUT, DELETE /trip/:id_user/:id_trip/ticket_pass

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// GET /api/trip/:id_user/:id_trip/ticket_pass?user=1
export async function GET(req, { params }) {
  const { id_user, id_trip } = await params;
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get('user'); // ตรวจสอบค่าจาก ?user=1

  if (mode === '1') {
    // ส่งออกเฉพาะ ticket_pass ที่ type === id_user
    const filteredTickets = trip.ticket_pass.filter(tp =>
      tp.type === id_user 
    );
    return NextResponse.json(filteredTickets, { status: 200 });
  } else {
    // ส่งทั้งหมด
    return NextResponse.json(trip.ticket_pass, { status: 200 });
  }
}

// POST /api/trip/:id_user/:id_trip/ticket_pass
export async function POST(req, { params }) {
  const { id_user, id_trip } = await params;
  await connectDB();
  const newTicketPass = await req.json();

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  // ให้ MongoDB สร้าง _id ให้กับ ticket_pass
  const ticketWithId = {
    ...newTicketPass,
    _id: new mongoose.Types.ObjectId(),
  };

  trip.ticket_pass.push(ticketWithId);
  await trip.save();

  return NextResponse.json(ticketWithId, { status: 200 });
}
