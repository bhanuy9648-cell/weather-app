import { useState, useEffect, useRef } from 'react';
import Map from '../components/Map';
import HourlyChart from '../components/HourlyChart';
import TelemetryLogs from '../components/TelemetryLogs';
import DetailedMetrics from '../components/DetailedMetrics';
import '../styles/Weather.css';

const defaultLocation = { lat: 40.7128, lng: -74.0060, name: "New York" };

const Home = () => {
  // Coordinates and Location name state
  const [coords, setCoords] = useState({ lat: defaultLocation.lat, lng: defaultLocation.lng });
  const [locationName, setLocationName] = useState(defaultLocation.name);

  // Weather data
  const [weather, setWeather] = useState(null);

  // Live GPS tracking states
  const [isLive, setIsLive] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [logs, setLogs] = useState([
    {
      id: 'initial',
      message: 'Ready for live tracking activation...',
      details: 'Pending GPS',
      typeClass: 'log-start',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      latlng: null,
      weatherObj: null
    }
  ]);

  // Telemetry caching refs to prevent closure issues in geolocation callback
  const trackingHistoryRef = useRef([]);
  const watchIdRef = useRef(null);
  const lastFetchedCoordsRef = useRef(null);
  const lastFetchedTimeRef = useRef(0);
  const cachedWeatherObjRef = useRef(null);

  // UI state variables
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Locating user...");
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Notification System
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Reverse geocoding helper
  const reverseGeocode = async (lat, lng) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SkyFlowWeatherDashboard/1.0 (contact: github-agent)'
        }
      });
      if (!response.ok) throw new Error("Reverse geocoding fetch error");
      const data = await response.json();
      
      if (data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
        const state = data.address.state || data.address.region;
        const country = data.address.country;
        
        if (city) return `${city}, ${country}`;
        if (state) return `${state}, ${country}`;
        return country;
      }
    } catch (e) {
      console.error(e);
    }
    return `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  // Haversine formula to compute distance moved in meters
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Log message adder
  const addTrackingLogItem = (message, details, typeClass, latlng, weatherObj) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    setLogs((prev) => {
      const newLogs = [
        { id, message, details, typeClass, latlng, timestamp, weatherObj },
        ...prev
      ];
      // Limit to 25 items
      return newLogs.slice(0, 25);
    });
  };

  // Fetch weather dataset from Open-Meteo
  const fetchWeatherData = async (lat, lng, name) => {
    setLoadingStatus(`Loading weather for ${name}...`);
    setLoading(true);
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,precipitation_probability,relativehumidity_2m,surface_pressure&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
    
    try {
      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error("Weather request failed");
      const data = await response.json();
      
      const details = getWeatherDetails(data.current_weather.weathercode);
      
      // Update body class for gradient transitions
      document.body.className = '';
      document.body.classList.add(details.theme);

      // Cache weather properties
      const weatherObj = {
        temp: Math.round(data.current_weather.temperature),
        icon: details.icon,
        desc: details.desc
      };
      cachedWeatherObjRef.current = weatherObj;

      setWeather(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch weather data. Please try again.", "error");
      setLoading(false);
      return null;
    }
  };

  // Resolve WMO Weather interpretation codes
  const getWeatherDetails = (code) => {
    if (code === 0) return { desc: 'Clear Sky', icon: 'fa-sun', theme: 'weather-clear' };
    if ([1, 2, 3].includes(code)) return { desc: 'Partly Cloudy', icon: 'fa-cloud-sun', theme: 'weather-cloudy' };
    if ([45, 48].includes(code)) return { desc: 'Foggy', icon: 'fa-smog', theme: 'weather-cloudy' };
    if ([51, 53, 55, 56, 57].includes(code)) return { desc: 'Drizzle', icon: 'fa-cloud-rain', theme: 'weather-rainy' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { desc: 'Rainy', icon: 'fa-cloud-showers-heavy', theme: 'weather-rainy' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { desc: 'Snowy', icon: 'fa-snowflake', theme: 'weather-snowy' };
    if ([95, 96, 99].includes(code)) return { desc: 'Thunderstorm', icon: 'fa-cloud-bolt', theme: 'weather-stormy' };
    return { desc: 'Cloudy', icon: 'fa-cloud', theme: 'weather-cloudy' };
  };

  // Geolocation lookup (GPS One-time call)
  const requestGPSLocation = () => {
    setLoadingStatus("Locating your device...");
    setLoading(true);

    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      fetchWeatherData(coords.lat, coords.lng, locationName);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        lastFetchedCoordsRef.current = { lat, lng };
        lastFetchedTimeRef.current = Date.now();
        
        const address = await reverseGeocode(lat, lng);
        setCoords({ lat, lng });
        setLocationName(address);
        fetchWeatherData(lat, lng, address);
        showToast(`Location resolved: ${address}`, "success");
      },
      (error) => {
        console.warn(error);
        showToast(`GPS Error: ${error.message}. Loading default location.`, "error");
        fetchWeatherData(coords.lat, coords.lng, locationName);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Trigger one-time GPS lock on startup
  useEffect(() => {
    requestGPSLocation();
    
    return () => {
      // Deactivate watch tracking on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Geolocation live watch tracking
  const toggleLiveTracking = (active) => {
    setIsLive(active);
    
    if (active) {
      if (!navigator.geolocation) {
        showToast("Live tracking is not supported by your browser.", "error");
        setIsLive(false);
        return;
      }
      
      setLoadingStatus("Initializing live telemetry...");
      setLoading(true);
      
      // Reset history
      setTrackingHistory([]);
      trackingHistoryRef.current = [];
      
      addTrackingLogItem("Started live location tracking", "GPS Activated", "log-start", null, null);
      showToast("Live telemetry tracking active", "success");
      
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          setLoading(false);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy ? position.coords.accuracy.toFixed(1) : 'unknown';
          const speed = position.coords.speed ? (position.coords.speed * 3.6).toFixed(1) : null;
          const rawAccuracy = position.coords.accuracy || 999;
          
          // Noise filter
          if (rawAccuracy > 100 && trackingHistoryRef.current.length > 0) {
            console.warn("Ignoring noisy GPS telemetry (Accuracy: " + rawAccuracy + "m)");
            return;
          }
          
          const newCoords = [lat, lng];
          trackingHistoryRef.current = [...trackingHistoryRef.current, newCoords];
          setTrackingHistory(trackingHistoryRef.current);
          
          // Update core map view
          setCoords({ lat, lng });
          
          // API throttling rules
          let shouldUpdateWeather = false;
          let distanceMoved = 0;
          let timeDiff = 0;

          if (lastFetchedCoordsRef.current === null) {
            shouldUpdateWeather = true;
          } else {
            distanceMoved = calculateDistance(lat, lng, lastFetchedCoordsRef.current.lat, lastFetchedCoordsRef.current.lng);
            timeDiff = Date.now() - lastFetchedTimeRef.current;
            
            // Trigger updates if moved > 80m or > 5 minutes
            if (distanceMoved > 80 || timeDiff > 300000) {
              shouldUpdateWeather = true;
            }
          }
          
          const speedText = speed ? `, Speed: ${speed} km/h` : '';
          
          if (shouldUpdateWeather) {
            lastFetchedCoordsRef.current = { lat, lng };
            lastFetchedTimeRef.current = Date.now();
            
            const addr = await reverseGeocode(lat, lng);
            setLocationName(addr);
            
            await fetchWeatherData(lat, lng, addr);
            
            const distText = distanceMoved > 0 ? `, Moved: ${distanceMoved.toFixed(0)}m` : '';
            addTrackingLogItem(
              `Weather & Location sync (Acc: ±${accuracy}m${speedText}${distText})`,
              `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              "log-update",
              newCoords,
              cachedWeatherObjRef.current
            );
          } else {
            const distText = `, Moved: ${distanceMoved.toFixed(0)}m`;
            addTrackingLogItem(
              `Telemetry update (Acc: ±${accuracy}m${speedText}${distText}, API Throttled)`,
              `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              "log-update",
              newCoords,
              cachedWeatherObjRef.current
            );
          }
        },
        (error) => {
          setLoading(false);
          showToast(`Live Tracking Error: ${error.message}`, "error");
          addTrackingLogItem(`GPS signal lost: ${error.message}`, "Signal Error", "log-error", null, null);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
      
      watchIdRef.current = id;
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      addTrackingLogItem("Live tracking deactivated", "Offline", "log-start", null, null);
      showToast("Live tracking deactivated", "info");
    }
  };

  // Autocomplete City Geocoding
  const searchCityGeocoding = async (query) => {
    if (query.length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }
    
    const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    
    try {
      const response = await fetch(searchUrl);
      if (!response.ok) return;
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setAutocompleteResults(data.results);
        setShowAutocomplete(true);
      } else {
        setAutocompleteResults([]);
        setShowAutocomplete(false);
      }
    } catch (error) {
      console.error("Geocoding fetch error:", error);
    }
  };

  // Debounced geocoding search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCityGeocoding(searchQuery);
    }, 350);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click autocomplete item handler
  const handleAutocompleteClick = (city) => {
    // Disable active tracking
    if (isLive) {
      setIsLive(false);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    const label = `${city.name}, ${city.country || ''}`;
    setSearchQuery(city.name);
    setShowAutocomplete(false);
    setCoords({ lat: city.latitude, lng: city.longitude });
    setLocationName(label);
    
    fetchWeatherData(city.latitude, city.longitude, label);
  };

  // Panning map callback from logs click
  const handleLogClick = (latlng) => {
    setCoords({ lat: latlng[0], lng: latlng[1] });
  };

  // Close suggestions box when click outside
  useEffect(() => {
    const clickOutside = () => setShowAutocomplete(false);
    document.addEventListener('click', clickOutside);
    return () => document.removeEventListener('click', clickOutside);
  }, []);

  // Format date helper for main weather card
  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const weatherDetails = weather ? getWeatherDetails(weather.current_weather.weathercode) : { desc: 'Loading...', icon: 'fa-spinner', theme: 'weather-clear' };

  // Parse metrics
  const curHour = new Date().getHours();
  const humidity = weather ? weather.hourly.relativehumidity_2m[curHour] || weather.hourly.relativehumidity_2m[0] : null;
  const windSpeed = weather ? weather.current_weather.windspeed : null;
  const uvIndex = weather ? weather.daily.uv_index_max[0] : null;
  const pressure = weather ? weather.hourly.surface_pressure[curHour] || weather.hourly.surface_pressure[0] : null;
  const sunrise = weather && weather.daily.sunrise[0] ? new Date(weather.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
  const sunset = weather && weather.daily.sunset[0] ? new Date(weather.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="container">
      {/* Loading Overlay */}
      <div id="loading-screen" className={`loading-overlay ${!loading ? 'hidden' : ''}`}>
        <div className="spinner"></div>
        <div className="loading-text" id="loading-status">{loadingStatus}</div>
      </div>

      {/* Header Controls */}
      <header className="glass-panel">
        <div className="brand-section">
          <i className="fa-solid fa-wind brand-icon"></i>
          <h1 className="brand-title">SkyFlow</h1>
        </div>
        
        <div className="controls-section">
          {/* Search bar */}
          <div className="search-section" onClick={(e) => e.stopPropagation()}>
            <i className="fa-solid fa-magnifying-glass search-icon-inside"></i>
            <input
              type="text"
              id="search-city"
              className="search-input"
              placeholder="Search cities..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {showAutocomplete && autocompleteResults.length > 0 && (
              <ul id="autocomplete-list" className="autocomplete-results" style={{ display: 'block' }}>
                {autocompleteResults.map((city) => (
                  <li
                    key={city.id}
                    className="autocomplete-item"
                    onClick={() => handleAutocompleteClick(city)}
                  >
                    <i className="fa-solid fa-location-dot"></i>
                    <span><strong>{city.name}</strong>{city.admin1 ? ` (${city.admin1})` : ''}{city.country ? `, ${city.country}` : ''}</span>
                    <span className="country-code">{city.country_code || '---'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Live tracking toggle */}
          <div className="toggle-container">
            <span className="live-status">
              Live Tracking
              <span id="live-indicator-dot" className={`live-dot ${isLive ? 'active' : ''}`}></span>
            </span>
            <label className="switch">
              <input
                type="checkbox"
                id="live-toggle"
                checked={isLive}
                onChange={(e) => toggleLiveTracking(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Current Location Button */}
          <button id="btn-current-gps" className="btn-icon" title="Use current GPS location" onClick={requestGPSLocation}>
            <i className="fa-solid fa-location-crosshairs"></i>
            GPS
          </button>
        </div>
      </header>

      {/* Dashboard Content Grid */}
      <main className="dashboard-grid">
        
        {/* Left Column: Current Weather and Mini Metrics */}
        <section className="sidebar">
          {/* Main Weather Display Card */}
          <div className="glass-panel main-weather-card">
            <div className="weather-illustration-box" id="main-weather-icon">
              <i className={`fa-solid ${weatherDetails.icon}`}></i>
            </div>
            <div className="temp-display">
              <span id="main-temp">{weather ? Math.round(weather.current_weather.temperature) : '--'}</span>
              <span className="temp-unit">°C</span>
            </div>
            <div className="weather-desc" id="main-weather-desc">{weatherDetails.desc}</div>
            <div className="location-display">
              <i class="fa-solid fa-location-dot"></i>
              <span id="main-location">{locationName}</span>
            </div>
            <div className="date-display" id="main-date">{getFormattedDate()}</div>
          </div>

          {/* Detailed Metrics Grid */}
          <DetailedMetrics
            humidity={humidity}
            windSpeed={windSpeed}
            uvIndex={uvIndex}
            pressure={pressure}
            sunrise={sunrise}
            sunset={sunset}
          />
        </section>

        {/* Right Column: Interactive Map, Weather Charts, and Live Logs */}
        <section className="main-content">
          {/* Interactive Leaflet Map Wrapper */}
          <div className="glass-panel map-container-wrapper">
            <Map
              lat={coords.lat}
              lng={coords.lng}
              isLive={isLive}
              trackingHistory={trackingHistory}
            />
          </div>

          {/* Live Location Activity Log */}
          <div className="glass-panel tracking-log-card" id="tracking-log-card">
            <div className="tracking-log-header">
              <h3 className="section-title">
                <i className="fa-solid fa-route"></i>
                Live Tracking Activity Log
              </h3>
              <span className="live-status" style={{ fontSize: '0.75rem' }}>
                Updates: <span id="log-count">{logs.filter(l => l.typeClass === 'log-update').length}</span>
              </span>
            </div>
            <TelemetryLogs logs={logs} onLogClick={handleLogClick} />
          </div>

          {/* Temperature and Rain Charts */}
          {weather && (
            <div className="glass-panel chart-card">
              <h3 className="section-title">
                <i className="fa-solid fa-chart-line"></i>
                Hourly Forecast (24 Hours)
              </h3>
              <HourlyChart hourlyData={weather.hourly} />
            </div>
          )}

          {/* Daily Forecast */}
          {weather && (
            <div className="glass-panel">
              <h3 className="section-title">
                <i className="fa-solid fa-calendar-days"></i>
                7-Day Weather Forecast
              </h3>
              <ul className="daily-forecast-list" id="daily-forecast-list">
                {weather.daily.time.map((time, idx) => {
                  const date = new Date(time);
                  const dayName = idx === 0 ? 'Today' : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                  const code = weather.daily.weathercode[idx];
                  const details = getWeatherDetails(code);
                  const maxTemp = Math.round(weather.daily.temperature_2m_max[idx]);
                  const minTemp = Math.round(weather.daily.temperature_2m_min[idx]);
                  
                  return (
                    <li key={time} className="glass-panel daily-day-card">
                      <span className="daily-day-name">{dayName}</span>
                      <div className="daily-icon"><i className={`fa-solid ${details.icon}`}></i></div>
                      <span className="daily-temp-range">{maxTemp}° / {minTemp}°</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </main>

      {/* Toast Notification System */}
      <div className="toast-container" id="toast-container">
        {toasts.map((toast) => {
          let icon = 'fa-info-circle';
          if (toast.type === 'success') icon = 'fa-circle-check';
          if (toast.type === 'error') icon = 'fa-triangle-exclamation';
          if (toast.type === 'warning') icon = 'fa-circle-exclamation';
          
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <i className={`fa-solid ${icon} toast-icon`}></i>
              <span className="toast-message">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
