'use client';

import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast ,inputBox} from "@/lib/swal";
import Loading from '@/components/Loading';
import MapMultiMarker from '@/components/MapMultiMarker'
import {X,Search,SquarePen ,Route , SkipForward,CircleX} from 'lucide-react'
import './plan.css'
import PlanList from './PlanList'
import Link from 'next/link';

export default function Plan() {
  const router = useRouter();
  const params = useParams();
  const { userType, userId, id_trip ,statusTrip} = useTrip();
  const [planList, setPlanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchInput , setSearchInput] = useState('');
  const [maplist , setMaplist] = useState([]);
  const [mapMode , setMapMode] = useState('markers'); //markers , navigation

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  useEffect(() => {
    const fetchPlanItem = async () => {
      try {
        const response = await axios.get(`/api/trip/${userId}/${id_trip}/plan?data=some`);
        setPlanList(response.data);
      } catch (error) {
        showErrorToast("ไม่พบแผนการเดินทางนี้");
        router.push(`/trip/${id_trip}/plan`);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanItem();
  }, [userId, id_trip]);

  useEffect(() => {
      const plan_InProgress = planList.find((plan) => plan.status == 'in_progress')
      if(plan_InProgress){
        if(plan_InProgress.type != 'transport'){
          setMapMode('markers')
          setMaplist([
            {
              location_name: plan_InProgress.data?.location?.name || '',
              lat: plan_InProgress.data?.location?.lat || '',
              lng: plan_InProgress.data?.location?.lng || '',
              address: plan_InProgress.data?.location?.address || '',
            }
          ])
        }else{
          setMapMode('navigation')
          setMaplist([
            {
              location_name: plan_InProgress.data?.origin?.name || '',
              lat: plan_InProgress.data?.origin?.lat || '',
              lng: plan_InProgress.data?.origin?.lng || '',
              address: plan_InProgress.data?.origin?.address || '',
            },
            {
              location_name: plan_InProgress.data?.destination?.name || '',
              lat: plan_InProgress.data?.destination?.lat || '',
              lng: plan_InProgress.data?.destination?.lng || '',
              address: plan_InProgress.data?.destination?.address || '',
            },
          ])
        }
      }else{
        setMaplist([])
        setMapMode('markers')
      }
  }, [planList]);

  const nextPlan = async (mode) => {
      if (isUpdating) return;
      setIsUpdating(true);

      // Build the request URL. If a mode is provided, add it as a query parameter.
      let url = `/api/trip/${userId}/${id_trip}/plan/UpdateStatus?data=some`;
      if (mode) {
        url += `&mode=${mode}`;
      }

      try {
        const response = await axios.put(url); // Use the potentially modified URL
        setPlanList(response.data.plan);
        showSuccessToast(response.data.message || "Plan status updated successfully!");

      } catch (error) {
        console.error(`Failed to update plan status (mode: ${mode || 'next'}):`, error);
        const errorMessage = error.response?.data?.message || "Could not update the plan status.";
        showErrorToast(errorMessage);
      } finally {
        setIsUpdating(false);
      }
    };

  const openSearchBox = async () => {
      const { value: input, isConfirmed } = await inputBox({
        title: "Search plan",
        text: "Search by Name , Date , Location",
        confirmButtonText: "Search",
        cancelButtonText: "Cancel",
      });

      // หลังจากที่กล่อง inputBox ปิดลง
      if (input && isConfirmed) {
        // ให้หน่วงเวลาการอัปเดต state เล็กน้อย
        // เพื่อรอให้ animation ของกล่องค้นหาจบลงก่อน
        setTimeout(() => {
          setSearchInput(input);
        }, 300); // หน่วงเวลา 200 มิลลิวินาที (0.2 วินาที)
      } else {
        // ถ้าผู้ใช้ยกเลิกหรือไม่ได้กรอกอะไร ก็ให้ล้างค่าทันที
        setSearchInput('');
      }
    }

  // console.log(planList)

  if (loading) return <Loading />;

  return (
    <div className="container">
      {/* head */}
      <div className="mb-3 plan-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h3 className="fw-bold mb-1 d-flex align-items-center gap-2"><Route size={28}/>Plan</h3>
            </div>
            {/* btn */}
            <div className='d-flex flex-wrap'>
              <div className="d-flex align-items-center gap-2 ">
                <button className='btn d-flex align-items-center' onClick={(e) => openSearchBox()}>
                  <Search size={20}/>
                </button>
                {statusTrip == 'not_started' && (
                <button
                  disabled
                  className="btn input-outline-dark d-flex align-items-center mt-md-0 gap-2"
                >
                  <div className="spinner-grow spinner-grow-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  ยังไม่เริ่ม
                </button>
                )}
                {statusTrip == 'in_progress' && (
                  <button
                    disabled
                    className="btn input-outline-dark d-flex align-items-center mt-md-0 gap-2 text-primary btn-sm"
                  >
                    <div className="spinner-grow text-primary spinner-grow-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    กำลังดำเนิน
                  </button>
                )}
                {statusTrip == 'completed' && (
                  <button
                    disabled
                    className="btn input-outline-dark d-flex align-items-center mt-md-0 gap-2 text-success"
                  >
                    <div className="spinner-grow text-success spinner-grow-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    จบเเล้ว
                  </button>
                )}
                {statusTrip == 'cancelled' && (
                  <button
                    disabled
                    className="btn input-outline-dark d-flex align-items-center mt-md-0 gap-2 text-danger"
                  >
                    <div className="spinner-grow text-danger spinner-grow-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    ยกเลิก
                  </button>
                )}
                {/* edit */}
                {userType == 'admin' && (
                  <button
                    onClick={() => router.push(`/trip/${id_trip}/plan/edit`)}
                    className="btn input-outline-dark d-flex align-items-center mt-md-0 btn-sm"
                  >
                    <SquarePen className="me-2" size={18}/>
                    Edit plan
                  </button>
                )}
                {/* button update status */}
                { userType == 'admin' && statusTrip == 'in_progress' && (
                    <div className="btn-group">
                      <button
                        onClick={() => nextPlan()} 
                        className="btn custom-dark-hover d-flex align-items-center mt-md-0 gap-2 btn-sm"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <SkipForward size={18}/>
                            <span>Next Plan</span>
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="btn custom-dark-hover dropdown-toggle dropdown-toggle-split  mt-md-0 " 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        disabled={isUpdating} 
                      >
                        <span className="visually-hidden">Toggle Dropdown</span>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button className="dropdown-item d-flex align-items-center gap-2 text-warning" onClick={() => nextPlan('skip')}>
                            <SkipForward size={18}/>Skip next plan
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => nextPlan('cancel')}>
                            <CircleX size={18} />Cancel next plan
                          </button>
                        </li>
                      </ul>
                    </div>
                )}
              </div>
            </div>
          </div>
      </div>
      
      <div className="row gap-3 flex-column flex-md-row">
          <div className="col">
              <PlanList plan_list={planList} trip_status={statusTrip} fillter={searchInput}/>
          </div>
          <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column">
              <div className="right-box" >
                <MapMultiMarker 
                  locations={maplist} 
                  mode={mapMode} 
                />
                <div className="my-3">
                  <h4 className="d-flex align-items-center mb-2">
                    <Route size={24} className="me-2" />
                    Plan
                  </h4>
                  <div className="d-flex gap-2">
                    <Link
                      className="btn custom-dark-hover flex-fill d-flex align-items-center justify-content-center p-2"
                      href={`/trip/${id_trip}/plan/Summary`}
                    >
                      Summary plan
                    </Link>
                    <Link
                      className="btn input-outline-dark flex-fill d-flex align-items-center justify-content-center p-2"
                      href={`/trip/${id_trip}/plan/PlanSummaryCost`}
                    >
                      Plan cost summary
                    </Link>
                  </div>
                </div>
              </div>
          </div>
      </div>  
      
    </div>
  );
}
