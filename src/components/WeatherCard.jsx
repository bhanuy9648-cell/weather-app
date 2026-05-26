import PropTypes from 'prop-types'
import { formatTemperature, getTemperatureUnit, getWindSpeedUnit } from '../utils/temperatureConverter'
import { formatTime } from '../utils/dateFormatter'
import '../styles/Weather.css'

const WeatherCard = ({ weather, units = 'metric' }) => {
  if (!weather) {
    return null
  }

  const { main, weather: weatherData, wind, clouds, sys, visibility, isDemoMode } = weather
  const tempUnit = getTemperatureUnit(units)
  const windUnit = getWindSpeedUnit(units)
  const mainWeather = weatherData[0]

  return (
    <div className="weather-dashboard-card">
      {isDemoMode && (
        <div className="demo-banner">
          <span className="demo-tag">DEMO MODE</span>
          <p>Displaying simulated weather details. Add a valid OpenWeatherMap API key in <code>.env</code> for live real-time weather.</p>
        </div>
      )}

      <div className="weather-hero-panel">
        <div className="hero-main-info">
          <h2 className="location-name">
            {weather.name}
            {sys?.country && <span className="country-code">, {sys.country}</span>}
          </h2>
          <p className="current-date">{new Date(weather.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          <div className="weather-condition-badge">
            <span className="condition-text">{mainWeather?.description}</span>
          </div>
        </div>

        <div className="hero-temp-section">
          <div className="icon-container">
            <img
              src={`https://openweathermap.org/img/wn/${mainWeather?.icon}@4x.png`}
              alt={mainWeather?.main}
              className="weather-hero-icon"
            />
          </div>
          <div className="temp-display">
            <span className="current-temp-val">
              {Math.round(main.temp)}
            </span>
            <span className="temp-unit-symbol">°{tempUnit}</span>
          </div>
          <div className="temp-range-row">
            <span className="temp-max">↑ {formatTemperature(main.temp_max, tempUnit)}</span>
            <span className="temp-divider">|</span>
            <span className="temp-min">↓ {formatTemperature(main.temp_min, tempUnit)}</span>
          </div>
        </div>
      </div>

      <div className="weather-grid-metrics">
        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Feels Like</span>
            <span className="metric-icon">🌡️</span>
          </div>
          <div className="metric-value">
            {formatTemperature(main.feels_like, tempUnit)}
          </div>
          <div className="metric-desc">
            {main.feels_like > main.temp ? 'Warmer than actual' : 'Cooler than actual'}
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Humidity</span>
            <span className="metric-icon">💧</span>
          </div>
          <div className="metric-value-container">
            <div className="metric-value">{main.humidity}%</div>
            <div className="radial-progress-bar">
              <svg viewBox="0 0 36 36" className="circular-chart blue">
                <path className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${main.humidity}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
          <div className="metric-desc">
            {main.humidity < 40 ? 'Dry air' : main.humidity < 70 ? 'Comfortable humidity' : 'Sticky, humid air'}
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Wind Speed</span>
            <span className="metric-icon">💨</span>
          </div>
          <div className="wind-metrics-wrapper">
            <div className="metric-value-col">
              <span className="metric-value">{wind.speed}</span>
              <span className="metric-sub-unit"> {windUnit}</span>
            </div>
            {wind.deg !== undefined && (
              <div className="wind-compass" title={`Wind direction: ${wind.deg}°`}>
                <svg className="compass-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon 
                    points="12,6 8,16 12,13 16,16" 
                    className="compass-pointer"
                    style={{ transform: `rotate(${wind.deg}deg)`, transformOrigin: '50% 50%' }}
                  />
                </svg>
                <span className="compass-direction-label">{wind.deg}°</span>
              </div>
            )}
          </div>
          <div className="metric-desc">
            {wind.speed < 3 ? 'Calm breeze' : wind.speed < 10 ? 'Moderate breeze' : 'Strong winds'}
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Pressure</span>
            <span className="metric-icon">⏲️</span>
          </div>
          <div className="metric-value">{main.pressure} <span className="metric-sub-unit">hPa</span></div>
          <div className="metric-desc">
            {main.pressure > 1013 ? 'High pressure system' : 'Low pressure system'}
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Visibility</span>
            <span className="metric-icon">👁️</span>
          </div>
          <div className="metric-value">
            {visibility ? (visibility / 1000).toFixed(1) : '10.0'} <span className="metric-sub-unit">km</span>
          </div>
          <div className="metric-desc">
            {visibility && visibility < 2000 ? 'Foggy or hazy' : 'Excellent clarity'}
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Sun & Cloud</span>
            <span className="metric-icon">🌤️</span>
          </div>
          <div className="sun-hours-row">
            <div className="sun-time-item">
              <span className="sun-time-label">Sunrise:</span>
              <span className="sun-time-val">{sys?.sunrise ? formatTime(sys.sunrise) : '--:--'}</span>
            </div>
            <div className="sun-time-item">
              <span className="sun-time-label">Sunset:</span>
              <span className="sun-time-val">{sys?.sunset ? formatTime(sys.sunset) : '--:--'}</span>
            </div>
          </div>
          <div className="metric-desc">
            Cloud cover: {clouds.all}%
          </div>
        </div>
      </div>
    </div>
  )
}

WeatherCard.propTypes = {
  weather: PropTypes.object,
  units: PropTypes.string,
}

export default WeatherCard
