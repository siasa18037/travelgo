'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {  Map, FileText ,PlaneTakeoff ,PlaneLanding , Calendar,Clock ,Route ,Ticket,Wallet2} from 'lucide-react';
import UploadButton from '@/components/UploadButton'; 
import './edit.css'
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import CountryInput from "@/components/CountryInput";
import Usertriplist from "@/components/Usertriplist"
import { logoutUser } from "@/utils/logout";
import { useRouter , useParams} from "next/navigation";
import Loading from '@/components/Loading';
import Richtexteditor from '@/components/Richtexteditor'
import Link from "next/link";


export default function EditTrip() {
  const router = useRouter();
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState('18:00');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(true); // <-- เพิ่มตัวนี้
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: '', 
    end_date: '', 
    detail: '',
    profile_image: '',
    country: [],
    user:[]
  });
  const params = useParams();
  const id_trip = params.id_trip;

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setUserId(data.user.userId);

          fetch(`/api/trip/${data.user.userId}/${id_trip}`)
            .then(res => res.json())
            .then(trip => {
              if (!trip.message) {
                setForm(trip);

                const start = new Date(trip.start_date);
                const end = new Date(trip.end_date);

                setStartDate(start);
                setStartTime(start.toTimeString().slice(0, 5)); // "HH:MM"

                setEndDate(end);
                setEndTime(end.toTimeString().slice(0, 5));
              } else {
                router.push(`/dashboard`);
                return
              }
              setLoadingTrips(false);
            });
        } else {
          logoutUser();
        }
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadComplete = (url) => {
    setForm((prev) => ({ ...prev, profile_image: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const start = new Date(startDate);
    const [startHour, startMin] = startTime.split(':');
    start.setHours(startHour, startMin);

    const end = new Date(endDate);
    const [endHour, endMin] = endTime.split(':');
    end.setHours(endHour, endMin);

    const now = new Date();

    if (end <= start) {
      showErrorToast("End time must be after the start time.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.put(`/api/trip/${userId}/${id_trip}`, form);
      console.log(response.data)
      setForm(response.data)

      showSuccessToast("Trip update successfully!");
      router.push(`/trip/${id_trip}/edit`);
    } catch (error) {
      console.error("Error update trip:", error);
      showErrorToast("Failed to create trip.");
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    // ปรับ endDate ให้ไม่น้อยกว่า startDate
    if (endDate < startDate) {
      setEndDate(startDate);
    }

    // ถ้าเป็นวันเดียวกัน ต้องเช็คเวลา
    if (endDate.toDateString() === startDate.toDateString()) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startTotal = startHour * 60 + startMin;
      const endTotal = endHour * 60 + endMin;

      if (endTotal <= startTotal) {
        const newEnd = new Date(startDate);
        newEnd.setHours(startHour + 1);
        const newTime = newEnd.toTimeString().slice(0, 5); // 'HH:MM'
        setEndTime(newTime);
      }
    }
  }, [startDate, startTime, endDate, endTime]);

  useEffect(() => {
    const formatDateTime = (date, time) => {
      const d = new Date(date);
      const [hours, minutes] = time.split(':');
      d.setHours(parseInt(hours), parseInt(minutes));
      return d.toISOString().slice(0, 16); 
    };
    setForm((prev) => ({
      ...prev,
      start_date: formatDateTime(startDate, startTime),
      end_date: formatDateTime(endDate, endTime),
    }));
  }, [startDate, startTime, endDate, endTime]);

  const handleSelectedCountries = (list) => {
    setForm((prev) => ({ ...prev, country: list }));
  };

  const handleSelectedUsers = (list) => {
    setForm((prev) => ({ ...prev, user: list }));
  }

  if (!userId || loadingTrips) return <Loading />;

  return (
    <main className="Createtrip">
      <form onSubmit={handleSubmit}>
      <div className="container py-4">
        <div className="row gap-5 flex-column flex-md-row">
          {/* Left: Upload */}
          <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column">
            <h2 className="mb-4">Edit Trip</h2>
            <div className="image-profile mb-3 w-100">
              
                <img
                  src={form.profile_image}
                  alt="Profile"
                  className="img-fluid rounded shadow"
                />
             
            </div>
            <label className='pb-2'>Upload Image trip profile or Link</label>
            <UploadButton onUploaded={handleUploadComplete} />
            <div className="mb-5">
                <label htmlFor="profile_imagee" className="form-label">
                </label>
                <input
                  type="text"
                  className="form-control input-outline-dark"
                  id="profile_image"
                  name="profile_image"
                  value={form.profile_image}
                  onChange={handleChange}
                  placeholder='Link image profile'
                  required
                />
            </div>

            
            {/* Plan */}
            <div className="mb-3">
              <h4 className="d-flex align-items-center mb-2">
                <Route size={24} className="me-2" />
                Plan
              </h4>
              <div className="d-flex gap-2">
                <Link
                  className="btn custom-dark-hover flex-fill d-flex align-items-center justify-content-center p-2"
                  href={`/trip/${id_trip}/plan`}
                >
                  My plan
                </Link>
                <Link
                  className="btn btn-outline-dark flex-fill d-flex align-items-center justify-content-center p-2"
                  href={`/trip/${id_trip}/plan/edit`}
                >
                  Edit plan
                </Link>
              </div>
            </div>

            {/* Plan */}
            <div className="mb-3">
              <h4 className="d-flex align-items-center mb-2">
                <Ticket size={24} className="me-2" />
                Tiket
              </h4>
              <div className="d-flex gap-2">
                <Link
                  className="btn custom-dark-hover flex-fill d-flex align-items-center justify-content-center p-2"
                  href={`/trip/${id_trip}/ticket`}
                >
                  My tiket
                </Link>
                <Link
                  className="btn btn-outline-dark flex-fill d-flex align-items-center justify-content-center p-2"
                  href={`/trip/${id_trip}/ticket/add`}
                >
                  Add tiket
                </Link>
              </div>
            </div>

            {/* Plan */}
            <div>
              <h4 className="d-flex align-items-center mb-2">
                <Wallet2 size={24} className="me-2" />
                Wallet
              </h4>
              <div className="d-flex gap-2">
                <Link
                  className="btn custom-dark-hover flex-fill d-flex align-items-center justify-content-center p-2"
                  href={`/trip/${id_trip}/wallet`}
                >
                  My Wallet
                </Link>
                <Link
                  className="btn btn-outline-dark flex-fill d-flex align-items-center justify-content-center p-2"
                  href={`/trip/${id_trip}/ticket/add`}
                >
                  Summary 
                </Link>
              </div>
            </div>
            
          </div>
          
          {/* Right: Form */}
          <div className="col">
            {/* <form onSubmit={handleSubmit}> */}
              <h4 className="mb-4">Trip detail</h4>

              {/* Trip Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label d-flex align-items-center">
                  <Map size={18} className="me-1" /> Trip Name
                </label>
                <input
                  type="text"
                  className="form-control input-outline-dark"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Start Date */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <PlaneTakeoff size={18} className="me-1" /> Start Date
                </label>
                <div className="row g-2 align-items-center">
                  <div className="col-md-6">
                    <div className="input-group w-100">
                      <span className="input-group-text div-outline-white">
                        <Calendar size={16} />
                      </span>
                      <input
                        type="date"
                        className="form-control input-outline-dark "
                        value={startDate.toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text div-outline-white">
                        <Clock size={16} />
                      </span>
                      <input
                        type="time"
                        className="form-control input-outline-dark"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* End Date */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <PlaneLanding size={18} className="me-1" /> End Date
                </label>
                <div className="row g-2 align-items-center">
                  <div className="col-md-6">
                    <div className="input-group w-100">
                      <span className="input-group-text div-outline-white">
                        <Calendar size={16} />
                      </span>
                      {/* End Date */}
                      <input
                        type="date"
                        className="form-control input-outline-dark"
                        value={endDate.toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        min={startDate.toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text div-outline-white ">
                        <Clock size={16} />
                      </span>
                      {/* End Time */}
                      <input
                        type="time"
                        className="form-control input-outline-dark"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        min={
                          endDate.toDateString() === startDate.toDateString()
                            ? startTime
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* country */}
              <CountryInput value={form.country} onChange={handleSelectedCountries} />

              {/* User */}
              <Usertriplist userId_host={form.user[0].id_user} value={form.user} onChange={handleSelectedUsers}/>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label d-flex align-items-center">
                  <FileText size={18} className="me-1" /> Description
                </label>
                <input
                  type="text"
                  className="form-control input-outline-dark"
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* detail Rich Text Editor */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <FileText size={18} className="me-1" /> Detail
                </label>
                <Richtexteditor
                  value={form.detail}
                  onChange={(value) => setForm(prev => ({ ...prev, detail: value }))}
                />
              </div>

              {/* หากต้องการแสดงผล HTML ที่ปลอดภัย */}
              {/* <div className='Rich-Text-Editor' dangerouslySetInnerHTML={{ __html: form.detail }} /> */}

              {/*  */}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn custom-dark-hover w-100 d-flex align-items-center justify-content-center p-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    กำลังเเก้ไข...
                  </>
                ) : (
                  "แก้ไขทิป"
                )}
              </button>

            {/* </form> */}
          </div>
        </div>
      </div>
      </form>
    </main>
  );
}