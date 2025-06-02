import React, { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Loading from '@/components/Loading';
import '@/styles/mapbox-gl.css'

// mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

mapboxgl.accessToken = 'pk.eyJ1Ijoic2lhc2ExODAzNyIsImEiOiJjbWJkbTg1dTUxMmhxMnFvY2p3bXp5aTdyIn0.0IEqVDr79KuJ5z9WEVB7bA'

const MapMultiMarker = ({ locations }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!mapboxgl.accessToken || !locations || locations.length === 0) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      bounds: calculateBounds(locations),
      fitBoundsOptions: { padding: 50 }
    });

    // Add markers with hover popup
    const newMarkers = locations.map((loc, index) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'map-marker';
      markerEl.innerHTML = `<span class="marker-number">${index + 1}</span>`;

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([loc.lng, loc.lat])
        .addTo(map.current);

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false })
        .setLngLat([loc.lng, loc.lat])
        .setHTML(`
          <div>
            <h5>${loc.location_name}</h5>
            <p>${loc.address}</p>
          </div>
        `);

      marker.getElement().addEventListener('mouseenter', () => popup.addTo(map.current));
      marker.getElement().addEventListener('mouseleave', () => popup.remove());

      return marker;
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => marker.remove());
      if (map.current) map.current.remove();
    };
  }, [locations]);

  const calculateBounds = (locations) => {
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach(loc => bounds.extend([loc.lng, loc.lat]));
    return bounds;
  };

  if (!mapboxgl.accessToken) return <div>Mapbox token is missing</div>;
  if (!locations || locations.length === 0) return <Loading />;

  return (
    <div 
      ref={mapContainer} 
      style={{ width: '100%', height: '500px' }} 
      className="map-container"
    />
  );
};

export default MapMultiMarker;
