// middleware/auth.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function authMiddleware(request) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  if (token) {
    // ถ้าล็อกอินแล้วพยายามเข้าหน้า login หรือ register
    if (pathname === '/login' || pathname === '/register') {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }


    // ตรวจสอบ token ว่ายัง valid อยู่ไหม
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      console.log("JWT verify failed:", error.message);
      // token ไม่ถูกต้อง ให้ไป login หน้าเดิม
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // ถ้ายังไม่ล็อกอิน ถ้าเข้า page ที่ต้องล็อกอิน redirect ไป login พร้อม returnUrl
    if (pathname !== '/login' && pathname !== '/register') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    // อนุญาตให้เข้า login, register ได้
    return NextResponse.next();
  }
}
