'use client';

import { useRouter } from 'next/navigation';
import { CalendarDays, Users, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import { logoutUser } from "@/utils/logout";
import './dashboard.css'

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [triplist, setTriplist] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [autoRedirect, setAutoRedirect] = useState(false); // ✅ ตัวเปิด/ปิด auto redirect
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setUser(data.user);
          setLoadingTrips(true);
          fetch(`/api/trip/${data.user.userId}`)
            .then(res => res.json())
            .then(trip_list => {
              if (!trip_list.error) {
                setTriplist(trip_list);
              } else {
                logoutUser();
              }
              setLoadingTrips(false);
            });
        } else {
          logoutUser();
        }
      });
  }, []);

  // ✅ Redirect ถ้ามี trip เดียวและเปิด autoRedirect
  useEffect(() => {
    if (!loadingTrips && autoRedirect && triplist.length === 1) {
      router.push(`/trip/${triplist[0]._id}`);
    }
  }, [loadingTrips, triplist, autoRedirect, router]);

  if (!user || loadingTrips) return <Loading />;

  const formatThaiDate = (dateObj) => {
    const date = new Date(dateObj?.datetime);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
  };

  return (
    <main>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2 className="fw-bold mb-1">สวัสดี {user?.name} 🥰</h2>
            <p className="text-muted mb-0">พร้อมจะสร้างความทรงจำใหม่ยัง?</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            {/* ✅ ปุ่มเปิด/ปิด autoRedirect */}
            {/* <button
              onClick={() => setAutoRedirect(!autoRedirect)}
              className={`btn ${autoRedirect ? 'btn-outline-danger' : 'btn-outline-success'}`}
            >
              {autoRedirect ? 'ปิด Auto Redirect' : 'เปิด Auto Redirect'}
            </button> */}

            <button
              onClick={() => router.push('/trip/create')}
              className="btn custom-dark-hover d-flex align-items-center"
            >
              <PlusCircle className="me-2" size={18} />
              สร้างทริปใหม่
            </button>
          </div>
        </div>
      </div>

      <div className="container py-2">
        {Array.isArray(triplist) && triplist.length > 0 ? (
          <div className="row g-4">
            {triplist.map((trip) => (
              <div
                key={trip._id}
                className="col-12 col-md-6 col-lg-4"
                onClick={() => router.push(`/trip/${trip._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card h-100 shadow border-0">
                  <div className="position-relative">
                    <img
                      src={trip.profile_image}
                      className="card-img-top"
                      style={{ height: '200px', objectFit: 'cover' }}
                      alt={trip.name}
                    />
                    <p
                      className={`position-absolute top-0 end-0 m-2 card-text small align-items-center rounded px-2 py-1 ${getTripStatusStyle(trip.status)}`}
                    >
                      {getTripStatusMessage(trip.status)}
                    </p>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-semibold">{trip.name}</h5>
                    <p className="card-text text-muted mb-1 d-flex align-items-center">
                      <CalendarDays size={16} className="me-2" />
                      {formatThaiDate(trip.start_date)} - {formatThaiDate(trip.end_date)}
                    </p>
                    <p className="card-text text-secondary mb-1 d-flex align-items-center">
                      <Users size={16} className="me-2" />
                      สมาชิก {trip.user.length} คน
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">ไม่พบทริป</p>
        )}
      </div>
    </main>
  );
}
