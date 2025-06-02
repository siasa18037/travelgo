'use client';

import { useTrip } from '@/components/TripContext';
import { useState, useEffect ,useMemo } from 'react';
import axios from 'axios';
import { Route ,PlaneTakeoff,PlaneLanding,Compass,Hamburger ,Hotel} from 'lucide-react';
import './edit.css'
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import { logoutUser } from "@/utils/logout";
import { useRouter , useParams} from "next/navigation";
import Loading from '@/components/Loading';
import Richtexteditor from '@/components/Richtexteditor'
import Link from "next/link";
import MapMultiMarker from '@/components/MapMultiMarker';
import { format, addDays, isBefore } from 'date-fns';
import SearchMap from '@/components/SearchMap'

export default function EditPlan() {
  const router = useRouter();
  const { userType, userId, id_trip } = useTrip();
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [plan, setPlan] = useState();
  const [trip, setTrip] = useState({
    name: '',
    start_date: '', 
    end_date: '', 
    country: [],
  });

  const locationList = [
    {
      lat: 13.7563,
      lng: 100.5018,
      address: "กรุงเทพมหานคร",
      location_name: "วัดพระแก้ว"
    },
    {
      lat: 13.7367,
      lng: 100.5231,
      address: "กรุงเทพมหานคร",
      location_name: "วัดอรุณ"
    },
    
  ];

  // formatThaiDate
  const formatThaiDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    return `${day} ${month} ${year}`;
  };

  // formatTime
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // 
  const options = useMemo(() => {
    if (!trip.start_date || !trip.end_date) return [];

    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const result = [];

    let current = start;
    while (current <= end) {
      result.push(format(current, 'dd/MM/yyyy'));
      current = addDays(current, 1);
    }

    return result;
  }, [trip.start_date, trip.end_date]);


  useEffect(() => {
    if(userType!="admin"){
      router.push(`/trip/${id_trip}`);
      return
    }
    fetch(`/api/trip/${userId}/${id_trip}`)
      .then(res => res.json())
      .then(data => {
        if (!data.message) {
          setTrip({
            name: data.name,
            start_date: data.start_date, 
            end_date: data.end_date, 
            country: data.country,
          });
          setPlan(data.plan)
        } else {
          showErrorToast(data.message)
          router.push(`/dashboard`);
          return
        }
        setLoadingTrips(false);
      });
  }, []);


  if (!userId || loadingTrips) return <Loading />;

  return (
    <main className='EditPlan container'>
      <div className="head-title d-flex justify-content-between align-items-center">
        <h4 className="mt-2 d-flex align-items-center mb-2">
          <Route size={24} className="me-2" />
          Edit Plan
        </h4>
        <div className="date-start-end align-items-center">
          <p className="d-flex align-items-center mb-2">
            <PlaneTakeoff size={20} className="me-2" />
            {formatThaiDate(trip.start_date)}
          </p>
          <p className="d-flex align-items-center mb-0">
            <PlaneLanding size={20} className="me-2" />
            {formatThaiDate(trip.end_date)}
          </p>
        </div>
      </div>
      <div className="row gap-3 flex-column flex-md-row">

        {/* left */}
        <div className="col">

          {/* start box*/}
          <div className="card my-3">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div className="caed-text d-flex align-items-center">
                <PlaneTakeoff size={20} className="me-2" />
                <p className='mb-0'>Start</p>
              </div>
              <div className="datetime">
                {formatThaiDate(trip.start_date)} - {formatTime(trip.start_date)}
              </div>
            </div>
          </div>

          {/* main section */}
          <div className="main-section mb-3">
            <div className="card ">
              <div className="card-header">
                <div className="titel d-flex align-items-center mb-2">
                  <h2 className='mb-0 me-2'>1</h2>
                  <input 
                    type="text" 
                    className="form-control border-0 border-bottom rounded-0 shadow-none fs-3" 
                    placeholder="ตั้งชื่อ" 
                    name="name"
                    style={{
                      background: 'transparent',
                    }}
                  />
                </div>
                <div className="input">
                  <div className="btn-group btn-group-toggle mb-2" data-toggle="buttons">
                    <label className="btn btn-secondary input-outline-dark d-flex align-items-center active bg-black ">
                      <input
                        type="radio"
                        name="options"
                        id="option1"
                        autoComplete="off"
                        defaultChecked
                        style={{ display: 'none' }}
                        value='Activities'
                      />
                      <Compass className='me-2' size={18}/>
                      Activities
                    </label>
                    <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                      <input
                        type="radio"
                        name="options"
                        id="option2"
                        autoComplete="off"
                        style={{ display: 'none' }}
                        value='eat'
                      />
                      <Hamburger className='me-2' size={18}/>
                      Eat
                    </label>
                    <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                      <input
                        type="radio"
                        name="options"
                        id="option3"
                        autoComplete="off"
                        style={{ display: 'none' }}
                        value='hotel'
                      />
                      <Hotel className='me-2' size={18}/>
                      Hotel
                    </label>
                  </div>
                  <div className="input-datetime row ">
                    <div className="col-md-6 d-flex flex-column flex-md-row align-items-md-center gap-2">
                      <span className="">Start</span>
                      <select className="form-select border-secondary flex-fill">
                        {options.map((date, index) => (
                          <option key={index}>{date}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        className="form-control border-secondary flex-fill"
                      />
                    </div>
                    <div className="col-md-6 d-flex flex-column flex-md-row align-items-md-center gap-2">
                      <span className="">End</span>
                      <select className="form-select border-secondary flex-fill">
                        {options.map((date, index) => (
                          <option key={index}>{date}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        className="form-control border-secondary flex-fill"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <SearchMap/>
              </div>
            </div>
          </div>

          {/* transport section */}
          {/* <div class="transport-section mb-3">
          </div> */}

          {/* end box*/}
          <div className="card mb-3">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div className="caed-text d-flex align-items-center">
                <PlaneLanding size={20} className="me-2" />
                <p className='mb-0'>End</p>
              </div>
              <div className="datetime">
                {formatThaiDate(trip.end_date)} - {formatTime(trip.end_date)}
              </div>
            </div>
          </div>

        </div>

        {/* right */}
        <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column pt-3">
          {/* <MapMultiMarker locations={locationList} /> */}
        </div>
      </div>

    </main>
  );
}
