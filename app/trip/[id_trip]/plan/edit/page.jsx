'use client';

import { useTrip } from '@/components/TripContext';
import { useState, useEffect ,useMemo } from 'react';
import axios from 'axios';
import { Route ,PlaneTakeoff,PlaneLanding,Compass,Hamburger ,Hotel ,Bus , CarFront , TrainFront , Plane ,Footprints,Bike ,CircleArrowUp,CircleArrowDown,MoveRight} from 'lucide-react';
import './edit.css'
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import { logoutUser } from "@/utils/logout";
import { useRouter , useParams} from "next/navigation";
import Loading from '@/components/Loading';
import Richtexteditor from '@/components/Richtexteditor'
import Link from "next/link";
import MapMultiMarker from '@/components/MapMultiMarker';
import { format, addDays, isBefore } from 'date-fns';
import MapSearch from '@/components/MapSearch'

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
      lat: 17.4042207,
      lng: 102.8053644,
      address: "ซอยแสงภากรณ์, 10520, Lat Krabang, Bangkok, Thailand",
      location_name: "ซอยแสงภากรณ์"
    },
    {
      lat: 17.387112,
      lng: 102.7755279,
      address: "กรุงเทพมหานคร",
      location_name: "วัดอรุณ"
    },
    
  ];

  const handleLocation = (location) => {
    console.log("ตำแหน่งที่ได้รับ:", location);
    // location = { name, lat, lng, address }
    // คุณสามารถบันทึก state ได้ตรงนี้
  };

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

          {/* main section 1*/}
          <div className="main-section mb-3">
            <div className="card">
              <div className="card-header bg-body-secondary">
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
                <div className="row gx-3 gy-2 align-items-center">
                  <div className="col-md-auto">
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center active bg-black">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          defaultChecked
                          style={{ display: 'none' }}
                          value="Activities"
                        />
                        <Compass className="me-2" size={18} />
                        Activities
                      </label>
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          style={{ display: 'none' }}
                          value="eat"
                        />
                        <Hamburger className="me-2" size={18} />
                        Eat
                      </label>
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          style={{ display: 'none' }}
                          value="hotel"
                        />
                        <Hotel className="me-2" size={18} />
                        Hotel
                      </label>
                    </div>
                  </div>

                  {/* ส่วนเลือกเวลา */}
                  <div className="col-md d-flex flex-wrap flex-md-nowrap align-items-center gap-2">
                    <span >Start</span>
                    <select className="form-select border-secondary flex-fill">
                      {options.map((date, index) => (
                        <option key={index}>{date}</option>
                      ))}
                    </select>
                    <input type="time" className="form-control border-secondary flex-fill" />
                  </div>
                </div>

              </div>
              <div className="card-body bg-body-secondary">
                  <MapSearch SelectLocation={handleLocation} />
              </div>
              <div className="card-header d-flex align-items-center justify-content-between border-0 bg-body-secondary">
                <div className="status">
                  {/* ว่างไว้ */}
                </div>
                <div className="left d-flex align-items-center gap-2">
                  <Link className="btn d-flex align-items-center btn-outline-dark" href={`/trip/${id_trip}/plan/map`}>
                    ดูตำเเหน่ง
                  </Link>
                  <button className="btn d-flex align-items-center btn-outline-dark" >
                    ตั้งค่าเพิ่มเติม
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* transport section */}
          <div className="transport-section mb-3 ">
            <div className="card ">
              <div className="card-header bg-info-subtle">
                <div className="row gx-3 gy-2 align-items-center">
                  <div className="col-md-auto">
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center active bg-black">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          defaultChecked
                          style={{ display: 'none' }}
                          value="public_transport"
                        />
                        <Bus size={18} />
                      </label>
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          style={{ display: 'none' }}
                          value="car"
                        />
                        <CarFront size={18} />
                      </label>
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          style={{ display: 'none' }}
                          value="plane"
                        />
                        <Plane size={18} />
                      </label>
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          style={{ display: 'none' }}
                          value="train"
                        />
                        <TrainFront size={18} />
          
                      </label>
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          style={{ display: 'none' }}
                          value="walking"
                        />
                        <Footprints size={18} />
                      </label>
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          style={{ display: 'none' }}
                          value="bicycle"
                        />
                        <Bike size={18} />
                      </label>
                    </div>
                  </div>

                  {/* ส่วนเลือกเวลา */}
                  <div className="col-md d-flex flex-wrap flex-md-nowrap align-items-center gap-2">
                    <span >Start</span>
                    <select className="form-select border-secondary flex-fill">
                      {options.map((date, index) => (
                        <option key={index}>{date}</option>
                      ))}
                    </select>
                    <input type="time" className="form-control border-secondary flex-fill" />
                  </div>
                </div>

              </div>
              <div className="card-body border-0 bg-info-subtle">
                <div className="row align-items-center gx-3 gy-2">
                  {/* Route Information */}
                  <div className="col-12 col-md d-flex align-items-center flex-wrap">
                    <p className="mb-0">พิพิธภัณฑสถานแห่งชาติโตเกียว</p>
                    <MoveRight className="mx-3" size={25} />
                    <p className="mb-0">ศาลเจ้าฮาคุซัน</p>
                  </div>
                  {/* Buttons */}
                  <div className="col-12 col-md-auto d-flex justify-content-md-end gap-2">
                    <Link
                      className="btn d-flex align-items-center btn-outline-dark"
                      href={`/trip/${id_trip}/plan/map`}
                    >
                      ดูเส้นทาง
                    </Link>
                    <button className="btn d-flex align-items-center btn-outline-dark">
                      ตั้งค่าเพิ่มเติม
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* main section 2*/}
          <div className="main-section mb-3">
            <div className="card">
              <div className="card-header bg-body-secondary">
                <div className="titel d-flex align-items-center mb-2">
                  <h2 className='mb-0 me-2'>2</h2>
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
                <div className="row gx-3 gy-2 align-items-center">
                  <div className="col-md-auto">
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center active bg-black">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          defaultChecked
                          style={{ display: 'none' }}
                          value="Activities"
                        />
                        <Compass className="me-2" size={18} />
                        Activities
                      </label>
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          style={{ display: 'none' }}
                          value="eat"
                        />
                        <Hamburger className="me-2" size={18} />
                        Eat
                      </label>
                      <label className="btn btn-secondary input-outline-dark d-flex align-items-center">
                        <input
                          type="radio"
                          name="options"
                          autoComplete="off"
                          style={{ display: 'none' }}
                          value="hotel"
                        />
                        <Hotel className="me-2" size={18} />
                        Hotel
                      </label>
                    </div>
                  </div>

                  {/* ส่วนเลือกเวลา */}
                  <div className="col-md d-flex flex-wrap flex-md-nowrap align-items-center gap-2">
                    <span >Start</span>
                    <select className="form-select border-secondary flex-fill">
                      {options.map((date, index) => (
                        <option key={index}>{date}</option>
                      ))}
                    </select>
                    <input type="time" className="form-control border-secondary flex-fill" />
                  </div>
                </div>

              </div>
              <div className="card-body bg-body-secondary">
                  <MapSearch SelectLocation={handleLocation} />
              </div>
              <div className="card-header d-flex align-items-center justify-content-between border-0 bg-body-secondary">
                <div className="status">
                  {/* ว่างไว้ */}
                </div>
                <div className="left d-flex align-items-center gap-2">
                  <Link className="btn d-flex align-items-center btn-outline-dark" href={`/trip/${id_trip}/plan/map`}>
                    ดูตำเเหน่ง
                  </Link>
                  <button className="btn d-flex align-items-center btn-outline-dark" >
                    ตั้งค่าเพิ่มเติม
                  </button>
                </div>
              </div>
            </div>
          </div>

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
