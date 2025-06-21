'use client';

import { useTrip } from '@/components/TripContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';
import { Ticket, MapPin, PlaneTakeoff, Calendar, Clock, PlaneLanding, User, FileText ,Share2,Route ,Earth,CircleDollarSign} from 'lucide-react';
import UploadButton from '@/components/UploadButton'; 
import { timezones } from '@/lib/timezone';
import { utcToZonedTime, zonedTimeToUtc, format } from 'date-fns-tz';
import Richtexteditor from '@/components/Richtexteditor'
import currencyCodes from 'currency-codes';

export default function TicketItemPage() {
  const router = useRouter();
  const { userType, userId, id_trip } = useTrip();

  return (
    <main className="TicketItem">
        TicketItem
    </main>
  );
}
