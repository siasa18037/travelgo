import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const options = await generateAuthenticationOptions({
      rpID: process.env.HOST_DOMAIN || 'localhost',
      timeout: 60000,
      // ❌ ไม่ใส่ allowCredentials เพื่อให้ browser discover ได้เอง
      userVerification: 'preferred',
    });

    const cookieStore = await cookies();
    cookieStore.set('passkey_challenge', options.challenge, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    // console.log('✅ Generated discovery authentication options');
    return NextResponse.json(options);
  } catch (err) {
    console.error('🔥 Error in passkey/login/start:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
