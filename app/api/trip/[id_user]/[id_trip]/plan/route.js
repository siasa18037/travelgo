// # GET, POST /trip/:id_user/:id_trip/plan

import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// GET /api/trip/:id_user/:id_trip/plan?data=some
export async function GET(req, { params }) {
  const { id_user, id_trip } = await params;
  await connectDB();

  const url = new URL(req.url);
  const mode = url.searchParams.get('data'); // 'some' 

  const trip = await Trip.findById(id_trip);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const userExists = trip.user.some(u => u.id_user === id_user);
  if (!userExists) return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });

  if(mode=='some'){
    const somePlanData = trip.plan.map(p => {
      // สร้าง object ใหม่สำหรับ data ที่จะถูกกรอง
      const filteredData = {};

      // ตรวจสอบและเพิ่ม property ถ้ามีอยู่ใน plan.data
      if (p.data) {
        if (p.data.location) filteredData.location = p.data.location;
        if (p.data.destination) filteredData.destination = p.data.destination;
        if (p.data.origin) filteredData.origin = p.data.origin;
        if (p.data.transport_type) filteredData.transport_type = p.data.transport_type;
      }
      
      // คืนค่า object ใหม่ที่มีเฉพาะข้อมูลที่ต้องการ
      return {
        _id: p._id,
        name: p.name,
        start: p.start,
        end: p.end,
        type: p.type,
        status: p.status,
        amount: p.amount,
        Price_per_person: p.Price_per_person,
        data: filteredData
      };
    });

    return NextResponse.json(somePlanData, { status: 200 });

  }else{
    return NextResponse.json(trip.plan, { status: 200 });
  }
  
}

// PUT /api/trip/:id_user/:id_trip/plan - แก้ไขหรืออัปเดต plan ทั้งหมด
export async function PUT(req, { params }) {
  await connectDB();
  const { id_user, id_trip } = await params;
  const updatedList = await req.json(); // รับ plan list ใหม่

  // console.log(updatedList)

  try {
    const trip = await Trip.findById(id_trip);
    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    const userExists = trip.user.some(u => u.id_user === id_user);
    if (!userExists) {
      return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
    }

    // สร้าง Map จาก _id ใน list ที่ส่งมา
    const newPlanMap = new Map();
    const newPlanList = [];

    updatedList.forEach(item => {
      // ถ้าไม่มี _id แสดงว่าเป็น item ใหม่
      if (!item._id) {
        item._id = new mongoose.Types.ObjectId(); // สร้าง id ใหม่
      }
      newPlanMap.set(item._id.toString(), item);
    });

    // สร้างแผนใหม่จากรายการเดิมที่ยังอยู่ + รายการใหม่
    const resultPlan = [];

    for (const existing of trip.plan) {
      const match = newPlanMap.get(existing._id.toString());

      if (match) {
        // อัปเดต field จาก match ลง existing
        resultPlan.push({
          ...existing.toObject(), // เก็บของเก่า
          ...match              // ทับด้วยของใหม่
        });
        newPlanMap.delete(existing._id.toString()); // ลบออกจาก newMap เพื่อไม่ให้เพิ่มซ้ำ
      }
      // ถ้าไม่มี match → ข้ามไป (ลบออก)
    }

    // เพิ่มรายการใหม่ที่เหลือใน map
    for (const [, newItem] of newPlanMap) {
      resultPlan.push(newItem);
    }

    // console.log(resultPlan)

    // บันทึก
    trip.plan = resultPlan;
    await trip.save();

    return NextResponse.json({ message: 'Plan list updated successfully', plan: trip.plan }, { status: 200 });

  } catch (err) {
    console.error('Error updating plan:', err);
    return NextResponse.json({ message: 'Error updating plan', error: err.message }, { status: 500 });
  }
}
