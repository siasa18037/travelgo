'use client';
import { useState, useEffect } from 'react';
import { Mail, Phone, FileText ,User,Trash,QrCode,KeySquare , CircleCheck} from 'lucide-react';
import { showSuccessToast, showErrorToast , confirmDelete} from "@/lib/swal";
import UploadButton from '@/components/UploadButton'; 
import './profile.css'
import { logoutUser } from "@/utils/logout"; 
import Loading from "@/components/Loading"
import { startRegistration } from "@simplewebauthn/browser";


export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name:'',
    avatar :'',
    email: '',
    passport_number: '',
    promptpay_number: '',
    phone: [], // array ของเบอร์โทร
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading_ChangePassword, setIsLoading_ChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasPasskey, setHasPasskey] = useState(false);
  const [isCheckingPasskey, setIsCheckingPasskey] = useState(true);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);


  useEffect(() => {
    if (!user) return;
    checkPasskeyStatus(user.userId);
  }, [user]);

  async function checkPasskeyStatus(userId) {
    try {
      const res = await fetch(`/api/auth/passkey/check/${userId}`);
      const data = await res.json();
      if (data.ok && data.hasPasskey) setHasPasskey(true);
      else setHasPasskey(false);
    } catch (err) {
      console.error('Error checking passkey:', err);
    } finally {
      setIsCheckingPasskey(false);
    }
  }

  async function handleDeletePasskey() {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/auth/passkey/delete/${user.userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.ok) {
        showSuccessToast("ลบ Passkey สำเร็จ");
        setHasPasskey(false);
      } else {
        showErrorToast(data.message || "ลบ Passkey ไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      showErrorToast("เกิดข้อผิดพลาดขณะลบ Passkey");
    }
  }

  useEffect(() => {
    // ตรวจสอบ session ว่าล็อกอินอยู่หรือไม่
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setUser(data.user);
          // ดึงข้อมูลผู้ใช้โดยใช้ userId
          fetch(`/api/user/${data.user.userId}`)
            .then(res => res.json())
            .then(userData => {
              // console.log(userData)
              if(!userData.error){
                  setForm({
                  name:userData.name,
                  avatar :userData.avatar,
                  email: userData.email || '',
                  passport_number: userData.passport_number || '',
                  phone: Array.isArray(userData.phone) && userData.phone.length > 0
                    ? userData.phone.map(p => typeof p === 'object' ? p : { name: '', phone_number: '' })
                    : [],
                  promptpay_number : userData.promptpay_number || '',
                });
              }else{
                logoutUser()
                return
              }
              
            });
        }
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (index, field, value) => {
    const updatedPhones = [...form.phone];
    updatedPhones[index][field] = value;
    setForm(prev => ({ ...prev, phone: updatedPhones }));
  };

  const addPhone = () => {
    setForm(prev => ({
      ...prev,
      phone: [...prev.phone, { name: '', phone_number: '' }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      showSuccessToast('เเก้ไขข้อมูลเเล้ว')
    } catch (error) {
      console.error("Error updating user:", error);
      showErrorToast('Error updating user')
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (url) => {
      setForm(prev => ({ ...prev, avatar: url }));
    };

    const removePhone = (indexToRemove) => {
      setForm(prev => ({
        ...prev,
        phone: prev.phone.filter((_, idx) => idx !== indexToRemove)
      }));
    };

    const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showErrorToast("รหัสผ่านใหม่กับยืนยันไม่ตรงกัน");
      return;
    }

    if (!currentPassword){
      showErrorToast("กรุณาใส่รหัสผ่านปัจจุบัน");
      return;
    }

    setIsLoading_ChangePassword(true);

    try {
      const res = await fetch(`/api/user/${user.userId}/changepassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showSuccessToast('เปลี่ยนรหัสผ่านสำเร็จ');
        // เคลียร์ช่องรหัสผ่าน
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showErrorToast(data.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showErrorToast("เกิดข้อผิดพลาดขณะเปลี่ยนรหัสผ่าน");
    } finally {
      setIsLoading_ChangePassword(false);
    }
  };

  async function handleRegisterPasskey() {
    try {
      // ขอ challenge จาก backend
      const res = await fetch("/api/auth/passkey/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const options = await res.json();

      // 🧠 ตรวจสอบก่อนเรียก startRegistration
      if (!options || !options.challenge) {
        console.error("❌ Invalid registration options:", options);
        showErrorToast("ข้อมูล passkey จากเซิร์ฟเวอร์ไม่ถูกต้อง");
        return;
      }

      // ให้ browser สร้าง passkey
      const attResp = await startRegistration(options);

      // ส่งกลับไป verify กับ server
      const verifyRes = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attResp),
      });

      if (verifyRes.ok) {
        showSuccessToast("ลงทะเบียน Passkey สำเร็จ 🎉");
        await checkPasskeyStatus(user.userId);
      } else {
        showErrorToast("ไม่สามารถลงทะเบียน Passkey ได้");
      }

    }
     catch (err) {
      console.error(err);
      showErrorToast("เกิดข้อผิดพลาดระหว่างสร้าง Passkey");
    } finally {
      setIsRegisteringPasskey(false);
    }
  }


  if (!user) return <Loading />;

  console.log(form)

  return (
    <main className="Profile">
      <div className="container py-5">
        <div className="row gap-5 flex-column flex-md-row">
          <div className="col-md-4 mb-4 mb-md-0">
            <div className="image-profile">
              <img
                src={form.avatar || null}
                alt="Profile" />
                
              <UploadButton onUploaded={handleUploadComplete} />
            </div>
          </div>
          <div className="col">
            <form className="container" onSubmit={handleSubmit}>
              <h2>Profile</h2>
              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name d-flex align-items-center" className="form-label">
                  <User size={18} /> Name
                </label>
                <input
                  type="text"
                  className="form-control input-outline-dark "
                  id="email"
                  name="email"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email d-flex align-items-center" className="form-label">
                  <Mail size={18} /> Email
                </label>
                <input
                  type="email"
                  className="form-control input-outline-dark "
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Passport Number */}
              <div className="mb-3">
                <label htmlFor="passport_number d-flex align-items-center" className="form-label">
                  <FileText size={18} /> Passport Number
                </label>
                <input
                  type="text"
                  className="form-control input-outline-dark "
                  id="passport_number"
                  name="passport_number"
                  value={form.passport_number}
                  onChange={handleChange}
                />
              </div>
              {/* Phone Numbers */}
              <div className="mb-3">
                <label className="form-label">
                  <Phone size={18} /> เบอร์โทร
                </label>
                <br></br>
                {form.phone.map((p, index) => (
                  <div className="row g-1 mb-2 align-items-center" key={index}>
                    {/* ช่องชื่อเบอร์โทร */}
                    <div className="col-4">
                      <input
                        type="text"
                        className="form-control form-control-sm input-outline-dark"
                        placeholder="ชื่อเบอร์โทร (เช่น บ้าน, ที่ทำงาน)"
                        value={p.name}
                        onChange={(e) => handlePhoneChange(index, 'name', e.target.value)}
                      />
                    </div>

                    {/* ช่องเบอร์โทร */}
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm input-outline-dark"
                        placeholder="เบอร์โทร"
                        value={p.phone_number}
                        onChange={(e) => handlePhoneChange(index, 'phone_number', e.target.value)}
                      />
                    </div>

                    {/* ปุ่มลบ */}
                    <div className="col-1 justify-content-center">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removePhone(index)}
                        title="ลบเบอร์นี้"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                ))}
                <button
                  type="button"
                  className="btn btn-sm input-outline-dark"
                  onClick={addPhone}
                >
                  + เพิ่มเบอร์โทร
                </button>
              </div>
              {/* promptpay */}
              <div className="mb-3">
                <label htmlFor="passport_number d-flex align-items-center" className="form-label">
                  <QrCode size={18} /> PromptPay Number
                </label>
                <input
                  type="text"
                  className="form-control input-outline-dark "
                  id="promptpay_number"
                  name="promptpay_number"
                  value={form?.promptpay_number || ''}
                  onChange={handleChange}
                />
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="btn custom-dark-hover w-100 d-flex align-items-center justify-content-center p-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2 " role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    กำลังแก้ไข...
                  </>
                ) : (
                  "แก้ไข"
                )}
              </button>
              {/* change password */}
              <div className="mb-3 border-top pt-5">
                <h5 className="mb-3">Change Password</h5>

                <div className="mb-2">
                  <label htmlFor="currentPassword" className="form-label">
                    รหัสผ่านปัจจุบัน
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm input-outline-dark"
                    id="currentPassword"
                    placeholder="กรอกรหัสผ่านเดิม"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor="newPassword" className="form-label">
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm input-outline-dark"
                    id="newPassword"
                    placeholder="กรอกรหัสผ่านใหม่"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                 
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm input-outline-dark"
                    id="confirmPassword"
                    placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                   
                  />
                </div>

                <button
                  type="button"
                  className="btn custom-dark-hover w-100 d-flex align-items-center justify-content-center p-2"
                  onClick={handleChangePassword}
                >
                  {isLoading_ChangePassword ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2 " role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    กำลังเปลี่ยนรหัสผ่าน...
                  </>
                ) : (
                  "เปลี่ยนรหัสผ่าน"
                )}
                </button>
              </div>

              {/* Register Passkey */}
              <div className="mb-3 border-top pt-5">
                <h5 className="mb-3">ลงทะเบียน Passkey</h5>
                <p className="text-muted">
                  ใช้เพื่อเข้าสู่ระบบโดยไม่ต้องใช้รหัสผ่าน (Touch ID / Face ID / Windows Hello)
                </p>

                {isCheckingPasskey ? (
                  <div className="text-secondary">⏳ กำลังตรวจสอบสถานะ...</div>
                ) : hasPasskey ? (
                  <div className="alert alert-success d-flex align-items-center justify-content-between">
                    <span><CircleCheck size={18}/> คุณได้ลงทะเบียน Passkey แล้ว</span>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm ms-2"
                      onClick={handleDeletePasskey}
                    >
                      ลบ Passkey
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center p-2 gap-2"
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
                        <KeySquare size={18}/> ลงทะเบียน Passkey
                      </>
                    )}
                  </button>
                )}
              </div>


            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
