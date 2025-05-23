import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logout success" });
  res.cookies.set("token", "", { maxAge: 0 });
  return res;
}
