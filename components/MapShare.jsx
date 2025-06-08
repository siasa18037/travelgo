import { useEffect, useState } from "react";
import { X,MapPin,LocateFixed} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Link from "next/link";
import '@/styles/mapShare.css'

// http://api.map.baidu.com/marker?location={lat},{lng}&output=html

export default function MapShare({ data, type, onClose }) {

console.log(data)

  return (
    <>
        <div className="overlay" />
        <div className="MapShare card" style={{maxWidth:'650px'}}>
            <div className="card-header d-flex align-items-center justify-content-between border-1">
                <ul className="nav nav-tabs card-header-tabs border-0">
                    <li className="nav-item disabled">
                        <a className={`nav-link text-black ${type === "location" ? 'active' : ''}`} aria-current="true" >Location</a>
                    </li>
                    <li className="nav-item disabled">
                        <a className={`nav-link text-black ${type === "navigation" ? 'active' : ''}`} aria-current="true" >Navigation</a>
                    </li>
                </ul>
                <button onClick={onClose} className="btn btn-sm text-danger"><X/></button>
            </div>
            {/* location */}
            {
                type=="location" && (
                    <div className="card-body centered-card">
                        <div className="location p-2 border-bottom">
                            <strong className="d-flex align-items-center mb-2 fs-3"><MapPin size={22} className="me-2"/>{data.name}</strong>
                            <p className="d-flex align-items-center mb-0"><LocateFixed className="me-2" size={18}/>{data.location.lat},{data.location.lng}</p>
                        </div>
                        <div className="link row g-2 mt-2">
                            <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                            <Link
                                className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded "
                                target="_blank"
                                href={`https://www.google.com/maps?q=${data.location.lat},${data.location.lng}(${data.location.name})`}
                            >
                                <img src="/images/google-maps-logo.png" width="22" className="me-2" alt="Google Maps" />
                                Google Map
                            </Link>
                            </div>

                            <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                            <Link
                                className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded "
                                target="_blank"
                                href={`https://uri.amap.com/marker?position=${data.location.lng},${data.location.lat}&name=${data.location.name}`}
                            >
                                <img src="/images/Amap-logo.png" width="22" className="me-2" alt="AMap" />
                                Amap
                            </Link>
                            </div>

                            <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                            <Link
                                className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded "
                                target="_blank"
                                href={`http://api.map.baidu.com/marker?location=${data.location.lat},${data.location.lng}&title=${data.location.name}&output=html`}
                            >
                                <img src="/images/baidu.png" width="22" className="me-2" alt="Baidu Map" />
                                Baidu Map
                            </Link>
                            </div>

                            <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                            <Link
                                className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded "
                                target="_blank"
                                href={`https://maps.apple.com/?ll=${data.location.lat},${data.location.lng}&q=${data.location.name}`}
                            >
                                <img src="/images/AppleMaps_logo.png" width="22" className="me-2" alt="Apple Map" />
                                Apple Map
                            </Link>
                            </div>
                        </div>
                    </div>

                )
            }{
                type=="navigation" && (
                    <div className="card-body centered-card">
                        <div className="location p-2 border-bottom d-flex align-items-center">
                           {/* <p>{data}</p> */}
                        </div>
                        <div className="link row g-2 mt-2">
                          
                        </div>
                    </div>
                )
            }
            
        </div>
    </>
  );
}
{/* <div className="btn-group btn-group-toggle" data-toggle="buttons">
                            <input type="checkbox" className="btn-check" id="btncheck1" autocomplete="off"/>
                            <label className="btn btn-secondary input-outline-dark d-flex align-items-center active bg-black" for="btncheck1">Now</label>

                            <input type="checkbox" className="btn-check" id="btncheck2" autocomplete="off"/>
                            <label className="btn btn-secondary input-outline-dark d-flex align-items-center" for="btncheck2">Checkbox 2</label>

                            <input type="checkbox" className="btn-check" id="btncheck3" autocomplete="off"/>
                            <label className="btn btn-secondary input-outline-dark d-flex align-items-center" for="btncheck3">Checkbox 3</label>
                        </div> */}