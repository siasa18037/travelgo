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

export default function PlanItem() {
  const router = useRouter();
  const params = useParams();
  const { id_plan } = params;
  const { userType, userId, id_trip } = useTrip();
  const [planItem, setPlanItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userType !== 'admin') {
      router.push(`/trip/${userId}/${id_trip}/plan`);
      return;
    }

    const fetchPlanItem = async () => {
      try {
        const response = await axios.get(`/api/trip/${userId}/${id_trip}/plan/${id_plan}`);
        setPlanItem(response.data);
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
    <div className="container py-4">
      <h2>แผนการเดินทาง</h2>
      <Link className='custom-dark-hover p-2' href={`/trip/${id_trip}/plan/${id_plan}/edit`}>Edit</Link>
    </div>
  );
}
