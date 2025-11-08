'use client';

import ReactDOM from "react-dom";
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  MapPin, Wallet, Hamburger, Hotel,
  Bus, CarFront, TrainFront, Plane, Footprints, Bike
} from 'lucide-react';
import { getLocalTimeString, getLocalToThaiDate } from '@/utils/dateLocal';
import { showErrorToast } from '@/lib/swal';
import { useRouter } from 'next/navigation';
import MapShare from '@/components/MapShare';
import StatusPlan from '@/components/StatusPlan';
import '@/styles/globals.css'

export default function ShowTripBoxMini({ id_user, id_trip ,start_trip}) {
  const [plan, setPlan] = useState(null);
  const [tripStatus, setTripStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapShareBox, setMapShareBox] = useState(false);
  const [mapShareData, setMapShareData] = useState(null);
  const [mapShareType, setMapShareType] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNowPlan = async () => {
      try {
        const res = await axios.get(`/api/trip/${id_user}/${id_trip}/plan/nowPlan`);
        if (res.status === 200) {
          setPlan(res.data.PlanInProgresData);
          setTripStatus(res.data.trip_status);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setTripStatus(error.response.data.trip_status);
        } else {
          console.error(error);
          showErrorToast('โหลดข้อมูลไม่สำเร็จ');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchNowPlan();
  }, [id_user, id_trip]);

  const ShowMapShare = (type, item) => {
    if (type === 'location') {
      setMapShareData({
        name: item.data.location.name,
        start: item.start,
        end: item.end,
        location: item.data.location,
      });
    } else if (type === 'navigation') {
      setMapShareData({
        name: item.name,
        start: item.start,
        end: item.end,
        transport_type: item.data.transport_type,
        origin: item.data.origin,
        destination: item.data.destination,
      });
    }
    setMapShareType(type);
    setMapShareBox(true);
  };

  if (isLoading)
    return (
      <div className="text-center p-3 text-muted small">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div className="ShowTripBoxMini card my-3" style={{
        borderRadius: '16px',
        padding: '10px 10px',
        color: 'white',
        backgroundColor: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.25s ease',
      }}>
      <div className="card-body p-3">
        {(plan && tripStatus == 'in_progress') ? (
          <>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
                style={{ width: 40, height: 40 }}
              >
                {plan.type === 'hotel' && <Hotel size={18} />}
                {plan.type === 'eat' && <Hamburger size={18} />}
                {plan.type === 'Activities' && <MapPin size={18} />}
                {plan.type === 'transport' && (
                  <>
                    {plan.data.transport_type === 'public_transport' && <Bus size={18} />}
                    {plan.data.transport_type === 'car' && <CarFront size={18} />}
                    {plan.data.transport_type === 'plane' && <Plane size={18} />}
                    {plan.data.transport_type === 'train' && <TrainFront size={18} />}
                    {plan.data.transport_type === 'walking' && <Footprints size={18} />}
                    {plan.data.transport_type === 'bicycle' && <Bike size={18} />}
                  </>
                )}
              </div>

              <div className="flex-grow-1">
                <div className="d-flex align-items-center ">
                    <StatusPlan
                        mode={'3'}
                        id_user={id_user}
                        status={plan.status}
                        start={plan.start}
                        end={plan.end}
                    />
                </div>
                <div className="d-flex align-items-center mt-1">
                  <h5 className="mb-0 fw-semibold ">
                    {plan.type === 'transport'
                      ? plan.name || `กำลังเดินทางไป ${plan.data?.destination?.name || ''}`
                      : plan.name || plan.data?.location?.name || 'ไม่มีชื่อ'}
                  </h5>
                </div>
                <p className="mb-0 small text-white">
                  {getLocalToThaiDate(plan.start)} • {getLocalTimeString(plan.start)}
                </p>
              </div>
            </div>

            {/* ปุ่ม action */}
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-sm border-white text-white d-flex align-items-center"
                onClick={() => router.push(`/trip/${id_trip}/plan/${plan._id}`)}
              >
                รายละเอียด
              </button>
              <button
                className="btn btn-sm border-white text-white d-flex align-items-center"
                onClick={() => router.push(`/trip/${id_trip}/wallet/plan/${plan._id}`)}
              >
                <Wallet size={14} className="me-1" /> Wallet
              </button>

              {plan.type !== 'transport' && plan.data?.location && (
                <button
                  className="btn btn-sm border-white text-white d-flex align-items-center"
                  onClick={() => ShowMapShare('location', plan)}
                >
                  <MapPin size={14} className="me-1" /> ดูเส้นทาง
                </button>
              )}
              {plan.type === 'transport' && (
                <button
                  className="btn btn-sm border-white text-white d-flex align-items-center"
                  onClick={() => ShowMapShare('navigation', plan)}
                >
                  <MapPin size={14} className="me-1" /> นำทาง
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {tripStatus == 'not_started' && (
              <div className="text-center text-secondary py-3">
                <h5 className="fw-semibold mb-1">
                  {(() => {
                    if (!start_trip?.datetime) return 'ไม่พบข้อมูลเวลาเริ่มเดินทาง';

                    const startTime = new Date(start_trip.datetime);
                    const now = new Date();

                    let diffMs = startTime - now;
                    if (diffMs <= 0) {
                      return 'ถึงเวลาเดินทางของคุณแล้ว ✈️';
                    }

                    const diffMinutes = Math.floor(diffMs / (1000 * 60));
                    const diffHours = Math.floor(diffMinutes / 60);
                    const diffDays = Math.floor(diffHours / 24);

                    if (diffDays > 0) return `อีก ${diffDays} วันจะถึงการเดินทางของคุณ`;
                    if (diffHours > 0) return `อีก ${diffHours} ชั่วโมงจะถึงการเดินทางของคุณ`;
                    return `อีก ${diffMinutes} นาทีจะถึงการเดินทางของคุณ`;
                  })()}
                </h5>
                <span className="badge bg-warning">
                  กำลังจะมาถึง
                </span>
              </div>
            )}

            {tripStatus == 'completed' && (
              <div className="text-center text-secondary py-3">
                <h5 className="fw-semibold mb-1">การเดินทางของคุณสิ้นสุดลงแล้ว</h5>
                <span className="badge bg-success">จบแล้ว</span>
              </div>
            )}

            {tripStatus == 'cancelled' && (
              <div className="text-center text-secondary py-3">
                <h5 className="fw-semibold mb-1">การเดินทางของคุณถูกยกเลิก</h5>
                <span className="badge bg-danger">ยกเลิก</span>
              </div>
            )}

            {tripStatus == 'in_progress' && (
              <div className="text-center text-secondary py-3">
                <h5 className="fw-semibold mb-1">กำลังออกเดินทาง</h5>
                <p className="fw-semibold mb-0">ขอให้เดินทางโดยสวัสดิภาพ!</p>
              </div>
            )}

          </>
        )}
      </div>

      {/* Map modal */}
      {mapShareBox && typeof window !== "undefined" &&
      ReactDOM.createPortal(
        <div
          className="overlay"
          onClick={() => setMapShareBox(false)} 
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className="MapShare card"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 0,
              overflowY: 'auto',
              backgroundColor: 'white',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <MapShare
              data={mapShareData}
              type={mapShareType}
              onClose={() => setMapShareBox(false)}
            />
          </div>
        </div>,
        document.body // ✅ Render ทับลงใน body
      )
    }

    </div>
  );
}
