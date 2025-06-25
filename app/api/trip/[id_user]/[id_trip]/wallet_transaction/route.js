// # GET, POST, PUT, DELETE /trip/:id_user/:id_trip/wallet_transaction
import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// # GET  /trip/:id_user/:id_trip/wallet_transaction?plan_id=[plan_id]
export async function GET(req, { params }) {
  try {
    const { id_user, id_trip } = await params;
    await connectDB();

    const url = new URL(req.url);
    const plan_id = url.searchParams.get('plan_id'); 

    const trip = await Trip.findById(id_trip);
    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    const userExists = trip.user.some(u => u.id_user === id_user);
    if (!userExists) {
      return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
    }

    if (plan_id) {
      // ค้นหา transaction ที่เกี่ยวข้องกับ plan_id ที่ระบุ
      const transactions = trip.wallet_transaction.filter(t => t.plan_id && t.plan_id.toString() === plan_id);
      return NextResponse.json(transactions, { status: 200 });
    } else {
      // ถ้าไม่ระบุ plan_id ให้ส่งกลับทั้งหมด
      return NextResponse.json(trip.wallet_transaction, { status: 200 });
    }
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// # POST /trip/:id_user/:id_trip/wallet_transaction?plan_id=[plan_id]
// เพิ่ม transaction ใหม่หลายรายการพร้อมกัน
export async function POST(req, { params }) {
  try {
    const { id_user, id_trip } = await params;
    await connectDB();

    const url = new URL(req.url);
    const plan_id = url.searchParams.get('plan_id'); 

    // รับข้อมูลมาเป็น Array ของ Object ที่จะเพิ่ม
    const newTransactions = await req.json(); 

    // ตรวจสอบว่าเป็น Array หรือไม่
    if (!Array.isArray(newTransactions)) {
      return NextResponse.json({ message: 'Request body must be an array of transactions' }, { status: 400 });
    }

    const trip = await Trip.findById(id_trip);
    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    const userExists = trip.user.some(u => u.id_user === id_user);
    if (!userExists) {
      return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
    }
    
    // เพิ่มข้อมูลใหม่ทั้งหมดเข้าไปใน wallet_transaction array
    // ใช้ spread operator (...) เพื่อเพิ่มสมาชิกทั้งหมดใน newTransactions เข้าไปใน array เดิม
    trip.wallet_transaction.push(...newTransactions);

    // บันทึกการเปลี่ยนแปลง
    await trip.save();

    if (plan_id) {
      // ค้นหา transaction ที่เกี่ยวข้องกับ plan_id ที่ระบุ
      const transactions = trip.wallet_transaction.filter(t => t.plan_id && t.plan_id.toString() === plan_id);
      return NextResponse.json(transactions, { status: 201 });
    } else {
      // ถ้าไม่ระบุ plan_id ให้ส่งกลับทั้งหมด
      return NextResponse.json(trip.wallet_transaction, { status: 201 });
    }

  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// # PUT /trip/:id_user/:id_trip/wallet_transaction 
// แก้ไขสถานะ isPaid ของ transaction หลายรายการพร้อมกันโดยรับ Array ของ ID
export async function PUT(req, { params }) {
  try {
    const { id_user, id_trip } = await params;
    await connectDB();

    const url = new URL(req.url);
    const plan_id = url.searchParams.get('plan_id');

    // รับข้อมูลมาเป็น Array ของ ID (string) ที่ต้องการสลับสถานะ 'isPaid'
    const idsToToggle = await req.json(); 

    if (!Array.isArray(idsToToggle)) {
        return NextResponse.json({ message: 'Request body must be an array of transaction IDs' }, { status: 400 });
    }

    const trip = await Trip.findById(id_trip);
    if (!trip) {
        return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    const userExists = trip.user.some(u => u.id_user === id_user);
    if (!userExists) {
        return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
    }

    // สร้าง Set จาก ID ที่รับมาเพื่อการค้นหาที่รวดเร็ว O(1)
    const idSet = new Set(idsToToggle);

    // วนลูปที่ transaction ทั้งหมดที่มีอยู่ใน Trip
    trip.wallet_transaction.forEach(transaction => {
      // ตรวจสอบว่า ID ของ transaction นี้อยู่ใน Set ที่เราต้องการจะแก้ไขหรือไม่
      if (idSet.has(transaction._id.toString())) {
        // ถ้าใช่ ให้สลับค่า isPaid (จาก true เป็น false, จาก false เป็น true)
        transaction.isPaid = !transaction.isPaid;
      }
    });

    // บันทึกการเปลี่ยนแปลงทั้งหมดลงฐานข้อมูล
    await trip.save();
    
    if (plan_id) {
      // ค้นหา transaction ที่เกี่ยวข้องกับ plan_id ที่ระบุ
      const transactions = trip.wallet_transaction.filter(t => t.plan_id && t.plan_id.toString() === plan_id);
      return NextResponse.json(transactions, { status: 200 });
    } else {
      // ถ้าไม่ระบุ plan_id ให้ส่งกลับทั้งหมด
      return NextResponse.json(trip.wallet_transaction, { status: 200 });
    }

  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// # DELETE /trip/:id_user/:id_trip/wallet_transaction 
// ลบ transaction หลายรายการพร้อมกันโดยรับ Array ของ ID มาโดยตรง
export async function DELETE(req, { params }) {
  try {
    const { id_user, id_trip } = await params;
    await connectDB();

    const url = new URL(req.url);
    const plan_id = url.searchParams.get('plan_id');

    // รับค่ามาเป็น Array ของ ID (string) โดยตรง เช่น ['id1', 'id2', ...]
    const idsArrayToDelete = await req.json(); 

    // ตรวจสอบว่าเป็น Array หรือไม่
    if (!Array.isArray(idsArrayToDelete)) {
        return NextResponse.json({ message: 'Request body must be an array of transaction ID strings' }, { status: 400 });
    }

    const trip = await Trip.findById(id_trip);
    if (!trip) {
        return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    const userExists = trip.user.some(u => u.id_user === id_user);
    if (!userExists) {
        return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
    }

    // สร้าง Set ของ id ที่ต้องการจะลบจาก Array ที่รับมาโดยตรง
    const idsToDelete = new Set(idsArrayToDelete);

    if (idsToDelete.size === 0) {
        return NextResponse.json({ message: 'No transaction IDs provided for deletion' }, { status: 400 });
    }

    // กรอง wallet_transaction array เดิมออก
    // โดยเก็บไว้เฉพาะ transaction ที่ _id ไม่ได้อยู่ใน Set ของ id ที่จะลบ
    // ส่วนนี้ไม่ต้องแก้ไข เพราะทำงานกับ Set ของ string อยู่แล้ว
    trip.wallet_transaction = trip.wallet_transaction.filter(
        t => !idsToDelete.has(t._id.toString())
    );
    
    // บันทึกการเปลี่ยนแปลง
    await trip.save();

    if (plan_id) {
      // ค้นหา transaction ที่เกี่ยวข้องกับ plan_id ที่ระบุ
      const transactions = trip.wallet_transaction.filter(t => t.plan_id && t.plan_id.toString() === plan_id);
      return NextResponse.json(transactions, { status: 200 });
    } else {
      // ถ้าไม่ระบุ plan_id ให้ส่งกลับทั้งหมด
      return NextResponse.json(trip.wallet_transaction, { status: 200 });
    }

  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}