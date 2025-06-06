import React, { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Loading from '@/components/Loading';
import '@/styles/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2lhc2ExODAzNyIsImEiOiJjbWJkbTg1dTUxMmhxMnFvY2p3bXp5aTdyIn0.0IEqVDr79KuJ5z9WEVB7bA';

const DEFAULT_LOCATION = {
  lng: 100.523186,
  lat: 13.736717,
}; // กรุงเทพ

const MapMultiMarker = ({ locations }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState([]);

useEffect(() => {
  if (!mapboxgl.accessToken) return;

  const validLocations = (locations || []).filter(
    (loc) => loc.lat !== undefined && loc.lng !== undefined && loc.lat !== '' && loc.lng !== ''
  );

  // Initialize map
  map.current = new mapboxgl.Map({
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat], // fallback center
    zoom: 10, // fallback zoom
  });

  // ถ้ามีหลายจุด ให้ fitBounds
  if (validLocations.length > 1) {
    const bounds = calculateBounds(validLocations);
    map.current.fitBounds(bounds, { padding: 50 });
  }
  // ถ้ามี 1 จุด ให้ setCenter แบบกำหนดเอง ไม่ให้ซูมเยอะเกิน
  else if (validLocations.length === 1) {
    map.current.setCenter([validLocations[0].lng, validLocations[0].lat]);
    map.current.setZoom(12); // ปรับได้ตามความเหมาะสม
  }
  // ถ้าไม่มีเลย ใช้ DEFAULT_LOCATION
  else {
    map.current.setCenter([DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat]);
    map.current.setZoom(10);
  }

  // Add markers
const newMarkers = validLocations.map((loc, index) => {
  const markerEl = document.createElement('div');
  markerEl.className = 'map-marker';
  markerEl.innerHTML = `<span class="marker-number">${index + 1}</span>`;

  // 👉 เพิ่ม event click เพื่อเปิด URL
  markerEl.addEventListener('click', () => {
    if (loc.address) {
      window.open(loc.address, '_blank'); // เปิดในแท็บใหม่
    }
  });

  const marker = new mapboxgl.Marker(markerEl)
    .setLngLat([loc.lng, loc.lat])
    .addTo(map.current);

  const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false })
    .setLngLat([loc.lng, loc.lat])
    .setHTML(`
      <div>
        <p>${loc.location_name}</p>
      </div>
    `);

  marker.getElement().addEventListener('mouseenter', () => popup.addTo(map.current));
  marker.getElement().addEventListener('mouseleave', () => popup.remove());

  return marker;
});


  setMarkers(newMarkers);

  return () => {
    newMarkers.forEach((marker) => marker.remove());
    if (map.current) map.current.remove();
  };
}, [locations]);


  const calculateBounds = (locations) => {
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc) => bounds.extend([loc.lng, loc.lat]));
    return bounds;
  };

  if (!mapboxgl.accessToken) return <div>Mapbox token is missing</div>;

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '500px' }}
      className="map-container"
    />
  );
};

export default MapMultiMarker;
