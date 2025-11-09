'use client';

import { useTrip } from '@/components/TripContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ShowTripBoxMini from '@/components/ShowTripBoxMini';
import { showErrorToast } from '@/lib/swal';
import { useRouter } from 'next/navigation';
import {
  Map,
  Wallet,
  CircleDollarSign,
  ShieldBan,
  Link,
  Ticket,
  FolderOpen,
  Settings,
  Users
} from 'lucide-react';
import {
  getLocalToThaiDate,
  getLocalTimeString,
} from '@/utils/dateLocal';
import './trip.css';
import { Router } from 'next/router';

  const getTripStatusMessage = (status) => {
    if(status === 'not_started') return "เร็วๆ นี้";
    if(status === 'in_progress') return "กำลังเดินทาง";
    if(status === 'completed') return "จบแล้ว";
    if(status === 'cancelled') return "ยกเลิก";
  };

  const getTripStatusStyle = (status) => {
    if(status === 'not_started') return "bg-warning-subtle text-warning-emphasis border border-warning";
    if(status === 'in_progress') return "bg-success-subtle text-success-emphasis border border-success";
    if(status === 'completed') return "bg-secondary-subtle text-secondary-emphasis border border-secondary";
    if(status === 'cancelled') return "bg-danger-subtle text-danger-emphasis border border-danger";
  }

export default function TripPage() {
  const router = useRouter();
  const { userType, userId, id_trip } = useTrip();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`/api/trip/${userId}/${id_trip}?mode=some`);
        setTrip(res.data);
      } catch (error) {
        console.error(error);
        showErrorToast('ไม่สามารถโหลดข้อมูลทริปได้');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
  }, [userId, id_trip]);

  if (isLoading) {
    return (
      <div className="text-center p-5 text-muted small">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center text-danger">ไม่พบทริป</div>;
  }

  

  return (
    <div className="Trip">
      {/* ===== Hero Section ===== */}
      <div
        className="headbox d-flex align-items-center text-dark"
        style={{
          position: 'relative',
          minHeight: '80vh',
          backgroundImage: `url(${trip.profile_image || '/default-trip.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'var(--text-primary)',
        }}
      >
        {/* overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
          }}
        ></div>

        {/* content */}
        <div
          className="trip-content container position-relative"
          style={{
            zIndex: 2,
          }}
        >
          <div className="row align-items-center justify-content-between">
            {/* ===== LEFT SIDE ===== */}
            <div className="col-12 col-lg-6 mb-lg-0" style={{padding:'0px'}}>
              <div className="">
               
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <h2 className="fw-bold mb-0 gradient-text">{trip.name}</h2>
                  <p
                    className={`card-text small align-items-center rounded px-2 py-1 mb-0 ${getTripStatusStyle(trip.status)}`}
                  >
                    {getTripStatusMessage(trip.status)}
                  </p>
                </div>
                <p className="fw-semibold text-white mb-1">
                  {getLocalToThaiDate(trip.start_date)} - {getLocalToThaiDate(trip.end_date)}
                </p>
                <p className="text-white fw-light mb-2">
                  {trip.description || ''}
                </p>

                {/* Country List */}
                <div className="d-flex flex-wrap gap-2">
                  {trip.country && trip.country.length > 0 ? (
                    trip.country.map((cty, index) => (
                      <span
                        key={index}
                        className="trip-country-badge text-white border border-white"
                      >
                        {cty}
                      </span>
                    ))
                  ) : (
                    <span className="text-theme-secondary small"></span>
                  )}
                </div>


              
              </div>

       
              <ShowTripBoxMini
                userType={userType}
                id_user={userId}
                id_trip={id_trip}
                start_trip={trip.start_date}
              />

            </div>

            {/* ===== RIGHT SIDE ===== */}
            <div className="col-12 col-lg-5 mt-4 mt-lg-0" style={{ padding: '0px' }}>
              <div
                className="rightbox d-grid"
                style={{
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                }}
              >
                {[
                  { label: 'Plan', icon: <Map size={24} />, path: `/trip/${id_trip}/plan` },
                  { label: 'Wallet', icon: <Wallet size={24} />, path: `/trip/${id_trip}/wallet` },
                  { label: 'ตั๋ว/Pass', icon: <Ticket size={24} />, path: `/trip/${id_trip}/ticket` },
                  { label: 'Currency', icon: <CircleDollarSign size={24} />, path: `https://www.superrich1965.com/en/exchange-rate` },
                  { label: 'เอกสาร', icon: <FolderOpen size={24} />, path: `/trip/${id_trip}/files` },
                  { label: 'Link', icon: <Link size={24} />, path: `/trip/${id_trip}/link` },
                  { label: 'Immigration' , icon: <ShieldBan size={24}/>, path: `/trip/${id_trip}/immigration` },
                  { label: 'User', icon: <Users size={24} />, path: `/trip/${id_trip}/user` },
                  { label: 'ตั้งค่า', icon: <Settings size={24} />, path: `/trip/${id_trip}/edit` },
                ].map((btn, index) => (
                  <button
                    key={index}
                    className="btn fw-semibold d-flex flex-column align-items-center justify-content-center"
                    style={{
                      borderRadius: '16px',
                      padding: '18px 10px',
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(6px)',
                      transition: 'all 0.25s ease',
                    }}
                    onClick={() => router.push(btn.path)}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{btn.icon}</span>
                    <small style={{ fontSize: '0.85rem', marginTop: '4px' }}>{btn.label}</small>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===== Main Section Below ===== */}
      <div className="main container py-5">
        <div 
            className="richtexteditor" 
            dangerouslySetInnerHTML={{ __html: trip.detail }} 
        />
      </div>
    </div>
  );
}
