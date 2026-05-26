import { createContext, useContext, useState, useEffect } from 'react'

const WeatherContext = createContext()

export const WeatherProvider = ({ children }) => {
  const [units, setUnits] = useState(() => {
    return localStorage.getItem('weather_units') || 'metric'
  })
  
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('weather_recent_searches')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('weather_units', units)
  }, [units])

  useEffect(() => {
    localStorage.setItem('weather_recent_searches', JSON.stringify(recentSearches))
  }, [recentSearches])

  const toggleUnits = () => {
    setUnits((prev) => (prev === 'metric' ? 'imperial' : 'metric'))
  }

  const addRecentSearch = (city) => {
    if (!city || city.trim() === '') return
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== city.toLowerCase())
      return [city, ...filtered].slice(0, 5)
    })
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
  }

  const value = {
    units,
    toggleUnits,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  }

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  )
}

export const useWeatherContext = () => {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error('useWeatherContext must be used within WeatherProvider')
  }
  return context
}
