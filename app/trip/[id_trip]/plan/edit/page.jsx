'use client';

import { useTrip } from '@/components/TripContext';
import { useState, useEffect ,useMemo } from 'react';
import axios from 'axios';
import { Route ,PlaneTakeoff,PlaneLanding,Compass,Hamburger ,Hotel ,Bus , CarFront , TrainFront , Plane ,Footprints,Bike ,CircleArrowUp,CircleArrowDown,MoveRight ,Plus} from 'lucide-react';
import './edit.css'
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import { useRouter , useParams} from "next/navigation";
import Loading from '@/components/Loading';
import Link from "next/link";
import MapMultiMarker from '@/components/MapMultiMarker';
import { format, addDays, isBefore } from 'date-fns';
import MapSearch from '@/components/MapSearch'
import { timezones } from '@/lib/timezone';

export default function EditPlan() {
  const router = useRouter();
  const { userType, userId, id_trip } = useTrip();
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [plan, setPlan] = useState([]);
  const [trip, setTrip] = useState({
    name: '',
    start_date: '', 
    end_date: '', 
    country: [],
  });
  let mainIndex = 0;

  const getDateObj = (input) => {
    if (typeof input === 'object' && input !== null && input.datetime) {
      return new Date(input.datetime);
    }
    return new Date(input);
  };

  const locationList = [];

  const handleLocation = (location, index) => {
    setPlan(prevPlan => {
      const newPlan = [...prevPlan];
      // อัปเดต location ใน data ของรายการปัจจุบัน
      newPlan[index].data.location = {
        name: location.name || '',
        lat: location.lat || '',
        lng: location.lng || '',
        address: location.address || ''
      };
      return newPlan;
    });
  };

  // formatThaiDate
  const formatThaiDate = (input) => {
    let date, timezone = "";

    if (typeof input === 'object' && input !== null && input.datetime) {
      date = new Date(input.datetime);
      timezone = input.timezone || "";
    } else {
      date = new Date(input);
    }

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
  const formatTime = (input) => {
    let datetime, timezone;

    if (typeof input === 'object' && input !== null && input.datetime) {
      datetime = input.datetime;
      timezone = input.timezone || 'Asia/Bangkok';
    } else {
      datetime = input;
      timezone = 'Asia/Bangkok';
    }

    const formatter = new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    });

    // หา country จาก timezone
    const matched = timezones.find(([country, tz]) => tz === timezone);
    const countryName = matched ? matched[0] : timezone;

    return `${formatter.format(new Date(datetime))} (${countryName})`;
  };

  // 
  const options = useMemo(() => {
  if (!trip.start_date || !trip.end_date) return [];

  const start = getDateObj(trip.start_date);
  const end = getDateObj(trip.end_date);
  const result = [];

  let current = new Date(start);
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
  
  const addMainSection = () => {
    const isFirst = plan.length === 0;
    const defaultTimezone = (() => {
      const tzMatch = timezones.find(([country]) => trip.country.includes(country));
      return tzMatch ? tzMatch[1] : Intl.DateTimeFormat().resolvedOptions().timeZone;
    })();

    const startDate = isFirst
      ? {
          datetime: trip.start_date?.datetime || new Date().toISOString(),
          timezone: trip.start_date?.timezone || defaultTimezone
        }
      : { datetime: '', timezone: defaultTimezone };

    setPlan((prev) => [
      ...prev,
      {
        type: 'Activities',
        name: '',
        start: startDate,
        end: { datetime: '', timezone: ''},
        data: {
          location: {
            name: '',
            lat: '',
            lng: '',
            address: ''
          }
        }
      }
    ]);
  };

  const addTransportSection = () => {
    if (plan.length === 0) {
      showErrorToast("กรุณาเพิ่มสถานที่หรือกิจกรรมเริ่มต้น");
      return;
    }

    const lastItem = plan[plan.length - 1];
    if (lastItem?.type === 'transport') {
      showErrorToast("ไม่สามารถเพิ่มการเดินทางซ้ำติดกันได้");
      return;
    }

    const defaultTimezone = (() => {
      const tzMatch = timezones.find(([country]) => trip.country.includes(country));
      return tzMatch ? tzMatch[1] : Intl.DateTimeFormat().resolvedOptions().timeZone;
    })();

    setPlan((prev) => [
      ...prev,
      {
        type: 'transport',
        name: '',
        transport_type: 'public_transport',
        start: { datetime: '', timezone: defaultTimezone },
        end: { datetime: '', timezone: '' },
        origin: {
          name: '',
          lat: '',
          lng: '',
          address: ''
        },
        destination: {
          name: '',
          lat: '',
          lng: '',
          address: ''
        }
      }
    ]);
  };

  // ฟังก์ชันupdateEndTimes
  const updateEndTimes = () => {
    setPlan(prevPlan => {
      const newPlan = [...prevPlan];
      
      // อัปเดตเวลา end ของแต่ละรายการให้เท่ากับ start ของรายการถัดไป
      for (let i = 0; i < newPlan.length - 1; i++) {
        newPlan[i].end = {
          datetime: newPlan[i + 1].start.datetime,
          timezone: newPlan[i + 1].start.timezone
        };
      }
      
      // สำหรับรายการสุดท้าย ให้ end เท่ากับ end_date ของทริป
      if (newPlan.length > 0) {
        newPlan[newPlan.length - 1].end = {
          datetime: trip.end_date?.datetime || trip.end_date,
          timezone: trip.end_date?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      }
      
      return newPlan;
    });
  };

  // useEffect(() => {
  //   updateEndTimes();
  // }, [plan.length, trip.end_date]);


  console.log(plan)

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

          {/* main plan */}
          {plan.map((item, index) => (
            <div key={index}>
            {(() => {
              if (item.type !== 'transport') {
                mainIndex++;
                return (
              // main-section
              <div className="main-section mb-3">
                <div className="card">
                  <div className="card-header bg-body-secondary">
                    <div className="titel d-flex align-items-center mb-2">
                      <h2 className='mb-0 me-2'>{mainIndex}</h2>
                      <input 
                        type="text" 
                        className="form-control border-0 border-bottom rounded-0 shadow-none fs-3" 
                        placeholder="ตั้งชื่อ" 
                        name="name"
                        // value={item.name}
                        style={{
                          background: 'transparent',
                        }}
                      />
                    </div>
                    <div className="row gx-3 gy-2 align-items-center">
                      <div className="col-md-auto">
                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.type === "Activities" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="Activities"
                              checked={item.type === "Activities"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].type = "Activities";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Compass className="me-2" size={18} />
                            Activities
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.type === "eat" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="Activities"
                              checked={item.type === "eat"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].type = "eat";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Hamburger className="me-2" size={18} />
                            Eat
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.type === "hotel" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="Activities"
                              checked={item.type === "hotel"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].type = "hotel";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Hotel className="me-2" size={18} />
                            Hotel
                          </label>
                        </div>
                      </div>

                      {/* ส่วนเลือกเวลา */}
                      <div className="col-md d-flex flex-wrap flex-md-nowrap align-items-center gap-2">
                        <span>Start</span>
                        <select
                          className="form-select border-secondary flex-fill"
                          value={
                            index === 0
                              ? format(new Date(trip.start_date?.datetime || trip.start_date), 'dd/MM/yyyy')
                              : item.start?.datetime
                                ? format(new Date(item.start.datetime), 'dd/MM/yyyy')
                                : ''
                          }
                          disabled={index === 0}
                          onChange={(e) => {
                            if (index === 0) return;
                            const selectedDate = e.target.value;
                            const newPlan = [...plan];

                            const currentStart = newPlan[index].start?.datetime
                              ? new Date(newPlan[index].start.datetime)
                              : new Date(options[0].split('/').reverse().join('-'));

                            const timePart = format(currentStart, 'HH:mm');
                            const datePart = selectedDate.split('/').reverse().join('-');

                            newPlan[index].start = {
                              datetime: new Date(`${datePart}T${timePart}`).toISOString(),
                              timezone: newPlan[index].start?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
                            };

                            setPlan(newPlan);
                            // updateEndTimes()
                          }}
                        >
                          {options
                            .filter(dateStr => {
                              if (index === 0) return true;
                              const prevItem = plan[index - 1];
                              const prevDate = new Date(prevItem?.end?.datetime || prevItem?.start?.datetime);
                              const currentDate = new Date(dateStr.split('/').reverse().join('-'));
                              return currentDate >= new Date(prevDate.toDateString());
                            })
                            .map((date, idx) => (
                              <option key={idx}>{date}</option>
                            ))}
                        </select>

                        <input
                          type="time"
                          className="form-control border-secondary flex-fill"
                          value={
                            index === 0
                              ? format(new Date(trip.start_date?.datetime || trip.start_date), 'HH:mm')
                              : item.start?.datetime
                                ? format(new Date(item.start.datetime), 'HH:mm')
                                : ''
                          }
                          disabled={index === 0}
                          onChange={(e) => {
                            if (index === 0) return;
                            const selectedTime = e.target.value;
                            const newPlan = [...plan];

                            const currentStart = newPlan[index].start?.datetime
                              ? new Date(newPlan[index].start.datetime)
                              : new Date(options[0].split('/').reverse().join('-'));

                            const dateStr = format(currentStart, 'yyyy-MM-dd');
                            const newDatetime = new Date(`${dateStr}T${selectedTime}`).toISOString();

                            const currentTimezone = newPlan[index].start?.timezone;

                            if (index > 0) {
                              const prevEnd = new Date(plan[index - 1]?.end?.datetime || plan[index - 1]?.start?.datetime);
                              const current = new Date(newDatetime);
                              if (current <= prevEnd) {
                                showErrorToast("เวลาต้องมากกว่ารายการก่อนหน้า");
                                return;
                              }
                            }

                            newPlan[index].start = {
                              datetime: newDatetime,
                              timezone: currentTimezone 
                            };

                            setPlan(newPlan);
                            // updateEndTimes()
                          }}
                        />

                        <select
                          disabled={index === 0}
                          className="form-select input-outline-dark"
                          value={item.start?.timezone || ''}
                          onChange={(e) => {
                            const newTimezone = e.target.value;
                            const newPlan = [...plan];
                            const current = newPlan[index].start;

                            if (!current?.datetime) return;

                            // สร้าง formatter สำหรับ timezone เดิม
                            const originalFormatter = new Intl.DateTimeFormat('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                              timeZone: current.timezone
                            });
                            
                            // ดึงชั่วโมงและนาทีในเวลาท้องถิ่นเดิม
                            const originalTime = originalFormatter.format(new Date(current.datetime));
                            const [hours, minutes] = originalTime.split(':').map(Number);

                            // แปลง date เป็น string ใน timezone ใหม่ โดยใช้วันที่เดิม + เวลาเดิม
                            const localDate = format(new Date(current.datetime), 'yyyy-MM-dd');
                            const newDatetime = new Date(`${localDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`).toISOString();

                            newPlan[index].start = {
                              datetime: newDatetime,
                              timezone: newTimezone,
                            };

                            setPlan(newPlan);
                            // updateEndTimes()
                          }}
                        >
                          {timezones
                            .filter(([country]) => trip.country.includes(country))
                            .map(([country, tz]) => (
                              <option key={tz} value={tz}>
                                {country}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                  </div>
                  <div className="card-body bg-body-secondary">
                      <MapSearch 
                        SelectLocation={(location) => handleLocation(location, index)} 
                        value={item.data.location} 
                      />
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
              );
              } else {
                return (
              // transport-section
              <div className="transport-section mb-3 ">
                <div className="card ">
                  <div className="card-header bg-info-subtle">
                    <div className="row gx-3 gy-2 align-items-center">
                      <div className="col-md-auto">
                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.transport_type === "public_transport" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.transport_type === "public_transport"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].transport_type = "public_transport";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Bus size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.transport_type === "car" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.transport_type === "car"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].transport_type = "car";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <CarFront size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.transport_type === "plane" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.transport_type === "plane"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].transport_type = "plane";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Plane size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.transport_type === "train" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.transport_type === "train"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].transport_type = "train";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <TrainFront size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.transport_type === "walking" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.transport_type === "walking"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].transport_type = "walking";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Footprints size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.transport_type === "bicycle" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.transport_type === "bicycle"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].transport_type = "bicycle";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Bike size={18} />
                          </label>
                        </div>
                      </div>

                      {/* ส่วนเลือกเวลา */}
                      <div className="col-md d-flex flex-wrap flex-md-nowrap align-items-center gap-2">
                        <span>Start</span>
                        <select
                          className="form-select border-secondary flex-fill"
                          value={item.start?.datetime ? format(new Date(item.start.datetime), 'dd/MM/yyyy') : ''}
                          onChange={(e) => {
                            const selectedDate = e.target.value;
                            const newPlan = [...plan];
                            const currentStart = newPlan[index].start?.datetime
                              ? new Date(newPlan[index].start.datetime)
                              : new Date(options[0].split('/').reverse().join('-'));

                            const timePart = format(currentStart, 'HH:mm');
                            const datePart = selectedDate.split('/').reverse().join('-');

                            newPlan[index].start = {
                              datetime: new Date(`${datePart}T${timePart}`).toISOString(),
                              timezone: newPlan[index].start?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
                            };

                            setPlan(newPlan);
                            // updateEndTimes()
                          }}
                        >
                          {options
                            .filter(dateStr => {
                              if (index === 0) return true;
                              const prevItem = plan[index - 1];
                              const prevDate = new Date(prevItem?.end?.datetime || prevItem?.start?.datetime);
                              const currentDate = new Date(dateStr.split('/').reverse().join('-'));
                              return currentDate >= new Date(prevDate.toDateString());
                            })
                            .map((date, idx) => (
                              <option key={idx}>{date}</option>
                            ))}
                        </select>

                        <input
                          type="time"
                          className="form-control border-secondary flex-fill"
                          value={item.start?.datetime ? format(new Date(item.start.datetime), 'HH:mm') : ''}
                          onChange={(e) => {
                            const selectedTime = e.target.value;
                            const newPlan = [...plan];

                            const currentStart = newPlan[index].start?.datetime
                              ? new Date(newPlan[index].start.datetime)
                              : new Date(options[0].split('/').reverse().join('-'));

                            const dateStr = format(currentStart, 'yyyy-MM-dd');
                            const newDatetime = new Date(`${dateStr}T${selectedTime}`).toISOString();

                            // ตรวจสอบไม่ให้เวลาย้อนกลับ
                            if (index > 0) {
                              const prevEnd = new Date(plan[index - 1]?.end?.datetime || plan[index - 1]?.start?.datetime);
                              const current = new Date(newDatetime);
                              if (current <= prevEnd) {
                                showErrorToast("เวลาต้องมากกว่ารายการก่อนหน้า");
                                return;
                              }
                            }

                            newPlan[index].start = {
                              datetime: newDatetime,
                              timezone: newPlan[index].start?.timezone 
                            };

                            setPlan(newPlan);
                            // updateEndTimes()
                          }}
                        />

                        <select
                          className="form-select input-outline-dark"
                          value={item.start?.timezone || ''}
                          onChange={(e) => {
                            const newTimezone = e.target.value;
                            const newPlan = [...plan];
                            const current = newPlan[index].start;

                            if (!current?.datetime) return;

                            // สร้าง formatter สำหรับ timezone เดิม
                            const originalFormatter = new Intl.DateTimeFormat('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                              timeZone: current.timezone
                            });
                            
                            // ดึงชั่วโมงและนาทีในเวลาท้องถิ่นเดิม
                            const originalTime = originalFormatter.format(new Date(current.datetime));
                            const [hours, minutes] = originalTime.split(':').map(Number);

                            // แปลง date เป็น string ใน timezone ใหม่ โดยใช้วันที่เดิม + เวลาเดิม
                            const localDate = format(new Date(current.datetime), 'yyyy-MM-dd');
                            const newDatetime = new Date(`${localDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`).toISOString();

                            newPlan[index].start = {
                              datetime: newDatetime,
                              timezone: newTimezone,
                            };

                            // ทำเช่นเดียวกันกับ end time ถ้ามี
                            if (newPlan[index].end?.datetime) {
                              const endFormatter = new Intl.DateTimeFormat('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: newPlan[index].end.timezone
                              });
                              
                              const endTime = endFormatter.format(new Date(newPlan[index].end.datetime));
                              const [endHours, endMinutes] = endTime.split(':').map(Number);
                              
                              const endDate = format(new Date(newPlan[index].end.datetime), 'yyyy-MM-dd');
                              newPlan[index].end = {
                                datetime: new Date(`${endDate}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`).toISOString(),
                                timezone: newTimezone
                              };
                            }

                            setPlan(newPlan);
                            // updateEndTimes()
                          }}
                        >
                          {timezones
                            .filter(([country]) => trip.country.includes(country))
                            .map(([country, tz]) => (
                              <option key={tz} value={tz}>
                                {country}
                              </option>
                            ))}
                        </select>
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
              );
              }
            })()}
            </div>
          ))}

          {/* Add button */}
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <button onClick={addMainSection} className="btn d-flex align-items-center btn-outline-dark">
                <Plus className='me-1' size={20} />
                เพิ่มสถานที่ กิจกรรม
              </button>
              <button onClick={addTransportSection} className="btn d-flex align-items-center btn-outline-dark">
                <Plus className='me-1' size={20} />
                เพิ่มการเดินทาง
              </button>
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

          <button onClick={updateEndTimes}>update</button>

        </div>

        {/* right */}
        <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column pt-3">
          {/* <MapMultiMarker locations={locationList} /> */}
        </div>
      </div>

    </main>
  );
} 
