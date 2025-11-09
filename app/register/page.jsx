"use client";
import React, { useState } from "react";
import { Mail, KeyRound, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import './register.css';


function RegisterPage() {

  const domain = process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ 1. สมัครสมาชิก
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        showErrorToast(data.message || "เกิดข้อผิดพลาดในระบบ");
        return;
      }

      // ✅ 2. สมัครเสร็จแล้ว → ล็อกอินอัตโนมัติ
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (loginRes) {
        showSuccessToast("สมัครสมาชิกและเข้าสู่ระบบสำเร็จ");
        window.location.href = "/register/passKeySetUp";
      } else {
        showErrorToast("สมัครสำเร็จ แต่ล็อกอินไม่สำเร็จ กรุณาลองอีกครั้ง");
        router.push("/login");
      }

    } catch (error) {
      console.error("Error:", error);
      showErrorToast("เกิดข้อผิดพลาดขณะสมัครสมาชิก");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Register container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            <User size={18} /> Name
          </label>
          <input
            type="text"
            className="form-control input-outline-dark"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            <Mail size={18} /> Email
          </label>
          <input
            type="email"
            className="form-control input-outline-dark"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            <KeyRound size={18} /> Password
          </label>
          <input
            type="password"
            className="form-control input-outline-dark"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn custom-dark-hover w-100 d-flex align-items-center justify-content-center p-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner-border spinner-border-sm me-2 text-dark" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              กำลังสมัครสมาชิก...
            </>
          ) : (
            "สมัครสมาชิก"
          )}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
