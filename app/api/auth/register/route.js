import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const { name, email, password, type_user } = body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: "อีเมลถูกใช้แล้ว" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    type_user: type_user || "user",
  });

  return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ", userId: newUser._id });
}
