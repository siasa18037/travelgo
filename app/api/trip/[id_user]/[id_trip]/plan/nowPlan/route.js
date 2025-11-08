// # GET /api/trip/[id_user]/[id_trip]/plan/nowPlan

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/trip/[id_user]/[id_trip]/plan/nowPlan
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

  // ✅ หาเฉพาะ plan ที่มีสถานะ in_progress
  const inProgressPlans = trip.plan.filter(p => p.status === 'in_progress');

  if (inProgressPlans.length === 0) {
    return NextResponse.json({ message: 'No in-progress plan found',  "trip_status" : trip.status}, { status: 404 });
  }

  // ✅ เอาเฉพาะอันแรกสุด (สมมติเรียงตามเวลา start)
  const nowPlan = inProgressPlans.sort(
    (a, b) => new Date(a.start.datetime) - new Date(b.start.datetime)
  )[0];

  // ✅ กรอง field ตามที่เธอกำหนด
  const filteredData = {};
  if (nowPlan.data) {
    if (nowPlan.data.location) filteredData.location = nowPlan.data.location;
    if (nowPlan.data.destination) filteredData.destination = nowPlan.data.destination;
    if (nowPlan.data.origin) filteredData.origin = nowPlan.data.origin;
    if (nowPlan.data.transport_type) filteredData.transport_type = nowPlan.data.transport_type;
  }

  const PlanInProgresData = {
    _id: nowPlan._id,
    name: nowPlan.name,
    start: nowPlan.start,
    end: nowPlan.end,
    type: nowPlan.type,
    status: nowPlan.status,
    amount: nowPlan.amount,
    Price_per_person: nowPlan.Price_per_person,
    data: filteredData,
  };

  const resDate = {
    PlanInProgresData,
    "trip_status" : trip.status,
  }

  return NextResponse.json(resDate, { status: 200 });
}
