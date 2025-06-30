import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorToast, showSuccessToast, confirmBox ,confirmDelete} from "@/lib/swal"; // เพิ่ม confirmBox
import { Wallet, CircleDollarSign, Handshake, HandCoins, X, CheckCircle, XCircle, Calendar, User, Info , Trash,QrCode} from 'lucide-react';
import './ShowDetailBox.css'

// 1. (แก้ไข) เพิ่ม user_list เข้าไปใน props
export default function ShowDetailBox({ userId, id_trip, data, onClose, onSuccess, user_list , exchangeRates }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);

    // ถ้าไม่มีข้อมูล ให้ return null เพื่อไม่แสดงผลอะไรเลย
    if (!data) {
        return null;
    }

    // 2. (เพิ่ม) ฟังก์ชัน helpers สำหรับจัดการข้อมูล user และ format ต่างๆ
    const getUser = (id) => user_list.find(u => u._id === id) || { name: 'Unknown', avatar: '/images/userprofile.jpg' , promptpay_number : ''};
    const formatPrice = (price) => {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };
    const formatDate = (iso) => new Date(iso).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });

    // 3. (แก้ไข) แก้ไขฟังก์ชัน updateIsPaid ให้สมบูรณ์
    const updateIsPaid = async () => {
        // ตรวจสอบเงื่อนไขอีกครั้งก่อนส่ง
        if (data.type !== 'loan' || data.isPaid || !(data.host === userId || data.user_to === userId)) {
            showErrorToast("ไม่สามารถอัปเดตรายการนี้ได้");
            return;
        }

        const result = await confirmBox({
            title: 'ยืนยันการคืนเงิน',
            text: `คุณต้องการยืนยันว่ารายการนี้ได้รับการคืนเงินแล้วใช่หรือไม่?`,
            icon: 'question',
            confirmButtonText : 'คืนเงิน', 
            cancelButtonText : 'ยกเลิก'
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                // API endpoint ต้องการ array ของ id ใน body
                await axios.put(`/api/trip/${userId}/${id_trip}/wallet_transaction`, [data._id]);
                showSuccessToast("อัปเดตรายการคืนสำเร็จ!");
                onSuccess(); // เรียก onSuccess ที่ได้รับจาก props เพื่อ refresh ข้อมูลและปิด modal
            } catch (error) {
                showErrorToast("เกิดข้อผิดพลาดในการอัปเดต");
                console.error("Update error:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }

    const Qrcode = async () => {
        // 1. หาข้อมูลเจ้าหนี้ และเบอร์ PromptPay
        const userFrom = getUser(data.user_from);
        const promptpayNumber = userFrom.promptpay_number;

        // 2. ตรวจสอบว่ามีเบอร์ PromptPay หรือไม่
        if (!promptpayNumber) {
            showErrorToast(`ผู้ใช้ ${userFrom.name} ยังไม่ได้ตั้งค่า PromptPay`);
            return;
        }

        // 3. ตรวจสอบว่ามีข้อมูลอัตราแลกเปลี่ยนหรือไม่
        if (!exchangeRates) {
            showErrorToast("ยังไม่สามารถโหลดอัตราแลกเปลี่ยนได้, กรุณาลองใหม่อีกครั้ง");
            return;
        }

        // 4. คำนวณยอดเงินที่ต้องจ่ายเป็น THB
        let amountInTHB = 0;
        const { price, currency } = data.amount;

        if (currency === 'THB') {
            amountInTHB = price;
        } else {
            if (exchangeRates[currency]) {
                // แปลงสกุลเงินอื่นให้เป็น THB
                amountInTHB = price / exchangeRates[currency];
            } else {
                showErrorToast(`ไม่พบอัตราแลกเปลี่ยนสำหรับสกุลเงิน ${currency}`);
                return;
            }
        }

        // 5. Format ยอดเงินสำหรับแสดงผล (มีสัญลักษณ์ ฿) และสำหรับใช้ใน URL (ตัวเลขล้วน)
        const amountForURL = amountInTHB.toFixed(2); // ยอดเงินสำหรับ PromptPay URL (ทศนิยม 2 ตำแหน่ง)
        const amountForDisplay = new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(amountInTHB);

        // 6. แสดงกล่องยืนยันพร้อม QR Code
        const result = await confirmBox({
            title: `สแกนเพื่อจ่าย ${amountForDisplay}`,
            text: `เมื่อโอนเงินสำเร็จ กรุณากดยืนยันการชำระเงิน`,
            imageUrl: `https://promptpay.io/${promptpayNumber}/${amountForURL}.png`,
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: 'PromptPay QR Code',
            confirmButtonText: 'ชำระเงินแล้ว, ยืนยัน',
            cancelButtonText: 'ยกเลิก'
        });

        // 7. หากผู้ใช้กดยืนยัน ให้อัปเดตสถานะการจ่ายเงิน
        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                await axios.put(`/api/trip/${userId}/${id_trip}/wallet_transaction`, [data._id]);
                showSuccessToast("อัปเดตรายการคืนสำเร็จ!");
                onSuccess(); // เรียก onSuccess เพื่อ refresh ข้อมูลและปิด modal
            } catch (error) {
                showErrorToast("เกิดข้อผิดพลาดในการอัปเดต");
                console.error("Update error:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }

    const deleteItem = async () => {
        const result = await confirmDelete();
        if (result.isConfirmed){
            setIsLoadingDelete(true);
            try {
                await axios.delete(`/api/trip/${userId}/${id_trip}/wallet_transaction`, { data: [data._id] });

                showSuccessToast("ลบสำเร็จ!");
                onSuccess();
            } catch (error) {
                showErrorToast("เกิดข้อผิดพลาดในการลบ");
                console.error("Delete error:", error);
            } finally {
                setIsLoadingDelete(false);
            }
        }
    }

    // 4. (เพิ่ม) สร้าง UI สำหรับการแสดงผลข้อมูล
    const renderContent = () => {
        const host = getUser(data.host);

        if (data.type === 'expense') {
            return (
                <div>
                    <div className="d-flex align-items-center mb-3">
                        <CircleDollarSign className="me-3 text-success" size={32} />
                        <div>
                            <h5 className="mb-0">รายจ่าย</h5>
                            <small className="text-muted">{data.description || 'ไม่มีคำอธิบาย'}</small>
                        </div>
                        <div className="ms-auto text-end">
                            <h4 className='mb-0 text-success'>{formatPrice(data.amount.price)}</h4>
                            <span className="badge bg-secondary">{data.amount.currency}</span>
                        </div>
                    </div>
                    <hr />
                    <div className="detail-item d-flex align-items-center"><Calendar size={16} /><span className="ms-2"><b>วันที่:</b> {formatDate(data.time)}</span></div>
                    <div className="detail-item d-flex align-items-center"><User size={16} /><span className="ms-2"><b>จ่ายโดย:</b> {host.name}</span></div>
                    {data.note && <div className="detail-item mt-1 d-flex align-items-center"><Info size={16} /><span className="ms-2"><b>โน้ต:</b> {data.note}</span></div>}
                    <div className="mt-4 text-center">
                        {data.host === userId && (
                            <button
                                className="btn btn-danger me-2 "
                                onClick={deleteItem}
                                disabled={isLoadingDelete}
                            >
                                {isLoadingDelete ?
                                    (<><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> กำลังลบ...</>) :
                                    (<div className='d-flex align-items-center'><Trash className='me-2' size={18} /> ลบ</div>)
                                }
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        if (data.type === 'loan') {
            const userFrom = getUser(data.user_from);
            const userTo = getUser(data.user_to);

            return (
                <div>
                    <div className="d-flex align-items-center mb-3">
                        <HandCoins className="me-3 text-danger" size={32} />
                        <div>
                            <h5 className="mb-0">ยืมเงิน</h5>
                            <small className="text-muted">{data.description || 'ไม่มีคำอธิบาย'}</small>
                        </div>
                        <div className="ms-auto text-end">
                            <h4 className='mb-0 text-danger'>{formatPrice(data.amount.price)}</h4>
                            <span className="badge bg-secondary">{data.amount.currency}</span>
                        </div>
                    </div>
                    <hr />
                    <div className="loan-flow mb-3">
                        <div className='text-center'>
                            <img src={userFrom.avatar} className="rounded-circle avatar-small" alt={userFrom.name} style={{ width: "35px", height: "35px", objectFit: "cover" }}/>
                            <p className='small mb-0 mt-1 fw-bold text-primary'>{userFrom.name}</p>
                            <p className='small text-muted'>(เจ้าหนี้)</p>
                        </div>
                        <div className='d-flex align-items-center'></div>
                        <div className='text-center'>
                            <img src={userTo.avatar} className="rounded-circle avatar-small" alt={userTo.name} style={{ width: "35px", height: "35px", objectFit: "cover" }}/>
                            <p className='small mb-0 mt-1 fw-bold text-danger'>{userTo.name}</p>
                            <p className='small text-muted'>(ลูกหนี้)</p>
                        </div>
                    </div>

                    <div className="detail-item"><Calendar size={16} /><span className="ms-2"><b>วันที่ยืม:</b> {formatDate(data.time)}</span></div>
                    <div className="detail-item">
                        <b>สถานะ:</b>
                        {data.isPaid ? (
                            <span className="ms-2 badge bg-success"><CheckCircle size={14} /> คืนแล้ว</span>
                        ) : (
                            <span className="ms-2 badge bg-danger"><XCircle size={14} /> ยังไม่คืน</span>
                        )}
                    </div>
                     {data.note && <div className="detail-item d-flex align-items-center mt-1"><Info size={16} /><span className="ms-2"><b>โน้ต:</b> {data.note}</span></div>}

                    <div className="mt-4 text-center">
                    {data.host === userId && (
                        <button
                            className="btn btn-danger me-2 "
                            onClick={deleteItem}
                            disabled={isLoadingDelete}
                        >
                            {isLoadingDelete ?
                                (<><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> กำลังลบ...</>) :
                                (<div className='d-flex align-items-center'><Trash className='me-2' size={18} /> ลบ</div>)
                            }
                        </button>
                    )}
                    {!data.isPaid && (data.user_to === userId || data.host === userId) && (
                        <button
                            className="btn btn-success"
                            onClick={updateIsPaid}
                            disabled={isLoading}
                        >
                            {isLoading ?
                                (<><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> กำลังดำเนินการ...</>) :
                                (<div className='d-flex align-items-center'><Handshake size={18} className='me-2'/>ยืนยันการคืนเงิน</div>)
                            }
                        </button>
                    )}
                    {!data.isPaid && (data.user_to === userId || data.host === userId) && getUser(data.user_from).promptpay_number && (
                        <button
                            className="btn btn-outline-success ms-2"
                            onClick={Qrcode}
                            disabled={isLoading}
                        >
                            <QrCode size={18}/>
                        </button>
                    )}
                    </div>
                </div>
            );
        }
    };


    return (
        <div className="overlay" onClick={onClose} >
            <div
                className="ShowDetailBox card p-4 bg-body rounded shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* head */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 d-flex align-items-center"><Wallet size={20} className="me-2" />รายละเอียดธุรกรรม</h5>
                    <button className="btn btn-sm" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                {/* main */}
                <div className="main-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}