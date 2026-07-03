import PropTypes from 'prop-types';

const TelemetryLogs = ({ logs, onLogClick }) => {
  return (
    <ul className="tracking-log-list" id="tracking-log-list">
      {logs.map((log) => (
        <li
          key={log.id}
          className={`tracking-log-item ${log.typeClass}`}
          onClick={() => log.latlng && onLogClick(log.latlng)}
          style={{ cursor: log.latlng ? 'pointer' : 'default' }}
          title={log.latlng ? 'Click to center map here' : undefined}
        >
          <div className="log-meta">
            <span className="log-time">{log.timestamp}</span>
            <span className="log-msg">{log.message}</span>
          </div>
          <div className="log-info-box">
            {log.weatherObj && (
              <div className="log-weather" title={log.weatherObj.desc}>
                <i className={`fa-solid ${log.weatherObj.icon}`}></i>
                <span>{log.weatherObj.temp}°C</span>
              </div>
            )}
            <span className="log-coords">{log.details}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

TelemetryLogs.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      details: PropTypes.string.isRequired,
      typeClass: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      latlng: PropTypes.arrayOf(PropTypes.number),
      weatherObj: PropTypes.shape({
        temp: PropTypes.number.isRequired,
        icon: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
      }),
    })
  ).isRequired,
  onLogClick: PropTypes.func.isRequired,
};

export default TelemetryLogs;
