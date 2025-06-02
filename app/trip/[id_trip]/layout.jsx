'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from "next/navigation";
import Loading from '@/components/Loading';
import { TripProvider } from '@/components/TripContext';


export default function TripLayout({ children }) {
  const router = useRouter();
  const params = useParams();
  const id_trip = params.id_trip;

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [nameTrip, setNameTrip] = useState(null);

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          const userId = data.user.userId;
          setUserId(userId);

          // 2. Check trip access
          fetch(`/api/trip/${userId}/${id_trip}/Check`)
            .then(res => res.json())
            .then(tripData => {
              if (tripData.ok) {
                setUserType(tripData.type);
                setNameTrip(tripData.name_trip)
                setAuthorized(true);
              } else {
                router.push('/dashboard'); 
              }
            })
            .catch(() => {
              router.push('/error');
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          router.push('/login'); 
        }
      })
      .catch(() => {
        router.push('/error');
      });
  }, [id_trip, router]);

  if (loading) {
    return <Loading />;
  }

  if (!authorized) {
    return null;
  }

  return (
    <TripProvider value={{ userType, userId, id_trip , nameTrip}}>
      {children}
    </TripProvider>
  );
}
