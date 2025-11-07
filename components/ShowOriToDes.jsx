import { useState, useEffect ,useMemo } from 'react';
import { Bus , CarFront , TrainFront , Plane ,Footprints,Bike } from 'lucide-react';
import { getDurationString, getLocalTimeString } from '@/utils/dateLocal';
import MapShare from '@/components/MapShare'
import axios from "axios";

export default function ShowOriToDes({data , start ,end , btn=false}) {
    const [mapShareBox , setMapShareBox] = useState(false); 
    const [mapSharedata,setMapSharedata] = useState();
    const [mapShareType,setMapShareType] = useState('location')
    const [navInfo, setNavInfo] = useState(null);

    // console.log(data)

    const transportOptions = [
        { value: "public_transport", icon: <Bus size={18} /> , name : "Public Transport" },
        { value: "car", icon: <CarFront size={18} />, name : "Car" },
        { value: "plane", icon: <Plane size={18} /> , name : "Plane"},
        { value: "train", icon: <TrainFront size={18} /> , name : "Train"},
        { value: "walking", icon: <Footprints size={18} /> , name : "Walking"},
        { value: "bicycle", icon: <Bike size={18} /> , name : "Bicycle"},
    ];

    const duration = getDurationString(start, end, 'Asia/Bangkok');

    const calculationNavigation = async (originLat, originLng, destLat, destLng , mode) => {
        // Input validation
        if (Math.abs(originLat) > 90 || Math.abs(destLat) > 90 || 
            Math.abs(originLng) > 180 || Math.abs(destLng) > 180) {
            console.error("Invalid coordinates received");
            return "Invalid coordinates";
        }
        if(mode=='plane'){
            return "";
        }

        let url;
        const apiKey = "5b3ce3597851110001cf62489b066887739342cf81da6dfaa136b684";
        if (mode=='walking'){
            url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${originLng},${originLat}&end=${destLng},${destLat}`;
        }else{
            url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${originLng},${originLat}&end=${destLng},${destLat}`;
        }
        const response = await axios.get(url)
        // console.log(response)

        const data = await response.data;

        if (!data?.features?.[0]?.properties?.summary) {
            console.warn("Unexpected API response structure:", data);
            console.log('Error')
            return "";
        }

        const distance = data.features[0].properties.summary.distance / 1000;
        const duration = data.features[0].properties.summary.duration / 60;

        if(mode=='car' || mode=='walking'){
             return `${distance.toFixed(2)} กิโลเมตร | RT ${duration.toFixed(1)} นาที`;
        }else{
            return `${distance.toFixed(2)} กิโลเมตร`;
        }

        return'';
    
    };


    const ShowMapShare = (mode) => {
        if (mode === 'origin') {
            setMapShareType('location')
            setMapSharedata({
                name: data.origin.name,
                start: start,
                end: end,
                location: data.origin
            });
        }else if (mode === 'destination') {
            setMapShareType('location')
            setMapSharedata({
                name: data.destination.name,
                start: start,
                end: end,
                location: data.destination
            });
        } 
        else if (mode === 'navigation') {
            setMapShareType('navigation')
            setMapSharedata({
                name: 'rfrf',
                start: start,
                end: end,
                transport_type: data.transport_type,
                origin: data.origin,
                destination: data.destination
            });
        }
        setMapShareBox(true);
    };

    useEffect(() => {
        const fetchNavInfo = async () => {
            const result = await calculationNavigation(
                data.origin.lat,
                data.origin.lng,
                data.destination.lat,
                data.destination.lng,
                data.transport_type
            );
            setNavInfo(result);
        };

        fetchNavInfo();
    }, [data.origin.lat, data.origin.lng, data.destination.lat, data.destination.lng ,data.transport_type]);

    return (
        <>
         <div className="ShowOriToDes input-outline-dark">
            <ol className="stepper p-2 mb-0">
                <li className="stepper__item pb-2 d-flex align-items-center gap-2">
                    <p className='mb-0'>{getLocalTimeString(start)}</p>
                    <h5 className="mb-0">
                        <button onClick={() => ShowMapShare('origin')} className='btn p-0 fs-5 fw-bold'>
                            {data.origin.name}
                        </button>
                    </h5>
                </li>
                <li className="stepper__item_2 pb-2">
                    {transportOptions.map(({ value, icon, name }) => (
                        value === data.transport_type && (
                            <p key={value} className="mb-0 d-flex align-items-center gap-2">
                                {icon}{name} ใช้เวลา {duration} {navInfo && `(${navInfo}) `}
                            </p>
                        )
                    ))}
                </li>
                <li className="stepper__item d-flex align-items-center gap-2">
                    <p className='mb-0'>{getLocalTimeString(end)}</p>
                    <h5 className="mb-0">
                        <button onClick={() => ShowMapShare('destination')} className='btn p-0 fs-5 fw-bold'>
                            {data.destination.name}
                        </button>
                    </h5>
                </li>
            </ol>
            <button
                className="btn input-outline-dark mb-1"
                onClick={() => ShowMapShare('navigation')}
                >
                นำทาง
            </button>
        </div>
        {/* mapShareBox */}
        {mapShareBox && (
        <div className="modal-content">
            <MapShare 
            data={mapSharedata} 
            type={mapShareType}
            onClose={() => setMapShareBox(false)}
            />
        </div>
        )}
        </>
    );
}
