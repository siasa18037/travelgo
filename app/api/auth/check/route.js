// api/auth/check

import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) throw new Error("No token");

    const User = verifyToken(token);
    return NextResponse.json({ ok: true, user: User });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
