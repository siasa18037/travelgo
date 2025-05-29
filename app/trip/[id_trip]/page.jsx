'use client';

import { useTrip } from '@/components/TripContext';

export default function trip() {
  const { userType, userId, id_trip } = useTrip();

  return (
    <div>
      <h1 className="text-primary">Welcome to Trip🌍</h1>
      <h2>Trip ID: {id_trip}</h2>
      <p>User ID: {userId}</p>
      <p>User Type: {userType}</p>
    </div>
  );
}
