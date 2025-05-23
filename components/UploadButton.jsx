'use client';

import { useState } from 'react';
import { showSuccessToast, showErrorToast, showWarningToast } from "@/lib/swal";
import { Upload, CheckCircle } from 'lucide-react';

export default function UploadButton({ onUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploaded(false); // Reset เมื่อเลือกรูปใหม่
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showWarningToast('กรุณาเลือกรูปก่อนอัปโหลด');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onUploaded?.(data.url);
        setUploaded(true);
        showSuccessToast("อัปโหลดสำเร็จ");
      } else {
        showErrorToast('อัปโหลดล้มเหลว');
      }
    } catch (err) {
      showErrorToast('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <input
        type="file"
        accept="image/*"
        className="form-control"
        onChange={handleFileChange}
        disabled={loading}
      />
      <button
        className="btn btn-dark d-flex align-items-center justify-content-center"
        onClick={handleUpload}
        disabled={loading}
        style={{ width: '42px', height: '40px'}}
        title={uploaded ? "อัปโหลดสำเร็จ" : loading ? "กำลังอัปโหลด..." : "อัปโหลด"}
      >
        {loading ? (
          <div className="spinner-border spinner-border-sm text-light" role="status">
            <span className="visually-hidden"></span>
          </div>
        ) : uploaded ? (
          <CheckCircle size={20} />
        ) : (
          <Upload size={20} />
        )}
      </button>
    </div>
  );
}
