import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import UserCredential from '@/models/UserCredential';
import { signToken } from '@/lib/auth';

const expectedOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000';
const expectedRPID = process.env.HOST_DOMAIN || 'localhost';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const cookieStore = await cookies();
    const challenge = cookieStore.get('passkey_challenge')?.value;
    if (!challenge) {
      return NextResponse.json({ error: 'Missing challenge' }, { status: 400 });
    }

    // 🧠 ดึง credential จาก DB ด้วย id ที่ browser ส่งมา
    const cred = await UserCredential.findOne({ credentialID: body.id });
    if (!cred) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: cred.credentialID,
        publicKey: Buffer.from(cred.publicKey, 'base64'),
        counter: cred.counter,
      },
    });

    const { verified, authenticationInfo } = verification;
    if (!verified) {
      return NextResponse.json({ verified: false, message: 'Verification failed' }, { status: 401 });
    }

    cred.counter = authenticationInfo.newCounter;
    await cred.save();

    const user = await User.findById(cred.userId);
    const token = signToken({
      userId: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      type_user: user.type_user,
    });

    const res = NextResponse.json({ verified: true, message: 'Passkey login success' });
    res.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    cookieStore.set('passkey_challenge', '', { maxAge: 0 });
    // console.log('🎉 Passkey discovery login success for', user.email);

    return res;
  } catch (err) {
    console.error('🔥 Error verifying passkey login:', err);
    return NextResponse.json({ verified: false, error: err.message }, { status: 500 });
  }
}
