'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorToast, showSuccessToast ,confirmDelete} from '@/lib/swal';
import { useTrip } from '@/components/TripContext';
import { FileText, PlusCircle, Trash2, Edit, ExternalLink ,Download} from 'lucide-react';
import './document.css';

export default function DocumentPage() {
  const { userType, userId, id_trip } = useTrip();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({ name: '', url_type: 'file', url: '', note: '' });

  // ✅ โหลดเอกสารทั้งหมด
  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`/api/trip/${userId}/${id_trip}/document`);
      setDocuments(res.data || []);
    } catch (err) {
      console.error(err);
      showErrorToast('โหลดข้อมูลเอกสารไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId, id_trip]);

  // ✅ เปิด / ปิด Modal
  const openModal = (doc = null) => {
    setEditingDoc(doc);
    if (doc) {
      setFormData({
        name: doc.name,
        url_type: doc.url_type,
        url: doc.url,
        note: doc.note || '',
      });
    } else {
      setFormData({ name: '', url_type: 'file', url: '', note: '' });
    }
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingDoc(null);
  };

  // ✅ เพิ่มหรือแก้ไข
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoc) {
        await axios.put(`/api/trip/${userId}/${id_trip}/document`, {
          doc_id: editingDoc._id,
          ...formData,
        });
        showSuccessToast('อัปเดตสำเร็จ');
      } else {
        await axios.post(`/api/trip/${userId}/${id_trip}/document`, formData);
        showSuccessToast('เพิ่มเอกสารสำเร็จ');
      }
      closeModal();
      fetchDocuments();
    } catch (err) {
      console.error(err);
      showErrorToast('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  // ✅ ลบเอกสาร (เฉพาะ host)
  const handleDelete = async (docId) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/api/trip/${userId}/${id_trip}/document`, { data: { doc_id: docId } });
      showSuccessToast('ลบเอกสารสำเร็จ');
      fetchDocuments();
    } catch (err) {
      console.error(err);
      showErrorToast('ไม่สามารถลบเอกสารได้');
    }
  };

  // ✅ ฟังก์ชันดาวน์โหลดไฟล์/รูปภาพ
  const handleDownload = async (url, name, type) => {
    try {
      if (type === 'file') {
        // ดาวน์โหลดไฟล์ทั่วไป
        const link = document.createElement('a');
        link.href = url;
        link.download = name || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } 
      else if (type === 'image') {
        // ดาวน์โหลดรูปภาพด้วย blob (รองรับ cross-origin)
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = name || 'image.jpg';
        document.body.appendChild(link);
        link.click();

        // cleanup
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Download failed:', err);
      showErrorToast('ไม่สามารถดาวน์โหลดไฟล์ได้');
    }
  };



  if (isLoading) {
    return (
      <div className="text-center p-5 text-muted small">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        กำลังโหลดข้อมูลเอกสาร...
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FileText size={28} /> Document
          </h3>
          <p className="text-muted mb-0">รายการเอกสารทั้งหมดในทริปของคุณ</p>
        </div>
        <button onClick={() => openModal()} className="btn custom-dark-hover d-flex align-items-center mt-2 mt-md-0">
          <PlusCircle size={18} className="me-2" /> เพิ่มเอกสาร
        </button>
      </div>

      {/* Table */}
      {documents.length === 0 ? (
        <div className="text-center text-muted py-5">ยังไม่มีเอกสาร</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle table-hover">
         
            <tbody>
              {documents.map((doc, index) => (
                <tr key={doc._id}>
                  <td className=" fw-semibold" style={{ minWidth: 180  }}>
                    {index + 1}. {doc.name} 
                    <div className="text-muted small fw-light" >
                      {doc.note?.length > 40 ? doc.note.slice(0, 40) + '...' : doc.note || ''}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="d-flex justify-content-end gap-2">
                      {/* ✅ ถ้าเป็น host จะแสดงปุ่มแก้ไข / ลบ */}
                      {doc.host === userId && (
                        <>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openModal(doc)}
                            title="แก้ไข"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(doc._id)}
                            title="ลบ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      {(doc.url_type === 'file' || doc.url_type === 'image') && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleDownload(doc.url, doc.name, doc.url_type)}
                            title="ดาวน์โหลดไฟล์"
                          >
                            <Download size={14} />
                          </button>
                        )}

                      {/* ✅ ปุ่มเปิดลิงก์ */}
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm d-flex justify-content-center align-items-center"
                        title="เปิดเอกสาร"
                      >
                        <ExternalLink size={14} className="me-1" /> เปิด
                      </a>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && <div className="modal-backdrop fade show"></div>}
      <div
        className={`modal fade ${showModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">{editingDoc ? 'แก้ไขเอกสาร' : 'เพิ่มเอกสารใหม่'}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">ชื่อเอกสาร</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">ประเภท</label>
                  <select
                    className="form-select"
                    value={formData.url_type}
                    onChange={(e) => setFormData({ ...formData, url_type: e.target.value })}
                  >
                    <option value="file">ไฟล์ (File)</option>
                    <option value="link">ลิงก์ (Link)</option>
                    <option value="image">รูปภาพ (Image)</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">ลิงก์ / URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">หมายเหตุ</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDoc ? 'บันทึกการแก้ไข' : 'เพิ่มเอกสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
