/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius) => {
  return (celsius * 9/5) + 32
}

/**
 * Convert Fahrenheit to Celsius
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
export const fahrenheitToCelsius = (fahrenheit) => {
  return (fahrenheit - 32) * 5/9
}

/**
 * Format temperature with unit
 * @param {number} temp - Temperature value
 * @param {string} unit - Unit ('C' or 'F')
 * @returns {string} Formatted temperature
 */
export const formatTemperature = (temp, unit = 'C') => {
  return `${Math.round(temp)}°${unit}`
}

/**
 * Get temperature unit symbol
 * @param {string} units - Units system ('metric' or 'imperial')
 * @returns {string} Unit symbol
 */
export const getTemperatureUnit = (units = 'metric') => {
  return units === 'metric' ? 'C' : 'F'
}

/**
 * Get wind speed unit
 * @param {string} units - Units system ('metric' or 'imperial')
 * @returns {string} Unit text
 */
export const getWindSpeedUnit = (units = 'metric') => {
  return units === 'metric' ? 'm/s' : 'mph'
}

export default {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatTemperature,
  getTemperatureUnit,
  getWindSpeedUnit,
}
