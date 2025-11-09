import { generateRegistrationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TextEncoder } from 'util';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      console.error("❌ Missing email in request body");
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const options = await generateRegistrationOptions({
      rpName: 'MyApp',
      rpID: process.env.HOST_DOMAIN || 'localhost',
      userID: new TextEncoder().encode(email),
      userName: email,
      timeout: 60000,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',     
        userVerification: 'preferred',
      },
      extensions: { credProps: true },
    });


    // console.log("✅ Generated registration options:", options);

    const cookieStore = await cookies();
    cookieStore.set('passkey_challenge', options.challenge, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    // ✅ เก็บ email ไว้ด้วย (เพราะ WebAuthn ไม่ส่ง email กลับมา)
    cookieStore.set('passkey_email', email, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json(options);
  } catch (err) {
    console.error("🔥 Error in passkey/register/start:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
