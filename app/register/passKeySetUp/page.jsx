'use client';
import { useState, useEffect } from 'react';
import { KeySquare, XCircle } from 'lucide-react';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import { logoutUser } from "@/utils/logout"; 
import Loading from "@/components/Loading";
import { startRegistration } from "@simplewebauthn/browser";
import "../register.css";

export default function PasskeySetupPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: '' });
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

  // ✅ ตรวจสอบ session ครั้งเดียว
  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(async (data) => {
        if (data.ok) {
          setUser(data.user);
          const userRes = await fetch(`/api/user/${data.user.userId}`);
          const userData = await userRes.json();
          if (!userData.error) {
            setForm({ email: userData.email || '' });
          } else logoutUser();
        } else logoutUser();
      })
      .catch(() => logoutUser());
  }, []);

  // ✅ สร้าง Passkey (ใช้เฉพาะครั้งแรก)
  async function handleRegisterPasskey() {
    try {
      setIsRegisteringPasskey(true);

      const res = await fetch("/api/auth/passkey/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const options = await res.json();

      if (!options || !options.challenge) {
        showErrorToast("ข้อมูล Passkey จากเซิร์ฟเวอร์ไม่ถูกต้อง");
        return;
      }

      const attResp = await startRegistration(options);

      const verifyRes = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attResp),
      });

      if (verifyRes.ok) {
        showSuccessToast("ลงทะเบียน Passkey สำเร็จ 🎉");
        
        window.location.href = "/dashboard";

      } else {
        showErrorToast("ไม่สามารถลงทะเบียน Passkey ได้");
      }

    } catch (err) {
      console.error(err);
      showErrorToast("เกิดข้อผิดพลาดระหว่างสร้าง Passkey");
    } finally {
      setIsRegisteringPasskey(false);
    }
  }

  const handleSkip = () => {
    window.location.href = "/dashboard";
  };

  if (!user) return <Loading />;

  return (
    <main className="container py-5" style={{ maxWidth: 600 }}>
      <div className="text-center mb-4">
        <h2 className="fw-bold">ตั้งค่า Passkey</h2>
        <p className="text-muted mb-0">
          ใช้เพื่อเข้าสู่ระบบโดยไม่ต้องใช้รหัสผ่านในอนาคต
        </p>
        <p className="text-muted">
          (Touch ID / Face ID / Windows Hello)
        </p>
      </div>

      <div className="d-flex flex-column align-items-center gap-3">
        <button
          type="button"
          className="btn custom-dark-hover w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleRegisterPasskey}
          disabled={isRegisteringPasskey}
        >
          {isRegisteringPasskey ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status" />
              กำลังลงทะเบียน...
            </>
          ) : (
            <>
              <KeySquare size={18}/> ลงทะเบียน Passkey ตอนนี้
            </>
          )}
        </button>

        <button
          type="button"
          className="btn input-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleSkip}
        >
          ภายหลัง
        </button>
      </div>
    </main>
  );
}
