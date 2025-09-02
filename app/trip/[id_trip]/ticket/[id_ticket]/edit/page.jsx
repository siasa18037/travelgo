'use client';

import { useTrip } from '@/components/TripContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast , confirmDelete} from "@/lib/swal";
import Loading from '@/components/Loading';
import { Ticket, MapPin, PlaneTakeoff, Calendar, Clock, PlaneLanding, User, FileText ,Share2,Route ,Earth,CircleDollarSign,Trash,Link2 } from 'lucide-react';
import './edit.css';
import UploadButton from '@/components/UploadButton'; 
import { timezones } from '@/lib/timezone';
import { utcToZonedTime, zonedTimeToUtc, format } from 'date-fns-tz';
import Richtexteditor from '@/components/Richtexteditor'
import currencyCodes from 'currency-codes';

export default function EditTicketItemPage() {
  const router = useRouter();
    const params = useParams();
    const { id_ticket } = params;
    const { userType, userId, id_trip } = useTrip();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBig, setIsLoadingBig] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState("12:00");
  const [startTimezone, setStartTimezone] = useState("Asia/Bangkok");

  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState("13:00");
  const [endTimezone, setEndTimezone] = useState("Asia/Bangkok");

  const [form, setForm] = useState({
    type: "private",  // public, private, or userId
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
    img: '',
    location_use: '',
    ticket_link: ''
  });

  useEffect(() => {
    if (userType !== 'admin') {
      router.push(`/trip/${id_trip}/ticket`);
      return;
    }

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
        setIsLoadingBig(false);
      }
    };

    fetchPlanItem();
  }, [userId, id_trip, id_ticket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // แปลงเวลาให้อยู่ในรูปแบบ UTC
      const startZoned = new Date(`${startDate.toISOString().split('T')[0]}T${startTime}:00`);
      const startUTC = zonedTimeToUtc(startZoned, startTimezone);

      const endZoned = new Date(`${endDate.toISOString().split('T')[0]}T${endTime}:00`);
      const endUTC = zonedTimeToUtc(endZoned, endTimezone);

      const payload = {
        ...form,
        start: {
          datetime: startUTC.toISOString(),
          timezone: startTimezone
        },
        end: {
          datetime: endUTC.toISOString(),
          timezone: endTimezone
        }
      };

        const response = await axios.put(`/api/trip/${userId}/${id_trip}/ticket_pass/${id_ticket}`, payload);

        setForm(response.data)
        showSuccessToast("Update successfully!");
        router.push(`/trip/${id_trip}/ticket/${id_ticket}`)


    } catch (err) {
      console.error(err);
      showErrorToast("Failed to create ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadComplete = (url) => {
    setForm(prev => ({ ...prev, img: url }));
  };

  const handleDelete = async () => {
    const result = await confirmDelete();

    if (result.isConfirmed) {
        try {
        const res = await axios.delete(`/api/trip/${userId}/${id_trip}/ticket_pass/${id_ticket}`);
        if (res.status === 200) {
            showSuccessToast("ลบตั๋วสำเร็จแล้ว");
            router.push(`/trip/${id_trip}/ticket`);
        }
        } catch (error) {
        showErrorToast("เกิดข้อผิดพลาดในการลบ");
        console.error(error);
        }
    }
    };

  if(isLoadingBig){
    return <Loading/>
  }else{
    return (
    <main className="EditTicketItem">
      <form onSubmit={handleSubmit}>
        <div className="container py-4">
          <div className="row gap-5 flex-column flex-md-row">
            {/* Left */}
            <div className="col-md-4 mb-4 mb-md-0 d-flex flex-column">
              <h2 className="mb-4">Edit Ticket</h2>
              <div className="image-profile mb-3 w-100">
                <img
                  src={form.img || 'https://media.istockphoto.com/id/1500283713/th/%E0%B9%80%E0%B8%A7%E0%B8%84%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C/%E0%B8%95%E0%B8%B1%E0%B9%8B%E0%B8%A7%E0%B9%82%E0%B8%A3%E0%B8%87%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%A2%E0%B8%99%E0%B8%95%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%87%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7-%E0%B8%95%E0%B8%B1%E0%B9%8B%E0%B8%A7%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%A2%E0%B8%99%E0%B8%95%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%87%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7.jpg?s=612x612&w=0&k=20&c=nvI4pUVTHSJbd7eXcmQn0bjdYgS_BsKUW0-h4zvJD94='}
                  alt="Trip"
                  className="img-fluid rounded shadow"
                />
              </div>
              <label className='pb-2'>Upload Image or Link</label>
              <UploadButton onUploaded={handleUploadComplete} />
              <input
                type="text"
                className="form-control input-outline-dark mt-2"
                name="img"
                value={form.img}
                onChange={handleChange}
                placeholder="Image URL"
              />
            </div>

            {/* Right */}
            <div className="col">
              <h4 className="mb-4">Ticket Details</h4>

              {/* type */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label d-flex align-items-center gap-1">
                  <Share2 className="me-1" size={18} /> Ticket Type
                </label>
                <div className="btn-group btn-group-toggle" data-toggle="buttons">
                      <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${form.type === "private" ? 'active bg-black' : ''}`} >
                        <input
                          type="radio"
                          value="Activities"
                          checked={form.type === "private"}
                          onChange={() => setForm({ ...form, type: "private" })}
                          style={{ display: 'none' }}
                        />
                        <Route className="me-2" size={18} />
                        This trip
                      </label>
                      <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${form.type == userId ? 'active bg-black' : ''}`}>
                        <input
                          type="radio"
                          value="eat"
                          checked={form.type == userId}
                          onChange={() => setForm({ ...form, type: userId })}
                          style={{ display: 'none' }}
                        />
                        <User className="me-2" size={18} />
                        Only me
                      </label>
                      <label className={`btn btn-secondary input-outline-dark d-flex align-items-center ${form.type === "public" ? 'active bg-black' : ''}`}>
                        <input
                          type="radio"
                          value="hotel"
                          checked={form.type === "public"}
                          onChange={() => setForm({ ...form, type: "public" })}
                          style={{ display: 'none' }}
                        />
                        <Earth className="me-2" size={18} />
                        Public
                      </label>
                    </div>
              </div>

              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label d-flex align-items-center gap-1">
                  <Ticket className="me-1" size={18} /> Ticket Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control input-outline-dark"
                  required
                />
              </div>

              {/* Start */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center gap-1">
                  <PlaneTakeoff size={18} className="me-1" /> Start Date & Time
                </label>
                <div className="row g-2 align-items-center">
                  <div className="col-md-6">
                        <div className="input-group w-100">
                            <span className="input-group-text div-outline-white">
                                <Calendar size={16} />
                            </span>
                            <input type="date" className="form-control input-outline-dark"
                            value={startDate.toISOString().split('T')[0]}
                            onChange={(e) => setStartDate(new Date(e.target.value))}
                            />
                        </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text div-outline-white">
                        <Clock size={16} />
                        </span>
                        <input type="time" className="form-control input-outline-dark"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        />
                        <select className="form-select input-outline-dark"
                        value={startTimezone}
                        onChange={(e) => setStartTimezone(e.target.value)}
                        >
                        {timezones.map(([label, value]) => (
                            <option key={value} value={value}>{label} - {value}</option>
                        ))}
                        </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* End */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center gap-1">
                  <PlaneLanding size={18} className="me-1" /> End Date & Time
                </label>
                <div className="row g-2 align-items-center">
                  <div className="col-md-6">
                    <div className="input-group w-100">
                      <span className="input-group-text div-outline-white">
                        <Calendar size={16} />
                      </span>
                        <input type="date" className="form-control input-outline-dark"
                        value={endDate.toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text div-outline-white">
                            <Clock size={16} />
                        </span>
                        <input type="time" className="form-control input-outline-dark"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        />
                        <select className="form-select input-outline-dark"
                        value={endTimezone}
                        onChange={(e) => setEndTimezone(e.target.value)}
                        >
                        {timezones.map(([label, value]) => (
                            <option key={value} value={value}>{label} - {value}</option>
                        ))}
                        </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Description */}
              <div className="mb-3">
                <label htmlFor="location_use" className="form-label d-flex align-items-center gap-1">
                  <MapPin className="me-1" size={18} /> Location Description
                </label>
                <input
                  type="text"
                  name="location_use"
                  value={form.location_use}
                  onChange={handleChange}
                  className="form-control input-outline-dark"
                  required
                />
              </div>

              {/* Price*/}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                    <CircleDollarSign size={18} className="me-2" /> Price
                </label>
                <div className="input-group overflow-hidden">
                <span className="input-group-text input-outline-dark">ราคา</span>
                <input 
                    type="number" 
                    min={0}
                    className="form-control input-outline-dark" 
                    value={form.price?.price || 0}
                    onChange={(e) => setForm({
                    ...form,
                    price: {
                        ...form.price,
                        price: parseFloat(e.target.value)
                    }
                    })}
                />
                <select
                    className="form-select input-outline-dark"
                    value={form.price?.currency || 'THB'}
                    onChange={(e) =>
                    setForm({
                        ...form,
                        price: {
                        ...form.price,
                        currency: e.target.value
                        }
                    })
                    }
                >
                    {currencyCodes.data.map(({ code, currency }) => (
                    <option key={code} value={code}>
                        {code} - {currency}
                    </option>
                    ))}
                </select>
                </div>
              </div>

              {/* ticket link */}
              <div className="mb-3">
                <label htmlFor="location_use" className="form-label d-flex align-items-center gap-1">
                  <Link2 className="me-1" size={18} /> Ticket Link URL
                </label>
                <input
                  type="text"
                  name="ticket_link"
                  value={form.ticket_link}
                  onChange={handleChange}
                  className="form-control input-outline-dark"
                />
              </div>

              {/* detail */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <FileText size={18} className="me-1" /> Detail
                </label>
                <Richtexteditor
                  value={form.detail}
                  onChange={(value) => setForm(prev => ({ ...prev, detail: value }))}
                />
              </div>

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
                    Updating...
                  </>
                ) : (
                  "Update ticket"
                )}
              </button>

              {/* delete */}
              <div className="mt-5">
                <button className='btn d-flex align-items-center btn-danger' type='button' onClick={() => handleDelete()}>
                    <Trash size={18} className="me-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
  }
  
}
