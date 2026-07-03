import PropTypes from 'prop-types';

const DetailedMetrics = ({ humidity, windSpeed, uvIndex, pressure, sunrise, sunset }) => {
  return (
    <div className="detail-grid">
      {/* Humidity */}
      <div className="glass-panel metric-card">
        <div className="metric-icon">
          <i className="fa-solid fa-droplet"></i>
        </div>
        <div className="metric-info">
          <span className="metric-label">Humidity</span>
          <span className="metric-value" id="val-humidity">
            {humidity !== null ? `${humidity}%` : '--%'}
          </span>
        </div>
      </div>

      {/* Wind Speed */}
      <div className="glass-panel metric-card">
        <div className="metric-icon">
          <i className="fa-solid fa-wind"></i>
        </div>
        <div className="metric-info">
          <span className="metric-label">Wind Speed</span>
          <span className="metric-value" id="val-wind">
            {windSpeed !== null ? `${windSpeed} km/h` : '-- km/h'}
          </span>
        </div>
      </div>

      {/* UV Index */}
      <div className="glass-panel metric-card">
        <div className="metric-icon">
          <i className="fa-solid fa-circle-radiation"></i>
        </div>
        <div className="metric-info">
          <span className="metric-label">UV Index</span>
          <span className="metric-value" id="val-uv">
            {uvIndex !== null ? uvIndex : '--'}
          </span>
        </div>
      </div>

      {/* Barometric Pressure */}
      <div className="glass-panel metric-card">
        <div className="metric-icon">
          <i className="fa-solid fa-gauge"></i>
        </div>
        <div className="metric-info">
          <span className="metric-label">Pressure</span>
          <span className="metric-value" id="val-pressure">
            {pressure !== null ? `${pressure} hPa` : '-- hPa'}
          </span>
        </div>
      </div>

      {/* Sunrise */}
      <div className="glass-panel metric-card">
        <div className="metric-icon">
          <i className="fa-solid fa-sun-plant-wilt"></i>
        </div>
        <div className="metric-info">
          <span className="metric-label">Sunrise</span>
          <span className="metric-value" id="val-sunrise">
            {sunrise || '--:--'}
          </span>
        </div>
      </div>

      {/* Sunset */}
      <div className="glass-panel metric-card">
        <div className="metric-icon">
          <i className="fa-solid fa-moon"></i>
        </div>
        <div className="metric-info">
          <span className="metric-label">Sunset</span>
          <span className="metric-value" id="val-sunset">
            {sunset || '--:--'}
          </span>
        </div>
      </div>
    </div>
  );
};

DetailedMetrics.propTypes = {
  humidity: PropTypes.number,
  windSpeed: PropTypes.number,
  uvIndex: PropTypes.number,
  pressure: PropTypes.number,
  sunrise: PropTypes.string,
  sunset: PropTypes.string,
};

DetailedMetrics.defaultProps = {
  humidity: null,
  windSpeed: null,
  uvIndex: null,
  pressure: null,
  sunrise: '',
  sunset: '',
};

export default DetailedMetrics;
