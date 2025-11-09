import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

// ✅ GET: ดึง link ทั้งหมดของ trip
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

  return NextResponse.json(trip.link || [], { status: 200 });
}

// ✅ POST: เพิ่ม link ใหม่
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

  const newLink = {
    host: id_user,
    name,
    url_type,
    url,
    note,
  };

  trip.link.push(newLink);
  await trip.save();

  return NextResponse.json(
    { message: 'Link added successfully', link: newLink },
    { status: 201 }
  );
}

// ✅ PUT: อัปเดต link เดิม
export async function PUT(req, { params }) {
  const { id_user, id_trip } = params;
  await connectDB();

  const body = await req.json();
  const { link_id, name, url_type, url, note } = await body;

  if (!link_id) {
    return NextResponse.json({ message: 'link_id is required' }, { status: 400 });
  }

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  const user = trip.user.find(u => u.id_user === id_user);
  if (!user) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  const linkDoc = trip.link.id(link_id);
  if (!linkDoc) {
    return NextResponse.json({ message: 'Link not found' }, { status: 404 });
  }

  if (name) linkDoc.name = name;
  if (url_type) linkDoc.url_type = url_type;
  if (url) linkDoc.url = url;
  if (note) linkDoc.note = note;

  await trip.save();

  return NextResponse.json(
    { message: 'Link updated successfully', link: linkDoc },
    { status: 200 }
  );
}
