import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WeatherCard from '../components/WeatherCard'
import ForecastCard from '../components/ForecastCard'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import { useWeather } from '../hooks/useWeather'
import { useWeatherContext } from '../context/WeatherContext'
import '../styles/Weather.css'

const WeatherDetails = () => {
  const { city } = useParams()
  const navigate = useNavigate()
  const { weather, forecast, loading, error, fetchWeather } = useWeather()
  const { units } = useWeatherContext()

  useEffect(() => {
    if (city) {
      fetchWeather(city, units)
    }
  }, [city, units, fetchWeather])

  const handleBack = () => {
    navigate('/')
  }

  const getWeatherThemeClass = () => {
    if (!weather || !weather.weather || !weather.weather[0]) {
      return 'theme-default'
    }
    const condition = weather.weather[0].main.toLowerCase()
    if (condition.includes('clear')) return 'theme-clear'
    if (condition.includes('cloud')) return 'theme-clouds'
    if (condition.includes('rain') || condition.includes('drizzle')) return 'theme-rain'
    if (condition.includes('thunderstorm')) return 'theme-thunderstorm'
    if (condition.includes('snow')) return 'theme-snow'
    if (
      condition.includes('mist') ||
      condition.includes('fog') ||
      condition.includes('haze') ||
      condition.includes('smoke') ||
      condition.includes('dust') ||
      condition.includes('sand') ||
      condition.includes('ash') ||
      condition.includes('squall') ||
      condition.includes('tornado')
    ) {
      return 'theme-mist'
    }
    return 'theme-default'
  }

  const themeClass = getWeatherThemeClass()

  return (
    <div className={`weather-details-page ${themeClass}`}>
      <div className="dashboard-container" style={{ gridTemplateColumns: '1fr', maxWidth: '900px' }}>
        
        <header className="details-header" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
          <button className="back-button" onClick={handleBack}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12,19 5,12 12,5" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </header>

        <main className="main-dashboard-panel">
          {loading && <Loading />}
          {error && <ErrorMessage message={error} onRetry={() => fetchWeather(city, units)} />}
          {!loading && !error && weather && (
            <div className="weather-details-fadein">
              <WeatherCard weather={weather} units={units} />
              <ForecastCard forecast={forecast} units={units} />
            </div>
          )}
        </main>

      </div>
    </div>
  )
}

export default WeatherDetails
