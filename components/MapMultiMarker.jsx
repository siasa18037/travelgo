import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Loading from '@/components/Loading';
import '@/styles/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2lhc2ExODAzNyIsImEiOiJjbWJkbTg1dTUxMmhxMnFvY2p3bXp5aTdyIn0.0IEqVDr79KuJ5z9WEVB7bA';

const DEFAULT_LOCATION = {
  lng: 100.523186,
  lat: 13.736717,
};

const MapMultiMarker = ({ locations, mode = 'markers' }) => { //navigation
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  useEffect(() => {
    if (!mapboxgl.accessToken) return;

    const validLocations = (locations || []).filter(
      (loc) => loc.lat !== undefined && loc.lng !== undefined && loc.lat !== '' && loc.lng !== ''
    );

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat],
      zoom: 10,
    });

    map.current.on('load', () => {
      if (validLocations.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        validLocations.forEach((loc) => bounds.extend([loc.lng, loc.lat]));
        map.current.fitBounds(bounds, { padding: 80 });
      } else if (validLocations.length === 1) {
        map.current.setCenter([validLocations[0].lng, validLocations[0].lat]);
        map.current.setZoom(12);
      }

      validLocations.forEach((loc, index) => {
        const markerEl = document.createElement('div');
        markerEl.className = 'map-marker';
        markerEl.innerHTML = `<span class="marker-number">${index + 1}</span>`;

        markerEl.addEventListener('click', () => {
          if (loc.address) {
            window.open(loc.address, '_blank');
          }
        });

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([loc.lng, loc.lat])
          .addTo(map.current);

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false })
          .setHTML(`<div><p>${loc.location_name}</p></div>`);
        
        marker.setPopup(popup);
      });

      if (mode === 'navigation' && validLocations.length > 1) {
        getRoute(validLocations);
      }
    });

    // ▼▼▼ ส่วนที่แก้ไข ▼▼▼
    const getRoute = async (coords) => {
      const coordinatesString = coords.map(loc => `${loc.lng},${loc.lat}`).join(';');
      const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

      try {
        const response = await fetch(apiUrl);
        const json = await response.json();
        
        // --- จุดแก้ไขสำคัญ ---
        // ตรวจสอบว่า API หาเส้นทางเจอหรือไม่
        if (json.routes && json.routes.length > 0) {
          const data = json.routes[0];
          const routeGeometry = data.geometry;

          // ถ้าเจอเส้นทาง ก็วาดลงบนแผนที่ตามปกติ
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeGeometry,
            },
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#3887be',
              'line-width': 5,
              'line-opacity': 0.75,
            },
          });
        } else {
          // ถ้าไม่เจอเส้นทาง ให้แสดงข้อความเตือนใน Console และไม่ต้องทำอะไรเพิ่ม
          // แผนที่จะแสดงแค่หมุด (Marker) ซึ่งเป็นสิ่งที่เราต้องการ
          console.warn('Mapbox Directions API could not find a route between points. Displaying markers only.');
        }
      } catch (error) {
        // จัดการกับ Error ที่เกิดจาก Network หรืออื่นๆ
        console.error('Error fetching route:', error);
      }
    };
    // ▲▲▲ สิ้นสุดส่วนที่แก้ไข ▲▲▲

    return () => {
      if (map.current) map.current.remove();
    };
  }, [locations, mode]);

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