import { useEffect, useState } from "react";
import MapWithGeocoder from "@/components/MapWithGeocoder";
import { Map, Search ,Link ,MapPin} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/swal";

export default function MapSearch({ SelectLocation , value }) {
    const [showMap, setShowMap] = useState(false);
    const [selectedMode, setSelectedMode] = useState("google"); // 'search' or 'google'
    const [googleLink, setGoogleLink] = useState("");
    const [location , setLocation] = useState();

    useEffect(() => {
        if (value) {
            setLocation(value);
            if (value.address) {
                setGoogleLink(value.address);
            }
        }
    }, [value]);

    const handleLocationSelected = (location) => {
        if (SelectLocation) {
        SelectLocation(location); // ส่งค่ากลับไปยังคอมโพเนนต์แม่
        }
        setShowMap(false);
    };

    function extractGoogleMapInfo(googleLink) {
    
        const realLatLngMatch = googleLink.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        const lat = realLatLngMatch ? parseFloat(realLatLngMatch[1]) : null;
        const lng = realLatLngMatch ? parseFloat(realLatLngMatch[2]) : null;
        let name = '';

        if (googleLink){
            const url = new URL(googleLink);
            const pathParts = url.pathname.split('/');
            for (let i = 0; i < pathParts.length; i++) {
                if (pathParts[i] === 'place' && i + 1 < pathParts.length) {
                    name = decodeURIComponent(pathParts[i + 1].replace(/\+/g, ' '));
                    break;
                }
            }
            const address = googleLink;
            setLocation({name, lat, lng, address})
            return { name, lat, lng, address };
        }
        const address = '';
        return { name, lat, lng, address }
    }


    const extractLatLngFromGoogleLink = () => {
        try {
            const info = extractGoogleMapInfo(googleLink);

            if (!info.lat || !info.lng) {
            showErrorToast("ไม่สามารถดึงพิกัดจากลิงก์ได้");
            return;
            }

            if (SelectLocation) {
            SelectLocation(info);
            }

            showSuccessToast("ดึงข้อมูลตำแหน่งสำเร็จ!");
        } catch (error) {
            console.error(error);
            showErrorToast("เกิดข้อผิดพลาดในการประมวลผลลิงก์");
        }
    };


  return (
    <>
      <div className="input d-flex justify-content-between align-items-center gap-2">
        <div className="btn-group btn-group-toggle mb-2" data-toggle="buttons">
          <label
            className={`btn btn-secondary input-outline-dark d-flex align-items-center ${
              selectedMode === "google" ? "active bg-black" : ""
            }`}
            onClick={() => {
              setSelectedMode("google");
              setShowMap(false);
            }}
          >
            <input type="radio" name="options" style={{ display: "none" }} />
            <Map className="me-2" size={18} />
            Google map
          </label>
          <label
            className={`btn btn-secondary input-outline-dark d-flex align-items-center ${
              selectedMode === "search" ? "active bg-black" : ""
            }`}
            onClick={() => {
              setSelectedMode("search");
              setShowMap(true);
            }}
          >
            <input type="radio" name="options" style={{ display: "none" }} />
            <Search className="me-2" size={18} />
            Search map
          </label>
        </div>
        {location && (
        <div className="d-flex align-items-center">
            <MapPin className="me-1" size={18} />
            <p className="mb-0"> <strong>{location.name}</strong></p>
        </div>
        )}
      </div>

      {/* Google Map Link Input */}
      {selectedMode === "google" && (
        <div className="d-flex justify-content-center align-items-center gap-2 ">
            <input
                type="text"
                placeholder="วางลิงก์ Google Maps ที่นี่..."
                className="form-control input-outline-dark"
                value={googleLink}
                onChange={(e) => setGoogleLink(e.target.value)}
            />
            <button
                className="btn d-flex align-items-center custom-dark-hover"
                onClick={extractLatLngFromGoogleLink}
                style={{ minWidth : '120px' }}
            >
                <Link className="me-1" size={18} />
                Link data
            </button>
        </div>
      )}

      {/* Search map mode */}
      {showMap && selectedMode === "search" && (
        <div style={{ marginBottom: "20px" }}>
          <MapWithGeocoder onSelectLocation={handleLocationSelected} />
        </div>
      )}
    </>
  );
}