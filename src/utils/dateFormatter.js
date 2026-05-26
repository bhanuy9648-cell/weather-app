/**
 * Format Unix timestamp to readable date string
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp, format = 'short') => {
  const date = new Date(timestamp * 1000)

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    case 'time':
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    default:
      return date.toLocaleDateString()
  }
}

/**
 * Format Unix timestamp to day of week
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Day of week
 */
export const getDayOfWeek = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

/**
 * Format Unix timestamp to time string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Time string
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default {
  formatDate,
  getDayOfWeek,
  formatTime,
}
