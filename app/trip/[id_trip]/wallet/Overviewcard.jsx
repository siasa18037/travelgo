import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';
import { Wallet, CircleDollarSign, Handshake, HandCoins } from 'lucide-react';

export default function Overviewcard({ userId, id_trip }) {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ตรวจสอบว่ามี props ที่จำเป็นหรือไม่
        if (!userId || !id_trip) {
            setLoading(false);
            return;
        }

        const fetchOverview = async () => {
            try {
                const response = await axios.get(`/api/trip/${userId}/${id_trip}/wallet_transaction/overview`);
                setOverview(response.data);
            } catch (error) {
                console.error("Failed to fetch overview data:", error);
                showErrorToast("ไม่สามารถโหลดข้อมูลภาพรวมได้");
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, [userId, id_trip]);

    //ฟังก์ชันสำหรับจัดรูปแบบตัวเลขให้สวยงาม
    const formatCurrency = (number) => {
        if (typeof number !== 'number') {
            return '0.00';
        }
        // จัดรูปแบบให้มี comma และทศนิยม 2 ตำแหน่ง
        return number.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    if (loading) {
        return <Loading />;
    }

    if (!overview) {
        return <div className="text-center p-4 text-gray-500">ไม่สามารถแสดงข้อมูลได้</div>;
    }

    return (
        <div>
            <div className="row ">
                {/* Card 1: ค่าใช้จ่ายรวมของทริป */}
                <div className="col-xl-3 col-md-6 col-6 mb-2">
                    <div className="card border-0 shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-1">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        ค่าใช้จ่ายรวมของทริป
                                    </div>
                                    <div className="h6 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(overview.totalPlanAmount)} ฿
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <Wallet className="text-gray-300" size={25} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: รายจ่ายส่วนตัวทั้งหมด */}
                <div className="col-xl-3 col-md-6 col-6 mb-2">
                    <div className="card border-0 shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-1">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        รายจ่ายส่วนตัวทั้งหมด
                                    </div>
                                    <div className="h6 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(overview.totalExpenseByUser)} ฿
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <CircleDollarSign className="text-gray-300" size={25} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: หนี้ที่ยังไม่ได้จ่ายคืน (คุณเป็นหนี้) */}
                <div className="col-xl-3 col-md-6 col-6 mb-2">
                    <div className="card border-0 shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-1">
                                    <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                        หนี้ที่ยังไม่ได้จ่ายคืน
                                    </div>
                                    <div className="h6 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(overview.unpaidLoanFromUser)} ฿
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <Handshake className="text-gray-300" size={25} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 4: คนอื่นติดหนี้เรา (ยังไม่คืน) */}
                <div className="col-xl-3 col-md-6 col-6 mb-2">
                    <div className="card border-0 shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-1">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        คนอื่นติดหนี้เรา (ยังไม่คืน)
                                    </div>
                                    <div className="h6 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(overview.unpaidLoanToUser)} ฿
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <HandCoins className="text-gray-300" size={25} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}