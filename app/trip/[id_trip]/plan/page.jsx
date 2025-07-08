'use client';

import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';

import {PlusCircle,SquarePen ,Route , SkipForward,CircleX} from 'lucide-react'
import './plan.css'
import PlanList from './PlanList'

export default function Plan() {
  const router = useRouter();
  const params = useParams();
  const { userType, userId, id_trip ,statusTrip} = useTrip();
  const [planList, setPlanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  useEffect(() => {
    const fetchPlanItem = async () => {
      try {
        const response = await axios.get(`/api/trip/${userId}/${id_trip}/plan`);
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

  const nextPlan = async (mode) => {
      if (isUpdating) return;
      setIsUpdating(true);

      // Build the request URL. If a mode is provided, add it as a query parameter.
      let url = `/api/trip/${userId}/${id_trip}/plan/UpdateStatus`;
      if (mode) {
        url += `?mode=${mode}`;
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
            <div className='d-flex align-items-center gap-2'>
              {statusTrip == 'not_started' && (
                <button
                  disabled
                  className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0 gap-2"
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
                  className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0 gap-2 text-primary btn-sm"
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
                  className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0 gap-2 text-success"
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
                  className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0 gap-2 text-danger"
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
                  className="btn input-outline-dark d-flex align-items-center mt-2 mt-md-0 btn-sm"
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
                      className="btn custom-dark-hover d-flex align-items-center mt-2 mt-md-0 gap-2 btn-sm"
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
                      className="btn custom-dark-hover dropdown-toggle dropdown-toggle-split mt-2 mt-md-0 " 
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
      
      <div className="row gap-3 flex-column flex-md-row">
          <div className="col">
              <PlanList plan_list={planList} />
          </div>
          <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column">
              map
          </div>
      </div>  
      
    </div>
  );
}
