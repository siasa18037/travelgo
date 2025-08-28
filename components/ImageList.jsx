'use client';
import { useState, useEffect } from "react";
import UploadButton from '@/components/UploadButton';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import {Image , Trash ,X,ArrowDownToLine,Plus} from 'lucide-react';
import { set } from "mongoose";

export default function ImageList({autoFetchFirst=false, id_user, id_trip, id_plan , data=[]}) { 
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null); // modal preview
  const [newLink, setNewLink] = useState("");
  const [openEditImageBox , setOpenEditImageBox ] = useState(false);

  // ✅ ดึงรูปจาก API
  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/trip/${id_user}/${id_trip}/plan/${id_plan}/image`);
      const data = await res.json();
      if (res.ok) {
        setImages(data);
      } else {
        showErrorToast(data.message || "โหลดรูปไม่สำเร็จ");
      }
    } catch (err) {
      showErrorToast("เชื่อมต่อเซิร์ฟเวอร์ผิดพลาด");
    }
  };

  useEffect(() => {
    if(autoFetchFirst){
      fetchImages();
    }else{
      setImages(data);
    }
    
  }, []);

  // ✅ อัพเดตรูป (PUT)
  const updateImages = async (newImages) => {
    try {
      const res = await fetch(`/api/trip/${id_user}/${id_trip}/plan/${id_plan}/image`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newImages }),
      });
      const data = await res.json();
      if (res.ok) {
        setImages(data.images);
        showSuccessToast("อัพเดตรูปเรียบร้อย");
      } else {
        showErrorToast(data.message || "อัพเดตรูปไม่สำเร็จ");
      }
    } catch (err) {
      showErrorToast("เชื่อมต่อเซิร์ฟเวอร์ผิดพลาด");
    }
  };

  // ✅ เมื่อ UploadButton อัพโหลดเสร็จ
  const handleUploaded = (url) => {
    const newImages = [...images, url];
    updateImages(newImages);
    setOpenEditImageBox(false);
  };

  // ✅ เพิ่มลิงก์เอง
  const handleAddLink = () => {
    if (!newLink.trim()) return;
    const newImages = [...images, newLink.trim()];
    updateImages(newImages);
    setNewLink("");
    setOpenEditImageBox(false);
  };

  // ✅ ลบรูป
  const handleRemove = (url) => {
    const newImages = images.filter(img => img !== url);
    updateImages(newImages);
  };

    const handleDownload = (url) => {
    try {
        const link = document.createElement("a");
        link.href = url;
        link.download = url.split("/").pop() || "image.jpg"; // ตั้งชื่อไฟล์จาก url
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        showErrorToast("ไม่สามารถดาวน์โหลดรูปได้");
    }
    };


  return (
    <>
    <div className="ImageList my-3 ">
        <div className="d-flex align-items-center justify-content-between mb-2">
            <h4 className="d-flex align-items-center mb-0">
                <Image size={24} className="me-2" />
                Images
            </h4>
            <button
                className="btn input-outline-dark btn-sm"
                onClick={() => setOpenEditImageBox(true)}
                >
                Upload Image
            </button>
        </div>
      
        {/* Image Grid */}
        <div className="row g-2">
            {images.map((img, idx) => (
            <div key={idx} className="col-6 col-md-4 col-lg-3 position-relative">
                <img
                src={img}
                alt={`img-${idx}`}
                className="img-fluid rounded shadow-sm"
                style={{ cursor: "pointer", objectFit: "cover", height: "100px", width: "100%" }}
                onClick={() => setPreview(img)}
                />
            </div>
            ))}
        </div>

        {/* Modal Preview */}
        {preview && (
            <div className="overlay" onClick={() => setPreview(null)}>
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <img src={preview} alt="preview" className="img-fluid rounded" style={{ maxHeight: "90vh" }} />
                    <div className="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2">
                        <button
                        className="btn btn-success d-flex align-items-center"
                        onClick={() => handleDownload(preview)}
                        >
                            <ArrowDownToLine size={18}/>
                        </button>
                        <button
                        className="btn btn-danger d-flex align-items-center"
                        onClick={() => handleRemove(preview)}
                        >
                            <Trash size={18}/>
                        </button>
                        <button
                        className="btn btn-light d-flex align-items-center"
                        onClick={() => setPreview(null)}
                        >
                            <X size={18}/>
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    {openEditImageBox && (
        <div className="overlay" onClick={() => setOpenEditImageBox(false)} >
            <div
                className="card p-3 bg-body rounded"
                onClick={(e) => e.stopPropagation()}
                style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: "500px", 
                width: "100%" 
                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Upload Images</h5>
                    <button className="btn btn-sm" onClick={() => setOpenEditImageBox(false)}>
                    <X size={18} />
                    </button>
                </div>
                {/* Upload + Add link */}
                <div className="mb-3">
                    <UploadButton onUploaded={handleUploaded} />
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                    <input
                    type="text"
                    className="form-control input-outline-dark"
                    placeholder="ใส่ลิงก์รูป..."
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    />
                    <button className="btn custom-dark-hover d-flex align-items-center justify-content-center" style={{ width: '42px', height: '40px'}} onClick={handleAddLink}><Plus size={18}/></button>
                </div>
            </div>
        </div>
    )}
    </>
  );
}
