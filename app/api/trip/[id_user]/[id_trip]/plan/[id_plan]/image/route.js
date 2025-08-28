//  # GET, PUT  /trip/[id_user]/[id_trip]/plan/[id_plan]/image/route.js

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// GET /api/trip/[id_user]/[id_trip]/plan/[id_plan]/image
export async function GET(req, { params }) {
  const { id_user, id_trip, id_plan } = await params;
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  const planItem = trip.plan.find(p => p._id.toString() === id_plan);
  if (!planItem) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

  return NextResponse.json(planItem.image , { status: 200 });
}

// PUT /api/trip/[id_user]/[id_trip]/plan/[id_plan]/image
export async function PUT(req, { params }) {
  const { id_user, id_trip, id_plan } = await params;
  await connectDB();

  const { images } = await req.json();
  if (!Array.isArray(images)) {
    return NextResponse.json({ message: 'Images must be an array' }, { status: 400 });
  }

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  const planItem = trip.plan.id(id_plan);
  if (!planItem) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

  planItem.image = images;

  await trip.save();
  return NextResponse.json({
    message: 'Images updated successfully',
    images: planItem.image
  }, { status: 200 });
}
