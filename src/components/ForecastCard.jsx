import PropTypes from 'prop-types'
import { formatDate, getDayOfWeek } from '../utils/dateFormatter'
import { formatTemperature, getTemperatureUnit } from '../utils/temperatureConverter'
import '../styles/Weather.css'

const ForecastCard = ({ forecast, units = 'metric' }) => {
  if (!forecast || !forecast.list) {
    return null
  }

  // Group 3-hour forecasts by day
  const dailyForecasts = {}
  forecast.list.forEach((item) => {
    // Format to YYYY-MM-DD or standard short date to ensure proper grouping
    const dateStr = new Date(item.dt * 1000).toISOString().split('T')[0]
    
    if (!dailyForecasts[dateStr]) {
      dailyForecasts[dateStr] = []
    }
    dailyForecasts[dateStr].push(item)
  })

  // Get up to 5 days, calculating averages/ranges for each day
  const daysKeys = Object.keys(dailyForecasts).slice(0, 5)
  const tempUnit = getTemperatureUnit(units)

  const processedForecasts = daysKeys.map((dateStr) => {
    const dayItems = dailyForecasts[dateStr]
    // Use the middle-of-the-day item for weather status / icon
    const middleItem = dayItems[Math.floor(dayItems.length / 2)] || dayItems[0]
    
    // Find min and max temp across the day items
    let maxTemp = -Infinity
    let minTemp = Infinity
    let totalHumidity = 0

    dayItems.forEach((item) => {
      if (item.main.temp_max > maxTemp) maxTemp = item.main.temp_max
      if (item.main.temp_min < minTemp) minTemp = item.main.temp_min
      totalHumidity += item.main.humidity
    })

    const avgHumidity = Math.round(totalHumidity / dayItems.length)

    return {
      dt: middleItem.dt,
      dateLabel: dateStr,
      icon: middleItem.weather[0].icon,
      condition: middleItem.weather[0].main,
      description: middleItem.weather[0].description,
      tempMax: maxTemp,
      tempMin: minTemp,
      humidity: avgHumidity,
    }
  })

  return (
    <div className="forecast-panel glass-panel">
      <h3 className="forecast-title">5-Day Forecast</h3>
      <div className="forecast-deck">
        {processedForecasts.map((day, idx) => {
          const isToday = new Date(day.dt * 1000).toDateString() === new Date().toDateString()
          return (
            <div key={day.dt} className={`forecast-deck-card ${isToday ? 'today-highlight' : ''}`}>
              <p className="forecast-day-name">
                {isToday ? 'Today' : getDayOfWeek(day.dt)}
              </p>
              <p className="forecast-date-sub">
                {formatDate(day.dt, 'short')}
              </p>
              
              <div className="forecast-img-wrapper">
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                  alt={day.condition}
                  className="forecast-weather-icon"
                />
              </div>

              <span className="forecast-status-label">{day.condition}</span>

              <div className="forecast-temp-range">
                <span className="forecast-temp-high">
                  {Math.round(day.tempMax)}°
                </span>
                <div className="temp-bar-visual">
                  <div className="temp-bar-fill" style={{ height: '4px', width: '100%', background: 'linear-gradient(90deg, #4ecdc4, #ff6b6b)', borderRadius: '2px' }}></div>
                </div>
                <span className="forecast-temp-low">
                  {Math.round(day.tempMin)}°
                </span>
              </div>

              <div className="forecast-humidity-stat">
                <span className="humidity-icon">💧</span>
                <span className="humidity-val">{day.humidity}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

ForecastCard.propTypes = {
  forecast: PropTypes.object,
  units: PropTypes.string,
}

export default ForecastCard
