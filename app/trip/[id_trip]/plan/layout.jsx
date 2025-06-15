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

  const generateBreadcrumbs = () => {
  const breadcrumbs = [];

  // เริ่มจาก Trip Name
    breadcrumbs.push(
      <Link
        key="trip"
        href={`/trip/${id_trip}`}
        className="text-black"
        style={{ textDecoration: 'none' }}
      >
        {nameTrip}
      </Link>
    );

    // เพิ่ม > plan
    if (pathname.includes(`/trip/${id_trip}/plan`)) {
      breadcrumbs.push(<span key="sep1" className="mx-2">&gt;</span>);
      breadcrumbs.push(
        <Link
          key="plan"
          href={`/trip/${id_trip}/plan`}
          className="text-black capitalize"
          style={{ textDecoration: 'none' }}
        >
          plan
        </Link>
      );
    }

    // ถ้า path ลงท้ายด้วย /edit ให้แสดง "edit"
    if (pathname.endsWith('/edit')) {
      breadcrumbs.push(<span key="sep2" className="mx-2">&gt;</span>);
      breadcrumbs.push(
        <span key="edit" className="text-black capitalize">
          edit
        </span>
      );
    }

    return breadcrumbs;
  };


  return (
    <>
      <nav className='container mt-3  items-center'>
        {generateBreadcrumbs()}
      </nav>
      {children}
    </>

  );

}