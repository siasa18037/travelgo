'use client';

import { useTrip } from '@/components/TripContext';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';
import { Route ,Map,Compass,Hamburger ,Hotel ,Bus , CarFront , TrainFront , Plane ,Footprints,Bike ,PencilLine,Clock3,Settings2,FileText,CircleDollarSign,ListChecks,CalendarCheck,Luggage,WalletMinimal} from 'lucide-react';
import './edit.css'
import { getLocalDateString, getLocalTimeString } from '@/utils/dateLocal';
import MapSearch from '@/components/MapSearch'
import ShowOriToDes from '@/components/ShowOriToDes'
import Richtexteditor from '@/components/Richtexteditor'
import CheckList from '@/components/CheckList'
import currencyCodes from 'currency-codes';
import TicketInputList from '@/components/TicketInputList'
import MapMultiMarker from '@/components/MapMultiMarker'
import Link from 'next/link';
import StatusPlan from '@/components/StatusPlan';

export default function EditPlanItem() {
  const router = useRouter();
  const params = useParams();
  const { id_plan } = params;
  const { userType, userId, id_trip } = useTrip();
  const [planItemForm, setPlanItemForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const currencies = currencyCodes.data; // เป็น array ทั้งหมด
  const [isLoading, setIsLoading] = useState(false);
  const [locationlist , setLocationlist] = useState([]);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (userType !== 'admin') {
      router.push(`/trip/${userId}/${id_trip}/plan/edit`);
      return;
    }

    const fetchPlanItem = async () => {
      try {
        const response = await axios.get(`/api/trip/${userId}/${id_trip}/plan/${id_plan}`);
        // console.log(response)
        if(response.message){
          showErrorToast(response.message);
          router.push(`/trip/${id_trip}/plan`);
          return;
        }else{
          setPlanItemForm(response.data);
          // console.log(response.data)
        }
      } catch (error) {
        showErrorToast("ไม่พบแผนการเดินทางนี้");
        router.push(`/trip/${id_trip}/plan`);
        return
      } finally {
        setLoading(false);
      }
    };

    fetchPlanItem();
  }, [userId, id_trip, id_plan, router, userType]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`/api/trip/${userId}/${id_trip}/plan/${id_plan}`, planItemForm);
      setPlanItemForm(response.data); // หรือ .data ถ้า backend ส่งแค่นั้น
      showSuccessToast("อัปเดตแผนสำเร็จ");
    } catch (error) {
      showErrorToast("อัปเดตแผนล้มเหลว");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
      if (planItemForm && !mapInitialized.current) { 
        let list = [];
        if (planItemForm.type === 'transport') {
          list = [
            {
              location_name: planItemForm.data?.origin?.name || '',
              lat: planItemForm.data?.origin?.lat || '',
              lng: planItemForm.data?.origin?.lng || '',
              address: planItemForm.data?.origin?.address || '',
            },
            {
              location_name: planItemForm.data?.destination?.name || '',
              lat: planItemForm.data?.destination?.lat || '',
              lng: planItemForm.data?.destination?.lng || '',
              address: planItemForm.data?.destination?.address || '',
            },
          ];
        } else {
          list = [
            {
              location_name: planItemForm.data?.location?.name || '',
              lat: planItemForm.data?.location?.lat || '',
              lng: planItemForm.data?.location?.lng || '',
              address: planItemForm.data?.location?.address || '',
            },
          ];
        }
        
        setLocationlist(list);

        mapInitialized.current = true;
      }
    }, [planItemForm]);

  const transportOptions = [
    { value: "public_transport", icon: <Bus size={18} /> },
    { value: "car", icon: <CarFront size={18} /> },
    { value: "plane", icon: <Plane size={18} /> },
    { value: "train", icon: <TrainFront size={18} /> },
    { value: "walking", icon: <Footprints size={18} /> },
    { value: "bicycle", icon: <Bike size={18} /> },
  ];

  if (loading) return <Loading />;

  console.log(planItemForm)

  if(planItemForm){
    return (
      <div className="EditPlanItem container pb-5">
        <div className="head">
          <h4 className="mt-2 d-flex align-items-center mb-3">
            <Route size={24} className="me-2" />
            Edit plan detail
          </h4>
        </div>
        <div className="row gap-5 flex-column flex-md-row mt-2">
          {/* left */}
          <div className="col">

              {/* Plan Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label d-flex align-items-center">
                  <PencilLine size={18} className="me-1" /> Plan Name
                </label>
                <input
                  type="text"
                  className="form-control input-outline-dark"
                  id="name"
                  name="name"
                  value={planItemForm.name || ''}
                  onChange={(e) => setPlanItemForm({ ...planItemForm, name: e.target.value })}
                />
              </div>
              {/* time */}
              <div className="col-md d-flex flex-wrap flex-md-nowrap align-items-center gap-2 mb-3">
                <span className='d-flex gap-1 align-items-center'><Clock3 size={18}/>Start</span>
                {/* เลือกวัน */}
                <select
                  className="form-select border-secondary flex-fill"
                  value={getLocalDateString(planItemForm.start)}
                  disabled
                >
                    <option>{getLocalDateString(planItemForm.start)}</option>
                </select>
                {/* เลือกเวลา */}
                <input
                  type="time"
                  className="form-control border-secondary flex-fill"
                  value={getLocalTimeString(planItemForm.start, '')}
                  disabled
                />
                {/* เลือกtimezone */}
                <select
                  disabled
                  className="form-select input-outline-dark"
                  value={planItemForm.start?.timezone || ''}
                >
                 <option>
                    {planItemForm.start?.timezone || ''}
                  </option>
                </select>
              </div>
              {/* type */}
              <div className="col-md-auto mb-3">
                {planItemForm.type !== 'transport' ? (
                  <>
                    <label htmlFor="name" className="form-label d-flex align-items-center">
                      <Settings2 size={18} className="me-1" /> Plan Type
                    </label>
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                      <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${planItemForm.type === "Activities" ? 'active bg-black' : ''}`} >
                        <input
                          type="radio"
                          value="Activities"
                          checked={planItemForm.type === "Activities"}
                          onChange={() => setPlanItemForm({ ...planItemForm, type: "Activities" })}
                          style={{ display: 'none' }}
                        />
                        <Compass className="me-2" size={18} />
                        Activities
                      </label>
                      <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${planItemForm.type === "eat" ? 'active bg-black' : ''}`}>
                        <input
                          type="radio"
                          value="eat"
                          checked={planItemForm.type === "eat"}
                          onChange={() => setPlanItemForm({ ...planItemForm, type: "eat" })}
                          style={{ display: 'none' }}
                        />
                        <Hamburger className="me-2" size={18} />
                        Eat
                      </label>
                      <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${planItemForm.type === "hotel" ? 'active bg-black' : ''}`}>
                        <input
                          type="radio"
                          value="hotel"
                          checked={planItemForm.type === "hotel"}
                          onChange={() => setPlanItemForm({ ...planItemForm, type: "hotel" })}
                          style={{ display: 'none' }}
                        />
                        <Hotel className="me-2" size={18} />
                        Hotel
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <label htmlFor="name" className="form-label d-flex align-items-center">
                      <Settings2 size={18} className="me-1" /> Transport Type
                    </label>
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                      {transportOptions.map(({ value, icon }) => (
                        <label
                          key={value}
                          className={`btn btn-secondary input-outline-dark d-flex align-items-center ${
                            planItemForm.data.transport_type === value ? 'active bg-black' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            checked={planItemForm.data.transport_type === value}
                            onChange={() =>
                              setPlanItemForm({
                                ...planItemForm,
                                data: {
                                  ...planItemForm.data,
                                  transport_type: value,
                                },
                              })
                            }
                            style={{ display: 'none' }}
                          />
                          {icon}
                        </label>
                      ))}
                    </div>
                  </>
                )}
               
              </div>
              {/* map of not transport*/}
              {planItemForm.type !== 'transport' && (
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label d-flex align-items-center">
                      <Map size={18} className="me-1" /> Map
                    </label>
                    <MapSearch 
                      SelectLocation={(location) => {
                        setPlanItemForm({
                          ...planItemForm,
                            data: {
                              ...planItemForm.data,
                              location: {
                                name: location.name || '',
                                lat: location.lat || '',
                                lng: location.lng || '',
                                address: location.address || ''
                              },
                            },
                          })
                      }} 
                      value={planItemForm.data.location} 
                    />
                  </div>
                )}
              {/* ShowOriToDes for Transport*/}
              { planItemForm.type == 'transport' && (
                <div  className='mb-3'>
                  <ShowOriToDes data={planItemForm.data} start={planItemForm.start} end={planItemForm.end}/>
                </div>
              )}
              {/* detail */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <FileText size={18} className="me-1" /> Detail
                </label>
                <Richtexteditor
                  value={planItemForm.detail}
                  onChange={(value) => setPlanItemForm(prev => ({ ...prev, detail: value }))}
                />
              </div>
              {/* Activities and Eat */}
              { (planItemForm.type == 'Activities' || planItemForm.type == 'eat') && (
                  <div className="mb-3">
                    <label className="form-label d-flex align-items-center">
                      <CalendarCheck size={18} className="me-1" /> Booking
                    </label>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">Name</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_name || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_name: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">From</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_from || ''}
                        placeholder='Trip.com ..'
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_from: e.target.value
                          }
                        })}
                      />
                      <span className="input-group-text input-outline-dark">Booking date</span>
                      <input 
                        type="date" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_date || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_date: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">Booking ID</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_ID || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_ID: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="input-group overflow-hidden">
                      <span className="input-group-text input-outline-dark">Note</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_note || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_note: e.target.value
                          }
                        })}
                      />
                    </div>
                </div>
              )}
              {/* hotel */}
              { (planItemForm.type == 'hotel') && (
                  <div className="mb-3">
                    <label className="form-label d-flex align-items-center">
                      <CalendarCheck size={18} className="me-1" /> Booking
                    </label>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">Name</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_name || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_name: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">From</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_from || ''}
                        placeholder='Trip.com ..'
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_from: e.target.value
                          }
                        })}
                      />
                      <span className="input-group-text input-outline-dark">Booking date</span>
                      <input 
                        type="date" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_date || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_date: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">Booking ID</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_ID || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_ID: e.target.value
                          }
                        })}
                      />
                      <span className="input-group-text input-outline-dark">Pin</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_Pin || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_Pin: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">Room</span>
                      <input 
                        type="number" 
                        placeholder='1 ห้อง'
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_room || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_room: e.target.value
                          }
                        })}
                      />
                      <span className="input-group-text input-outline-dark">Night</span>
                      <input 
                        type="number" 
                        placeholder='1 คืน'
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_night || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_night: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="input-group overflow-hidden">
                      <span className="input-group-text input-outline-dark">Note</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_note || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_note: e.target.value
                          }
                        })}
                      />
                    </div>
                </div>
              )}
              {/* transport */}
              { (planItemForm.type == 'transport') && (
                  <div className="mb-3">
                    <label className="form-label d-flex align-items-center">
                      <CalendarCheck size={18} className="me-1" /> Booking
                    </label>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">Name</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_name || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_name: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">From</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_from || ''}
                        placeholder='Trip.com ..'
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_from: e.target.value
                          }
                        })}
                      />
                      <span className="input-group-text input-outline-dark">Booking date</span>
                      <input 
                        type="date" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_date || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_date: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="input-group overflow-hidden mb-2">
                      <span className="input-group-text input-outline-dark">Booking ID</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_ID || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_ID: e.target.value
                          }
                        })}
                      />
                      <span className="input-group-text input-outline-dark">Pin</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_Pin || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_Pin: e.target.value
                          }
                        })}
                      />
                    </div>  
                    {(planItemForm.data.transport_type == 'public_transport' || planItemForm.data.transport_type == 'train') && (
                      <div className="input-group overflow-hidden mb-2">
                        <span className="input-group-text input-outline-dark">Route</span>
                        <input 
                          type="text" 
                          className="form-control input-outline-dark" 
                          value={planItemForm.data?.booking_route || ''}
                          onChange={(e) => setPlanItemForm({
                            ...planItemForm,
                            data: {
                              ...planItemForm.data,
                              booking_route: e.target.value
                            }
                          })}
                        />
                        <span className="input-group-text input-outline-dark">Car no.</span>
                        <input 
                          type="text" 
                          className="form-control input-outline-dark" 
                          value={planItemForm.data?.booking_carno || ''}
                          onChange={(e) => setPlanItemForm({
                            ...planItemForm,
                            data: {
                              ...planItemForm.data,
                              booking_carno: e.target.value
                            }
                          })}
                        />
                      </div> 
                    )}
                    {(planItemForm.data.transport_type == 'plane') && (
                      <>
                        <div className="input-group overflow-hidden mb-2">
                          <span className="input-group-text input-outline-dark">Flight no.</span>
                          <input 
                            type="text" 
                            className="form-control input-outline-dark" 
                            value={planItemForm.data?.booking_flightno || ''}
                            onChange={(e) => setPlanItemForm({
                              ...planItemForm,
                              data: {
                                ...planItemForm.data,
                                booking_flightno: e.target.value
                              }
                            })}
                          />
                          <span className="input-group-text input-outline-dark">PNR</span>
                          <input 
                            type="text" 
                            className="form-control input-outline-dark" 
                            value={planItemForm.data?.booking_PNR || ''}
                            onChange={(e) => setPlanItemForm({
                              ...planItemForm,
                              data: {
                                ...planItemForm.data,
                                booking_PNR: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="input-group overflow-hidden mb-2">
                          <span className="input-group-text input-outline-dark">Airline</span>
                          <input 
                            type="text" 
                            className="form-control input-outline-dark" 
                            value={planItemForm.data?.booking_airline || ''}
                            onChange={(e) => setPlanItemForm({
                              ...planItemForm,
                              data: {
                                ...planItemForm.data,
                                booking_airline: e.target.value
                              }
                            })}
                          />
                          <span className="input-group-text input-outline-dark">
                            <Luggage size={18}/>
                          </span>
                          <input 
                            type="text" 
                            className="form-control input-outline-dark" 
                            value={planItemForm.data?.booking_baggage || ''}
                            onChange={(e) => setPlanItemForm({
                              ...planItemForm,
                              data: {
                                ...planItemForm.data,
                                booking_baggage: e.target.value
                              }
                            })}
                          />
                          <span className="input-group-text input-outline-dark">
                            Kg.
                          </span>
                        </div>  
                      </>
                    )}
                    <div className="input-group overflow-hidden">
                      <span className="input-group-text input-outline-dark">Note</span>
                      <input 
                        type="text" 
                        className="form-control input-outline-dark" 
                        value={planItemForm.data?.booking_note || ''}
                        onChange={(e) => setPlanItemForm({
                          ...planItemForm,
                          data: {
                            ...planItemForm.data,
                            booking_note: e.target.value
                          }
                        })}
                      />
                    </div>
                </div>
              )}
              {/* ticket */}
              <TicketInputList  value={planItemForm?.Tiket_pass}  userId={userId}  id_trip={id_trip} onChange={(value) => setPlanItemForm(prev => ({ ...prev, Tiket_pass: value }))}/>
              {/* Price_per_person */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <CircleDollarSign size={18} className="me-1" /> Price
                </label>
                <div className="input-group overflow-hidden">
                  <span className="input-group-text input-outline-dark">ราคา</span>
                  <input 
                    type="number" 
                    min={0}
                    className="form-control input-outline-dark" 
                    value={planItemForm.amount?.price || 0}
                    onChange={(e) => setPlanItemForm({
                      ...planItemForm,
                      amount: {
                        ...planItemForm.amount,
                        price: e.target.value
                      }
                    })}
                  />
                  <select
                    className="form-select input-outline-dark"
                    value={planItemForm.amount?.currency || 'THB'}
                    onChange={(e) =>
                      setPlanItemForm({
                        ...planItemForm,
                        amount: {
                          ...planItemForm.amount,
                          currency: e.target.value
                        }
                      })
                    }
                  >
                    {currencyCodes.data.map(({ code, currency }) => (
                      <option key={code} value={code}>
                        {code} - {currency}
                      </option>
                    ))}
                  </select>
                  <span className="input-group-text input-outline-dark">ต่อ</span>
                  <input
                    type="number"
                    className="form-control input-outline-dark"
                    min={1}
                    style={{ maxWidth: '80px' }} // ปรับขนาดความกว้าง
                    value={planItemForm.Price_per_person || 1}
                    onChange={(e) => setPlanItemForm({ ...planItemForm, Price_per_person: e.target.value })}
                  />
                  <span className="input-group-text input-outline-dark">คน</span>
                </div>
              </div>
              {/* checklist */}
              <div  className='mb-3'>
                <label className="form-label d-flex align-items-center">
                  <ListChecks size={18} className="me-1" /> Check List
                </label>
                <CheckList mode='edit' id_user={userId} id_trip={id_trip} id_plan={id_plan}/>
              </div>
              <button
                type="button"
                className="btn custom-dark-hover w-100 d-flex align-items-center justify-content-center p-2"
                disabled={isLoading}
                onClick={() => handleSave()}
              >
                {isLoading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Updating...
                  </>
                ) : (
                  "Update plan"
                )}
              </button>

          </div>
          {/* right */}
          <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column">
              <MapMultiMarker 
                locations={locationlist} 
                mode={planItemForm.type == 'transport' ? 'navigation' : 'markers'} 
              />

              {/* status */}
              <div className="my-3">
                  <StatusPlan mode={'2'} id_user={userId} id_trip={id_trip} id_plan={id_plan}/>
              </div>

              {/* wallet*/}
              <div className="my-3">
                <h4 className="d-flex align-items-center mb-2">
                  <WalletMinimal size={24} className="me-2" />
                  Wallet
                </h4>
                <div className="d-flex gap-2">
                  <Link
                    className="btn custom-dark-hover flex-fill d-flex align-items-center justify-content-center p-2"
                    href={`/trip/${id_trip}/wallet/plan/${id_plan}`}
                  >
                    My plan wallet
                  </Link>
                  <Link
                    className="btn input-outline-dark flex-fill d-flex align-items-center justify-content-center p-2"
                    href={`/trip/${id_trip}/wallet/plan/${id_plan}/edit`}
                  >
                    Edit wallet
                  </Link>
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }
}
