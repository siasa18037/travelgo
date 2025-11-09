import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

// ✅ GET: ดึงเอกสารทั้งหมดของ trip
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

  return NextResponse.json(trip.document || [], { status: 200 });
}

// ✅ POST: เพิ่ม document ใหม่เข้า trip.document
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

  // ตรวจสอบสิทธิ์
  const user = trip.user.find(u => u.id_user === id_user);
  if (!user) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  // เพิ่ม document ใหม่
  const newDoc = {
    host: id_user,
    name,
    url_type,
    url,
    note
  };

  trip.document.push(newDoc);
  await trip.save();

  return NextResponse.json(
    { message: 'Document added successfully', document: newDoc },
    { status: 201 }
  );
}

// ✅ PUT: แก้ไข document ที่มีอยู่ใน trip.document
export async function PUT(req, { params }) {
  const { id_user, id_trip } = params;
  await connectDB();

  const body = await req.json();
  const { doc_id, name, url_type, url, note } = await body;

  if (!doc_id) {
    return NextResponse.json({ message: 'doc_id is required' }, { status: 400 });
  }

  const trip = await Trip.findById(id_trip);
  if (!trip) {
    return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  }

  // ตรวจสอบสิทธิ์
  const user = trip.user.find(u => u.id_user === id_user);
  if (!user) {
    return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
  }

  // หา document ที่ต้องการแก้
  const doc = trip.document.id(doc_id);
  if (!doc) {
    return NextResponse.json({ message: 'Document not found' }, { status: 404 });
  }

  // อัปเดตฟิลด์ที่ส่งมา
  if (name) doc.name = name;
  if (url_type) doc.url_type = url_type;
  if (url) doc.url = url;
  if (note) doc.note = note;

  await trip.save();

  return NextResponse.json(
    { message: 'Document updated successfully', document: doc },
    { status: 200 }
  );
}
