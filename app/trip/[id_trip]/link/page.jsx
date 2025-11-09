'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorToast, showSuccessToast ,confirmDelete} from '@/lib/swal';
import { useTrip } from '@/components/TripContext';
import { Link as LinkIcon, PlusCircle, Trash2, Edit, ExternalLink } from 'lucide-react';
import './link.css';

export default function LinkPage() {
  const { userType, userId, id_trip } = useTrip();
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '', note: '', url_type: 'link' });

  // ✅ โหลดข้อมูลลิงก์ทั้งหมด
  const fetchLinks = async () => {
    try {
      const res = await axios.get(`/api/trip/${userId}/${id_trip}/link`);
      setLinks(res.data || []);
    } catch (err) {
      console.error(err);
      showErrorToast('โหลดข้อมูลลิงก์ไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [userId, id_trip]);

  // ✅ เปิด / ปิด Modal
  const openModal = (link = null) => {
    setEditingLink(link);
    if (link) {
      setFormData({
        name: link.name,
        url: link.url,
        note: link.note || '',
        url_type: 'link',
      });
    } else {
      setFormData({ name: '', url: '', note: '', url_type: 'link' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLink(null);
  };

  // ✅ เพิ่มหรือแก้ไข
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await axios.put(`/api/trip/${userId}/${id_trip}/link`, {
          link_id: editingLink._id,
          ...formData,
        });
        showSuccessToast('อัปเดตลิงก์สำเร็จ');
      } else {
        await axios.post(`/api/trip/${userId}/${id_trip}/link`, formData);
        showSuccessToast('เพิ่มลิงก์สำเร็จ');
      }
      closeModal();
      fetchLinks();
    } catch (err) {
      console.error(err);
      showErrorToast('ไม่สามารถบันทึกลิงก์ได้');
    }
  };

  // ✅ ลบลิงก์ (เฉพาะ host)
  const handleDelete = async (linkId) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/api/trip/${userId}/${id_trip}/link`, { data: { link_id: linkId } });
      showSuccessToast('ลบลิงก์สำเร็จ');
      fetchLinks();
    } catch (err) {
      console.error(err);
      showErrorToast('ไม่สามารถลบลิงก์ได้');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-5 text-muted small">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        กำลังโหลดข้อมูลลิงก์...
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <LinkIcon size={28} /> Link
          </h3>
          <p className="text-muted mb-0">ลิงก์ที่เกี่ยวข้องกับทริปของคุณ</p>
        </div>
        <button onClick={() => openModal()} className="btn custom-dark-hover d-flex align-items-center mt-2 mt-md-0">
          <PlusCircle size={18} className="me-2" /> เพิ่มลิงก์
        </button>
      </div>

      {/* Table */}
      {links.length === 0 ? (
        <div className="text-center text-muted py-5">ยังไม่มีลิงก์</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle table-hover">
            <tbody>
              {links.map((link, index) => (
                <tr key={link._id}>
                  <td className="fw-semibold" style={{ minWidth: 180 }}>
                    {index + 1}. {link.name}
                    <div className="text-muted small fw-light">
                      {link.note?.length > 40 ? link.note.slice(0, 40) + '...' : link.note || ''}
                    </div>
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {link.host === userId && (
                        <>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openModal(link)}
                            title="แก้ไข"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(link._id)}
                            title="ลบ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}

                      {/* ปุ่มเปิดลิงก์ */}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm d-flex align-items-center"
                        title="เปิดลิงก์"
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
              <h5 className="modal-title">{editingLink ? 'แก้ไขลิงก์' : 'เพิ่มลิงก์ใหม่'}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">ชื่อ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">URL ลิงก์</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">หมายเหตุ (ถ้ามี)</label>
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
                  {editingLink ? 'บันทึกการแก้ไข' : 'เพิ่มลิงก์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
