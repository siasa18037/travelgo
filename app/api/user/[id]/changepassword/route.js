import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function POST(req, { params }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const { currentPassword, newPassword } = body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ ok: false, message: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ ok: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ ok: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
