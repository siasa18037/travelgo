//  # GET, PUT, POST ,DELETE /api/trip/[id_user]/[id_trip]/plan/[id_plan]/checklist

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// GET /api/trip/[id_user]/[id_trip]/plan/[id_plan]/checklist
export async function GET(req, { params }) {
  const { id_user, id_trip, id_plan } = await params;
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  const planItem = trip.plan.find(p => p._id.toString() === id_plan);
  if (!planItem) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

  return NextResponse.json(planItem.checklist , { status: 200 });
}

// POST /api/trip/[id_user]/[id_trip]/plan/[id_plan]/checklist
export async function POST(req, { params }) {
  const { id_user, id_trip, id_plan } = await params;
  const body = await req.json();
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  const planItem = trip.plan.id(id_plan);
  if (!planItem) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

  planItem.checklist.push(body); // body: { name, detail?, status? }
  await trip.save();

  return NextResponse.json(planItem.checklist, { status: 201 });
}

// PUT /api/trip/[id_user]/[id_trip]/plan/[id_plan]/checklist
export async function PUT(req, { params }) {
  const { id_user, id_trip, id_plan } = await params;
  const body = await req.json(); // body: { _id, name?, detail?, status? }
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  const planItem = trip.plan.id(id_plan);
  if (!planItem) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

  const checklistItem = planItem.checklist.id(body._id);
  if (!checklistItem) return NextResponse.json({ message: 'Checklist item not found' }, { status: 404 });

  if (body.name !== undefined) checklistItem.name = body.name;
  if (body.detail !== undefined) checklistItem.detail = body.detail;
  if (body.status !== undefined) checklistItem.status = body.status;

  await trip.save();
  return NextResponse.json(planItem.checklist, { status: 200 });
}

// DELETE /api/trip/[id_user]/[id_trip]/plan/[id_plan]/checklist
export async function DELETE(req, { params }) {
  const { id_user, id_trip, id_plan } = await params;
  const body = await req.json(); // body: { _id }
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  const planItem = trip.plan.id(id_plan);
  if (!planItem) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

  // กรอง checklist ใหม่โดยลบตัวที่มี _id ตรงกับที่ส่งมา
  const originalLength = planItem.checklist.length;
  planItem.checklist = planItem.checklist.filter(item => item._id.toString() !== body._id);

  if (planItem.checklist.length === originalLength) {
    return NextResponse.json({ message: 'Checklist item not found' }, { status: 404 });
  }

  await trip.save();

  return NextResponse.json({ message: 'Checklist deleted successfully', checklist: planItem.checklist }, { status: 200 });
}

