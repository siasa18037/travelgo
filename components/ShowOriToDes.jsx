import { useState, useEffect ,useMemo } from 'react';
import { Bus , CarFront , TrainFront , Plane ,Footprints,Bike } from 'lucide-react';
import { getDurationString, getLocalTimeString } from '@/utils/dateLocal';
import MapShare from '@/components/MapShare'

export default function ShowOriToDes({data , start ,end}) {
    const [mapShareBox , setMapShareBox] = useState(false); 
    const [mapSharedata,setMapSharedata] = useState();
    const [mapShareType,setMapShareType] = useState('location')

    console.log(data)

    const transportOptions = [
        { value: "public_transport", icon: <Bus size={18} /> , name : "Public Transport"},
        { value: "car", icon: <CarFront size={18} />, name : "Car" },
        { value: "plane", icon: <Plane size={18} /> , name : "Plane"},
        { value: "train", icon: <TrainFront size={18} /> , name : "Train"},
        { value: "walking", icon: <Footprints size={18} /> , name : "Walking"},
        { value: "bicycle", icon: <Bike size={18} /> , name : "Bicycle"},
    ];

    const duration = getDurationString(start, end, 'Asia/Bangkok');

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
        // else if (mode === '') {
        //     setMapShareType('navigation')
        //     setMapSharedata({
        //         name: item.name,
        //         start: item.start,
        //         end: item.end,
        //         transport_type: item.data.transport_type,
        //         origin: item.data.origin,
        //         destination: item.data.destination
        //     });
        // }
        setMapShareBox(true);
    };

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
                     {transportOptions.map(({ value, icon , name }) => (
                       value === data.transport_type && (
                        <p key={value} className="mb-0 d-flex align-items-center gap-2">
                          {icon}{name} ใช้เวลา {duration}
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
