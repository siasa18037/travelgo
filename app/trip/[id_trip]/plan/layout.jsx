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
          className="text-body"
          style={{ textDecoration: 'none' }}
        >
          {nameTrip}
        </Link>
      );

      // เพิ่ม > plan
      if (pathname.includes(`/trip/${id_trip}/plan`)) {
        // ใช้ key ที่ไม่ซ้ำกับตัวอื่น
        breadcrumbs.push(<span key="sep_plan" className="mx-2">&gt;</span>);
        breadcrumbs.push(
          <Link
            key="plan"
            href={`/trip/${id_trip}/plan`}
            className="text-body capitalize"
            style={{ textDecoration: 'none' }}
          >
            plan
          </Link>
        );
      }

      if (pathname.includes(`/trip/${id_trip}/plan/Summary`)) {
        // ใช้ key ที่ไม่ซ้ำกับตัวอื่น
        breadcrumbs.push(<span key="sep_summary" className="mx-2">&gt;</span>);
        breadcrumbs.push(
          <span key="summary_text" className="text-body capitalize">
            Summary plan
          </span>
        );
      }

      if (pathname.includes(`/trip/${id_trip}/plan/PlanSummaryCost`)) {
        // ใช้ key ที่ไม่ซ้ำกับตัวอื่น
        breadcrumbs.push(<span key="sep_cost" className="mx-2">&gt;</span>);
        breadcrumbs.push(
          <span key="cost_text" className="text-body capitalize">
            Summary Cost Plan
          </span>
        );
      }

      // ถ้า path ลงท้ายด้วย /edit ให้แสดง "edit"
      if (pathname.endsWith('/edit')) {
        // key="sep2" เดิมไม่ซ้ำอยู่แล้ว แต่เปลี่ยนเพื่อความสอดคล้อง
        breadcrumbs.push(<span key="sep_edit" className="mx-2">&gt;</span>);
        breadcrumbs.push(
          <span key="edit_text" className="text-body capitalize">
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