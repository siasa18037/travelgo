'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorToast, showSuccessToast ,confirmDelete } from '@/lib/swal';
import { useTrip } from '@/components/TripContext';
import { ShieldBan, PlusCircle, Trash2, Edit, ExternalLink, Download ,Waypoints} from 'lucide-react';
import './immigration.css';
import { useRouter } from 'next/navigation';

export default function ImmigrationPage() {
  const router = useRouter();
  const { userId, id_trip } = useTrip();
  const [isLoading, setIsLoading] = useState(true);
  const [immigrations, setImmigrations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingImm, setEditingImm] = useState(null);
  const [formData, setFormData] = useState({ name: '', url_type: 'file', url: '', note: '' });

  // ✅ โหลดข้อมูล immigration ทั้งหมด
  const fetchImmigrations = async () => {
    try {
      const res = await axios.get(`/api/trip/${userId}/${id_trip}/immigration`);
      setImmigrations(res.data || []);
    } catch (err) {
      console.error(err);
      showErrorToast('โหลดข้อมูลเอกสารไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImmigrations();
  }, [userId, id_trip]);

  // ✅ เปิด / ปิด Modal
  const openModal = (imm = null) => {
    setEditingImm(imm);
    if (imm) {
      setFormData({
        name: imm.name,
        url_type: imm.url_type,
        url: imm.url,
        note: imm.note || '',
      });
    } else {
      setFormData({ name: '', url_type: 'file', url: '', note: '' });
    }
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingImm(null);
  };

  // ✅ เพิ่มหรือแก้ไข
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingImm) {
        await axios.put(`/api/trip/${userId}/${id_trip}/immigration`, {
          imm_id: editingImm._id,
          ...formData,
        });
        showSuccessToast('อัปเดตเอกสารสำเร็จ');
      } else {
        await axios.post(`/api/trip/${userId}/${id_trip}/immigration`, formData);
        showSuccessToast('เพิ่มเอกสารสำเร็จ');
      }
      closeModal();
      fetchImmigrations();
    } catch (err) {
      console.error(err);
      showErrorToast('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  // ✅ ลบเอกสาร (เฉพาะ host)
  const handleDelete = async (immId) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/api/trip/${userId}/${id_trip}/immigration`, { data: { imm_id: immId } });
      showSuccessToast('ลบเอกสารสำเร็จ');
      fetchImmigrations();
    } catch (err) {
      console.error(err);
      showErrorToast('ไม่สามารถลบเอกสารได้');
    }
  };

  // ✅ ฟังก์ชันดาวน์โหลดไฟล์/รูปภาพ
  const handleDownload = async (url, name, type) => {
    try {
      if (type === 'file') {
        const link = document.createElement('a');
        link.href = url;
        link.download = name || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (type === 'image') {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = name || 'image.jpg';
        document.body.appendChild(link);
        link.click();
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
            <ShieldBan size={28} /> Immigration
          </h3>
          <p className="text-muted mb-0">เอกสารตรวจคนเข้าเมืองสำหรับทริปนี้</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => router.push(`/trip/${id_trip}/plan/Summary`)}
            className="btn custom-dark-hover d-flex align-items-center mt-2 mt-md-0"
          >
            <Waypoints size={18} className="me-2" /> สรุป Plan ทั้งหมด
          </button>
          <button
            onClick={() => openModal()}
            className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0"
          >
            <PlusCircle size={18} className="me-2" /> เพิ่มเอกสาร
          </button>
        </div>
      </div>

      {/* Table */}
      {immigrations.length === 0 ? (
        <div className="text-center text-muted py-5">ยังไม่มีเอกสารตรวจคนเข้าเมือง</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle table-hover">
            <tbody>
              {immigrations.map((imm, index) => (
                <tr key={imm._id}>
                  <td className="fw-semibold" style={{ minWidth: 180 }}>
                    {index + 1}. {imm.name}
                    <div className="text-muted small fw-light">
                      {imm.note?.length > 40 ? imm.note.slice(0, 40) + '...' : imm.note || ''}
                    </div>
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {imm.host === userId && (
                        <>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openModal(imm)}
                            title="แก้ไข"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(imm._id)}
                            title="ลบ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}

                      {(imm.url_type === 'file' || imm.url_type === 'image') && (
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleDownload(imm.url, imm.name, imm.url_type)}
                          title="ดาวน์โหลดไฟล์"
                        >
                          <Download size={14} />
                        </button>
                      )}

                      <a
                        href={imm.url}
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
              <h5 className="modal-title">
                {editingImm ? 'แก้ไขเอกสารตรวจคนเข้าเมือง' : 'เพิ่มเอกสารใหม่'}
              </h5>
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
                  {editingImm ? 'บันทึกการแก้ไข' : 'เพิ่มเอกสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
