import { RouterProvider } from 'react-router-dom'
import { WeatherProvider } from './context/WeatherContext'
import { router } from './routes'

function App() {
  return (
    <WeatherProvider>
      <RouterProvider router={router} />
    </WeatherProvider>
  )
}

export default App
