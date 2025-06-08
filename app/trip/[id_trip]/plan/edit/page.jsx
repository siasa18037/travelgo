'use client';

import { useTrip } from '@/components/TripContext';
import { useState, useEffect ,useMemo } from 'react';
import axios from 'axios';
import { Route ,PlaneTakeoff,PlaneLanding,Compass,Hamburger ,Hotel ,Bus , CarFront , TrainFront , Plane ,Footprints,Bike ,CircleArrowUp,CircleArrowDown,MoveRight ,Plus ,ClockAlert} from 'lucide-react';
import './edit.css'
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import { useRouter , useParams} from "next/navigation";
import Loading from '@/components/Loading';
import Link from "next/link";
import MapMultiMarker from '@/components/MapMultiMarker';
import { parse, format, addDays } from 'date-fns';
import MapSearch from '@/components/MapSearch'
import { timezones } from '@/lib/timezone';
import { zonedTimeToUtc ,utcToZonedTime } from 'date-fns-tz';
import { getLocalDateString, getLocalTimeString } from '@/utils/dateLocal';
import MapShare from '@/components/MapShare'


export default function EditPlan() {
  const router = useRouter();
  const { userType, userId, id_trip } = useTrip();
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [plan, setPlan] = useState([]);
  const [mapSharedata,setMapSharedata] = useState();
  const [mapShareBox , setMapShareBox] = useState(false); 
  const [mapShareType,setMapShareType] = useState();
  const [trip, setTrip] = useState({
    name: '',
    start_date: '', 
    end_date: '', 
    country: [],
    updatedAt :''
  });
  let mainIndex = 0;

  const getDateObj = (input) => {
    if (typeof input === 'object' && input !== null && input.datetime) {
      return new Date(input.datetime);
    }
    return new Date(input);
  };

  const updateLocationMap = () => {
    const list = plan
      .filter(item => item.type !== 'transport')
      .map(item => ({
        location_name: item.data?.location?.name || '',
        lat: item.data?.location?.lat || '',
        lng: item.data?.location?.lng || '',
        address: item.data?.location?.address || '',
      }));
    setLocationList(list);
  };
  

  // หา fallback timezone ตัวแรกของประเทศที่เลือก
  const availableTimezones = timezones.filter(([country]) => trip.country.includes(country));
  const fallbackTimezone = availableTimezones[0]?.[1] || 'UTC';


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
    updateLocation();
    updateLocationMap();
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
            updatedAt: data.updatedAt,
          });
          setPlan(data.plan);
        } else {
          showErrorToast(data.message);
          router.push(`/dashboard`);
          return
        }
        setLoadingTrips(false);
      });
  }, []);

  const formatDateTimeWithZone = (date, time, timezone) => {
  const datePart = format(date, 'yyyy-MM-dd');
  const dateTimeLocal = new Date(`${datePart}T${time}:00`);
  const utcDate = zonedTimeToUtc(dateTimeLocal, timezone);

  return {
    datetime: utcDate.toISOString(),
    timezone
  };
};

  const parseDateTimeWithZone = ({ datetime, timezone }) => {
    const utcDate = new Date(datetime);
    // แปลงเวลาตาม timezone ที่กำหนด
    const dateStr = format(utcDate, 'yyyy-MM-dd', { timeZone: timezone });
    const timeStr = format(utcDate, 'HH:mm', { timeZone: timezone });
    return {
      date: dateStr,
      time: timeStr,
      timezone
    };
  };
  
  const addMainSection = () => {
  const isFirst = plan.length === 0;

  let startDate;

  if (isFirst) {
    startDate = trip.start_date;
  } else {
    const lastItem = plan[plan.length - 1];
    startDate = lastItem.start && lastItem.start.datetime
    ? lastItem.start
    : lastItem.end;
  }

  setPlan((prev) => [
    ...prev,
    {
      type: 'Activities',
      name: '',
      start: startDate,
      end: '',
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

  const startDate = lastItem.start && lastItem.start.datetime
    ? lastItem.start
    : lastItem.end;

  setPlan((prev) => [
    ...prev,
    {
      type: 'transport',
      name: '',
      data:{
        transport_type: 'public_transport',
      },
      start: startDate,
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
  updateLocation();
  };

  // ฟังก์ชันupdateEndTimes
  const updateEndTimes = () => {
    setPlan(prevPlan => {
      const newPlan = [...prevPlan];
      
      for (let i = 0; i < newPlan.length - 1; i++) {
        if (newPlan[i + 1].start?.datetime) {
          newPlan[i].end = {
            datetime: newPlan[i + 1].start.datetime,
            timezone: newPlan[i + 1].start.timezone
          };
        }
      }
      
      if (newPlan.length > 0) {
        const lastItem = newPlan[newPlan.length - 1];
        if (trip.end_date?.datetime) {
          newPlan[newPlan.length - 1].end = {
            datetime: trip.end_date.datetime,
            timezone: trip.end_date.timezone || lastItem.start.timezone
          };
        }
      }
      return newPlan;
    });
  };

  // ฟังก์ชันupdateLocation
  // const updateLocation = () => {
  //   setPlan(prevPlan => {
  //     return prevPlan.map((item, idx) => {
  //       if (item.type === 'transport') {
  //         // ดึงข้อมูลจากรายการก่อนหน้า (origin)
  //         const prevItem = prevPlan[idx - 1];
  //         const origin = prevItem?.data?.location || {
  //           name: '',
  //           lat: '',
  //           lng: '',
  //           address: ''
  //         };

  //         // ดึงข้อมูลจากรายการถัดไป (destination)
  //         const nextItem = prevPlan[idx + 1];
  //         const destination = nextItem?.data?.location || {
  //           name: '',
  //           lat: '',
  //           lng: '',
  //           address: ''
  //         };

  //         return {
  //           ...item,
  //           origin,
  //           destination,
  //         };
  //       }
  //       return item;
  //     });
  //   });

  //   console.log('updateLocation' , plan)
  // }
  const updateLocation = () => {
    setPlan(prevPlan => {
      return prevPlan.map((item, idx) => {
        if (item.type === 'transport') {
          const prevItem = prevPlan[idx - 1];
          const nextItem = prevPlan[idx + 1];
          
          return {
            ...item,
            origin: prevItem?.data?.location || {
              name: '',
              lat: '',
              lng: '',
              address: ''
            },
            destination: nextItem?.data?.location || {
              name: '',
              lat: '',
              lng: '',
              address: ''
            }
          };
        }
        return item;
      });
    });
  };

  // Name
  const truncateName = (name) => {
    if (!name) return 'ไม่มีข้อมูล';
    return name.length > 30 ? `${name.substring(0, 30)}...` : name;
  };

  const validateTimeSequence = (plan) => {
    for (let i = 0; i < plan.length - 1; i++) {
      const currentItem = plan[i];
      const nextItem = plan[i + 1];
      
      if (!currentItem.end?.datetime || !nextItem.start?.datetime) {
        return {
          valid: false,
          message: 'กรุณาเลือกวันที่ให้ครบ'
        }
      }

      const currentTimezone = currentItem.start.timezone;
      const nextTimezone = nextItem.start.timezone;

      // แปลงเวลาเป็น local time ใน timezone ของตัวเองก่อน
      const currentStartLocal = utcToZonedTime(new Date(currentItem.start.datetime), currentTimezone);
      const nextStartLocal = utcToZonedTime(new Date(nextItem.start.datetime), nextTimezone);

      // แปลง local time เป็น timestamp สำหรับเปรียบเทียบ
      const currentStartTime = currentStartLocal.getTime();
      const nextStartTime = nextStartLocal.getTime();

      if (nextStartTime < currentStartTime) {
        const currentStartStr = format(currentStartLocal, 'dd/MM/yyyy HH:mm', { timeZone: currentTimezone });
        const nextStartStr = format(nextStartLocal, 'dd/MM/yyyy HH:mm', { timeZone: nextTimezone });
        
        return {
          valid: false,
          errorIndex: i,
          message: `เวลาไม่ต่อเนื่องกัน: 
            รายการที่ ${i + 1} จบที่ ${currentStartStr} (${currentTimezone}) 
            แต่รายการที่ ${i + 2} เริ่มที่ ${nextStartStr} (${nextTimezone})`
        };
      }
    }
    return { valid: true };
  };

  const handleSavePlan = async () => {
    setLoadingPlan(true);
    updateEndTimes();

    // สร้าง plan ใหม่ที่อัปเดตแล้ว
    const updatedPlan = [...plan];

    // ตรวจสอบความถูกต้องของเวลา
    const validation = validateTimeSequence(updatedPlan);
    if (!validation.valid) {
      showErrorToast(validation.message);
      setLoadingPlan(false);
      return;
    }

    // อัปเดต location ใน transport items
    updatedPlan.forEach((item, idx) => {
      if (item.type === 'transport') {
        const prevItem = updatedPlan[idx - 1];
        const nextItem = updatedPlan[idx + 1];
        
        updatedPlan[idx].origin = prevItem?.data?.location || {
          name: '',
          lat: '',
          lng: '',
          address: ''
        };

        updatedPlan[idx].destination = nextItem?.data?.location || {
          name: '',
          lat: '',
          lng: '',
          address: ''
        };
      }
    });

    setPlan(updatedPlan);

    try {
      console.log('sent :',updatedPlan)
      const response = await axios.put(`/api/trip/${userId}/${id_trip}/plan`, updatedPlan);
      setPlan(response.data.plan);
      console.log('res :',response.data.plan)
      showSuccessToast("อัปเดตแผนสำเร็จ");
      updateLocationMap();
    } catch (err) {
      showErrorToast("อัปเดตแผนล้มเหลว");
      console.error("Error updating plan:", err);
    } finally {
      setLoadingPlan(false); 
    }
  };

  const handleDeletePlan = (index) => {
    const newPlan = [...plan];
    
    // กรณีลบ main-section
    if (newPlan[index].type !== 'transport') {
      // เช็คว่ามี transport-section ตามมาหรือไม่
      if (index < newPlan.length - 1 && newPlan[index + 1].type === 'transport') {
        // ลบ transport-section ที่ตามมาด้วย
        newPlan.splice(index, 2);
      } else {
        // ลบเฉพาะ main-section ปัจจุบัน
        newPlan.splice(index, 1);
      }
    } 
    // กรณีลบ transport-section
    else {
      // ลบเฉพาะ transport-section ปัจจุบัน
      newPlan.splice(index, 1);
      
      // เช็คว่ามี main-section ก่อนหน้าและหลังหรือไม่
      if (index > 0 && index < newPlan.length) {
        // อัปเดตเวลาของ main-section หลังการลบ
        const prevItem = newPlan[index - 1];
        const nextItem = newPlan[index];
        
        // ตั้งค่า end ของรายการก่อนหน้าให้เท่ากับ start ของรายการถัดไป
        if (prevItem && nextItem.start) {
          prevItem.end = {
            datetime: nextItem.start.datetime,
            timezone: nextItem.start.timezone
          };
        }
      }
    }
    
    setPlan(newPlan);
    updateLocationMap();
    updateEndTimes();
  };

  const ShowMapShare = (type, index) => {
    const item = plan[index];
    updateLocation();
    
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
        origin: item.origin,
        destination: item.destination
      });
    }
    
    setMapShareType(type);
    setMapShareBox(true);
  };

  console.log(plan)

  if (!userId || loadingTrips) return <Loading />;

  return (
    <main className='EditPlan container pb-5'>
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
                        value={item.name || ''}
                        onChange={(e) => {
                          const newPlan = [...plan];
                          newPlan[index].name = e.target.value;
                          setPlan(newPlan);
                        }}
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

                      {/* ส่วนเลือกวันเวลา */}
                      <div className="col-md d-flex flex-wrap flex-md-nowrap align-items-center gap-2">
                        <span>Start</span>
                        {/* เลือกวัน */}
                        <select
                          className="form-select border-secondary flex-fill"
                          value={getLocalDateString(item.start, fallbackTimezone)}
                          disabled={index === 0}
                          onChange={(e) => {
                            if (index === 0) return;
                            const selectedDate = e.target.value; 
                            const newPlan = [...plan];

                            // ใช้ parse เพื่อสร้าง date object จาก string (dd/MM/yyyy)
                            const dateObj = parse(selectedDate, 'dd/MM/yyyy', new Date());

                            // เอา time เดิม ถ้าไม่มีให้ใช้ '00:00'
                            const currentTime = item.start?.datetime
                              ? parseDateTimeWithZone(item.start).time
                              : '00:00';

                            newPlan[index].start = formatDateTimeWithZone(
                              dateObj,
                              currentTime,
                              item.start?.timezone || fallbackTimezone,
                            );
                            setPlan(newPlan);
                            updateEndTimes();
                          }}
                        >
                          {options
                            .filter(dateStr => {
                              if (index === 0) return true; 
                              const prevItem = plan[index - 1];
                              const prevDate = new Date(prevItem?.start?.datetime); 
                              const currentDate = new Date(dateStr.split('/').reverse().join('-'));
                              return currentDate >= new Date(prevDate.toDateString());
                            })
                            .map((date, idx) => (
                              <option key={idx}>{date}</option>
                            ))}
                        </select>
                        {/* เลือกเวลา */}
                        <input
                          type="time"
                          className="form-control border-secondary flex-fill"
                          value={getLocalTimeString(item.start, fallbackTimezone)}
                          disabled={index === 0}
                          onChange={(e) => {
                            if (index === 0) return;
                            const selectedTime = e.target.value;
                            const newPlan = [...plan];

                            const currentDate = item.start?.datetime
                              ? parseDateTimeWithZone(item.start).date
                              : options[0].split('/').reverse().join('-'); 

                            const dateObj = parse(currentDate, 'yyyy-MM-dd', new Date());

                            newPlan[index].start = formatDateTimeWithZone(
                              dateObj,
                              selectedTime,
                              item.start?.timezone || fallbackTimezone
                            );
                            setPlan(newPlan);
                            updateEndTimes();
                          }}
                        />
                        {/* เลือกtimezone */}
                        <select
                          disabled={index === 0}
                          className="form-select input-outline-dark"
                          value={item.start?.timezone || ''}
                          onChange={(e) => {
                            const newTimezone = e.target.value;
                            const newPlan = [...plan];

                            let dateObj, time;

                            if (!item.start?.datetime) {
                              const lastItem = plan[plan.length - 1];
                              if (lastItem?.start?.datetime) {
                                const lastTz = lastItem.start.timezone || newTimezone;
                                // เอา local date จาก lastItem ตาม timezone เดิมของ lastItem
                                const localDateObj = utcToZonedTime(new Date(lastItem.start.datetime), lastTz);
                                dateObj = localDateObj;
                                time = format(localDateObj, 'HH:mm');
                              } else {
                                dateObj = new Date();
                                time = '00:00';
                              }
                            } else {
                              const oldTz = item.start.timezone || newTimezone;
                              const localDateObj = utcToZonedTime(new Date(item.start.datetime), oldTz);
                              dateObj = localDateObj;
                              time = format(localDateObj, 'HH:mm');
                            }

                            newPlan[index].start = formatDateTimeWithZone(
                              dateObj,
                              time,
                              newTimezone
                            );
                            setPlan(newPlan);
                            updateEndTimes();
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

                        {/* show utc time */}
                        <div className="position-relative">
                          <button
                            className="btn d-flex align-items-center px-0"
                            onClick={() => setOpenIndex(openIndex === index ? null : index)} // toggle
                          >
                            <ClockAlert size={16} color="red" />
                          </button>
                          
                          {openIndex === index && (
                            <div
                              className="position-absolute bg-light px-2 py-1 rounded shadow-sm"
                              style={{ fontSize: "0.75rem", top: 0, left: '25px', zIndex: 10 }}
                              >
                              {item.start?.datetime} ({item.start?.timezone})
                            </div>
                          )}
                        </div>
                      
                      </div>
                    </div>

                  </div>
                  <div className="card-body bg-body-secondary">
                    {/* {item.start.datetime + item.start.timezone} */}
                      <MapSearch 
                        SelectLocation={(location) => handleLocation(location, index)} 
                        value={item.data.location} 
                      />
                  </div>
                  <div className="card-header d-flex flex-wrap flex-md-nowrap align-items-center justify-content-between gap-2 border-0 bg-body-secondary">
                    <div className="status">
                      {/* ว่างไว้ */}
                    </div>
                    <div className="left d-flex align-items-center gap-2">
                      <button 
                        className="btn d-flex align-items-center btn-outline-dark" 
                        onClick={() => ShowMapShare('location', index)}
                      >
                        ดูตำแหน่ง
                      </button>
                      <button className="btn d-flex align-items-center btn-outline-dark" >
                        ตั้งค่าเพิ่มเติม
                      </button>
                      <button 
                        className="btn d-flex align-items-center btn-danger" 
                        onClick={() => handleDeletePlan(index)}
                      >
                        ลบ
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
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.data.transport_type === "public_transport" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.data.transport_type === "public_transport"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].data.transport_type = "public_transport";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Bus size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.data.transport_type === "car" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.data.transport_type === "car"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].data.transport_type = "car";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <CarFront size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.data.transport_type === "plane" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.data.transport_type === "plane"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].data.transport_type = "plane";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Plane size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.data.transport_type === "train" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.data.transport_type === "train"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].data.transport_type = "train";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <TrainFront size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.data.transport_type === "walking" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.data.transport_type === "walking"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].data.transport_type = "walking";
                                setPlan(newPlan);
                              }}
                              style={{ display: 'none' }}
                            />
                            <Footprints size={18} />
                          </label>
                          <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${item.data.transport_type === "bicycle" ? 'active bg-black' : ''}`}>
                            <input
                              type="radio"
                              name={`type-${index}`} // เปลี่ยนให้ unique
                              value="public_transport"
                              checked={item.data.transport_type === "bicycle"}
                              onChange={() => {
                                const newPlan = [...plan];
                                newPlan[index].data.transport_type = "bicycle";
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
                        {/* เลือกวัน */}
                        <select
                          className="form-select border-secondary flex-fill"
                          value={getLocalDateString(item.start, fallbackTimezone)}
                          disabled={index === 0}
                          onChange={(e) => {
                            if (index === 0) return;
                            const selectedDate = e.target.value; 
                            const newPlan = [...plan];

                            // ใช้ parse เพื่อสร้าง date object จาก string (dd/MM/yyyy)
                            const dateObj = parse(selectedDate, 'dd/MM/yyyy', new Date());

                            // เอา time เดิม ถ้าไม่มีให้ใช้ '00:00'
                            const currentTime = item.start?.datetime
                              ? parseDateTimeWithZone(item.start).time
                              : '00:00';

                            newPlan[index].start = formatDateTimeWithZone(
                              dateObj,
                              currentTime,
                              item.start?.timezone || fallbackTimezone,
                            );
                            setPlan(newPlan);
                            updateEndTimes();
                          }}
                        >
                          {options
                            .filter(dateStr => {
                              if (index === 0) return true; 
                              const prevItem = plan[index - 1];
                              const prevDate = new Date(prevItem?.start?.datetime); 
                              const currentDate = new Date(dateStr.split('/').reverse().join('-'));
                              return currentDate >= new Date(prevDate.toDateString());
                            })
                            .map((date, idx) => (
                              <option key={idx}>{date}</option>
                            ))}
                        </select>
                        {/* เลือกเวลา */}
                        <input
                          type="time"
                          className="form-control border-secondary flex-fill"
                          value={getLocalTimeString(item.start, fallbackTimezone)}
                          disabled={index === 0}
                          onChange={(e) => {
                            if (index === 0) return;
                            const selectedTime = e.target.value;
                            const newPlan = [...plan];

                            const currentDate = item.start?.datetime
                              ? parseDateTimeWithZone(item.start).date
                              : options[0].split('/').reverse().join('-'); 

                            const dateObj = parse(currentDate, 'yyyy-MM-dd', new Date());

                            newPlan[index].start = formatDateTimeWithZone(
                              dateObj,
                              selectedTime,
                              item.start?.timezone || fallbackTimezone
                            );
                            setPlan(newPlan);
                            updateEndTimes();
                          }}
                        />
                        {/* เลือกtimezone */}
                        <select
                          disabled={index === 0}
                          className="form-select input-outline-dark"
                          value={item.start?.timezone || ''}
                          onChange={(e) => {
                            const newTimezone = e.target.value;
                            const newPlan = [...plan];

                            let dateObj, time;

                            if (!item.start?.datetime) {
                              const lastItem = plan[plan.length - 1];
                              if (lastItem?.start?.datetime) {
                                const lastTz = lastItem.start.timezone || newTimezone;
                                // เอา local date จาก lastItem ตาม timezone เดิมของ lastItem
                                const localDateObj = utcToZonedTime(new Date(lastItem.start.datetime), lastTz);
                                dateObj = localDateObj;
                                time = format(localDateObj, 'HH:mm');
                              } else {
                                dateObj = new Date();
                                time = '00:00';
                              }
                            } else {
                              const oldTz = item.start.timezone || newTimezone;
                              const localDateObj = utcToZonedTime(new Date(item.start.datetime), oldTz);
                              dateObj = localDateObj;
                              time = format(localDateObj, 'HH:mm');
                            }

                            newPlan[index].start = formatDateTimeWithZone(
                              dateObj,
                              time,
                              newTimezone
                            );
                            setPlan(newPlan);
                            updateEndTimes();
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

                        {/* show utc time */}
                        <div className="position-relative">
                          <button
                            className="btn d-flex align-items-center px-0"
                            onClick={() => setOpenIndex(openIndex === index ? null : index)} // toggle
                          >
                            <ClockAlert size={16} color="red" />
                          </button>
                          
                          {openIndex === index && (
                            <div
                              className="position-absolute bg-light px-2 py-1 rounded shadow-sm"
                              style={{ fontSize: "0.75rem", top: 0, left: '25px', zIndex: 10 }}
                              >
                              {item.start?.datetime} ({item.start?.timezone})
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                  <div className="card-body border-0 bg-info-subtle">
                    <div className="row align-items-center gx-3 gy-2">
                      {/* Route Information */}
                      {/* {item.start.datetime + item.start.timezone} */}
                      <div className="col-12 col-md d-flex align-items-center flex-wrap">
                        <p className="mb-0">
                          {truncateName(plan[index - 1]?.data?.location?.name) || 'ไม่มีจุดเริ่มต้น'}
                        </p>
                        <MoveRight className="mx-3" size={25} />
                        <p className="mb-0">
                          {truncateName(plan[index + 1]?.data?.location?.name) || 'ไม่มีจุดหมาย'}
                        </p>
                      </div>
                      {/* Buttons */}
                      <div className="col-12 col-md-auto d-flex justify-content-md-end gap-2">
                        <button
                          className="btn d-flex align-items-center btn-outline-dark"
                          onClick={() => ShowMapShare('navigation', index)}
                        >
                          ดูเส้นทาง
                        </button>
                        <button className="btn d-flex align-items-center btn-outline-dark">
                          ตั้งค่าเพิ่มเติม
                        </button>
                        <button 
                          className="btn d-flex align-items-center btn-danger" 
                          onClick={() => handleDeletePlan(index)}
                        >
                          ลบ
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

          {/* Fixed Save Plan Bar Styled as Card */}
          <div className="fixed-bottom w-100 bg-transparent pb-2 px-2">
            <div className="card shadow-sm mx-auto " style={{ maxWidth: "720px" }}>
              <div className="p-2 card-body d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center ms-3 " style={{fontSize:'14px'}}>
                  Last update : {trip.updatedAt}
                </div>
                <button
                  type="submit"
                  className="btn btn-dark px-4 py-2 custom-dark-hover"
                  disabled={loadingPlan}
                  onClick={handleSavePlan}
                >
                  {loadingPlan ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึก"
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* right */}
        <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column pt-3">
          {/* <MapMultiMarker locations={locationList} /> */}
        </div>
      </div>


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

    </main> 

  );
} 
