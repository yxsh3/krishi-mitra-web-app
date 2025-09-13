import { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';

export default function Feedback() {
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'general', label: 'General Feedback' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'suggestion', label: 'Suggestion' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!type || !message) {
      setError('Please select a feedback type and enter your message');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          message,
          rating: rating ? parseInt(rating) : undefined,
          userInfo: userInfo || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      setResponse(data);
      
      // Reset form on success
      setType('');
      setMessage('');
      setRating('');
      setUserInfo('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Feedback - Krishi Mitra</title>
        <meta name="description" content="Share your experience and suggestions" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Feedback
            </h1>
            <p className="text-lg text-gray-600">
              Help us improve by sharing your experience and suggestions
            </p>
          </div>

          {/* Feedback Form */}
          <div className="card mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Type *
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select feedback type</option>
                  {feedbackTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Please describe your feedback in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (Optional)
                </label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select rating</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              {/* User Info */}
              <div>
                <label htmlFor="userInfo" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information (Optional)
                </label>
                <input
                  type="text"
                  id="userInfo"
                  value={userInfo}
                  onChange={(e) => setUserInfo(e.target.value)}
                  placeholder="Email or phone number (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
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

          {/* Success Response */}
          {response && (
            <div className="card mb-8 bg-green-50 border-green-200">
              <div className="text-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✅</span>
                  <strong>Thank you for your feedback!</strong>
                </div>
                <p>Your feedback has been submitted successfully. We appreciate your input and will use it to improve our platform.</p>
                {response.feedbackType && (
                  <p className="mt-2 text-sm">
                    <strong>Type:</strong> {response.feedbackType}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Project Overview */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Project</h2>
            <p className="text-gray-700 leading-relaxed">
              Our project is an AI-powered multilingual agriculture advisory platform. It provides farmers with personalized crop guidance, weather alerts, pest detection, market price tracking, and voice support in local languages. The goal is to empower small and marginal farmers with real-time, accessible insights.
            </p>
          </div>

          {/* Team Members */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">YK</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Yash Khade</h3>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">AJ</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Aditya Jagtap</h3>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">SG</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Soumya Ghag</h3>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">PI</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Parth Indulkar</h3>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">TD</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Tejas Dhanvi</h3>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">DM</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Dakshata Mhatre</h3>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}