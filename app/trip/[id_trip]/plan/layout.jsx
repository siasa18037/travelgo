'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from "next/navigation";
import Loading from '@/components/Loading';
import { useTrip } from '@/components/TripContext';
import Link from "next/link";

export default function PlanLayout({ children }) {
  const { userType, userId, id_trip, nameTrip } = useTrip();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(path => path);
    const breadcrumbs = [];
    
    breadcrumbs.push(
      <Link key="trip" href={`/trip/${id_trip}`} className="text-black" style={{ textDecoration: 'none' }}>
        {nameTrip}
      </Link>
    );

    let accumulatedPath = `/trip/${id_trip}`;
    for (let i = 2; i < paths.length; i++) {
      accumulatedPath += `/${paths[i]}`;
      breadcrumbs.push(
        <span key={`separator-${i}`} className="mx-2">&gt;</span>
      );
      breadcrumbs.push(
        <Link 
          key={`path-${i}`} 
          href={accumulatedPath} 
          className="text-black capitalize"
          style={{ textDecoration: 'none' }}
        >
          {paths[i]}
        </Link>
      );
    }

    return breadcrumbs;
  };

  return (
    <>
      <nav className='container mt-3 flex items-center'>
        {generateBreadcrumbs()}
      </nav>
      {children}
    </>
  );
}