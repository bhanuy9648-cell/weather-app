import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip, Filler } from 'chart.js';

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip, Filler);

const HourlyChart = ({ hourlyData }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !hourlyData) return;

    const ctx = canvasRef.current.getContext('2d');

    // Destroy existing chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Take next 24 hours of data
    const hours = hourlyData.time.slice(0, 24).map(t => {
      const d = new Date(t);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
    });
    const temps = hourlyData.temperature_2m.slice(0, 24);
    const precips = hourlyData.precipitation_probability.slice(0, 24);

    // Get primary style variable or fallback
    const activeColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#38bdf8';

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temps,
            borderColor: activeColor,
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Rain Chance (%)',
            data: precips,
            borderColor: 'rgba(168, 85, 247, 0.6)',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            borderWidth: 1.5,
            tension: 0.3,
            fill: true,
            yAxisID: 'y1',
            hidden: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 11 }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 10 },
              maxTicksLimit: 8
            }
          },
          y: {
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 10 }
            }
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: {
              color: '#a855f7',
              font: { family: 'Inter', size: 10 }
            },
            min: 0,
            max: 100
          }
        }
      }
    });

    chartRef.current = chartInstance;

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [hourlyData]); // Redraw whenever hourly data changes

  return (
    <div className="chart-container-box">
      <canvas ref={canvasRef} id="hourly-chart"></canvas>
    </div>
  );
};

HourlyChart.propTypes = {
  hourlyData: PropTypes.shape({
    time: PropTypes.arrayOf(PropTypes.string).isRequired,
    temperature_2m: PropTypes.arrayOf(PropTypes.number).isRequired,
    precipitation_probability: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
};

export default HourlyChart;
