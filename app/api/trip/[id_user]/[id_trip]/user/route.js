// # GET api/trip/:id_user/:id_trip/user

import Trip from '@/models/Trip';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// GET api/trip/:id_user/:id_trip/user
export async function GET(req, { params }) {
    try {
        const { id_user, id_trip } = await params; // ไม่จำเป็นต้อง await params

        if (!mongoose.Types.ObjectId.isValid(id_trip)) {
            return NextResponse.json({ message: 'Invalid Trip ID format' }, { status: 400 });
        }

        await connectDB();

        const trip = await Trip.findById(id_trip);
        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        // ตรวจสอบว่า user ที่กำลังเรียก API นี้ อยู่ในทริปจริงหรือไม่
        const userExists = trip.user.some(u => u.id_user.toString() === id_user);
        if (!userExists) {
            return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
        }

        // 1. ดึง ID ของผู้ใช้ทั้งหมดในทริปออกมาสร้างเป็น Array ใหม่
        // จาก: [{ id_user: 'aaa', ... }, { id_user: 'bbb', ... }]
        // เป็น: ['aaa', 'bbb']
        const userIdsInTrip = trip.user.map(u => u.id_user);

        // 2. ใช้ $in เพื่อค้นหา User ทั้งหมดที่มี _id อยู่ใน Array `userIdsInTrip`
        const users = await User.find({
            '_id': { $in: userIdsInTrip }
        }).select('_id name email avatar type_user'); // type_user อาจจะต้องแก้เป็นฟิลด์ที่ถูกต้องใน Model User

        // ส่งข้อมูล user ทั้งหมดในทริปกลับไป
        return NextResponse.json(users);

    } catch (error) {
        console.error("Error fetching trip users:", error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}