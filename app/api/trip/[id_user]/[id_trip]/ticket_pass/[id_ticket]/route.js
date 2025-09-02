// # GET, PUT, DELETE /trip/[id_user]/[id_trip]/ticket_pass/[id_ticket]

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// GET /trip/[id_user]/[id_trip]/ticket_pass/[id_ticket]
export async function GET(req, { params }) {
  const { id_user, id_trip, id_ticket } = await params;
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  const trips = await Trip.find({}, 'ticket_pass');
      const ticket_item = trips
        .flatMap(trip => trip.ticket_pass)
        .filter(ticket => ticket._id == id_ticket);

  if (!ticket_item) {
    return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
  }

  return NextResponse.json(ticket_item[0], { status: 200 });
}


// put /trip/[id_user]/[id_trip]/ticket_pass/[id_ticket]
export async function PUT(req, { params }) {
  const { id_user, id_trip, id_ticket } = await params;
  await connectDB();

  const updatedData = await req.json();

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  const ticket_item = trip.ticket_pass.id(id_ticket);
  if (!ticket_item) {
    return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
  }

  // อัปเดต field ที่อนุญาตให้เปลี่ยน
  Object.assign(ticket_item, updatedData);
  await trip.save();

  return NextResponse.json(ticket_item, { status: 200 });
}

// DELETE /trip/[id_user]/[id_trip]/ticket_pass/[id_ticket]
export async function DELETE(req, { params }) {
  try {
    const { id_user, id_trip, id_ticket } = await params;
    await connectDB();

    const trip = await Trip.findById(id_trip);
    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    const userExists = trip.user.some(u => u.id_user === id_user);
    if (!userExists) {
      return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
    }

    const ticket_item = trip.ticket_pass.id(id_ticket);
    if (!ticket_item) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    // ✅ ใช้ pull แทน remove
    trip.ticket_pass.pull({ _id: id_ticket });

    await trip.save();

    return NextResponse.json({ message: 'Ticket deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error("DELETE Error:", err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}
