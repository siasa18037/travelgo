import Trip from '@/models/Trip';
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function PUT(req, { params }) {
  await connectDB();
  const { id_user, id_trip } = await params;

  const url = new URL(req.url);
  const mode = url.searchParams.get('mode'); // 'skip' or 'cancel'

  if (!mongoose.Types.ObjectId.isValid(id_trip)) {
    return NextResponse.json({ message: 'Invalid Trip ID' }, { status: 400 });
  }

  try {
    const trip = await Trip.findById(id_trip);
    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    const userExists = trip.user.some(u => u.id_user === id_user);
    if (!userExists) {
      return NextResponse.json({ message: 'User not in this trip' }, { status: 403 });
    }

    const plans = trip.plan;
    // ใช้ตัวแปรนี้เพื่อติดตามว่าเราจะเริ่มค้นหา Plan 'not_started' ตัวต่อไปจาก index ไหน
    let searchStartIndex = -1;

    const currentInProgressIndex = plans.findIndex(p => p.status === 'in_progress');

    if (currentInProgressIndex !== -1) {
      // --- ขั้นตอนที่ 1: Plan ที่กำลังทำอยู่ ให้เปลี่ยนเป็น 'completed' เสมอ ---
      plans[currentInProgressIndex].status = 'completed';
      // เราจะเริ่มค้นหา Plan ต่อไป จาก index ของ Plan ที่เพิ่งเสร็จไป
      searchStartIndex = currentInProgressIndex;
    }

    // --- ขั้นตอนที่ 2: ตรวจสอบ mode 'skip' หรือ 'cancel' เพื่อจัดการกับ Plan "ถัดไป" ---
    if (mode === 'skip' || mode === 'cancel') {
      // หา Plan "ถัดไป" ที่มีสถานะ 'not_started' เพื่อที่จะข้ามหรือยกเลิก
      const targetPlanIndex = plans.findIndex(
        (p, index) => index > searchStartIndex && p.status === 'not_started'
      );

      if (targetPlanIndex !== -1) {
        // ถ้าเจอ, ก็เปลี่ยนสถานะตาม mode ที่ส่งมา
        plans[targetPlanIndex].status = (mode === 'skip' ? 'skipped' : 'cancelled');
        // จากนั้น, อัปเดต searchStartIndex ให้เป็น index ของ Plan ที่เพิ่งถูกข้ามไป
        // เพื่อที่ขั้นตอนถัดไปจะได้หา Plan ที่อยู่ "หลังจาก" ตัวที่ถูกข้ามไปแล้ว
        searchStartIndex = targetPlanIndex;
      }
    }

    // --- ขั้นตอนที่ 3: ค้นหา Plan ถัดไปจริงๆ ที่จะมาเป็น 'in_progress' ใหม่ ---
    // Logic นี้จะทำงานในทุกกรณี ไม่ว่าจะกด Next, Skip, หรือ Cancel
    const nextActivePlanIndex = plans.findIndex(
      (p, index) => index > searchStartIndex && p.status === 'not_started'
    );

    if (nextActivePlanIndex !== -1) {
      // ถ้าเจอ Plan ที่พร้อมจะเริ่ม, ก็ตั้งสถานะเป็น 'in_progress'
      plans[nextActivePlanIndex].status = 'in_progress';
    }

    // บันทึกการเปลี่ยนแปลงทั้งหมด
    await trip.save();
    return NextResponse.json({ message: 'Plan updated successfully', plan: trip.plan }, { status: 200 });

  } catch (err) {
    console.error('Error updating plan status:', err);
    return NextResponse.json({ message: 'Error updating status plan', error: err.message }, { status: 500 });
  }
}