import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

// ✅ GET: ดึง immigration ทั้งหมดของ trip
export async function GET(req, { params }) {
  const { id_user, id_trip } = await params;
  await connectDB();

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  // ตรวจสอบว่า user อยู่ใน trip
  const user = trip.user.find(u => u.id_user === id_user);
  if (!user) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  return NextResponse.json(trip.immigration || [], { status: 200 });
}

// ✅ POST: เพิ่ม immigration ใหม่
export async function POST(req, { params }) {
  const { id_user, id_trip } = params;
  await connectDB();

  const body = await req.json();
  const { name, url_type, url, note } = await body;

  if (!name || !url_type || !url) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  const user = trip.user.find(u => u.id_user === id_user);
  if (!user) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  const newImm = {
    host: id_user,
    name,
    url_type,
    url,
    note,
  };

  trip.immigration.push(newImm);
  await trip.save();

  return NextResponse.json(
    { message: 'Immigration document added successfully', immigration: newImm },
    { status: 201 }
  );
}

// ✅ PUT: อัปเดต immigration เดิม
export async function PUT(req, { params }) {
  const { id_user, id_trip } = params;
  await connectDB();

  const body = await req.json();
  const { imm_id, name, url_type, url, note } = await body;

  if (!imm_id) {
    return NextResponse.json({ message: 'imm_id is required' }, { status: 400 });
  }

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  const user = trip.user.find(u => u.id_user === id_user);
  if (!user) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  const imm = trip.immigration.id(imm_id);
  if (!imm) {
    return NextResponse.json({ message: 'Immigration document not found' }, { status: 404 });
  }

  if (name) imm.name = name;
  if (url_type) imm.url_type = url_type;
  if (url) imm.url = url;
  if (note) imm.note = note;

  await trip.save();

  return NextResponse.json(
    { message: 'Immigration document updated successfully', immigration: imm },
    { status: 200 }
  );
}
