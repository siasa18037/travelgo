'use client';

import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Loading from '@/components/Loading';
import { Ticket , PlaneTakeoff , PlaneLanding ,MapPin} from 'lucide-react';
import UploadButton from '@/components/UploadButton'; 
import { timezones } from '@/lib/timezone';
import { utcToZonedTime, zonedTimeToUtc, format } from 'date-fns-tz';
import { getLocalDateString, getLocalTimeString , getLocalToThaiDate} from '@/utils/dateLocal';
import Richtexteditor from '@/components/Richtexteditor'
import currencyCodes from 'currency-codes';
import Link from 'next/link';
import './TicketItem.css'

export default function TicketItemPage() {
    const router = useRouter();
    const params = useParams();
    const { id_ticket } = params;
    const { userType, userId, id_trip } = useTrip();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios
        .get("/api/user")
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("โหลดข้อมูลผู้ใช้ล้มเหลว", err));
    }, []);

    const [form, setForm] = useState({
        type: "private",  
        name: "",
        detail: "",
        booking_Tiket_pass: "",
        price: {
        price: 0,
        currency: "THB"
        },
        start: {
        datetime: "",
        timezone: "Asia/Bangkok"
        },
        end: {
        datetime: "",
        timezone: "Asia/Bangkok"
        },
        img: '/images/Image-not-found.png',
        location_use: ''
    });

    useEffect(() => {
        const fetchPlanItem = async () => {
            try {
                const response = await axios.get(`/api/trip/${userId}/${id_trip}/ticket_pass/${id_ticket}`);
                // console.log(response)
                if(response.message){
                showErrorToast(response.message);
                router.push(`/trip/${id_trip}/ticket`);
                return;
                }else{
                setForm(response.data);
                // console.log(response.data)
                }
            } catch (error) {
                showErrorToast("ไม่พบตั๋ว");
                router.push(`/trip/${id_trip}/ticket`);
                return
            } finally {
                setIsLoading(false);
            }
            };

        fetchPlanItem();
    }, [userId, id_trip, id_ticket]);

    const getItemStatusTag = (type) => {
        if (type == 'public') return 'bg-secondary-subtle text-secondary-emphasis border border-secondary';
        if (type == 'private') return 'bg-success-subtle text-success-emphasis border border-success';
        return 'bg-warning-subtle text-warning-emphasis border border-warning';
    };

    const getItemStatusTagString = (type) => {
        if (type == 'public') return 'สาธารณะ';
        if (type == 'private') return 'ทิปนี้';
        const found = users.find((user) => user._id === userId);
        if(found){
            return `เฉพาะ ${found.name}`
        }else{
            return 'ไม่พบข้อมูล'
        }
        
    };

    if (isLoading) return <Loading />;

    console.log(form)

    return (
        <div className="TicketItem container py-3">
            <div className="row gap-3 flex-column flex-md-row mt-2">
                <div className="col-md-4 mb-md-0 d-flex flex-column">
                    <img src={form.img} />
                    <div className="d-flex gap-2 mt-3">
                        {form?.ticket_link && (
                            <Link
                            className="btn custom-dark-hover flex-fill d-flex align-items-center justify-content-center p-2"
                            href={form.ticket_link || '#'}
                            >
                            My Ticket
                            </Link>
                        )}
                        {( form?.host == userId || form.type == userId ) &&(
                            <Link
                            className="btn input-outline-dark flex-fill d-flex align-items-center justify-content-center p-2"
                            href={`/trip/${id_trip}/ticket/${id_ticket}/edit`}
                            >
                            Edit Ticket
                            </Link>
                        )}
                    </div>
                </div>
                <div className="col">
                    <div className="head mb-2 d-flex align-items-center gap-3 flex-wrap" >
                        <h3 className="d-flex align-items-center mb-0">
                            <Ticket size={35} className='me-2'/>
                            {form.name}
                        </h3>
                        <p
                        style={{minWidth:'40px'}}
                        className={`mb-0 card-text small align-items-center rounded px-2 py-1 ${getItemStatusTag(form.type)}`}
                        >
                            {getItemStatusTagString(form.type)}
                        </p>
                    </div>
                    <div className="mb-3">
                        <label className="d-flex align-items-center mb-0">
                            <MapPin size={18} className='me-2'/>
                            {form.location_use}
                        </label>
                    </div>
                    <div className="mb-3 gap-2">
                        <label className="d-flex align-items-center mb-0">
                            <PlaneTakeoff size={18} className='me-2'/>
                            เริ่มต้น {getLocalToThaiDate(form.start, '')} - {getLocalTimeString(form.start, '')} 
                        </label>
                        <label className="d-flex align-items-center mb-0">
                            <PlaneLanding size={18} className='me-2'/>
                            สิ้นสุด {getLocalToThaiDate(form.end, '')} - {getLocalTimeString(form.end, '')} 
                        </label>
                    </div>
                    <div 
                        className="mb-3 richtexteditor" 
                        dangerouslySetInnerHTML={{ __html: form.detail }} 
                    />
                </div>
            </div>
        </div>

    );
}
