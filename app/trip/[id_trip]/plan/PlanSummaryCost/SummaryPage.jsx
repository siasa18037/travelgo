import { X, Hotel, MapPin, Hamburger, Waypoints } from "lucide-react";

export default function SummaryPage({ data, onClose }) {
  return (
    <>
      <div className="overlay" onClick={onClose}>
        <div
          className="MapShare card shadow"
          style={{ maxWidth: "650px", width: "100%" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-header d-flex align-items-center justify-content-between border-1">
            <p className="mb-0 ">สรุปค่าใช้จ่ายทั้งหมด</p>
            <button onClick={onClose} className="btn btn-sm text-danger">
              <X />
            </button>
          </div>

          <div className="card-body centered-card">
            <ul className="list-group list-group-flush fs-6">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  กิจกรรม
                </div>
                <strong>{data.Activities_cost.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Hotel size={20} className="text-info" />
                  ที่พัก
                </div>
                <strong>{data.hotel_cost.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Hamburger size={20} className="text-warning" />
                  อาหาร
                </div>
                <strong>{data.eat_cost.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Waypoints size={20} className="text-success" />
                  การเดินทาง
                </div>
                <strong>{data.transport_cost.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท</strong>
              </li>
              <li className="list-group-item border-top mt-2 d-flex justify-content-between align-items-center fw-bold fs-5">
                รวมทั้งหมด
                <span className="text-success">
                  {(data.Activities_cost + data.hotel_cost + data.eat_cost + data.transport_cost).toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท / คน
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
