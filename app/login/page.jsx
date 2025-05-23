"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import { Mail , KeyRound} from "lucide-react";
import './Login.css'

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnUrl = searchParams.get("returnUrl");
  const isValidReturnUrl = returnUrl && returnUrl.startsWith("/") && returnUrl !== "/login";
  const redirectUrl = isValidReturnUrl ? returnUrl : "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false); // ✅ loading state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true); // ✅ เริ่มโหลด

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setIsLoading(false); // ✅ หยุดโหลด

      if (!res.ok) {
        showErrorToast("รหัสหรืออีเมลไม่ถูกต้อง");
        return;
      }

      
      // router.push(redirectUrl);
      // setTimeout(() => window.location.reload(), 100);
      
      showSuccessToast("เข้าสู่ระบบสำเร็จ");
      window.location.href = redirectUrl
    } catch (err) {
      console.error("Login failed", err);
      setIsLoading(false); // ✅ หยุดโหลด
      showErrorToast("เกิดข้อผิดพลาดในระบบ");
    }
  };

  return (
    <div className="Login container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label htmlFor="email" className="form-label"><Mail size={18} /> Email</label>
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
          <label htmlFor="password" className="form-label"><KeyRound size={18} /> Password</label>
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
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            "เข้าสู่ระบบ"
          )}
        </button>



      </form>
      

    </div>
  );
}

export default LoginPage;
