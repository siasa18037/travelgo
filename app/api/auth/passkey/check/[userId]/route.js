import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import UserCredential from '@/models/UserCredential';


export async function GET(req, { params }) {
  try {
    await connectDB();
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ ok: false, message: 'Missing userId' }, { status: 400 });
    }

    const credentials = await UserCredential.find({ userId });

    if (credentials.length > 0) {
      return NextResponse.json({
        ok: true,
        hasPasskey: true,
        count: credentials.length,
        credentials: credentials.map(c => ({
          credentialID: c.credentialID,
          createdAt: c.createdAt,
          counter: c.counter,
        })),
      });
    } else {
      return NextResponse.json({
        ok: true,
        hasPasskey: false,
        message: 'User has no registered passkeys',
      });
    }
  } catch (err) {
    console.error('🔥 Error checking passkey:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
