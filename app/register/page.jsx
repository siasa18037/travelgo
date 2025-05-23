"use client";
import React, { useState } from "react";
import { Mail, KeyRound,User} from "lucide-react";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import './register.css';

function RegisterPage() {
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log(data.message);

      if (res.ok) {
        showSuccessToast("สมัครสมาชิกสำเร็จ");
        router.push("/login");
      } else {
        showErrorToast("เกิดข้อผิดพลาดในระบบ");
      }
    } catch (error) {
      console.error("Error:", error);
      showErrorToast("เกิดข้อผิดพลาดขณะส่งข้อมูล");
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
            <User size={18} /> Name</label>
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
              <div
                className="spinner-border spinner-border-sm me-2 text-dark"
                role="status"
              >
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
