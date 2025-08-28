// PlanList.jsx

import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import StatusPlan from '@/components/StatusPlan';
import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Wallet, Hamburger, Hotel, Bus, CarFront, TrainFront, Plane, Footprints, Bike } from 'lucide-react';
import { getLocalTimeString, getLocalToThaiDate } from '@/utils/dateLocal'
import MapShare from '@/components/MapShare'

export default function PlanList({ plan_list, trip_status, fillter = '' }) {
  const router = useRouter();
  const { userType, userId, id_trip, statusTrip } = useTrip();
  const [mapSharedata, setMapSharedata] = useState();
  const [mapShareBox, setMapShareBox] = useState(false);
  const [mapShareType, setMapShareType] = useState();
  const [isLoading, setIsLoading] = useState(false);

  // --- ✨ ส่วนที่แก้ไขและเพิ่มเติม ---
  const inProgressRef = useRef(null);
  const prevInProgressIdRef = useRef(null); // Ref สำหรับเก็บ ID ของ plan in_progress ก่อนหน้า
  const [shouldScroll, setShouldScroll] = useState(false); // State เพื่อสั่งให้เลื่อนหน้าจอ

  // 1. Effect นี้จะคอยตรวจจับว่า 'in_progress' plan เปลี่ยนไปหรือไม่
  useEffect(() => {
    // ถ้ามีการค้นหาอยู่ ให้หยุดการทำงานส่วนนี้
    if (fillter && fillter.trim() !== '') {
        setShouldScroll(false); // ปิดการเลื่อนเมื่อมีการค้นหา
        return;
    }

    const inProgressPlan = plan_list.find(p => p.status === 'in_progress');
    const currentInProgressId = inProgressPlan?._id || null;

    // ถ้า ID ของ plan 'in_progress' ปัจจุบันไม่ตรงกับ ID ที่เก็บไว้
    if (currentInProgressId && currentInProgressId !== prevInProgressIdRef.current) {
      setShouldScroll(true); // ตั้งค่าให้เลื่อนหน้าจอ
      prevInProgressIdRef.current = currentInProgressId; // อัปเดต ID ล่าสุด
    } else if (!currentInProgressId) {
      // กรณีไม่มี plan in_progress แล้ว
      prevInProgressIdRef.current = null;
    }
  }, [plan_list, fillter]);

  // 2. Effect นี้จะทำงานเมื่อ 'shouldScroll' เป็น true เท่านั้น
  useEffect(() => {
    if (shouldScroll && inProgressRef.current) {
      inProgressRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      setShouldScroll(false); // ปิดการสั่งเลื่อนหลังจากเลื่อนสำเร็จ
    }
  }, [shouldScroll]);
  // --- ✨ สิ้นสุดส่วนที่แก้ไข ---

  // Effect สำหรับการค้นหา (ยังคงเดิม)
  useEffect(() => {
    if (!fillter || fillter.trim() === '') return;

    const searchTerm = fillter.toLowerCase().trim();

    const foundPlan = plan_list.find(plan => {
      const planName = plan.name?.toLowerCase() || '';
      if (planName.includes(searchTerm)) return true;

      const locationName = plan.data?.location?.name?.toLowerCase() || '';
      if (locationName.includes(searchTerm)) return true;

      const destinationName = plan.data?.destination?.name?.toLowerCase() || '';
      if (destinationName.includes(searchTerm)) return true;

      const thaiDate = getLocalToThaiDate(plan.start).toLowerCase();
      const timeString = getLocalTimeString(plan.start).toLowerCase();
      if (thaiDate.includes(searchTerm) || timeString.includes(searchTerm)) return true;

      return false;
    });

    if (foundPlan) {
      const element = document.getElementById(foundPlan._id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [fillter, plan_list]);

  const handleStartTrip = async () => {
    setIsLoading(true);
    try {
      await axios.put(`/api/trip/${userId}/${id_trip}`, { status: 'in_progress' });
      location.reload();
      showSuccessToast("Trip Started");
    } catch (error) {
      console.error("Error update trip:", error);
      showErrorToast("Failed to Trip Started");
    } finally {
      setIsLoading(false);
    }
  };

  const ShowMapShare = (type, item) => {
    if (type === 'location') {
      setMapSharedata({
        name: item.data.location.name,
        start: item.start,
        end: item.end,
        location: item.data.location
      });
    } else if (type === 'navigation') {
      setMapSharedata({
        name: item.name,
        start: item.start,
        end: item.end,
        transport_type: item.data.transport_type,
        origin: item.data.origin,
        destination: item.data.destination
      });
    }
    setMapShareType(type);
    setMapShareBox(true);
  };

  // ... ส่วนของ JSX return ยังคงเหมือนเดิม ไม่มีการเปลี่ยนแปลง ...
  // ... (คัดลอกส่วน JSX ของคุณมาวางต่อที่นี่) ...
  return (
   <>
    <section className="bsb-timeline-2">
        <div className="container">
            <div className="row mx-2">
                <ul className="timeline">
                    <li className="timeline-item" >
                        <span
                            className="timeline-icon"
                            style={{
                                    backgroundColor:
                                    trip_status === 'in_progress' ? '#198754' :
                                    trip_status === 'completed'   ? '#198754' :
                                    trip_status === 'cancelled'   ? '#dc3545' :
                                    trip_status === 'not_started' ? 'var(--bs-body-bg)' :
                                    ''
                                }}
                        ></span>
                        <div className="timeline-body">
                            <div className="timeline-content">
                                <div className="card border-0">
                                    <div className="d-flex align-items-center gap-4">
                                        <h4 className="mb-0">Start</h4>
                                        {trip_status === 'not_started' && (
                                            <button className="btn btn-success" onClick={()=>handleStartTrip()} disabled={isLoading}>
                                                {isLoading ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        กำลังเริ่มการเดินทาง...
                                                    </>
                                                    ) : (
                                                    <>
                                                        เริ่มการเดินทาง
                                                    </>
                                                    )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    {plan_list.length === 0 ? (
                        <div className=""></div>
                    ) : (
                        plan_list.map((plan) => (
                        <li
                            className="timeline-item"
                            key={plan._id}
                            id={plan._id}
                            ref={plan.status === 'in_progress' ? inProgressRef : null}
                        >
                            <div onClick={() => router.push(`/trip/${id_trip}/plan/${plan._id}`)} style={{ cursor: 'pointer' }}>
                            <span
                                className="timeline-icon"
                                style={{
                                    backgroundColor:
                                    plan.status === 'in_progress' ? '#0d6efd' :
                                    plan.status === 'completed'   ? '#198754' :
                                    plan.status === 'skipped'     ? '#ffc107' :
                                    plan.status === 'cancelled'   ? '#dc3545' :
                                    plan.status === 'not_started' ? 'var(--bs-body-bg)' :
                                    '',
                                    color:
                                    plan.status === 'not_started' ? 'var(--bs-body-color)' :
                                    'var(--bs-body-bg)'
                                }}
                                >
                                { plan.type == 'hotel' && (
                                    <Hotel size={18}/>
                                )}
                                { plan.type == 'eat' && (
                                    <Hamburger size={18}/>
                                )}
                                { plan.type == 'Activities' && (
                                    <MapPin size={18}/>
                                )}
                                { plan.type == 'transport' && (
                                    <>
                                        {plan.data.transport_type == 'public_transport' && (
                                            <Bus size={18}/>
                                        )}
                                        {plan.data.transport_type == 'car' && (
                                            <CarFront size={18}/>
                                        )}
                                        {plan.data.transport_type == 'plane' && (
                                            <Plane size={18}/>
                                        )}
                                        {plan.data.transport_type == 'train' && (
                                            <TrainFront size={18}/>
                                        )}
                                        {plan.data.transport_type == 'walking' && (
                                            <Footprints size={18}/>
                                        )}
                                        {plan.data.transport_type == 'bicycle' && (
                                            <Bike size={18}/>
                                        )}
                                    </>
                                )}
                            </span>
                            <div className="timeline-body">
                            <div className="timeline-content">
                                <div className="card border-0">
                                    <div className="card-body p-0">
                                        <div className="card-text d-flex align-items-center gap-3 mb-2">
                                            <div className="card-text mb-0">
                                                <h5 className="mb-0">{getLocalTimeString(plan.start)}</h5>
                                                <p className="mb-0 small text-secondary">{getLocalToThaiDate(plan.start)}</p>
                                            </div>
                                            <StatusPlan mode={'3'} id_user={userId} status={plan.status} start={plan.start}  end={plan.end}/>
                                        </div>
                                        {plan.type == 'transport' ? (
                                            <h5 className="mb-1">{plan.name || `เดินทางไป ${plan.data?.destination?.name || ''}`}</h5>
                                        ):(
                                            <h4 className="mb-1">{plan.name || plan.data?.location?.name || `ไม่มีชื่อ`}</h4>
                                        )}
                                        {(plan.type != 'transport' && plan.data.location.name ) &&(
                                            <div className="d-flex align-items-center gap-1">
                                                <MapPin size={14}/>
                                                <p className="card-text m-0 small">{plan.data?.location?.name}</p>
                                            </div>
                                        )}
                                        {plan.status == 'in_progress' && (
                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // สั่งให้หยุด Event ที่นี่
                                                        router.push(`/trip/${id_trip}/plan/${plan._id}`);
                                                    }}
                                                    className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0 btn-sm"
                                                >
                                                    Plan Detail
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // สั่งให้หยุด Event ที่นี่
                                                        router.push(`/trip/${id_trip}/wallet/plan/${plan._id}`);
                                                    }}
                                                    className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0 btn-sm gap-1"
                                                >
                                                    <Wallet size={14}/>
                                                    Plan Wallet
                                                </button>
                                                {plan.type != 'transport' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // สั่งให้หยุด Event ที่นี่
                                                            ShowMapShare('location', plan);
                                                        }}
                                                        className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0 btn-sm gap-1"
                                                    >
                                                        <MapPin size={14}/>
                                                        ดูเส้นทาง
                                                    </button>
                                                )}
                                                {plan.type == 'transport' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // สั่งให้หยุด Event ที่นี่
                                                            ShowMapShare('navigation', plan);
                                                        }}
                                                        className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0 btn-sm gap-1"
                                                    >
                                                        <MapPin size={14}/>
                                                        นำทาง
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            </div>
                            </div>
                        </li>
                        ))
                    )}
                    <li className="timeline-item" >
                        <span
                            className="timeline-icon"
                            style={{
                                    backgroundColor:
                                    trip_status === 'in_progress' ? 'var(--bs-body-bg)' :
                                    trip_status === 'completed'   ? '#198754' :
                                    trip_status === 'cancelled'   ? '#dc3545' :
                                    trip_status === 'not_started' ? 'var(--bs-body-bg)' :
                                    ''
                                }}
                        ></span>
                        <div className="timeline-body">
                            <div className="timeline-content">
                                <div className="card border-0">
                                    <h4 className="mb-0">End</h4>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
    {/* mapShareBox */}
    {mapShareBox && (
    <div className="modal-content">
        <MapShare
        data={mapSharedata}
        type={mapShareType}
        onClose={() => setMapShareBox(false)}
        />
    </div>
    )}
   </>
  );
}