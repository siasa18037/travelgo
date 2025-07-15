'use client';

import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast ,inputBox} from "@/lib/swal";
import Loading from '@/components/Loading';
import {X,Search,SquarePen ,Route , SkipForward,CircleX} from 'lucide-react'
import Link from 'next/link';

export default function SummaryPlanCost() {
  const router = useRouter();
  const params = useParams();
 

  return (
    <div className="container">
    
    </div>
  );
}
