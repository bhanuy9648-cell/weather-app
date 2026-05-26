import { createHashRouter } from 'react-router-dom'
import Home from './pages/Home'
import WeatherDetails from './pages/WeatherDetails'

export const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/weather/:city',
    element: <WeatherDetails />,
  },
])
