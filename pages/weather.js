import { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';

export default function Weather() {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!lat || !lon) {
      setError('Please enter both latitude and longitude');
      return;
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setError('Please enter valid numbers for latitude and longitude');
      return;
    }

    if (latNum < -90 || latNum > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (lonNum < -180 || lonNum > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: latNum,
          lon: lonNum
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch weather data');
      }

      setWeatherData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAlertBgColor = (severity) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'info':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'severe':
        return '🚨';
      case 'moderate':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <>
      <Head>
        <title>Weather Forecast - Krishi Mitra</title>
        <meta name="description" content="Check weather conditions for your crops" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Weather Forecast
            </h1>
            <p className="text-lg text-gray-600">
              Get accurate weather information for your farming needs
            </p>
          </div>

          {/* Weather Form */}
          <div className="card mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Latitude Input */}
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    id="lat"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="e.g., 19.0760"
                    step="any"
                    min="-90"
                    max="90"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                {/* Longitude Input */}
                <div>
                  <label htmlFor="lon" className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    id="lon"
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    placeholder="e.g., 72.8777"
                    step="any"
                    min="-180"
                    max="180"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching weather...' : 'Get Weather'}
              </button>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="card mb-8 bg-red-50 border-red-200">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Weather Data Display */}
          {weatherData && (
            <div className="space-y-6">
              {/* Main Weather Info */}
              <div className="card">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {weatherData.location}
                  </h2>
                  <div className="text-6xl mb-4">🌤️</div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {weatherData.temp}°C
                  </div>
                  <div className="text-xl text-gray-600 mb-4 capitalize">
                    {weatherData.description}
                  </div>
                  <div className="text-lg text-gray-700">
                    Humidity: {weatherData.humidity}%
                  </div>
                </div>
              </div>

              {/* Rain Probability Card */}
              <div className="card bg-blue-50 border-blue-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Rain Probability
                  </h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {weatherData.rainProbability}%
                  </div>
                  <div className="text-blue-700">
                    {weatherData.rainProbability > 70 
                      ? 'High chance of rain - plan accordingly' 
                      : weatherData.rainProbability > 40 
                      ? 'Moderate chance of rain' 
                      : 'Low chance of rain'
                    }
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {weatherData.alerts && weatherData.alerts.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Weather Alerts
                  </h3>
                  <div className="space-y-3">
                    {weatherData.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getAlertBgColor(alert.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{getAlertIcon(alert.severity)}</span>
                          <div>
                            <div className="font-medium capitalize mb-1">
                              {alert.event || alert.severity} Alert
                            </div>
                            <div className="text-sm">
                              {alert.description || alert.message}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Alerts Message */}
              {weatherData.alerts && weatherData.alerts.length === 0 && (
                <div className="card bg-green-50 border-green-200">
                  <div className="text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      No Weather Alerts
                    </h3>
                    <p className="text-green-700">
                      Current weather conditions are normal for farming activities.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="card mt-8 bg-gray-50 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              How to Use
            </h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Enter the latitude and longitude of your farm location</li>
              <li>• You can find coordinates using Google Maps or GPS</li>
              <li>• Get real-time weather data and farming recommendations</li>
              <li>• Monitor rain probability and weather alerts for your crops</li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}