import { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import WeatherCard from '../components/WeatherCard'
import ForecastCard from '../components/ForecastCard'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import LocationButton from '../components/LocationButton'
import { useWeather } from '../hooks/useWeather'
import { useWeatherContext } from '../context/WeatherContext'
import '../styles/Weather.css'

const Home = () => {
  const { weather, forecast, loading, error, fetchWeather } = useWeather()
  const { 
    units, 
    toggleUnits, 
    recentSearches, 
    addRecentSearch, 
    clearRecentSearches 
  } = useWeatherContext()

  const [lastQuery, setLastQuery] = useState(null)

  // Autodetect location on startup
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }
          setLastQuery(coords)
          fetchWeather(coords, units)
        },
        (err) => {
          console.log('Startup location detection skipped:', err.message)
        }
      )
    }
  }, []) // Empty dependency array ensures this runs exactly once on mount

  // Refetch when units change if we have an active query
  useEffect(() => {
    if (lastQuery) {
      fetchWeather(lastQuery, units)
    }
  }, [units])

  const handleSearch = (city) => {
    if (!city) return
    addRecentSearch(city)
    setLastQuery(city)
    fetchWeather(city, units)
  }

  const handleLocationFetched = (coords) => {
    setLastQuery(coords)
    fetchWeather(coords, units)
    addRecentSearch(weather?.name || `Coords: ${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`)
  }

  // Effect to sync recent searches when weather loads from coordinates
  useEffect(() => {
    if (weather && weather.name && typeof lastQuery === 'object') {
      addRecentSearch(weather.name)
    }
  }, [weather, lastQuery])

  const handleRetry = () => {
    if (lastQuery) {
      fetchWeather(lastQuery, units)
    }
  }

  const handleRecentClick = (city) => {
    setLastQuery(city)
    fetchWeather(city, units)
  }

  return (
    <div className="home-page">
      <div className="dashboard-container">
        
        {/* Left Sidebar Panel */}
        <aside className="sidebar-panel glass-panel">
          <header className="header">
            <h1>🌤️ SkyGlass</h1>
            <button 
              className="units-toggle" 
              onClick={toggleUnits}
              title={`Switch to ${units === 'metric' ? 'Fahrenheit' : 'Celsius'}`}
            >
              °{units === 'metric' ? 'F' : 'C'}
            </button>
          </header>

          <SearchBar onSearch={handleSearch} isLoading={loading} />

          <LocationButton onLocationFetched={handleLocationFetched} disabled={loading} />

          {recentSearches.length > 0 && (
            <div className="recent-searches-box">
              <div className="recent-searches-title-row">
                <h4>Recent Searches</h4>
                <button className="clear-recent-btn" onClick={clearRecentSearches}>
                  Clear
                </button>
              </div>
              <div className="recent-cities-list">
                {recentSearches.map((city, idx) => (
                  <button
                    key={`${city}-${idx}`}
                    className="recent-city-pill"
                    onClick={() => handleRecentClick(city)}
                    disabled={loading}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Main Details Panel */}
        <main className="main-dashboard-panel">
          {loading && <Loading />}
          
          {error && (
            <ErrorMessage 
              message={error} 
              onRetry={handleRetry} 
            />
          )}

          {!loading && !error && weather && (
            <div className="weather-details-fadein">
              <WeatherCard weather={weather} units={units} />
              <ForecastCard forecast={forecast} units={units} />
            </div>
          )}

          {!weather && !loading && !error && (
            <div className="welcome-message glass-panel">
              <span className="welcome-logo">🌤️</span>
              <h2>Welcome to SkyGlass</h2>
              <p>
                Search for any global city above, or use the <strong>My Location</strong> button to automatically retrieve your local weather forecast in real-time.
              </p>
            </div>
          )}
        </main>
        
      </div>
    </div>
  )
}

export default Home
