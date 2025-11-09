import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import UserCredential from '@/models/UserCredential';

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ ok: false, message: 'Missing userId' }, { status: 400 });
    }

    // ลบ Passkey ทั้งหมดของ user คนนี้
    const result = await UserCredential.deleteMany({ userId });

    if (result.deletedCount > 0) {
      return NextResponse.json({
        ok: true,
        message: `ลบ Passkey ทั้งหมดแล้ว (${result.deletedCount} รายการ)`,
      });
    } else {
      return NextResponse.json({
        ok: true,
        message: 'ไม่มี Passkey ที่ต้องลบ',
      });
    }
  } catch (err) {
    console.error('🔥 Error deleting passkey:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
