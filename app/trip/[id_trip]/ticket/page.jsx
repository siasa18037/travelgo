'use client';

import { useTrip } from '@/components/TripContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';
import {Ticket ,PlusCircle,MapPin} from 'lucide-react';
import './ticket.css'

export default function TicketPage() {
  const router = useRouter();
  const { userType, userId, id_trip } = useTrip();
  const [mode, setMode] = useState('trip'); // public ,trip ,me
  const [ticketList, setTicketList] = useState([]); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url;
        if (mode == 'trip') {
          url = `/api/trip/${userId}/${id_trip}/ticket_pass`;
        } else if (mode == 'me') {
          url = `/api/trip/${userId}/${id_trip}/ticket_pass?user=1`;
        } else {
          url = `/api/ticket_pass`;
        }

        const response = await axios.get(url);
        setTicketList(response.data || []);
      } catch (error) {
        showErrorToast("ดึงข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, id_trip, mode]);

  
  const getItemStatusTag = (type) => {
    if (type == 'public') return 'bg-secondary-subtle text-secondary-emphasis border border-secondary';
    if (type == 'private') return 'bg-success-subtle text-success-emphasis border border-success';
    return 'bg-warning-subtle text-warning-emphasis border border-warning';
  };

  const getItemStatusTagString = (type) => {
    if (type == 'public') return 'สาธารณะ';
    if (type == 'private') return 'ทิปนี้';
    return 'เฉพาะคุณ';
  };


  return (
    <div className="container mb-4">
      {/* head */}
      <div className="py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h3 className="fw-bold mb-1 d-flex align-items-center gap-2"><Ticket size={28}/>Ticket</h3>
              <p className="text-muted mb-0">ตั๋วของคุณพร้อมแล้วรึยัง?</p>
            </div>
            <button
              onClick={() => router.push(`/trip/${id_trip}/ticket/create`)}
              className="btn custom-dark-hover d-flex align-items-center mt-2 mt-md-0"
            >
              <PlusCircle className="me-2" size={18} />
              เพิ่มตั๋วใหม่
            </button>
          </div>
      </div>
      {/* select mode */}
      <div className="pb-3 d-flex gap-2">
        <button
          onClick={() => setMode('trip')}
          className={`btn input-outline-dark d-flex align-items-center ${mode == 'trip' && 'active'}`}
        >
          ทิปนี้
        </button>
        <button
          onClick={() => setMode('me')}
          className={`btn input-outline-dark d-flex align-items-center ${mode == 'me' && 'active'}`}
        >
          เฉพาะคุณ
        </button>
        <button
          onClick={() => setMode('public')}
          className={`btn input-outline-dark d-flex align-items-center ${mode == 'public' && 'active'}`}
        >
          ทั้งหมด
        </button>
      </div>
      {/* List */}
      {loading ? (
        <Loading />
      ) : (
        <div className="row g-4">
          {ticketList.length === 0 ? (
            <div className="text-muted text-center">ไม่พบตั๋วในหมวดหมู่นี้</div>
          ) : (
            ticketList.map((ticket) => (
              <div
                key={ticket._id}
                className="col-12 col-md-6 col-lg-4"
                onClick={() => router.push(`/trip/${id_trip}/ticket/${ticket._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card h-100 shadow border-0">
                  <div className="position-relative">
                    <img
                      src={ticket.img}
                      className="card-img-top"
                      alt={ticket.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <p
                      className={`position-absolute top-0 end-0 m-2 card-text small align-items-center rounded px-2 py-1 ${getItemStatusTag(ticket.type)}`}
                    >{getItemStatusTagString(ticket.type)}</p>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-semibold">{ticket.name}</h5>
                    <p className="card-text text-secondary mb-0 d-flex align-items-center">
                      <MapPin className='me-1' size={18}/> {ticket.location_use}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}


    </div>
  );
}
