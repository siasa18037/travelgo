'use client';
// app/trip/[id_trip]/plan/[id_plan]/page.jsx
import { useTrip } from '@/components/TripContext';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';
import Link from "next/link";
import {Clock2,LocateFixed,SquarePen ,Route ,MapPin, Wallet, Hamburger, Hotel, Bus, CarFront, TrainFront, Plane, Footprints, Bike} from 'lucide-react'
import './planItem.css'
import StatusPlan from '@/components/StatusPlan';
import { getLocalTimeString, getLocalToThaiDate ,getDurationString } from '@/utils/dateLocal'
import ShowOriToDes from '@/components/ShowOriToDes'

export default function PlanItem() {
  const router = useRouter();
  const params = useParams();
  const { id_plan } = params;
  const { userType, userId, id_trip ,statusTrip} = useTrip();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanItem = async () => {
      try {
        const response = await axios.get(`/api/trip/${userId}/${id_trip}/plan/${id_plan}`);
        setPlan(response.data);
        console.log(response.data)
      } catch (error) {
        showErrorToast("ไม่พบแผนการเดินทางนี้");
        router.push(`/trip/${userId}/${id_trip}/plan`);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanItem();
  }, [userId, id_trip, id_plan]);

  if (loading) return <Loading />;

  return (
    <div className="PlanItem container">
      {/* head */}
      <div className="mb-3 mt-2">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
            <div>
              <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              { plan.type == 'hotel' && (
                <>
                  <Hotel size={28}/>

                </> 
              )}
              { plan.type == 'eat' && (
                <>
                  <Hamburger size={28}/>
                </>
                  
              )}
              { plan.type == 'Activities' && (
                <>
                  <MapPin size={28}/>
                </>
                  
              )}
              { plan.type == 'transport' && (
                  <>
                      {plan.data.transport_type == 'public_transport' && (
                        <>
                          <Bus size={28}/>
                        </>
                      )}
                      {plan.data.transport_type == 'car' && (
                        <>
                          <CarFront size={28}/>
                        </>
                      )}
                      {plan.data.transport_type == 'plane' && (
                        <>
                          <Plane size={28}/>
                        </>
                      )}
                      {plan.data.transport_type == 'train' && (
                        <>
                          <TrainFront size={28}/>
                        </>
                      )}
                      {plan.data.transport_type == 'walking' && (
                        <>
                          <Footprints size={28}/>
                        </>
                      )}
                      {plan.data.transport_type == 'bicycle' && (
                        <>
                          <Bike size={28}/>
                        </>
                      )}
                  </>
              )}
              {plan.type == 'transport' ? 
                  plan.name || `เดินทางไป ${plan.data?.destination?.name || ''}`
              :
                  plan.name || plan.data?.location?.name || `ไม่มีชื่อ`
              }
              </h3>
              <div className="mb-0 d-flex align-items-center gap-2 flex-wrap">
                  <p className="mb-0 "><strong>{getLocalTimeString(plan.start)}</strong> - {getLocalToThaiDate(plan.start)}  </p> 
              </div>
            </div>
            {/* btn */}
            <div className='d-flex flex-wrap'>
              <div className="d-flex align-items-center gap-2 ">
                {/* edit */}
                <StatusPlan mode={'3'} id_user={userId} status={plan.status} start={plan.start}  end={plan.end}/>
                {userType == 'admin' && (
                  <button
                    onClick={() => router.push(`/trip/${id_trip}/plan/${id_plan}/edit`)}
                    className="btn input-outline-dark d-flex align-items-center mt-md-0 btn-sm"
                  >
                    <SquarePen className="me-2" size={18}/>
                    Edit plan
                  </button>
                )}
              </div>
            </div>
          </div>
      </div>

      {/* Data */}
      <div className="row gap-3 flex-column flex-md-row">
          {/* left */}
          <div className="col">
              {/* time and distination for transport*/}
              { plan.type == 'transport' && (
                <div  className='mb-3'>
                  <ShowOriToDes data={plan.data} start={plan.start} end={plan.end}/>
                </div>
              )}
              {/* time and distination for not transport*/}
              { plan.type != 'transport' && (
                <>
                  <div  className='input-outline-dark mb-2'>
                    <div className="time d-flex gap-2 align-items-center">
                      <Clock2 size={18} />
                      <p className="mb-0 "><strong>{getLocalTimeString(plan.start)} - {getLocalTimeString(plan.end)}</strong></p>
                      <p className='mb-0 text-secondary'>({getDurationString(plan.start, plan.end, 'Asia/Bangkok')})</p>
                    </div>
                  </div>
                  <div  className='input-outline-dark mb-2 gap-2'>
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <MapPin size={18} />
                      <p className='mb-0'><strong>{plan.data?.location?.name}</strong></p>
                    </div>
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <LocateFixed size={18} />
                      <p className='mb-0 text-secondary'>{plan.data?.location?.lat} {plan.data?.location?.lng}</p>
                    </div>
                    <button className='btn input-outline-dark my-1 me-1'>
                      ดูตำเเหน่ง
                    </button>
                    {plan.data?.location?.address && (
                      <button className='btn input-outline-dark my-1' onClick={() => router.push(plan.data?.location?.address)}>
                        Open with Google Map
                      </button>
                    )}
                  </div>
                </>
              )}
          </div>
          {/* right */}
          <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column">
              gfhfh
          </div>
      </div>

    </div>
  );
}
