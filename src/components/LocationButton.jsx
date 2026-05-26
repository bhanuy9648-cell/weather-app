import { useState } from 'react'
import PropTypes from 'prop-types'
import '../styles/Weather.css'

const LocationButton = ({ onLocationFetched, disabled }) => {
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState(null)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    setIsDetecting(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false)
        onLocationFetched({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      (err) => {
        setIsDetecting(false)
        console.error(err)
        let errorMsg = 'Failed to get location'
        if (err.code === 1) {
          errorMsg = 'Location permission denied'
        } else if (err.code === 2) {
          errorMsg = 'Location unavailable'
        } else if (err.code === 3) {
          errorMsg = 'Request timed out'
        }
        setError(errorMsg)
        // Auto fadeout error after 3 seconds
        setTimeout(() => setError(null), 3000)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }

  return (
    <div className="location-btn-container">
      <button
        type="button"
        className={`location-button ${isDetecting ? 'loading' : ''}`}
        onClick={handleGetLocation}
        disabled={disabled || isDetecting}
        title="Use current location weather"
      >
        <svg
          className="location-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
        </svg>
        <span>{isDetecting ? 'Locating...' : 'My Location'}</span>
      </button>
      {error && <span className="location-error">{error}</span>}
    </div>
  )
}

LocationButton.propTypes = {
  onLocationFetched: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

export default LocationButton
