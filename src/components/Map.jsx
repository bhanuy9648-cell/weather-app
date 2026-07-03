import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';

const Map = ({ lat, lng, isLive, trackingHistory }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);

  // Custom DivIcon for Leaflet markers matching the UI
  const createCustomGpsIcon = (isLiveMode) => {
    const className = isLiveMode ? 'custom-gps-marker live-mode' : 'custom-gps-marker';
    const color = isLiveMode ? 'var(--color-success)' : 'var(--accent-color)';
    const glow = isLiveMode ? 'var(--color-success-glow)' : 'var(--accent-glow)';
    
    return L.divIcon({
      className: className,
      html: `
        <div class="marker-pulse" style="background-color: ${glow};"></div>
        <div class="marker-core" style="background-color: ${color};"></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  useEffect(() => {
    // Initialize map
    const mapInstance = L.map('map-view', {
      zoomControl: true,
      attributionControl: true
    }).setView([lat, lng], 13);

    // CartoDB Dark Matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapInstance);

    // Marker
    const markerInstance = L.marker([lat, lng], {
      icon: createCustomGpsIcon(isLive)
    }).addTo(mapInstance);

    // Polyline
    const polylineInstance = L.polyline(trackingHistory, {
      color: '#10b981',
      weight: 4,
      opacity: 0.8,
      dashArray: '5, 10'
    }).addTo(mapInstance);

    mapRef.current = mapInstance;
    markerRef.current = markerInstance;
    polylineRef.current = polylineInstance;

    // Cleanup map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run only once on mount

  // Sync marker position and type when coordinates or tracking state change
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(createCustomGpsIcon(isLive));
      mapRef.current.setView([lat, lng], isLive ? 16 : 13);
    }
  }, [lat, lng, isLive]);

  // Sync polyline trail when tracking history changes
  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(trackingHistory);
    }
  }, [trackingHistory]);

  return <div id="map-view"></div>;
};

Map.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  isLive: PropTypes.bool.isRequired,
  trackingHistory: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
};

export default Map;
