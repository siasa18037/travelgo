//  # GET, PUT  /api/trip/[id_user]/[id_trip]/plan/[id_plan]/status

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// GET  /api/trip/[id_user]/[id_trip]/plan/[id_plan]/status
export async function GET(req, { params }) {
  const { id_user, id_trip, id_plan } = await params;
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  const planItem = trip.plan.find(p => p._id.toString() === id_plan);
  if (!planItem) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

  return NextResponse.json({status : planItem.status , start : planItem.start , end : planItem.end}, { status: 200 });
}

// # PUT /api/trip/[id_user]/[id_trip]/plan/[id_plan]/status
export async function PUT(req, { params }) {
  try {
    const { id_user, id_trip, id_plan } = await params;
    const { status } = await req.json(); 
    if (!status) {
      return NextResponse.json({ message: 'Status is required in the request body' }, { status: 400 });
    }
    const allowedStatuses = ['not_started', 'in_progress', 'completed', 'skipped', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    await connectDB();

    const trip = await Trip.findById(id_trip);
    if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

    const userExists = trip.user.some(u => u.id_user === id_user);
    if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

    const planItem = trip.plan.find(p => p._id.toString() === id_plan);
    if (!planItem) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
    
    planItem.status = status;
    
    await trip.save();
    
    return NextResponse.json(planItem.status , { status: 200 });

  } catch (error) {
    console.error('PUT Plan Status Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
