import PropTypes from 'prop-types'
import '../styles/Weather.css'

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <p className="error-icon">⚠️</p>
      <p className="error-text">{message}</p>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
}

export default ErrorMessage
