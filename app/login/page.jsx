"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import { Mail , KeyRound ,KeySquare} from "lucide-react";
import './Login.css'
import { startAuthentication } from "@simplewebauthn/browser";

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


async function handlePasskeyLogin() {
  try {
    const res = await fetch('/api/auth/passkey/login/start', { method: 'POST' });
    const options = await res.json();

    if (!options || !options.challenge) {
      showErrorToast('ไม่สามารถเริ่มการยืนยันตัวตนด้วย Passkey ได้');
      console.error('Invalid options:', options);
      return;
    }

    // ✅ Browser จะเลือก passkey ที่ตรงกับ domain เอง
    const authResp = await startAuthentication(options);

    const verifyRes = await fetch('/api/auth/passkey/login/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authResp),
    });

    const result = await verifyRes.json();
    if (result.verified) {
      showSuccessToast('เข้าสู่ระบบด้วย Passkey สำเร็จ 🎉');
      window.location.href = '/dashboard';
    } else {
      showErrorToast(result.message || 'ไม่สามารถเข้าสู่ระบบได้');
    }
  } catch (err) {
    console.error('Passkey login error:', err);
    showErrorToast('เกิดข้อผิดพลาดระหว่างล็อกอินด้วย Passkey');
  }
}



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

          <button
              type="button"
              className="btn input-outline-dark w-100 mt-2"
              onClick={handlePasskeyLogin}
            >
              <KeySquare size={18}/> Sign in with Passkey
            </button>


      </form>
      

    </div>
  );
}

export default LoginPage;
