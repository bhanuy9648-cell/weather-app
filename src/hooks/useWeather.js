import { useState, useCallback } from 'react'
import { 
  getCurrentWeather, 
  getForecast, 
  getWeatherByCoords, 
  getForecastByCoords 
} from '../services/weatherApi'

/**
 * Custom hook for weather data management
 */
export const useWeather = () => {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async (query, units = 'metric') => {
    setLoading(true)
    setError(null)
    try {
      let weatherData
      let forecastData
      
      if (typeof query === 'object' && query.lat !== undefined && query.lon !== undefined) {
        weatherData = await getWeatherByCoords(query.lat, query.lon, units)
        forecastData = await getForecastByCoords(query.lat, query.lon, units)
      } else if (typeof query === 'string' && query.trim() !== '') {
        weatherData = await getCurrentWeather(query, units)
        forecastData = await getForecast(query, units)
      } else {
        throw new Error('Invalid query search parameter')
      }

      setWeather(weatherData)
      setForecast(forecastData)
    } catch (err) {
      setError(err.message)
      setWeather(null)
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    weather,
    forecast,
    loading,
    error,
    fetchWeather,
  }
}

export default useWeather
