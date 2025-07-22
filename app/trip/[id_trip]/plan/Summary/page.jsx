'use client';

import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { showErrorToast } from "@/lib/swal";
import { Route, Hotel, Bus, CarFront, TrainFront, Plane, Footprints, Bike, Hamburger, MapPin } from 'lucide-react';
import { getLocalTimeString, getLocalToThaiDate ,getDatesListFromStartEnd} from '@/utils/dateLocal';
import './Summary.css';
import './timeline.css';

export default function PlanSummary() {
  const router = useRouter();
  const params = useParams();
  const { id_trip, userId } = useTrip();

  const [filter, setFilter] = useState('all');
  const [plan_list, setPlan_list] = useState([]);
  const [tripDates, setTripDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const dateRefs = useRef(new Map());

  useEffect(() => {
    if (!userId || !id_trip) return;
    
    const fetchPlanItem = async () => {
      try {
        const response = await axios.get(`/api/trip/${userId}/${id_trip}/plan?data=some`);
        const sortedPlans = response.data.sort((a, b) => new Date(a.start.datetime) - new Date(b.start.datetime));
        setPlan_list(sortedPlans);
      } catch (error) {
        showErrorToast("ไม่พบแผนการเดินทางนี้");
        router.push(`/trip/${id_trip}/plan/Summary`);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanItem();
  }, [userId, id_trip, router]);

  useEffect(() => {
    if (plan_list.length > 0) {
      const dates = getDatesListFromStartEnd(
        plan_list[0].start, 
        plan_list[plan_list.length - 1].start
      );
      
      console.log(dates)
      setTripDates(dates);
    }
  }, [plan_list]);

  const getISODateString = (date) => new Date(date).toISOString().split('T')[0];

  const handleFilterClick = (date) => {
    const dateString = date === 'all' ? 'all' : getISODateString(date);
    setFilter(dateString);

    if (dateString !== 'all') {
      const node = dateRefs.current.get(dateString);
      if (node) {
        node.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  };

  const filteredPlanList = plan_list.filter(plan => {
    if (filter === 'all') return true;
    return getISODateString(plan.start.datetime) === filter;
  });

  const assignedRefs = new Set();

  return (
    <>
    <div className="PlanSummary container">
      <div className="plan-header">
        <h3 className="fw-bold mb-2 d-flex align-items-center gap-2"><Route size={28}/>Summary plan</h3>
        <div className="fillter">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-0">
            <button
              onClick={() => handleFilterClick('all')}
              className={`btn input-outline-dark d-flex align-items-center mt-md-0 btn-sm ${filter === 'all' ? 'active' : ''}`}
            >
              All
            </button>

            {tripDates.map((date, index) => {
                const dateObj = new Date(date);

                const dateString = dateObj.toISOString().split('T')[0];

                return (
                <button
                    key={index}
                    onClick={() => handleFilterClick(dateObj)} // ส่งเป็น Date object ไปให้ handler
                    className={`btn input-outline-dark d-flex align-items-center mt-md-0 btn-sm ${filter === dateString ? 'active' : ''}`}
                >
                    {getLocalToThaiDate({ datetime: dateObj })}
                </button>
                );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-5">Loading...</div>
      ) : (
        <div className="bsb-timeline-3 mt-3">
          <div className="container">
            <div className="row mx-2">
              <ul className="timeline">
                <li className="timeline-item">
                  <span className="timeline-icon"></span>
                  <div className="timeline-body">
                    <div className="timeline-content">
                      <div className="card border-0"><h5 className="mb-0">Start</h5></div>
                    </div>
                  </div>
                </li>

                {filteredPlanList.length > 0 ? (
                  filteredPlanList.map((plan) => {
                    const planDateString = getISODateString(plan.start.datetime);
                    const isFirstOfDate = !assignedRefs.has(planDateString);
                    if (isFirstOfDate) {
                      assignedRefs.add(planDateString);
                    }
                    return (
                      <li
                        key={plan._id}
                        ref={isFirstOfDate ? (el) => {
                          if (el) dateRefs.current.set(planDateString, el);
                        } : null}
                        className="timeline-item"
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
                              'var(--bs-body-bg)',
                              color: plan.status === 'not_started' ? 'var(--bs-body-color)' : 'var(--bs-body-bg)'
                          }}
                        >
                            { plan.type === 'hotel' && <Hotel size={16}/> }
                            { plan.type === 'eat' && <Hamburger size={16}/> }
                            { plan.type === 'Activities' && <MapPin size={16}/> }
                            { plan.type === 'transport' && (
                                <>
                                    {plan.data.transport_type === 'public_transport' && <Bus size={16}/>}
                                    {plan.data.transport_type === 'car' && <CarFront size={16}/>}
                                    {plan.data.transport_type === 'plane' && <Plane size={16}/>}
                                    {plan.data.transport_type === 'train' && <TrainFront size={16}/>}
                                    {plan.data.transport_type === 'walking' && <Footprints size={16}/>}
                                    {plan.data.transport_type === 'bicycle' && <Bike size={16}/>}
                                </>
                            )}
                        </span>
                        <div className="timeline-body">
                          <div className="timeline-content">
                            <div className="card border-0">
                              <div className="card-body p-0">
                                <div className="card-text d-flex align-items-center gap-3">
                                  <div className="card-text mb-0">
                                    <h6 className="mb-0">{getLocalTimeString(plan.start)}</h6>
                                    <p className="mb-0 small text-secondary">{getLocalToThaiDate(plan.start)}</p>
                                  </div>
                                </div>
                                <h5 className="mb-1">{plan.name || plan.data?.location?.name || (plan.type === 'transport' ? `เดินทางไป ${plan.data?.destination?.name || ''}` : `...`)}</h5>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })
                ) : (
                    <li className="timeline-item">
                        <div className="timeline-body">
                            <div className="timeline-content">
                                <div className="card border-0"><p className="text-secondary my-4">No plans for this day.</p></div>
                            </div>
                        </div>
                    </li>
                )}

                <li className="timeline-item">
                  <span className="timeline-icon"></span>
                  <div className="timeline-body">
                    <div className="timeline-content">
                      <div className="card border-0"><h5 className="mb-0">End</h5></div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
    
    </>
  );
}