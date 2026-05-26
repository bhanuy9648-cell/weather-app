# Weather App

A modern, responsive weather application built with React and Vite.

## Features

- Search for weather by city name
- Display current weather conditions
- Show 5-day forecast
- Temperature unit conversion (Celsius/Fahrenheit)
- Responsive design
- Real-time data from OpenWeatherMap API

## Project Structure

```
weather-app/
├── public/              # Static files
├── src/
│   ├── assets/         # Images and icons
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React context
│   ├── utils/          # Utility functions
│   ├── styles/         # CSS files
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # Entry point
│   └── routes.jsx      # Route configuration
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your OpenWeatherMap API key:
   ```
   VITE_WEATHER_API_KEY=your_api_key_here
   ```

## Development

Run the development server:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

## Hosting on GitHub Pages

This project is ready to deploy with GitHub Pages through GitHub Actions.

1. Create a new GitHub repository.
2. Upload or push this project to the repository.
3. In the repository, go to `Settings > Pages`.
4. Under `Build and deployment`, set `Source` to `GitHub Actions`.
5. If you want live weather data, add a repository secret named `VITE_WEATHER_API_KEY` in `Settings > Secrets and variables > Actions`.
6. Push to the `main` branch. The workflow in `.github/workflows/deploy.yml` will build and publish the app.

If no API key is configured, the app still works with demonstration weather data.

## Preview

Preview the production build:
```bash
npm run preview
```

## Technologies

- React 18
- Vite
- Axios
- CSS3
- OpenWeatherMap API

## License

MIT
# weather-app
