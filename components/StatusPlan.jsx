'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Rocket, CheckCircle, SkipForward, XCircle, Clock } from 'lucide-react';
import Loading from '@/components/Loading';
import {getStatusTimeString ,getStatusEndTimeString } from '@/utils/dateLocal'

export default function StatusPlan({ mode = '1', id_user, id_trip, id_plan , status, start, end}) { // mode 1 = เเสดงเเค่ status , 2 = เเสดง status กับ sectionmode , 3 = เเสดงเเค่ status เเละรับค่า currentStatus 
    const [currentStatus, setCurrentStatus] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusTime, setStatusTime] = useState(null);
    const [statusEndTime, setStatusEndTime] = useState(null);
    

    useEffect(() => {
        if (!startTime || !endTime) return;
        const updateStatus = () => {
            setStatusTime(getStatusTimeString(startTime));
            setStatusEndTime(getStatusEndTimeString(endTime));
        };
        updateStatus();
        const interval = setInterval(updateStatus, 15000);
        return () => clearInterval(interval);
    }, [startTime, endTime]);


    const statusList = [
        {
            key: 'not_started',
            icon: <Clock size={18} />,
            title: 'ยังไม่เริ่ม',
            desc: 'สามารถเริ่มดำเนินแผนการนี้ได้ และสามารถย้อนกลับได้หากยังไม่เริ่ม',
            color: 'border-secondary',
            className: 'btn-outline-secondary'
        },
        {
            key: 'in_progress',
            icon: <Rocket size={18} />,
            title: 'กำลังดำเนิน',
            desc: 'ไม่สามารถย้อนกลับมาเริ่มต้นใหม่ได้',
            color: 'border-primary',
            className: 'btn-outline-primary' 
        },
        {
            key: 'completed',
            icon: <CheckCircle size={18} />,
            title: 'เสร็จสิ้น',
            desc: 'ไม่สามารถย้อนกลับและแก้ไขได้',
            color: 'border-success',
            className: 'btn-outline-success' 
        },
        {
            key: 'skipped',
            icon: <SkipForward size={18} />,
            title: 'ข้าม',
            desc: 'ข้ามการดำเนินการแผนนี้ไป',
            color: 'border-warning',
            className: 'btn-outline-warning' 
        },
        {
            key: 'cancelled',
            icon: <XCircle size={18} />,
            title: 'ยกเลิก',
            desc: 'ยกเลิกแผนการนี้ทั้งหมด',
            color: 'border-danger',
            className: 'btn-outline-danger'
        },
    ];

    useEffect(() => {
        const fetchStatus = async () => {
            if (!id_user || !id_trip || !id_plan) return;
            setLoading(true);
            try {
                const response = await axios.get(`/api/trip/${id_user}/${id_trip}/plan/${id_plan}/status`);
                setCurrentStatus(response.data.status);
                setStartTime(response.data.start);
                setEndTime(response.data.end);
            } catch (err) {
                console.error("Failed to fetch plan status:", err);
            } finally {
                setLoading(false);
            }
        };

        if (mode !== '3') {
            fetchStatus();
        } else if (status && start && end) {
            setCurrentStatus(status);
            setStartTime(start);
            setEndTime(end);
            setLoading(false);
        }
    }, [id_user, id_trip, id_plan, mode, status, start, end]);


    const handleStatusChange = async (newStatus) => {
        if (newStatus === currentStatus) return;
        try {
            const response = await axios.put(`/api/trip/${id_user}/${id_trip}/plan/${id_plan}/status`, {
                status: newStatus,
            });
            setCurrentStatus(response.data);
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    if (loading) return <Loading />;

    // console.log(currentStatus)

    return (
        <div className="StatusPlan">
            {/* status */}
            <div className="status-plan">
                <div className="head d-flex align-items-center gap-2">
                    {/*  not_started */}
                    { currentStatus === 'not_started' && (
                        <>
                            { statusTime?.type === 'On time' ? (
                                <div className='d-flex align-items-center gap-2'>
                                    <div className={`spinner-grow text-success spinner-grow-sm`} role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <h5 className='mb-0 text-success'>On time</h5>
                                    <h6 className='mb-0'>( ยังไม่เริ่ม )</h6>
                                </div>
                            ) : (
                                <div className='d-flex align-items-center gap-2'>
                                    <div className={`spinner-grow text-warning spinner-grow-sm`} role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <h5 className='mb-0 text-warning'>Delay</h5>
                                    <h5 className='mb-0 text-warning '>{statusTime?.time}</h5>
                                    <h6 className='mb-0'>( ยังไม่เริ่ม )</h6>
                                </div>
                            )}
                        </>
                    )}
                    {/* in_progress */}
                    { currentStatus == 'in_progress' && (
                        <div className='d-flex align-items-center gap-2'>
                            <div className={`spinner-grow text-primary spinner-grow-sm`} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h5 className='mb-0 text-primary'>In progress</h5>
                            {statusEndTime}
                        </div>
                    )}
                    {/* completed */}
                    { currentStatus == 'completed' && (
                        <div className='d-flex align-items-center gap-2'>
                            <CheckCircle size={20} className='text-success'/>
                            <h5 className='mb-0 text-success'>Completed</h5>
                        </div>
                    )}
                    {/* Skipped */}
                    { currentStatus == 'skipped' && (
                        <div className='d-flex align-items-center gap-2'>
                            <div className={`spinner-grow text-warning spinner-grow-sm`} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h5 className='mb-0 text-warning'>Skipped</h5>
                        </div>
                    )}
                    {/* Cancelled */}
                    { currentStatus == 'cancelled' && (
                        <div className='d-flex align-items-center gap-2'>
                            <XCircle size={22} className='text-danger'/>
                            <h5 className='mb-0 text-danger'>Cancelled</h5>
                        </div>
                    )}
                    
                </div>
                
            </div>
            {mode == '2' && (
                <div className="btn-group flex-wrap d-flex gap-2 mt-3" >
                    {statusList.map((status, index) => (
                    <div key={status.key} className="">
                        <input
                        type="radio"
                        className="btn-check "
                        name="btnradio"
                        id={`status-${status.key}`}
                        autoComplete="off"
                        checked={currentStatus === status.key}
                        onChange={() => handleStatusChange(status.key)}
                        />
                        <label className={`btn ${status.className} d-flex align-items-center gap-2 input-outline-dark`} htmlFor={`status-${status.key}`}>
                            {status.icon}
                            <span>{status.title}</span>
                        </label>
                    </div>
                    ))}
                </div>
            )}
        </div>
    );
}
