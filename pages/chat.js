import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import SpeechInput from '../components/SpeechInput';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [crop, setCrop] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const messagesEndRef = useRef(null);

  // Language options
  const languageOptions = [
    { value: 'en-IN', label: 'English', flag: '🇺🇸' },
    { value: 'hi-IN', label: 'हिंदी', flag: '🇮🇳' },
    { value: 'mr-IN', label: 'मराठी', flag: '🇮🇳' }
  ];

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [response]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Handle speech input result
  const handleSpeechResult = (text) => {
    setMessage(text);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          lang: language,
          crop: crop.trim() || undefined,
          lat: userLocation?.lat,
          lon: userLocation?.lon
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response');
      }

      setResponse(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Text-to-Speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      // Try to find a voice that matches the language
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
    }
  };

  return (
    <>
      <Head>
        <title>AI Chat - Krishi Mitra</title>
        <meta name="description" content="Chat with our AI farming assistant" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI Chat Assistant
            </h1>
            <p className="text-lg text-gray-600">
              Ask me anything about farming, crops, or agriculture
            </p>
          </div>

          {/* Chat Form */}
          <div className="card mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Language Selector */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Language / भाषा
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.flag} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Crop Input */}
              <div>
                <label htmlFor="crop" className="block text-sm font-medium text-gray-700 mb-2">
                  Crop (Optional) / फसल (वैकल्पिक)
                </label>
                <input
                  type="text"
                  id="crop"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  placeholder="e.g., Wheat, Rice, Tomato..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Message Input */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question / आपका प्रश्न
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about farming, pests, weather, etc..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <SpeechInput
                    lang={language}
                    onResult={handleSpeechResult}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Getting Response...' : 'Ask Question'}
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

          {/* Response Display */}
          {response && (
            <div className="card">
              <div className="space-y-6">
                {/* Advice Text */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Farming Advice / कृषि सलाह
                    <button
                      onClick={() => speakText(response.advice_text)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Play audio"
                    >
                      🔊
                    </button>
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {response.advice_text}
                  </p>
                </div>

                {/* Fertilizer Recommendation */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Fertilizer Recommendation / उर्वरक सिफारिश
                    <button
                      onClick={() => speakText(response.fertilizer)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Play audio"
                    >
                      🔊
                    </button>
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {response.fertilizer}
                  </p>
                </div>

                {/* Pest Flags */}
                {response.pest_flags && response.pest_flags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      Pest Alerts / कीट चेतावनी
                      <button
                        onClick={() => speakText(`Pest alerts: ${response.pest_flags.join(', ')}`)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Play audio"
                      >
                        🔊
                      </button>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {response.pest_flags.map((pest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {pest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {response.suggestions && response.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      Suggestions / सुझाव
                      <button
                        onClick={() => speakText(`Suggestions: ${response.suggestions.join('. ')}`)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Play audio"
                      >
                        🔊
                      </button>
                    </h3>
                    <ul className="space-y-2">
                      {response.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </main>
      </div>
    </>
  );
}
