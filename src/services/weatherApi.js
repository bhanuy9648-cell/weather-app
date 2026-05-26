import axios from 'axios'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const API_URL = import.meta.env.VITE_WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5'

const weatherApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

// Helper to check if API key is valid / present
const isApiKeyConfigured = () => {
  return API_KEY && API_KEY !== 'your_api_key_here' && API_KEY.trim() !== ''
}

// Generate deterministic mock data based on city name string
const getMockWeather = (city, units = 'metric') => {
  const normalized = city.trim().toLowerCase()
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash)
  }
  hash = Math.abs(hash)

  const tempRange = units === 'metric' ? { min: 10, max: 32 } : { min: 50, max: 90 }
  const currentTemp = tempRange.min + (hash % (tempRange.max - tempRange.min))
  const humidity = 40 + (hash % 50)
  const pressure = 990 + (hash % 30)
  const windSpeed = 2 + (hash % 12)
  const windDeg = hash % 360
  const clouds = hash % 100

  // Determine weather condition based on hash
  const conditions = [
    { main: 'Clear', desc: 'clear sky', icon: '01d' },
    { main: 'Clouds', desc: 'few clouds', icon: '02d' },
    { main: 'Clouds', desc: 'broken clouds', icon: '04d' },
    { main: 'Rain', desc: 'moderate rain', icon: '10d' },
    { main: 'Drizzle', desc: 'light rain', icon: '09d' },
    { main: 'Thunderstorm', desc: 'thunderstorm with rain', icon: '11d' },
    { main: 'Snow', desc: 'light snow', icon: '13d' },
    { main: 'Mist', desc: 'misty conditions', icon: '50d' },
  ]
  const cond = conditions[hash % conditions.length]

  const now = Math.floor(Date.now() / 1000)
  
  // Custom nice display names for well-known mock searches
  let displayName = city.charAt(0).toUpperCase() + city.slice(1)
  let countryCode = 'US'
  if (normalized === 'london') { displayName = 'London'; countryCode = 'GB'; }
  else if (normalized === 'tokyo') { displayName = 'Tokyo'; countryCode = 'JP'; }
  else if (normalized === 'paris') { displayName = 'Paris'; countryCode = 'FR'; }
  else if (normalized === 'sydney') { displayName = 'Sydney'; countryCode = 'AU'; }
  else if (normalized === 'mumbai') { displayName = 'Mumbai'; countryCode = 'IN'; }
  else if (normalized === 'delhi') { displayName = 'Delhi'; countryCode = 'IN'; }

  return {
    isDemoMode: true,
    coord: { lat: 40.7128 + (hash % 10) / 100, lon: -74.0060 - (hash % 10) / 100 },
    weather: [{ id: 800 + (hash % 50), main: cond.main, description: cond.desc, icon: cond.icon }],
    main: {
      temp: currentTemp,
      feels_like: currentTemp + (hash % 2 === 0 ? 1.5 : -1.2),
      temp_min: currentTemp - 4,
      temp_max: currentTemp + 4,
      pressure,
      humidity,
    },
    visibility: 10000 - (hash % 4000),
    wind: { speed: windSpeed, deg: windDeg },
    clouds: { all: clouds },
    dt: now,
    sys: { country: countryCode, sunrise: now - 25000, sunset: now + 35000 },
    name: displayName,
    cod: 200,
  }
}

const getMockForecast = (city, units = 'metric') => {
  const weatherData = getMockWeather(city, units)
  const list = []
  const now = Math.floor(Date.now() / 1000)

  // Weather condition pool
  const condPool = [
    { main: 'Clear', desc: 'clear sky', icon: '01d' },
    { main: 'Clouds', desc: 'few clouds', icon: '02d' },
    { main: 'Clouds', desc: 'overcast clouds', icon: '04d' },
    { main: 'Rain', desc: 'light rain', icon: '10d' },
  ]

  // Create 40 data points (5 days, every 3 hours)
  for (let i = 0; i < 40; i++) {
    const timeOffset = i * 3 * 3600 // 3 hours in seconds
    const dt = now + timeOffset
    const seed = weatherData.main.temp + Math.sin(i / 2) * 5
    const condIdx = (Math.abs(Math.floor(seed)) + i) % condPool.length
    const cond = condPool[condIdx]

    list.push({
      dt,
      main: {
        temp: seed,
        feels_like: seed - 0.8,
        temp_min: seed - 2,
        temp_max: seed + 2,
        pressure: weatherData.main.pressure + Math.cos(i) * 2,
        humidity: Math.min(100, Math.max(10, weatherData.main.humidity + Math.floor(Math.sin(i) * 15))),
      },
      weather: [{ id: 800 + condIdx, main: cond.main, description: cond.desc, icon: cond.icon }],
      clouds: { all: Math.min(100, Math.max(0, weatherData.clouds.all + Math.floor(Math.sin(i) * 30))) },
      wind: { speed: Math.max(0.5, weatherData.wind.speed + Math.sin(i) * 2), deg: (weatherData.wind.deg + i * 10) % 360 },
      dt_txt: new Date(dt * 1000).toISOString().replace('T', ' ').substring(0, 19),
    })
  }

  return {
    isDemoMode: true,
    list,
    city: {
      name: weatherData.name,
      country: weatherData.sys.country,
      coord: weatherData.coord,
      sunrise: weatherData.sys.sunrise,
      sunset: weatherData.sys.sunset,
    },
  }
}

/**
 * Get current weather for a city
 */
export const getCurrentWeather = async (city, units = 'metric') => {
  if (!isApiKeyConfigured()) {
    return getMockWeather(city, units)
  }

  try {
    const response = await weatherApi.get('/weather', {
      params: {
        q: city,
        units,
        appid: API_KEY,
      },
    })
    return { ...response.data, isDemoMode: false }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.warn('Invalid API key. Falling back to demonstration weather data.')
      return getMockWeather(city, units)
    }
    throw new Error(`Failed to fetch weather for ${city}: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Get 5-day forecast for a city
 */
export const getForecast = async (city, units = 'metric') => {
  if (!isApiKeyConfigured()) {
    return getMockForecast(city, units)
  }

  try {
    const response = await weatherApi.get('/forecast', {
      params: {
        q: city,
        units,
        appid: API_KEY,
      },
    })
    return { ...response.data, isDemoMode: false }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return getMockForecast(city, units)
    }
    throw new Error(`Failed to fetch forecast for ${city}: ${error.response?.data?.message || error.message}`)
  }
}

// Helper to get real city/suburb name from coordinates using OpenStreetMap Nominatim
const getAddressName = async (lat, lon) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat,
        lon,
        zoom: 12,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'SkyGlassWeatherApp/1.0',
      },
      timeout: 5000,
    })
    if (response.data && response.data.address) {
      const addr = response.data.address
      const name = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || addr.state
      const countryCode = addr.country_code ? addr.country_code.toUpperCase() : ''
      return { name, countryCode }
    }
  } catch (error) {
    console.error('Nominatim reverse geocoding error:', error.message)
  }
  return {
    name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
    countryCode: '',
  }
}

/**
 * Get weather by coordinates
 */
export const getWeatherByCoords = async (lat, lon, units = 'metric') => {
  const addrInfo = await getAddressName(lat, lon)

  if (!isApiKeyConfigured()) {
    const mockData = getMockWeather(addrInfo.name, units)
    mockData.coord = { lat, lon }
    if (addrInfo.countryCode) {
      mockData.sys.country = addrInfo.countryCode
    }
    return mockData
  }

  try {
    const response = await weatherApi.get('/weather', {
      params: {
        lat,
        lon,
        units,
        appid: API_KEY,
      },
    })
    const finalData = { ...response.data, isDemoMode: false }
    if (addrInfo.name && (!finalData.name || finalData.name.trim() === '' || finalData.name.startsWith('Coords:'))) {
      finalData.name = addrInfo.name
    }
    return finalData
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const mockData = getMockWeather(addrInfo.name, units)
      mockData.coord = { lat, lon }
      if (addrInfo.countryCode) {
        mockData.sys.country = addrInfo.countryCode
      }
      return mockData
    }
    throw new Error(`Failed to fetch weather by coordinates: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Get forecast by coordinates
 */
export const getForecastByCoords = async (lat, lon, units = 'metric') => {
  const addrInfo = await getAddressName(lat, lon)

  if (!isApiKeyConfigured()) {
    const mockForecast = getMockForecast(addrInfo.name, units)
    mockForecast.city.coord = { lat, lon }
    if (addrInfo.countryCode) {
      mockForecast.city.country = addrInfo.countryCode
    }
    return mockForecast
  }

  try {
    const response = await weatherApi.get('/forecast', {
      params: {
        lat,
        lon,
        units,
        appid: API_KEY,
      },
    })
    const finalData = { ...response.data, isDemoMode: false }
    if (addrInfo.name && (!finalData.city.name || finalData.city.name.trim() === '')) {
      finalData.city.name = addrInfo.name
    }
    return finalData
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const mockForecast = getMockForecast(addrInfo.name, units)
      mockForecast.city.coord = { lat, lon }
      if (addrInfo.countryCode) {
        mockForecast.city.country = addrInfo.countryCode
      }
      return mockForecast
    }
    throw new Error(`Failed to fetch forecast by coordinates: ${error.response?.data?.message || error.message}`)
  }
}

export default weatherApi
