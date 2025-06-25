'use client';

import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';
import StatusPlan from '@/components/StatusPlan';

export default function Plan() {
  const router = useRouter();
  const params = useParams();
  const { userType, userId, id_trip } = useTrip();
  const [planList, setPlanList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loading />;

  return (
    <div className="container py-4">
      <h2 className="mb-4">แผนการเดินทาง</h2>

      {planList.length === 0 ? (
        <div className="alert alert-info">ไม่มีแผนการเดินทาง</div>
      ) : (
        planList.map((plan) => (
          <div
            className="card mb-3 shadow-sm cursor-pointer"
            key={plan._id}
            onClick={() => router.push(`/trip/${id_trip}/plan/${plan._id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body">

              <StatusPlan mode={'3'} id_user={userId} status={plan.status} start={plan.start}  end={plan.end}/>
              
              <h5 className="card-title mt-2">{plan.name || '(ไม่มีชื่อ)'}</h5>
              <p className="card-text">
                <strong>ประเภท:</strong> {plan.type}<br />
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
