// middleware.js
import { authMiddleware } from "@/middleware/auth";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === 'true';
  const disableApiAuth = process.env.DISABLE_API_AUTH === 'true';

  // Logging for debugging
  // console.log(`[Middleware] Path: ${pathname}`, {
  //   isDevelopment,
  //   allowAllOrigins,
  //   disableApiAuth,
  //   origin: request.headers.get('origin'),
  //   method: request.method
  // });

  // 🔒 API Routes Protection
  if (pathname.startsWith('/api')) {
    // Bypass auth in development if DISABLE_API_AUTH=true
    if (isDevelopment && disableApiAuth) {
      const response = NextResponse.next();
      if (allowAllOrigins) {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      return response;
    }

    // Production or secure development mode
    const origin = request.headers.get('origin');
    
    // Allow server-side requests (getServerSideProps, etc.)
    if (!origin && request.headers.get('sec-fetch-mode') === 'cors') {
      return NextResponse.next();
    }

    // Configure allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://192.168.1.180:3000',
      'https://your-production-domain.com',
      'https://travelgo-rosy.vercel.app',
    ];

    // Allow all origins in development if ALLOW_ALL_ORIGINS=true
    if (isDevelopment && allowAllOrigins) {
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    // Check origin in production
    if (origin && !allowedOrigins.includes(origin)) {
      console.log(`[Middleware] Origin not allowed: ${origin}`);
      return new NextResponse(
        JSON.stringify({ message: 'Access denied: Invalid origin' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Block requests without origin (Postman, cURL, etc.)
    if (!origin) {
      console.log('[Middleware] Missing origin header');
      return new NextResponse(
        JSON.stringify({ message: 'Origin header is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 🔐 Frontend Routes Protection
  const protectedPaths = [
    '/dashboard',
    '/trip',
    '/login',
    '/register',
    '/profile'
  ];

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // console.log(`[Middleware] Protecting route: ${pathname}`);
    return await authMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/trip/:path*',
    '/login',
    '/register',
    '/profile/:path*',
  ],
};