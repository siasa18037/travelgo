'use client';

import { useTrip } from '@/components/TripContext';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';
import { Route ,Map,Compass,Hamburger ,Hotel ,Bus , CarFront , TrainFront , Plane ,Footprints,Bike ,PencilLine,Clock3,Settings2,FileText,CircleDollarSign} from 'lucide-react';
import './edit.css'
import { getLocalDateString, getLocalTimeString } from '@/utils/dateLocal';
import MapSearch from '@/components/MapSearch'
import ShowOriToDes from '@/components/ShowOriToDes'
import Richtexteditor from '@/components/Richtexteditor'

export default function EditPlanItem() {
  const router = useRouter();
  const params = useParams();
  const { id_plan } = params;
  const { userType, userId, id_trip } = useTrip();
  const [planItemForm, setPlanItemForm] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [userId, id_trip, id_plan]);

  const handleSave = async () => {
    try {
      const respone = await axios.put(`/api/trip/${userId}/${id_trip}/plan/${id_plan}`, planItemForm);
      setPlanItemForm(respone)
      showSuccessToast("อัปเดตแผนสำเร็จ");
    } catch (error) {
      showErrorToast("อัปเดตแผนล้มเหลว");
    }
  };

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
                    value={planItemForm.amount || 0}
                    onChange={(e) => setPlanItemForm({ ...planItemForm, amount: e.target.value })}
                  />
                  <span className="input-group-text input-outline-dark">บาท</span>
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
          </div>
          <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column">

          </div>
        </div>
        {planItemForm.name }
      </div>
    );
  }
}
