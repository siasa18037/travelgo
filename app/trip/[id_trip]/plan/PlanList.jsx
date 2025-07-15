import { useState, useEffect, useRef } from "react"; // เพิ่มส่วนนี้: import useRef
import axios from 'axios';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import StatusPlan from '@/components/StatusPlan';
import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Wallet ,Hamburger ,Hotel ,Bus , CarFront , TrainFront , Plane ,Footprints,Bike } from 'lucide-react';
import {getLocalTimeString,getLocalToThaiDate} from '@/utils/dateLocal'
import MapShare from '@/components/MapShare'

export default function PlanList({ plan_list , trip_status , fillter='' }) {
  const router = useRouter();
  const { userType, userId, id_trip ,statusTrip} = useTrip();
  const [mapSharedata,setMapSharedata] = useState();
  const [mapShareBox , setMapShareBox] = useState(false);
  const [mapShareType,setMapShareType] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const inProgressRef = useRef(null);

    useEffect(() => {
        if (fillter && fillter.trim() !== '') return;
            if (inProgressRef.current) {
            inProgressRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [plan_list, fillter]);

  useEffect(() => {
    if (!fillter || fillter.trim() === '') return;

    const searchTerm = fillter.toLowerCase().trim();

    const foundPlan = plan_list.find(plan => {
      // ตรวจสอบชื่อ plan
      const planName = plan.name?.toLowerCase() || '';
      if (planName.includes(searchTerm)) return true;

      // ตรวจสอบชื่อสถานที่ (สำหรับ type ที่ไม่ใช่ transport)
      const locationName = plan.data?.location?.name?.toLowerCase() || '';
      if (locationName.includes(searchTerm)) return true;

      // ตรวจสอบชื่อปลายทาง (สำหรับ type 'transport')
      const destinationName = plan.data?.destination?.name?.toLowerCase() || '';
      if (destinationName.includes(searchTerm)) return true;

      // ตรวจสอบวันที่และเวลาที่แปลงเป็นสตริงแล้ว
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
      await axios.put(`/api/trip/${userId}/${id_trip}`, {status:'in_progress'});
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
                            onClick={() => router.push(`/trip/${id_trip}/plan/${plan._id}`)}
                            style={{ cursor: 'pointer' }}
                        >
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