import { useRef, useEffect, useState } from "react";
import { SearchBox } from "@mapbox/search-js-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const accessToken = "pk.eyJ1Ijoic2lhc2ExODAzNyIsImEiOiJjbWJkbTg1dTUxMmhxMnFvY2p3bXp5aTdyIn0.0IEqVDr79KuJ5z9WEVB7bA";
// const accessToken = 'awdawd'

export default function MapWithGeocoder({ onSelectLocation }) {
  const mapContainerRef = useRef();
  const mapInstanceRef = useRef();
  const markerRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [100.5018, 13.7563], // Bangkok
      zoom: 9,
    });

    mapInstanceRef.current = map;

    // Handle map click
    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) markerRef.current.remove();

      markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
      map.flyTo({ center: [lng, lat], zoom: 14 });

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`
      );
      const data = await response.json();
      const place = data.features[0];

      if (place) {
        const location = {
          name: place.text || "",
          lat,
          lng,
          address: place.place_name || "",
        };

        if (onSelectLocation) {
          onSelectLocation(location); // ✅ ส่งไปยัง parent
        }
      }
    });

    return () => {
      map.remove();
    };
  }, [onSelectLocation]);

  // Handle SearchBox result
  const handleRetrieve = (result) => {
    if (!result?.features?.length) return;

    const feature = result.features[0];
    const [lng, lat] = feature.geometry.coordinates;

    if (markerRef.current) markerRef.current.remove();

    markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapInstanceRef.current);
    mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 14 });

    const location = {
      name: feature.properties?.name || feature.text || "",
      lat,
      lng,
      address: feature.properties?.full_address || feature.place_name || "",
    };

    if (onSelectLocation) {
      onSelectLocation(location); // ✅ ส่งไปยัง parent
    }
  };

  return (
    <>
      <SearchBox
        accessToken={accessToken}
        map={mapInstanceRef.current}
        mapboxgl={mapboxgl}
        value={inputValue}
        onChange={(value) => setInputValue(value)}
        onRetrieve={handleRetrieve}
      />
      <div id="map-container" ref={mapContainerRef} style={{ height: 300, marginBottom: 16 }} />
    </>
  );
}
