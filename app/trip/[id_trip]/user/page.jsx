'use client';
/* global bootstrap */

import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorToast } from '@/lib/swal';
import { useTrip } from '@/components/TripContext';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function UserPage() {
  const { userType, userId, id_trip } = useTrip();
  const [isLoading, setIsLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [users, setUsers] = useState([]);

  // ✅ โหลดข้อมูลทริป
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`/api/trip/${userId}/${id_trip}?mode=some`);
        setTrip(res.data);
        console.log("Trip Data:", res.data);
      } catch (error) {
        console.error(error);
        showErrorToast('ไม่สามารถโหลดข้อมูลทริปได้');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
  }, [userId, id_trip]);

  // ✅ โหลดข้อมูลผู้ใช้ทั้งหมด
  useEffect(() => {
    axios
      .get("/api/user")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("โหลดข้อมูลผู้ใช้ล้มเหลว", err));
  }, []);

  if (isLoading || !trip) {
    return (
      <div className="text-center p-5 text-muted small">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  const formatDate = (dateStr) =>
    format(new Date(dateStr), "d MMM yyyy", { locale: th });

  // ✅ กรองเฉพาะ user ที่ id_user ใน trip.user ตรงกับ _id ของ users
  const tripUsers = users
    .map((u) => {
      const match = trip.user?.find((tu) => tu.id_user === u._id);
      return match ? { ...u, roleType: match.type } : null;
    })
    .filter(Boolean);

  return (
    <div
      className="headbox d-flex align-items-center text-dark"
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundImage: `url(${trip.profile_image || '/default-trip.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
      ></div>

      {/* content */}
      <div
        className="trip-content container position-relative text-white"
        style={{
          zIndex: 2,
        }}
      >
        {/* Header */}
        <div className="text-center mb-5 mt-5">
          <h1 className="fw-bold display-5 text-shadow">{trip.name}</h1>
          <p className="lead text-light opacity-75">{trip.description}</p>

          {/* รายละเอียดทริป */}
          <div className="d-flex justify-content-center gap-4 mt-3 flex-wrap fs-6">
            <div className="d-flex align-items-center gap-2">
              <MapPin size={20} /> {trip.country.join(', ')}
            </div>
            <div className="d-flex align-items-center gap-2">
              <Calendar size={20} />
              {formatDate(trip.start_date.datetime)} - {formatDate(trip.end_date.datetime)}
            </div>
            <div className="d-flex align-items-center gap-2">
              <Users size={20} /> {tripUsers.length} ผู้ร่วมทริป
            </div>
          </div>
        </div>

        {/* รายชื่อผู้ร่วมทริป */}
        <div className="row justify-content-center">
          {tripUsers.length > 0 ? (
            tripUsers.map((u) => (
              <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={u._id}>
                <div
                  className="card h-100 text-center border-0 shadow-lg rounded-4 position-relative user-card"
                  style={{
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                  }}
                >
                  {/* แถบด้านบน */}
                  <div
                    className="p-3"
                    style={{
                      background:
                        u.roleType === 'admin'
                          ? 'linear-gradient(135deg, #f7c948, #ffbb00)'
                          : 'linear-gradient(135deg, #00c6ff, #0072ff)',
                      height: '120px',
                    }}
                  ></div>

                  {/* Avatar */}
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="rounded-circle shadow position-relative mx-auto"
                    style={{
                      width: '90px',
                      height: '90px',
                      objectFit: 'cover',
                      marginTop: '-45px',
                      border: '3px solid white',
                    }}
                  />

                  <div className="card-body pb-4">
                    <h5 className="fw-bold mb-1 text-white">{u.name}</h5>
                    <p className="text-light small opacity-75 mb-2">{u.email}</p>

                    {/* badge แสดง role */}
                    {u.roleType === 'admin' ? (
                      <span className="badge bg-warning text-dark mb-2 px-3 py-2 shadow-sm">
                        ผู้ดูแลทริป (Admin)
                      </span>
                    ) : (
                      <span className="badge bg-info text-dark mb-2 px-3 py-2 shadow-sm">
                        ผู้ร่วมเดินทาง
                      </span>
                    )}

                  
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-light py-5">
              ยังไม่มีผู้ร่วมทริปในตอนนี้
            </div>
          )}
        </div>
      </div>

      {/* custom css */}
      <style jsx>{`
        .text-shadow {
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        .user-card:hover {
          transform: translateY(-6px);
          transition: all 0.3s ease-in-out;
          box-shadow: 0 10px 20px rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}
