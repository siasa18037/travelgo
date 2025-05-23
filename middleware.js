// middleware.js
import { authMiddleware } from "@/middleware/auth";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const protectedRoutes = ['/dashboard', '/trip' , '/login' , '/register' , '/profile'];  
  const pathname = request.nextUrl.pathname;

  if (protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return await authMiddleware(request);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/trip/:path*' , '/login' , '/register' , '/profile/:path*'],
};
