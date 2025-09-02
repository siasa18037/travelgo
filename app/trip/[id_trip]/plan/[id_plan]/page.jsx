'use client';
// app/trip/[id_trip]/plan/[id_plan]/page.jsx
import { useTrip } from '@/components/TripContext';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';
import Link from "next/link";
import {Clock2,LocateFixed,SquarePen ,Route ,MapPin, Wallet, Hamburger, Hotel, Bus, CarFront, TrainFront, Plane, Footprints, Bike ,ListChecks ,Ticket,CalendarCheck,CalendarCheck2,NotebookPen,Luggage,BookKey,Moon,TicketsPlane,KeyRound} from 'lucide-react'
import './planItem.css'
import StatusPlan from '@/components/StatusPlan';
import { getLocalTimeString, getLocalToThaiDate ,getDurationString } from '@/utils/dateLocal'
import ShowOriToDes from '@/components/ShowOriToDes'
import ImageList from '@/components/ImageList'
import CheckList from '@/components/CheckList'
import MapMultiMarker from '@/components/MapMultiMarker'

export default function PlanItem() {
  const router = useRouter();
  const params = useParams();
  const { id_plan } = params;
  const { userType, userId, id_trip ,statusTrip} = useTrip();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allTictek , setAllTictek] = useState([]);
  const [locationlist , setLocationlist] = useState([]);
  const mapInitialized = useRef(false);

  useEffect(() => {
    const fetchAllTicket = async () => {
      try {
        const response = await axios.get(`/api/trip/${userId}/${id_trip}/ticket_pass?mode=all`);
        setAllTictek(response.data);
      } catch (error) {
        showErrorToast("โหลดข้อมูลตั๋วไม่สำเร็จ");
      }
    };
    fetchAllTicket();
  }, []);

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

  useEffect(() => {
      if (plan && !mapInitialized.current) { 
        let list = [];
        if (plan.type === 'transport') {
          list = [
            {
              location_name: plan.data?.origin?.name || '',
              lat: plan.data?.origin?.lat || '',
              lng: plan.data?.origin?.lng || '',
              address: plan.data?.origin?.address || '',
            },
            {
              location_name: plan.data?.destination?.name || '',
              lat: plan.data?.destination?.lat || '',
              lng: plan.data?.destination?.lng || '',
              address: plan.data?.destination?.address || '',
            },
          ];
        } else {
          list = [
            {
              location_name: plan.data?.location?.name || '',
              lat: plan.data?.location?.lat || '',
              lng: plan.data?.location?.lng || '',
              address: plan.data?.location?.address || '',
            },
          ];
        }
        
        setLocationlist(list);
      }
  }, [plan?.data?.location , plan?.data?.origin]);

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
                <div  className='mb-2'>
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

              {/* Booking != 'transport'  */}
              { plan.type != 'transport' && (
                <div  className='input-outline-dark mb-2'>
                  <div className="d-flex gap-2 align-items-center mb-1">
                    <CalendarCheck size={18} />
                    <p className='mb-0'>My Booking</p>
                  </div>
                  <div className="time d-flex gap-2 align-items-center mb-1">
                    { plan.type == 'hotel' && (
                      <>
                        <Hotel size={18}/>
                      </> 
                    )}
                    { plan.type == 'eat' && (
                      <>
                        <Hamburger size={18}/>
                      </>
                        
                    )}
                    { plan.type == 'Activities' && (
                      <>
                        <MapPin size={18}/>
                      </>
                        
                    )}
                    <p className='mb-0'><strong>{plan.data?.booking_name}</strong></p>
                  </div>
                  {plan.type == 'hotel' && (
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <Moon size={18} />
                      <p className='mb-0'>พัก {plan.data?.booking_night} คืน X {plan.data?.booking_room || 1} ห้อง</p>
                    </div>
                  )}
                  {plan.data?.booking_from && (
                  <div className="time d-flex gap-2 align-items-center mb-1">
                    <CalendarCheck2 size={18} />
                    <p className='mb-0'>{plan.data?.booking_from} จองเมื่อ {plan.data?.booking_date}</p>
                  </div>
                  )}
                  {plan.data?.booking_ID && (
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <BookKey size={18} />
                      <p className='mb-0'>Booking ID: {plan.data?.booking_ID} {plan.data?.booking_Pin && (`Pin: ${plan.data?.booking_Pin}`)}</p>
                    </div>
                  )}
                  {plan.data?.booking_note && (
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <NotebookPen size={18} />
                      <p className='mb-0'>{plan.data?.booking_note}</p>
                    </div>
                  )}
                </div>
              )}
              {/* Booking == 'transport'  */}
              { plan.type == 'transport' && (
                <div  className='input-outline-dark mb-2'>
                  <div className="d-flex gap-2 align-items-center mb-1">
                    <CalendarCheck size={18} />
                    <p className='mb-0'>My Booking</p>
                  </div>
                  <div className="time d-flex gap-2 align-items-center mb-1">
                    { plan.type == 'transport' && (
                        <>
                            {plan.data.transport_type == 'public_transport' && (
                              <>
                                <Bus size={18}/>
                              </>
                            )}
                            {plan.data.transport_type == 'car' && (
                              <>
                                <CarFront size={18}/>
                              </>
                            )}
                            {plan.data.transport_type == 'plane' && (
                              <>
                                <Plane size={18}/>
                              </>
                            )}
                            {plan.data.transport_type == 'train' && (
                              <>
                                <TrainFront size={18}/>
                              </>
                            )}
                            {plan.data.transport_type == 'walking' && (
                              <>
                                <Footprints size={18}/>
                              </>
                            )}
                            {plan.data.transport_type == 'bicycle' && (
                              <>
                                <Bike size={18}/>
                              </>
                            )}
                        </>
                    )}
                    <p className='mb-0'><strong>{plan.data?.booking_name}</strong></p>
                  </div>
                  {(plan.data.transport_type == 'plane') && plan.data?.booking_airline &&(
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <TicketsPlane size={18} />
                      <p className='mb-0'><strong>{plan.data?.booking_airline}</strong>{plan.data?.booking_flightno && (<> - <strong>{plan.data?.booking_flightno}</strong></>)}</p>
                    </div>
                  )}
                  {(plan.data.transport_type == 'plane') && plan.data?.booking_baggage &&(
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <Luggage size={18} />
                      <p className='mb-0'>โหลดน้ำหนักกระเป๋า {plan.data?.booking_baggage} Kg.</p>
                    </div>
                  )}
                  {plan.data?.booking_from && (
                  <div className="time d-flex gap-2 align-items-center mb-1">
                    <CalendarCheck2 size={18} />
                    <p className='mb-0'>{plan.data?.booking_from} จองเมื่อ {plan.data?.booking_date}</p>
                  </div>
                  )}
                  {plan.data?.booking_ID && (
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <BookKey size={18} />
                      <p className='mb-0'>Booking ID: {plan.data?.booking_ID} {plan.data?.booking_Pin && (`Pin: ${plan.data?.booking_Pin}`)}</p>
                    </div>
                  )}
                  {(plan.data.transport_type == 'public_transport' || plan.data.transport_type == 'train') && plan.data?.booking_route &&(
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <BookKey size={18} />
                      <p className='mb-0'>Route: <strong>{plan.data?.booking_route}</strong> {plan.data?.booking_carno && (<>Car no: <strong>{plan.data?.booking_carno}</strong></>)}</p>
                    </div>
                  )}
                  {(plan.data.transport_type == 'plane') && plan.data?.booking_PNR &&(
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <KeyRound size={18} />
                      <p className='mb-0'>PNR: {plan.data?.booking_PNR}</p>
                    </div>
                  )}
                  {plan.data?.booking_note && (
                    <div className="time d-flex gap-2 align-items-center mb-1">
                      <NotebookPen size={18} />
                      <p className='mb-0'>{plan.data?.booking_note}</p>
                    </div>
                  )}
                </div>
              )}


              {/* detail */}
              <div  className='mb-2'>
                {/* <label className="form-label d-flex align-items-center">
                  <ListChecks size={18} className="me-1" /> Detail
                </label> */}
                <div 
                    className="richtexteditor" 
                    dangerouslySetInnerHTML={{ __html: plan.detail }} 
                />
              </div>

              {/* checklist */}
              {plan.checklist.length != 0 && (
                <div  className='mb-2'>
                  <label className="form-label d-flex align-items-center">
                    <ListChecks size={18} className="me-1" /> Check List
                  </label>
                  <CheckList id_user={userId} id_trip={id_trip} id_plan={id_plan}/>
                </div>
              )} 

              {/* ticket */}
              {plan.Tiket_pass.length != 0 && (
              <div className="mb-2">
                <label className="form-label d-flex align-items-center">
                  <Ticket size={18} className="me-1" /> My Ticket
                </label>
                <div className="row g-2">
                  {plan.Tiket_pass.map((ticketId, idx) => {
                    const ticket = allTictek.find(t => String(t._id) == String(ticketId));
                    if (!ticket) return null;
                    return (
                      <div
                        key={idx}
                        className="col-6 col-md-4 col-lg-3 position-relative"
                        onClick={() => router.push(`/trip/${id_trip}/ticket/${ticket._id}`)}
                      >
                        <img
                          src={ticket?.img}
                          alt="ticket"
                          className="img-fluid rounded shadow-sm"
                          style={{ cursor: "pointer", objectFit: "cover", height: "120px", width: "100%" }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

          </div>
          {/* right */}
          <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column">
              {/* map */}
              {/* <MapMultiMarker 
                locations={locationlist} 
                mode={plan.type == 'transport' ? 'navigation' : 'markers'} 
              /> */}
              {/* Image  */}
              <ImageList data={plan.image} id_user={userId} id_trip={id_trip} id_plan={id_plan}/>
          </div>
      </div>
    </div>
  );
}
