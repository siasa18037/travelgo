import { useEffect, useState } from "react";
import { MoveRight, X, MapPin, LocateFixed, Bus, CarFront, TrainFront, Plane, Footprints, Bike, Clock, Map } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/swal";
import Link from "next/link";
import '@/styles/mapShare.css'
import { utcToZonedTime, format } from 'date-fns-tz';

export default function MapShare({ data, type, onClose }) {
    const [transportType, setTransportType] = useState(data?.transport_type || 'public_transport');
    const [transportMode, setTransportMode] = useState('now');
    const [departureTime, setDepartureTime] = useState('');
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);

    useEffect(() => {
    if (type === 'navigation' && data?.transport_type) {
        setTransportType(data.transport_type);
        
        if (data?.start?.datetime && data?.start?.timezone) {
            const zonedDate = utcToZonedTime(data.start.datetime, data.start.timezone);
            const formattedDate = format(zonedDate, "yyyy-MM-dd'T'HH:mm", {
                timeZone: data.start.timezone
            });
            setDepartureTime(formattedDate);
            
            }
        }

        

    }, [type, data?.transport_type, data?.start]);

    const handleTransportTypeChange = (type) => {
        setTransportType(type);
    };

    const handleTransportModeChange = (mode) => {
        setTransportMode(mode);
        if (mode === 'now') {
            setDepartureTime('');
        }
    };

    const handleLocationSourceChange = (useCurrent) => {
        setUseCurrentLocation(useCurrent);
    };

    const getTransportIcon = () => {
        switch (transportType) {
            case 'public_transport': return <Bus size={18} />;
            case 'car': return <CarFront size={18} />;
            case 'train': return <TrainFront size={18} />;
            case 'plane': return <Plane size={18} />;
            case 'walking': return <Footprints size={18} />;
            case 'bicycle': return <Bike size={18} />;
            default: return <Bus size={18} />;
        }
    };

    const getTransportName = () => {
        switch (transportType) {
            case 'public_transport': return 'Public Transport';
            case 'car': return 'Car';
            case 'train': return 'Train';
            case 'plane': return 'Plane';
            case 'walking': return 'Walking';
            case 'bicycle': return 'Bicycle';
            default: return 'Public Transport';
        }
    };

    function convertToUnixTime(departureTime) {
        // สร้าง Date object จาก string เวลา
        const date = new Date(departureTime);
        
        // แปลงเป็น Unix Timestamp (หน่วยวินาที)
        const unixTime = Math.floor(date.getTime() / 1000);
        
        return unixTime;
    }

    const getMapLinks = () => {
        if (type !== 'navigation') return {};

        const origin = useCurrentLocation ? 'Current Location' : `${data.origin.lat},${data.origin.lng}`;
        const destination = `${data.destination.lat},${data.destination.lng}`;
        // const mode = transportType === 'public_transport' ? 'transit' : transportType;
        let mode_googlemap ;
        let mode_Amap ;
        let mode_Baidu ;
        let mode_applemap ;
        // google map
        if (transportType === 'public_transport'){
            mode_googlemap = 'transit'
        }else if(transportType === 'car'){
            mode_googlemap = 'driving'
        }else if(transportType === 'bicycle'){
            mode_googlemap = 'bicycling'
        }else{
            mode_googlemap = transportType
        }
        // amap
        if (transportType === 'public_transport' || transportType === 'train'){
            mode_Amap = 'bus'
        }else if(transportType === 'walking'){
            mode_Amap = 'walk'
        }else if(transportType === 'bicycle'){
            mode_Amap = 'bike'
        }else{
            mode_Amap = transportType
        }
         // Baidu Ma
        if (transportType === 'public_transport'){
            mode_Baidu = 'transit'
        }else if(transportType === 'car'){
            mode_Baidu = 'driving'
        }else if(transportType === 'bicycle'){
            mode_Baidu = 'riding'
        }else{
            mode_Baidu = transportType
        }

        // Apple MAp
        if(transportType === 'car'){
            mode_applemap = 'd'
        }else if(transportType === 'walking'){
            mode_applemap = 'w'
        }else{
            mode_applemap = 'r'
        }

        
        const params = {
            origin,
            destination,
            travelmode: mode_googlemap,
            dir_action: 'navigate'
        };

        // console.log(departureTime)

        let unix_time;

        if (transportMode === 'onplan' && departureTime) {
            params.departure_time = Math.floor(new Date(departureTime).getTime() / 1000);
            unix_time = convertToUnixTime(departureTime);
        }

        // Google Maps
        const googleMapsUrl = `http://google.com/maps/dir/?api=1&${new URLSearchParams(params)}`;
        
        // AMap
        let amapUrl;
        if (useCurrentLocation){
            amapUrl = `https://uri.amap.com/navigation?from=当前位置&to=${data.destination.lng},${data.destination.lat}&mode=${mode_Amap}&policy=0&src=web&callnative=0`;
        }else{
            amapUrl = `https://uri.amap.com/navigation?from=${data.origin.lng},${data.origin.lat}&to=${data.destination.lng},${data.destination.lat}&mode=${mode_Amap}&policy=0&src=web&callnative=0`;
        }
        
        // Baidu Map
        let baiduUrl;
        if (useCurrentLocation){
            baiduUrl = `baidumap://map/direction?origin=currentLocation&destination=latlng:${data.destination.lat},${data.destination.lng}|name:${data.destination.name}&mode=${mode_Baidu}&region=none&output=html&src=webapp.baidu.openAPIdemo`;
        }else{
            baiduUrl = `http://api.map.baidu.com/direction?origin=latlng:${data.origin.lat},${data.origin.lng}|name:${data.origin.name}&destination=latlng:${data.destination.lat},${data.destination.lng}|name:${data.destination.name}&mode=${mode_Baidu}&region=none&output=html&src=webapp.baidu.openAPIdemo`;
        }
        
        // Apple Maps
        let appleMapsUrl;
        if (useCurrentLocation){
            appleMapsUrl = `maps://?saddr=Current%20Location&daddr=${data.destination.lat},${data.destination.lng}&dirflg=${mode_applemap}`;
        }else{
            appleMapsUrl = `maps://?saddr=${data.origin.lat},${data.origin.lng}&daddr=${data.destination.lat},${data.destination.lng}&dirflg=${mode_applemap}`;
        }

        return { googleMapsUrl, amapUrl, baiduUrl, appleMapsUrl };
    };


    const { googleMapsUrl, amapUrl, baiduUrl, appleMapsUrl } = getMapLinks();

    // console.log(data.start)
    return (
        <>
            <div className="overlay" onClick={onClose}>
                <div
                    className="MapShare card"
                    style={{ maxWidth: '650px' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="card-header d-flex align-items-center justify-content-between border-1">
                        <ul className="nav nav-tabs card-header-tabs border-0">
                            <li className="nav-item disabled">
                                <a className={`nav-link text-black ${type === "location" ? 'active' : ''}`} aria-current="true">Location</a>
                            </li>
                            <li className="nav-item disabled">
                                <a className={`nav-link text-black ${type === "navigation" ? 'active' : ''}`} aria-current="true">Navigation</a>
                            </li>
                        </ul>
                        <button onClick={onClose} className="btn btn-sm text-danger"><X/></button>
                    </div>
                    
                    {/* Location section */}
                    {type === "location" && (
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
                                    href={`https://maps.google.com/?q=${data.location.lat},${data.location.lng}(${data.name})`}
                                >
                                    <img src="/images/google-maps-logo.png" width="22" className="me-2" alt="Google Maps" />
                                    Google Map
                                </Link>
                                </div>

                                <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                                <Link
                                    className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded "
                                    target="_blank"
                                    href={`https://uri.amap.com/marker?position=${data.location.lng},${data.location.lat}&name=${data.name}`}
                                >
                                    <img src="/images/Amap-logo.png" width="22" className="me-2" alt="AMap" />
                                    Amap
                                </Link>
                                </div>

                                <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                                <Link
                                    className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded "
                                    target="_blank"
                                    href={`http://api.map.baidu.com/marker?location=${data.location.lat},${data.location.lng}&title=${data.name}&output=html`}
                                >
                                    <img src="/images/baidu.png" width="22" className="me-2" alt="Baidu Map" />
                                    Baidu Map
                                </Link>
                                </div>

                                <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                                <Link
                                    className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded "
                                    target="_blank"
                                    href={`https://maps.apple.com/?ll=${data.location.lat},${data.location.lng}&q=${data.name}`}
                                >
                                    <img src="/images/AppleMaps_logo.png" width="22" className="me-2" alt="Apple Map" />
                                    Apple Map
                                </Link>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Navigation section */}
                    {type === "navigation" && (
                        <div className="card-body centered-card">
                            <div className="location p-2 border-bottom d-flex align-items-center justify-content-center">
                                <p className="mb-0">
                                    {data.origin.name.length > 30 ? `${data.origin.name.slice(0, 30)}...` : data.origin.name}
                                </p>
                                <MoveRight className="mx-3" size={18} />
                                <p className="mb-0">
                                    {data.destination.name.length > 30 ? `${data.destination.name.slice(0, 30)}...` : data.destination.name}
                                </p>
                            </div>
                            
                            {/* Transport type selection */}
                            <div className="mt-3">
                                <h6 className="mb-2">Transport Type</h6>
                                <div className="btn-group btn-group-toggle w-100" data-toggle="buttons">
                                    {[
                                        { type: 'public_transport', icon: <Bus size={18} />, label: 'Public' },
                                        { type: 'car', icon: <CarFront size={18} />, label: 'Car' },
                                        { type: 'train', icon: <TrainFront size={18} />, label: 'Train' },
                                        { type: 'plane', icon: <Plane size={18} />, label: 'Plane' },
                                        { type: 'walking', icon: <Footprints size={18} />, label: 'Walk' },
                                        { type: 'bicycle', icon: <Bike size={18} />, label: 'Bike' }
                                    ].map((item) => (
                                        <button
                                            key={item.type}
                                            className={`btn btn-secondary input-outline-dark d-flex align-items-center justify-content-center ${transportType === item.type ? 'active bg-black' : ''}`}
                                            onClick={() => handleTransportTypeChange(item.type)}
                                        >
                                            {item.icon}
                                            {transportType === item.type && (
                                                <span className="ms-2">{item.label}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Departure time selection */}
                            <div className="mt-3">
                                <h6 className="mb-2">Departure Time</h6>
                                <div className="btn-group btn-group-toggle w-100" data-toggle="buttons">
                                    <button
                                        className={`btn btn-secondary input-outline-dark d-flex align-items-center justify-content-center ${transportMode === 'now' ? 'active bg-black' : ''}`}
                                        onClick={() => handleTransportModeChange('now')}
                                    >
                                        <Clock size={18} className="me-1" />
                                        <span className="ms-1">Leave now</span>
                                    </button>
                                    <button
                                        className={`btn btn-secondary input-outline-dark d-flex align-items-center justify-content-center ${transportMode === 'onplan' ? 'active bg-black' : ''}`}
                                        onClick={() => handleTransportModeChange('onplan')}
                                    >
                                        <Clock size={18} className="me-1" />
                                        <span className="ms-1">Depart at </span>
                                    </button>
                                </div>
                                {transportMode === 'onplan' && (
                                    <div className="mt-2">
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={departureTime}
                                            onChange={(e) => setDepartureTime(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {/* Location source selection */}
                            <div className="mt-3">
                                <h6 className="mb-2">Starting Point</h6>
                                <div className="btn-group btn-group-toggle w-100" data-toggle="buttons">
                                    <button
                                        className={`btn btn-secondary input-outline-dark d-flex align-items-center justify-content-center ${useCurrentLocation ? 'active bg-black' : ''}`}
                                        onClick={() => handleLocationSourceChange(true)}
                                    >
                                        <LocateFixed size={18} className="me-1" />
                                        <span className="ms-1">Current Location</span>
                                    </button>
                                    <button
                                        className={`btn btn-secondary input-outline-dark d-flex align-items-center justify-content-center ${!useCurrentLocation ? 'active bg-black' : ''}`}
                                        onClick={() => handleLocationSourceChange(false)}
                                    >
                                        <MapPin size={18} className="me-1" />
                                        <span className="ms-1">{data.origin.name.length > 30 ? `${data.origin.name.slice(0, 30)}...` : data.origin.name}</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Summary */}
                            <div className="mt-3 p-3 bg-light rounded">
                                <div className="d-flex align-items-center mb-2">
                                    {getTransportIcon()}
                                    <span className="ms-2 fw-bold">{getTransportName()}</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <Clock size={16} />
                                    <span className="ms-2">
                                        {transportMode === 'now' 
                                            ? 'Leave now' 
                                            : departureTime 
                                                ? `Depart at ${new Date(departureTime).toLocaleString()}`
                                                : 'Select departure time'}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <Map size={16} />
                                    <span className="ms-2">
                                        From: {useCurrentLocation ? 'Current Location' : data.origin.name}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Map links */}
                            <div className="link row g-2 mt-3">
                                <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                                    <Link
                                        className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded"
                                        target="_blank"
                                        href={googleMapsUrl}
                                    >
                                        <img src="/images/google-maps-logo.png" width="22" className="me-2" alt="Google Maps" />
                                        Google Map
                                    </Link>
                                </div>

                                <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                                    <Link
                                        className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded"
                                        target="_blank"
                                        href={amapUrl}
                                    >
                                        <img src="/images/Amap-logo.png" width="22" className="me-2" alt="AMap" />
                                        Amap
                                    </Link>
                                </div>

                                <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                                    <Link
                                        className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded"
                                        target="_blank"
                                        href={baiduUrl}
                                    >
                                        <img src="/images/baidu.png" width="22" className="me-2" alt="Baidu Map" />
                                        Baidu Map
                                    </Link>
                                </div>

                                <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                                    <Link
                                        className="btn btn-secondary input-outline-dark w-100 d-flex align-items-center justify-content-center rounded"
                                        target="_blank"
                                        href={appleMapsUrl}
                                    >
                                        <img src="/images/AppleMaps_logo.png" width="22" className="me-2" alt="Apple Map" />
                                        Apple Map
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}