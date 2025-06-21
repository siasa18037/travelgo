// GET /api/ticket_pass
import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();

  try {
    // ดึงทุก trip ที่มี ticket_pass อย่างน้อย 1 รายการ
    const trips = await Trip.find({}, 'ticket_pass');

    // รวม ticket_pass ทั้งหมดที่เป็น public
    const publicTickets = trips
      .flatMap(trip => trip.ticket_pass)
      .filter(ticket => ticket.type == 'public');

    return NextResponse.json(publicTickets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}
