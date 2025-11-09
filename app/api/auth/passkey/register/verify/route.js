import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import UserCredential from '@/models/UserCredential';

const expectedOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000';
const expectedRPID = process.env.HOST_DOMAIN || 'localhost';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const cookieStore = await cookies();
    const challenge = cookieStore.get('passkey_challenge')?.value;
    const email = cookieStore.get('passkey_email')?.value;

    if (!challenge) {
      return NextResponse.json({ error: 'Missing challenge' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Missing email cookie' }, { status: 400 });
    }

    // console.log('✅ Start verifying passkey registration for', email);

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID,
    });

    const { verified, registrationInfo } = verification;
    if (!verified) {
      return NextResponse.json({ verified: false, message: 'Verification failed' }, { status: 400 });
    }

    // 🔍 ตรวจสอบค่าที่ได้จาก registrationInfo
    // console.log('🧩 registrationInfo:', registrationInfo);

    const {
      credentialID,
      credentialPublicKey,
      counter,
      credential, // fallback structure for newer versions
    } = registrationInfo;

    // ✅ ดึงค่า credential id และ public key อย่างปลอดภัย
    const id =
      credentialID ||
      credential?.id ||
      body?.id ||
      null;

    const pubKeyBuffer = credentialPublicKey
      ? Buffer.from(credentialPublicKey)
      : Buffer.from(credential?.publicKey || '');

    if (!id) {
      console.warn('⚠️ Missing credential ID in registrationInfo');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ verified: false, message: 'User not found' }, { status: 404 });
    }

    // ✅ บันทึกลง DB (upsert)
    await UserCredential.findOneAndUpdate(
      { credentialID: id },
      {
        userId: user._id,
        credentialID: id,
        publicKey: pubKeyBuffer.toString('base64'),
        counter: counter || 0,
      },
      { upsert: true, new: true }
    );

    // console.log('🎉 Passkey registered successfully for', user.email);
    // console.log('🧾 Final credential data:', {
    //   credentialID: id,
    //   counter: counter || 0,
    //   publicKeyLength: pubKeyBuffer.length,
    // });

    // ✅ ล้าง cookie ชั่วคราว
    cookieStore.set('passkey_challenge', '', { maxAge: 0 });
    cookieStore.set('passkey_email', '', { maxAge: 0 });

    return NextResponse.json({
      verified: true,
      message: 'Passkey registered successfully',
    });
  } catch (err) {
    console.error('🔥 Error verifying passkey registration:', err);
    return NextResponse.json({ verified: false, error: err.message }, { status: 500 });
  }
}
