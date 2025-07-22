'use client';

import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { showErrorToast } from "@/lib/swal";
import { Route, Hotel, Bus, CarFront, TrainFront, Plane, Footprints, Bike, Hamburger, MapPin , Waypoints} from 'lucide-react';
import { getLocalTimeString, getLocalToThaiDate ,getDatesListFromStartEnd} from '@/utils/dateLocal';
import './PlanSummaryCost.css'
import { useMemo } from 'react';
import SummaryPage from './SummaryPage'

export default function PlanSummary() {
  const router = useRouter();
  const params = useParams();
  const { id_trip, userId } = useTrip();

  const [display, setDisplay] = useState('have');
  const [filter,setFilter] = useState(''); // hotel , transport , eat , Activities , public_transport','car', 'plane', 'train', 'walking', 'bicycle
  const [plan_list, setPlan_list] = useState([]);
  const [plan_list_filter, setPlan_list_filter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exchangeRates , setExchangeRates] = useState(null);
  const [openSummaryPage , setOpenSummaryPage] = useState(false)
  const [summaryPageData , setSummaryPageData ] = useState({
    'Activities_cost' : 0 ,
    'hotel_cost' : 0,
    'eat_cost' : 0,
    'transport_cost' : 0
  })

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
    if (!plan_list || plan_list.length === 0 || !exchangeRates) return;

    const summary = {
      Activities_cost: 0,
      hotel_cost: 0,
      eat_cost: 0,
      transport_cost: 0
    };

    plan_list.forEach(item => {
      if (!item.amount || !item.amount.price) return;

      const price = item.amount.price;
      const currency = item.amount.currency || 'THB';
      const peopleCount = item.Price_per_person || 1;
      const pricePerPerson = price / peopleCount;

      let priceInTHB = 0;

      if (currency === 'THB') {
        priceInTHB = pricePerPerson;
      } else {
        const rate = exchangeRates[currency];
        if (!rate) {
          console.warn(`ไม่มีอัตราแลกเปลี่ยนของ ${currency}`);
          return;
        }
        priceInTHB = pricePerPerson / rate;
      }

      if (item.type === 'Activities') {
        summary.Activities_cost += priceInTHB;
      } else if (item.type === 'hotel') {
        summary.hotel_cost += priceInTHB;
      } else if (item.type === 'eat') {
        summary.eat_cost += priceInTHB;
      } else if (item.type === 'transport') {
        summary.transport_cost += priceInTHB;
      }
    });

    setSummaryPageData({
      Activities_cost: summary.Activities_cost,
      hotel_cost: summary.hotel_cost,
      eat_cost: summary.eat_cost,
      transport_cost: summary.transport_cost
    });
  }, [plan_list, exchangeRates]);


  useEffect(() => {
    const fetchRates = async () => {
      try {
        console.log("Fetching currency rates once...");
        const response = await axios.get('https://api.frankfurter.app/latest?from=THB');
        setExchangeRates(response.data.rates);
      } catch (error) {
        console.error("Failed to fetch currency rates on mount:", error);
        showErrorToast("ไม่สามารถโหลดอัตราแลกเปลี่ยนได้");
      }
    };
    fetchRates();
  }, []); 

  useEffect(() => {
      const planlistDisplay = plan_list.filter(item1 => {
        if (display === 'have') {
          return item1.amount?.price > 0;
        }
        return true;
      })
      setPlan_list_filter(
        planlistDisplay.filter(item => {
          if(filter == 'hotel'){
            return item.type == 'hotel'
          }else if(filter == 'transport'){
            return item.type == 'transport'
          }else if(filter == 'eat'){
            return item.type == 'eat'
          }else if(filter == 'Activities'){
            return item.type == 'Activities'
          }else if(filter == 'public_transport'){
            return item.data?.transport_type == 'public_transport'
          }else if(filter == 'car'){
            return item.data?.transport_type == 'car'
          }else if(filter == 'plane'){
            return item.data?.transport_type == 'plane'
          }else if(filter == 'train'){
            return item.data?.transport_type == 'train'
          }else if(filter == 'walking'){
            return item.data?.transport_type == 'walking'
          }else if(filter == 'bicycle'){
            return item.data?.transport_type == 'bicycle'
          }else{
            return true
          }
        })
      )
  }, [filter, display , plan_list])

  const totalPriceInTHB = useMemo(() => {
    if (!exchangeRates) return 0;

    return plan_list_filter.reduce((sum, item) => {
      if (!item.amount || !item.amount.price) return sum;

      const price = item.amount.price;
      const currency = item.amount.currency || 'THB';
      const peopleCount = item.Price_per_person || 1;
      const pricePerPerson = price / peopleCount;

      if (currency === 'THB') {
        return sum + pricePerPerson;
      }

      const rate = exchangeRates[currency];
      if (!rate) {
        console.warn(`ไม่มีอัตราแลกเปลี่ยนของ ${currency}`);
        return sum;
      }

      return sum + pricePerPerson / rate;
    }, 0);
  }, [plan_list_filter, exchangeRates]);


  console.log(plan_list)

  return (
    <>
    <div className="PlanSummary container">
      <div className="plan-header">
        <h3 className="fw-bold mb-2 d-flex align-items-center gap-2"><Route size={28}/>Summary Cost Plan</h3>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="d-flex gap-2 flex-wrap">
            <button
              onClick={() => setDisplay('all')}
              className={`btn input-outline-dark d-flex align-items-center mt-md-0 btn-sm ${display === 'all' ? 'active' : ''}`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setDisplay('have')}
              className={`btn input-outline-dark d-flex align-items-center mt-md-0 btn-sm ${display === 'have' ? 'active' : ''}`}
            >
              เฉพาะที่มี
            </button>
            <button
              onClick={() => setOpenSummaryPage(true)}
              className={`btn btn-success d-flex align-items-center mt-md-0 btn-sm`}
            >
              สรุปราคาทั้งหมด
            </button>
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="btn-group btn-group-toggle flex-wrap">
              {[
                { key: "Activities", icon: <MapPin size={18} /> },
                { key: "transport", icon: <Waypoints size={18} /> },
                { key: "hotel", icon: <Hotel size={18} /> },
                { key: "eat", icon: <Hamburger size={18} /> },
                { key: "public_transport", icon: <Bus size={18} /> },
                { key: "car", icon: <CarFront size={18} /> },
                { key: "plane", icon: <Plane size={18} /> },
                { key: "train", icon: <TrainFront size={18} /> },
                { key: "walking", icon: <Footprints size={18} /> },
                { key: "bicycle", icon: <Bike size={18} /> },
              ].map(({ key, icon }) => (
                <label
                  key={key}
                  onClick={() => setFilter(filter === key ? '' : key)}
                  className={`btn btn-secondary input-outline-dark d-flex align-items-center ${filter === key ? 'active bg-black' : ''}`}
                  style={{ cursor: 'pointer', maxWidth:'50px'}}
                >
                  {icon}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <table className="table table-borderless table-custom table-hover">
          <tbody>
            <tr>
              <td colSpan="5" className="text-center text-muted py-4">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <label className='ms-2'>Loading...</label>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div className="table-responsive mt-1 border-top">
          <table className="table table-borderless table-custom table-hover">
            <tbody>
            {plan_list_filter
              .map((item, index) => (
                <tr key={item._id || index} className='border-bottom align-middle ' onClick={()=> router.push(`/trip/${id_trip}/plan/${item._id}`)}>
                  <td className='small' style={{minWidth:'200px'}}>
                    {getLocalTimeString(item.start)} - {getLocalToThaiDate(item.start)}
                  </td>
                  <td className="text-start d-flex align-items-center gap-2" style={{ minWidth: "400px" }}>
                    { item.type === 'hotel' && <Hotel size={16}/> }
                      { item.type === 'eat' && <Hamburger size={16}/> }
                      { item.type === 'Activities' && <MapPin size={16}/> }
                      { item.type === 'transport' && (
                          <>
                              {item.data.transport_type === 'public_transport' && <Bus size={16}/>}
                              {item.data.transport_type === 'car' && <CarFront size={16}/>}
                              {item.data.transport_type === 'plane' && <Plane size={16}/>}
                              {item.data.transport_type === 'train' && <TrainFront size={16}/>}
                              {item.data.transport_type === 'walking' && <Footprints size={16}/>}
                              {item.data.transport_type === 'bicycle' && <Bike size={16}/>}
                          </>
                      )}
                    {item.name || item.data?.location?.name || (item.type === 'transport' ? `เดินทางไป ${item.data?.destination?.name || ''}` : `...`)}
                  </td>
                  <td style={{ minWidth: "200px" }}>
                    {item.amount?.price
                      ? `${item.amount.price.toLocaleString()} ${item.amount.currency || 'THB'} / ${item?.Price_per_person || '1'} คน`
                      : ''}
                  </td>
                </tr>
              ))}
              
            </tbody>
              
          </table>
            {plan_list_filter.length > 0 && (
              <p className='small'>
                {plan_list_filter.length} แผน รวมทั้งหมด
                <strong> {totalPriceInTHB.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท / คน</strong>
              </p>
            )}
        </div>
      )}
    </div>
    {openSummaryPage && (
      <SummaryPage data={summaryPageData} onClose={()=> setOpenSummaryPage(false)}/>
    )}
    </>
  );
}